import { Controller, Get, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('api/v1')
export class MeController {
  constructor(private readonly prisma: PrismaService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: any) {
    const userId = req.user?.sub;

    if (!userId) throw new UnauthorizedException('Unauthorized');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true,
      role: true,
      universityId: true, createdAt: true, updatedAt: true },
    });

    
    if (!user) throw new UnauthorizedException('Unauthorized');
return { user: { id: user.id, email: user.email, role: user.role, universityId: user.universityId ?? null, createdAt: user.createdAt, updatedAt: user.updatedAt } };
  }
}
