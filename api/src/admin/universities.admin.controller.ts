import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PrismaService } from "../prisma/prisma.service";
import { AdminGuard } from "./admin.guard";

type CreateUniversityBody = {
  slug: string;
  name: string;
  countryCode: string;
  city?: string | null;
  websiteUrl?: string | null;
};

type UpdateUniversityBody = Partial<CreateUniversityBody>;

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller("admin/universities")
export class UniversitiesAdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list() {
    return this.prisma.university.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        countryCode: true,
        city: true,
        websiteUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  @Post()
  async create(@Body() body: CreateUniversityBody) {
    const slug = body.slug?.trim();
    const name = body.name?.trim();
    const countryCode = body.countryCode?.trim().toUpperCase();

    return this.prisma.university.create({
      data: {
        slug,
        name,
        countryCode,
        city: body.city ?? null,
        websiteUrl: body.websiteUrl ?? null,
      },
      select: {
        id: true,
        slug: true,
        name: true,
        countryCode: true,
        city: true,
        websiteUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() body: UpdateUniversityBody) {
    return this.prisma.university.update({
      where: { id },
      data: {
        ...(body.slug !== undefined ? { slug: body.slug.trim() } : {}),
        ...(body.name !== undefined ? { name: body.name.trim() } : {}),
        ...(body.countryCode !== undefined ? { countryCode: body.countryCode.trim().toUpperCase() } : {}),
        ...(body.city !== undefined ? { city: body.city } : {}),
        ...(body.websiteUrl !== undefined ? { websiteUrl: body.websiteUrl } : {}),
      },
      select: {
        id: true,
        slug: true,
        name: true,
        countryCode: true,
        city: true,
        websiteUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    await this.prisma.university.delete({ where: { id } });
    return { ok: true };
  }
}
