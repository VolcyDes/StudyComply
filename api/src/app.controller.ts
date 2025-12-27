import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api/v1')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  health() {
    return { status: 'ok' };
  }

  // (optionnel) on garde aussi la route racine si tu veux
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
