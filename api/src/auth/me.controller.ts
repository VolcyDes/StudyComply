import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Role } from '@prisma/client';

function normalizeRole(raw?: string): Role | null {
  if (!raw) return null;
  const upper = raw.toUpperCase();
  if (upper === 'UNIVERSITY') return Role.UNIVERSITY;
  if (upper === 'USER' || upper === 'STUDENT') return Role.USER;
  if (upper === 'ADMIN') return Role.ADMIN;
  return null;
}

@Controller('api/v1')
export class MeController {
  constructor(private readonly prisma: PrismaService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: any) {
    const userId = req.user?.sub;
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true, createdAt: true, updatedAt: true },
    });
    return { user };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(@Req() req: any, @Body() body: { role?: string }) {
    const userId = req.user?.sub;
    const role = normalizeRole(body.role);

    if (!role) {
      return { error: 'Invalid role. Must be STUDENT or UNIVERSITY.' };
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, email: true, role: true, updatedAt: true },
    });

    return { user };
  }
}
