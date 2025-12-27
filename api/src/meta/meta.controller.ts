import { Controller, Get } from '@nestjs/common';

type Country = { code: string; name: string };
type Purpose = { code: string; label: string };

const COUNTRIES: Country[] = [
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'IE', name: 'Ireland' },
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
];

const PURPOSES: Purpose[] = [
  { code: 'exchange', label: 'Exchange (semester)' },
  { code: 'internship', label: 'Internship' },
  { code: 'degree', label: 'Full degree' },
  { code: 'phd', label: 'PhD / Research' },
  { code: 'language', label: 'Language program' },
];

@Controller('api/v1/meta')
export class MetaController {
  @Get('countries')
  countries() {
    return COUNTRIES;
  }

  @Get('purposes')
  purposes() {
    return PURPOSES;
  }
}
