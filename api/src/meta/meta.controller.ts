import { Controller, Get } from '@nestjs/common';
import { MetaService } from './meta.service';

@Controller('meta')
export class MetaController {
  constructor(private readonly meta: MetaService) {}

  @Get('countries')
  countries() {
    return this.meta.countries();
  }

  @Get('purposes')
  purposes() {
    // MetaService returns { key, label } → we expose { code, label } to keep API stable
    return this.meta.purposes().then((rows) =>
      rows.map((p: any) => ({ code: p.key ?? p.code, label: p.label })),
    );
  }
}
