import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MetaService {
  constructor(private readonly prisma: PrismaService) {}

  async countries() {
    return this.prisma.country.findMany({
      orderBy: { name: 'asc' },
      select: { code: true, name: true },
    });
  }

  async purposes() {
    return this.prisma.studyPurpose.findMany({
      orderBy: { label: 'asc' },
      select: { key: true, label: true },
    });
  }
}
