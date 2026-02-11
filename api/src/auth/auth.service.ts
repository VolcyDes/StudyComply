import { Injectable, UnauthorizedException , ConflictException} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from "@prisma/client";

@Injectable()
export class AuthService {
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
    const user = await this.prisma.user.findUnique({ where: { email: cleanEmail }, select: { id: true, email: true, password: true, role: true, universityId: true } });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const token = await this.jwt.signAsync({ sub: user.id, email: user.email, role: user.role, universityId: user.universityId });

    return { user: { id: user.id, email: user.email, role: user.role, universityId: user.universityId ?? null }, token };
  }
}
