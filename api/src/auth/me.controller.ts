import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('api/v1')
export class MeController {
  constructor(private readonly prisma: PrismaService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: any) {
    const userId = req.user?.sub;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, role: true,
        createdAt: true, updatedAt: true,
        fullName: true, dateOfBirth: true, homeUniversity: true,
      },
    });

    return { user };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateProfile(
    @Req() req: any,
    @Body() body: { fullName?: string; dateOfBirth?: string; homeUniversity?: string },
  ) {
    const userId = req.user?.sub;

    const data: { fullName?: string; dateOfBirth?: Date | null; homeUniversity?: string } = {};

    if (body.fullName !== undefined) {
      data.fullName = body.fullName.trim() || null as any;
    }
    if (body.homeUniversity !== undefined) {
      data.homeUniversity = body.homeUniversity.trim() || null as any;
    }
    if (body.dateOfBirth !== undefined) {
      data.dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : null;
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true, email: true, role: true,
        createdAt: true, updatedAt: true,
        fullName: true, dateOfBirth: true, homeUniversity: true,
      },
    });

    return { user };
  }
}
