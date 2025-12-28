import { Body, Controller, Delete, Get, Req, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProjectsService } from './projects.service';

const STUDY_PURPOSES = new Set(['exchange', 'internship', 'degree', 'phd', 'language']);

@Controller('api/v1/projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get('active')
  active(@Req() req: any) {
    return this.projects.getActive(req.user.sub);
  }

  @Post('active')
  createActive(
    @Req() req: any,
    @Body() body: { destinationCountry: string; purpose: string; startDate: string; endDate: string } = {} as any,
  ) {
    const dest = (body.destinationCountry || '').trim().toUpperCase();
    const purpose = (body.purpose || '').trim();

    if (!dest || dest.length !== 2) {
      return { message: 'destinationCountry must be ISO2 (e.g. DE, ES)' };
    }
    if (!STUDY_PURPOSES.has(purpose)) {
      return { message: `purpose must be one of: ${Array.from(STUDY_PURPOSES).join(', ')}` };
    }
    if (!body.startDate || !body.endDate) {
      return { message: 'startDate and endDate are required' };
    }

    return this.projects.createActive(req.user.sub, {
      destinationCountry: dest,
      purpose,
      startDate: body.startDate,
      endDate: body.endDate,
    });
  }

  @Delete('active')
  clear(@Req() req: any) {
    return this.projects.clearActive(req.user.sub);
  }
}
