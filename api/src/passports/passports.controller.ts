import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PassportsService } from './passports.service';

@Controller('api/v1/passports')
@UseGuards(JwtAuthGuard)
export class PassportsController {
  constructor(private readonly passports: PassportsService) {}

  @Get()
  list(@Req() req: any) {
    return this.passports.findAll(req.user.sub);
  }

  @Post()
  async create(@Req() req: any, @Body() body: { countryCode: string }) {
    const created = await this.passports.create(req.user.sub, body.countryCode);
    if (!created) throw new ConflictException('Passport already exists');
    return created;
  }

  @Delete(':countryCode')
  async remove(@Req() req: any, @Param('countryCode') countryCode: string) {
    const count = await this.passports.remove(req.user.sub, countryCode);
    return { deleted: count > 0 };
  }
}
