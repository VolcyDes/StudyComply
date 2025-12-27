import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequirementsService } from './requirements.service';

@Controller('api/v1/requirements')
@UseGuards(JwtAuthGuard)
export class RequirementsController {
  constructor(private readonly reqs: RequirementsService) {}

  @Get()
  compute(@Req() req: any) {
    return this.reqs.compute(req.user.sub);
  }
}
