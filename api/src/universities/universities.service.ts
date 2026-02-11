import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PublicUniversityDTO } from "./dto/public-university.dto";
import { PublicUniversityRequirementDTO } from "./dto/public-university-requirement.dto";

function toISO(d: Date | null | undefined): string | null {
  if (!d) return null;
  return d.toISOString();
}

function computeDueDate(projectStartISO: string, dueDaysBefore: number): string | null {
  const start = new Date(projectStartISO);
  if (Number.isNaN(start.getTime())) return null;
  const computed = new Date(start);
  computed.setDate(computed.getDate() - dueDaysBefore);
  return computed.toISOString();
}

@Injectable()
export class UniversitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async searchUniversities(query?: string): Promise<PublicUniversityDTO[]> {
    const q = (query ?? "").trim();
    const rows = await this.prisma.university.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { slug: { contains: q, mode: "insensitive" } },
              { city: { contains: q, mode: "insensitive" } },
              { countryCode: { contains: q, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { name: "asc" },
      take: 25,
      select: {
        slug: true,
        name: true,
        countryCode: true,
        city: true,
        websiteUrl: true,
      },
    });

    return rows.map((r) => ({
      slug: r.slug,
      name: r.name,
      countryCode: r.countryCode,
      city: r.city,
      websiteUrl: r.websiteUrl,
    }));
  }

  async getUniversityBySlug(slug: string): Promise<PublicUniversityDTO> {
    const s = slug.trim();
    if (!s) throw new BadRequestException("slug is required");

    const row = await this.prisma.university.findUnique({
      where: { slug: s },
      select: {
        slug: true,
        name: true,
        countryCode: true,
        city: true,
        websiteUrl: true,
      },
    });

    if (!row) throw new NotFoundException("University not found");

    return {
      slug: row.slug,
      name: row.name,
      countryCode: row.countryCode,
      city: row.city,
      websiteUrl: row.websiteUrl,
    };
  }

  async getUniversityRequirements(params: {
    slug: string;
    stayMode?: "SHORT" | "LONG" | "ANY";
    projectStart?: string;
  }): Promise<PublicUniversityRequirementDTO[]> {
    const slug = params.slug.trim();
    if (!slug) throw new BadRequestException("slug is required");

    // Ensure university exists
    const uni = await this.prisma.university.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!uni) throw new NotFoundException("University not found");

    const stayMode = params.stayMode ?? "ANY";

    const rows = await this.prisma.universityRequirement.findMany({
      where: {
        universityId: uni.id,
        OR:
          stayMode === "ANY"
            ? [{ stayMode: "ANY" }, { stayMode: "SHORT" }, { stayMode: "LONG" }]
            : [{ stayMode: "ANY" }, { stayMode }],
      },
      orderBy: [
        { kind: "asc" }, // REQUIRED first (enum order, ok)
        { priority: "desc" },
        { createdAt: "asc" },
      ],
      select: {
        id: true,
        title: true,
        description: true,
        kind: true,
        priority: true,
        stayMode: true,
        dueDate: true,
        dueDaysBefore: true,
        ctaLabel: true,
        ctaUrl: true,
      },
    });

    return rows.map((r) => {
      const computed =
        params.projectStart && typeof r.dueDaysBefore === "number"
          ? computeDueDate(params.projectStart, r.dueDaysBefore)
          : null;

      return {
        id: r.id,
        title: r.title,
        description: r.description,
        kind: r.kind as any,
        priority: r.priority as any,
        stayMode: r.stayMode as any,
        dueDate: toISO(r.dueDate),
        dueDaysBefore: r.dueDaysBefore ?? null,
        computedDueDate: computed,
        ctaLabel: r.ctaLabel ?? null,
        ctaUrl: r.ctaUrl ?? null,
      };
    });
  }
}
