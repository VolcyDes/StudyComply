import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PrismaService } from "../prisma/prisma.service";
import { AdminGuard } from "./admin.guard";

type CreateRequirementBody = {
  title: string;
  description?: string | null;
  kind?: "REQUIRED" | "INFO";
  priority?: "LOW" | "MEDIUM" | "HIGH";
  stayMode?: "SHORT" | "LONG" | "ANY";
  dueDate?: string | null;       // ISO string
  dueDaysBefore?: number | null; // integer
  ctaLabel?: string | null;
  ctaUrl?: string | null;
};

type UpdateRequirementBody = Partial<CreateRequirementBody>;

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller("admin")
export class RequirementsAdminController {
  constructor(private readonly prisma: PrismaService) {}

  // GET /api/v1/admin/universities/:id/requirements
  @Get("universities/:universityId/requirements")
  async listForUniversity(
    @Param("universityId") universityId: string,
    @Query("stayMode") stayMode?: "SHORT" | "LONG" | "ANY",
  ) {
    const mode = stayMode ?? "ANY";

    return this.prisma.universityRequirement.findMany({
      where: {
        universityId,
        ...(mode === "ANY"
          ? {}
          : { OR: [{ stayMode: "ANY" }, { stayMode: mode }] }),
      },
      orderBy: [{ kind: "asc" }, { priority: "desc" }, { createdAt: "asc" }],
    });
  }

  // POST /api/v1/admin/universities/:id/requirements
  @Post("universities/:universityId/requirements")
  async createForUniversity(
    @Param("universityId") universityId: string,
    @Body() body: CreateRequirementBody,
  ) {
    const title = body.title?.trim();
    const description = body.description ?? null;

    const dueDate = body.dueDate ? new Date(body.dueDate) : null;

    return this.prisma.universityRequirement.create({
      data: {
        universityId,
        title,
        description,
        kind: (body.kind ?? "REQUIRED") as any,
        priority: (body.priority ?? "MEDIUM") as any,
        stayMode: (body.stayMode ?? "ANY") as any,
        dueDate,
        dueDaysBefore: body.dueDaysBefore ?? null,
        ctaLabel: body.ctaLabel ?? null,
        ctaUrl: body.ctaUrl ?? null,
      },
    });
  }

  // PATCH /api/v1/admin/requirements/:id
  @Patch("requirements/:id")
  async update(@Param("id") id: string, @Body() body: UpdateRequirementBody) {
    return this.prisma.universityRequirement.update({
      where: { id },
      data: {
        ...(body.title !== undefined ? { title: body.title.trim() } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.kind !== undefined ? { kind: body.kind as any } : {}),
        ...(body.priority !== undefined ? { priority: body.priority as any } : {}),
        ...(body.stayMode !== undefined ? { stayMode: body.stayMode as any } : {}),
        ...(body.dueDate !== undefined
          ? { dueDate: body.dueDate ? new Date(body.dueDate) : null }
          : {}),
        ...(body.dueDaysBefore !== undefined ? { dueDaysBefore: body.dueDaysBefore } : {}),
        ...(body.ctaLabel !== undefined ? { ctaLabel: body.ctaLabel } : {}),
        ...(body.ctaUrl !== undefined ? { ctaUrl: body.ctaUrl } : {}),
      },
    });
  }

  // DELETE /api/v1/admin/requirements/:id
  @Delete("requirements/:id")
  async remove(@Param("id") id: string) {
    await this.prisma.universityRequirement.delete({ where: { id } });
    return { ok: true };
  }
}
