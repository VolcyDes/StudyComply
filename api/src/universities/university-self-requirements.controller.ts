import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UniversityGuard } from '../auth/university.guard';

@UseGuards(JwtAuthGuard, UniversityGuard)
@Controller('university/requirements')
export class UniversitySelfRequirementsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@Req() req: any) {
    const universityId = req.user?.universityId;
    return this.prisma.universityRequirement.findMany({
      where: { universityId },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post()
  async create(
    @Req() req: any,
    @Body() body: {
      title: string;
      description?: string;
      kind?: 'REQUIRED' | 'INFO';
      priority?: 'LOW' | 'MEDIUM' | 'HIGH';
      stayMode?: 'SHORT' | 'LONG' | 'ANY';
      dueDate?: string;
      dueDaysBefore?: number;
      ctaLabel?: string;
      ctaUrl?: string;
    },
  ) {
    const universityId = req.user?.universityId;

    return this.prisma.universityRequirement.create({
      data: {
        universityId,
        title: body.title,
        description: body.description,
        kind: body.kind ?? 'REQUIRED',
        priority: body.priority ?? 'MEDIUM',
        stayMode: body.stayMode ?? 'ANY',
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        dueDaysBefore: body.dueDaysBefore,
        ctaLabel: body.ctaLabel,
        ctaUrl: body.ctaUrl,
      },
    });
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    const universityId = req.user?.universityId;

    return this.prisma.universityRequirement.deleteMany({
      where: { id, universityId },
    });
  }
}
