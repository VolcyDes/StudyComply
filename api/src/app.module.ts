import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { DocumentsModule } from './documents/documents.module';
import { MetaModule } from './meta/meta.module';
import { PassportsModule } from "./passports/passports.module";
import { ProjectsModule } from "./projects/projects.module";
import { RequirementsModule } from "./requirements/requirements.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    DocumentsModule,
    MetaModule,
  , MetaModule, PassportsModule, ProjectsModule, RequirementsModule, PassportsModule].filter(Boolean) as any,

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
