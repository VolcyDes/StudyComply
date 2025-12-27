import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RequirementsService {
  constructor(private prisma: PrismaService) {}

  async compute(userId: string) {
    const passports = await this.prisma.passport.findMany({
      where: { userId },
      select: { countryCode: true },
    });

    const project = await this.prisma.mobilityProject.findFirst({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
      select: { destinationCountry: true, purpose: true, startDate: true, endDate: true },
    });

    if (!project) {
      return {
        passports: passports.map(p => p.countryCode),
        project: null,
        required: [],
        missing: [],
        note: 'No active project yet',
      };
    }

    const passportCountries = passports.map(p => p.countryCode);
    const durationDays = Math.max(
      0,
      Math.ceil((project.endDate.getTime() - project.startDate.getTime()) / (1000 * 60 * 60 * 24)),
    );

    const rules = await this.prisma.requirementRule.findMany({
      where: {
        passportCountry: { in: passportCountries.length ? passportCountries : ['__NONE__'] },
        destinationCountry: project.destinationCountry,
        purpose: project.purpose,
      },
      select: {
        id: true,
        requiredType: true,
        title: true,
        notes: true,
        minDays: true,
        maxDays: true,
        passportCountry: true,
      },
      orderBy: { title: 'asc' },
    });

    const applicable = rules.filter(r => {
      if (r.minDays != null && durationDays < r.minDays) return false;
      if (r.maxDays != null && durationDays > r.maxDays) return false;
      return true;
    });

    // map requiredType -> your documents.type
    // you can refine later
    const requiredTypes = Array.from(new Set(applicable.map(r => r.requiredType)));

    const existingDocs = await this.prisma.document.findMany({
      where: { userId },
      select: { id: true, type: true, title: true },
    });

    const existingTypes = new Set(existingDocs.map(d => d.type));
    const missingTypes = requiredTypes.filter(t => !existingTypes.has(t));

    const missing = applicable.filter(r => missingTypes.includes(r.requiredType));

    return {
      passports: passportCountries,
      project: {
        destinationCountry: project.destinationCountry,
        purpose: project.purpose,
        startDate: project.startDate,
        endDate: project.endDate,
        durationDays,
      },
      required: applicable,
      missing,
    };
  }
}
