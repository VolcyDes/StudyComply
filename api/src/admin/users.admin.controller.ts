import { Body, Controller, Patch, Param, UseGuards } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AdminGuard } from "./admin.guard";

type UpdateUserRoleBody = {
  role: "USER" | "UNIVERSITY" | "ADMIN";
  universityId?: string | null;
};

@Controller("admin/users")
@UseGuards(JwtAuthGuard, AdminGuard)
export class UsersAdminController {
  constructor(private prisma: PrismaService) {}

  @Patch(":id/role")
  async updateRole(
    @Param("id") id: string,
    @Body() body: UpdateUserRoleBody,
  ) {
    return this.prisma.user.update({
      where: { id },
      data: {
        role: body.role,
        universityId: body.universityId ?? null,
      },
      select: {
        id: true,
        email: true,
        role: true,
        universityId: true,
      },
    });
  }
}
