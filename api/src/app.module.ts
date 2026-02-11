import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { HealthController } from "./health.controller";

import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { DocumentsModule } from "./documents/documents.module";
import { MetaModule } from "./meta/meta.module";
import { PassportsModule } from "./passports/passports.module";
import { ProjectsModule } from "./projects/projects.module";
import { RequirementsModule } from "./requirements/requirements.module";
import { UniversitiesModule } from "./universities/universities.module";
import { AdminModule } from "./admin/admin.module";

@Module({
  imports: [
    // Global rate-limit baseline (can be overridden per route)
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),

    PrismaModule,
    AuthModule,
    DocumentsModule,
    MetaModule,
    PassportsModule,
    ProjectsModule,
    RequirementsModule,
    UniversitiesModule,
    AdminModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    // ✅ Rate limit on ALL routes by default
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
