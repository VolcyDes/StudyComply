import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PassportsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.passport.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, countryCode: true, createdAt: true },
    });
  }

  async create(userId: string, countryCodeRaw: string) {
    const countryCode = (countryCodeRaw || '').trim().toUpperCase();
    if (!countryCode || countryCode.length !== 2) {
      // simple guardrail (ISO2 expected)
      throw new Error('Invalid countryCode (expected ISO2 like "FR")');
    }

    // ✅ IMPORTANT: refuse duplicates (no upsert)
    const existing = await this.prisma.passport.findUnique({
      where: {
        userId_countryCode: { userId, countryCode },
      },
      select: { id: true },
    });

    if (existing) return null; // controller will map this to 409

    return this.prisma.passport.create({
      data: { userId, countryCode },
      select: { id: true, countryCode: true, createdAt: true },
    });
  }

  async remove(userId: string, countryCodeRaw: string) {
    const raw = (countryCodeRaw || "").trim();

    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(raw);

    const where = isUuid
      ? { id: raw, userId }
      : { userId, countryCode: raw.toUpperCase() };

    const r = await this.prisma.passport.deleteMany({ where });
    return r.count;
  }
}
