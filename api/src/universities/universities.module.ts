import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';

import { UniversitiesController } from './universities.controller';
import { UniversitiesService } from './universities.service';

import { UniversitySelfRequirementsController } from './university-self-requirements.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    UniversitiesController,
    UniversitySelfRequirementsController,
  ],
  providers: [UniversitiesService],
})
export class UniversitiesModule {}
