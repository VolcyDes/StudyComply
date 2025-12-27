import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  getActive(userId: string) {
    return this.prisma.mobilityProject.findFirst({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, destinationCountry: true, purpose: true,
        startDate: true, endDate: true, isActive: true,
        createdAt: true, updatedAt: true,
      },
    });
  }

  async createActive(userId: string, input: { destinationCountry: string; purpose: string; startDate: string; endDate: string; }) {
    // deactivate previous active projects
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
      },
      select: {
        id: true, destinationCountry: true, purpose: true,
        startDate: true, endDate: true, isActive: true,
        createdAt: true, updatedAt: true,
      },
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
