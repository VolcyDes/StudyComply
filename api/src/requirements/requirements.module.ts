import { Module } from '@nestjs/common';
import { RequirementsController } from './requirements.controller';
import { RequirementsService } from './requirements.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PassportsModule } from "../passports/passports.module";

@Module({
  imports: [PrismaModule, PassportsModule],
  controllers: [RequirementsController],
  providers: [RequirementsService],
})
export class RequirementsModule {}
