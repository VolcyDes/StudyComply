import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const PROJECT_SELECT = {
  id: true, destinationCountry: true, purpose: true,
  startDate: true, endDate: true, isActive: true,
  hostUniversity: true,
  createdAt: true, updatedAt: true,
};

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  getActive(userId: string) {
    return this.prisma.mobilityProject.findFirst({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
      select: PROJECT_SELECT,
    });
  }

  async createActive(userId: string, input: {
    destinationCountry: string;
    purpose: string;
    startDate: string;
    endDate: string;
    hostUniversity?: string;
  }) {
    await this.prisma.mobilityProject.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });

    return this.prisma.mobilityProject.create({
      data: {
        userId,
        destinationCountry: input.destinationCountry.toUpperCase(),
        purpose: input.purpose,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        isActive: true,
        hostUniversity: input.hostUniversity?.trim() || null,
      },
      select: PROJECT_SELECT,
    });
  }

  async clearActive(userId: string) {
    await this.prisma.mobilityProject.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });
    return { cleared: true };
  }
}
