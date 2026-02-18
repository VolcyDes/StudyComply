import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { DocumentsModule } from './documents/documents.module';
import { MetaModule } from './meta/meta.module';
import { PassportsModule } from './passports/passports.module';
import { ProjectsModule } from './projects/projects.module';
import { RequirementsModule } from './requirements/requirements.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    DocumentsModule,
    MetaModule,
    PassportsModule,
    ProjectsModule,
    RequirementsModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
