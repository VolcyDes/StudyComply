import { Injectable, UnauthorizedException , ConflictException} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from "@prisma/client";
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  private accessTtlSeconds(): number {
    const raw = (process.env.JWT_ACCESS_TTL || '15m').toString().trim().toLowerCase();
    // supports: 900, 15m, 1h, 7d
    const m = raw.match(/^(\d+)([smhd])?$/);
    if (!m) return 15 * 60;
    const n = Number(m[1]);
    const unit = m[2] || 's';
    const mult = unit === 's' ? 1 : unit === 'm' ? 60 : unit === 'h' ? 3600 : 86400;
    return Math.max(60, n * mult);
  }


  private getAccessTtl(): string {
    return (process.env.JWT_ACCESS_TTL || '15m').toString();
  }

  private getRefreshDays(): number {
    const v = Number(process.env.JWT_REFRESH_TTL_DAYS || 30);
    return Number.isFinite(v) && v > 0 ? v : 30;
  }

  private async issueRefreshTokenForUser(userId: string): Promise<{ refreshToken: string; expiresAt: Date }> {
    const refreshToken = randomBytes(48).toString('base64url'); // long + url-safe
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date(Date.now() + this.getRefreshDays() * 24 * 60 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash, refreshTokenExpiresAt: expiresAt },
      select: { id: true },
    });

    return { refreshToken, expiresAt };
  }

  async clearRefreshTokenForUser(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null, refreshTokenExpiresAt: null },
      select: { id: true },
    });
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; refreshExpiresAt: Date }> {
    if (!refreshToken) throw new UnauthorizedException('Missing refresh token');

    // simple scan (acceptable now). Later: move to RefreshToken table with id for O(1) lookup.
    const candidates = await this.prisma.user.findMany({
      where: { refreshTokenHash: { not: null } },
      select: { id: true, refreshTokenHash: true, refreshTokenExpiresAt: true, email: true, role: true, universityId: true },
      take: 50000,
    });

    let user: typeof candidates[number] | null = null;
    for (const u of candidates) {
      if (!u.refreshTokenHash) continue;
      const ok = await bcrypt.compare(refreshToken, u.refreshTokenHash);
      if (ok) { user = u; break; }
    }
    if (!user) throw new UnauthorizedException('Invalid refresh token');

    if (!user.refreshTokenExpiresAt || user.refreshTokenExpiresAt.getTime() <= Date.now()) {
      await this.clearRefreshTokenForUser(user.id);
      throw new UnauthorizedException('Refresh token expired');
    }

    const rotated = await this.issueRefreshTokenForUser(user.id);

    const accessToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email, role: user.role, universityId: user.universityId },
      { secret: process.env.JWT_SECRET, expiresIn: this.accessTtlSeconds() },
    );

    return { accessToken, refreshToken: rotated.refreshToken, refreshExpiresAt: rotated.expiresAt };
  }

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  
  async register(email: string, password: string, role?: "USER"|"UNIVERSITY", universitySlug?: string) {
    const cleanEmail = (email ?? '').trim().toLowerCase();
    const hashed = await bcrypt.hash(password, 10);

    const finalRole: "USER" | "UNIVERSITY" = role === "UNIVERSITY" ? "UNIVERSITY" : "USER";

    try {
      let universityId: string | null = null;

      if (finalRole === "UNIVERSITY") {
        const slug = (universitySlug ?? "").trim();
        if (!slug) {
          throw new UnauthorizedException("universitySlug is required for UNIVERSITY accounts");
        }

        const uni = await this.prisma.university.upsert({
          where: { slug },
          update: {},
          create: {
            slug,
            name: slug.toUpperCase(),
            countryCode: "XX",
          },
          select: { id: true },
        });

        universityId = uni.id;
      }

      const user = await this.prisma.user.create({
        data: {
          email: cleanEmail,
          password: hashed,
          role: finalRole,
          universityId,
        },
        select: {
          id: true,
          email: true,
          role: true,
          universityId: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const token = await this.jwt.signAsync({ sub: user.id, email: user.email, role: user.role, universityId: user.universityId });

      return { user, token };

    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        throw new ConflictException("Email already in use");
      }
      throw e;
    }
  }


  async login(email: string, password: string) {
    const cleanEmail = (email ?? '').trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email: cleanEmail }, select: { id: true, email: true, password: true, role: true, universityId: true, emailVerifiedAt: true } });

    
    if (!user) throw new UnauthorizedException('Invalid credentials');

    if (!user.emailVerifiedAt) {
      throw new UnauthorizedException("EMAIL_NOT_VERIFIED");
    }


    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const token = await this.jwt.signAsync({ sub: user.id, email: user.email, role: user.role, universityId: user.universityId });

    const rt = await this.issueRefreshTokenForUser(user.id);

    return {
      refreshToken: rt.refreshToken,
      refreshExpiresAt: rt.expiresAt,
      user: { id: user.id, email: user.email, role: user.role, universityId: user.universityId ?? null }, token };
}


  async generateEmailVerificationToken(userId: string) {
    return this.jwt.signAsync(
      { sub: userId, type: "email-verify" },
      { secret: process.env.JWT_SECRET, expiresIn: "24h" }
    );
  }

  async verifyEmailToken(token: string) {
    const payload: any = await this.jwt.verifyAsync(token, {
      secret: process.env.JWT_SECRET,
    });

    if (payload?.type !== "email-verify") {
      throw new Error("Invalid verification token");
    }

    return payload.sub as string;
  }

  async markEmailVerified(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { emailVerifiedAt: new Date() },
    });
  }



  async logoutUser(userId: string): Promise<void> {
    await this.clearRefreshTokenForUser(userId);
  }

}
