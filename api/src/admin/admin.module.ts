import { UsersAdminController } from "./users.admin.controller";
import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AdminGuard } from "./admin.guard";
import { UniversitiesAdminController } from "./universities.admin.controller";
import { RequirementsAdminController } from "./requirements.admin.controller";

@Module({
  controllers: [UniversitiesAdminController, RequirementsAdminController, UsersAdminController],
  providers: [PrismaService, AdminGuard],
})
export class AdminModule {}
