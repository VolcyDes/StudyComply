import { Controller, Get, Param, Query } from "@nestjs/common";
import { UniversitiesService } from "./universities.service";

@Controller("universities")
export class UniversitiesController {
  constructor(private readonly universities: UniversitiesService) {}

  // GET /api/v1/universities?query=paris
  @Get()
  async search(@Query("query") query?: string) {
    return this.universities.searchUniversities(query);
  }

  // GET /api/v1/universities/:slug
  @Get(":slug")
  async getOne(@Param("slug") slug: string) {
    return this.universities.getUniversityBySlug(slug);
  }

  // GET /api/v1/universities/:slug/requirements?stayMode=LONG&projectStart=2026-09-01T00:00:00.000Z
  @Get(":slug/requirements")
  async getRequirements(
    @Param("slug") slug: string,
    @Query("stayMode") stayMode?: "SHORT" | "LONG" | "ANY",
    @Query("projectStart") projectStart?: string,
  ) {
    return this.universities.getUniversityRequirements({ slug, stayMode, projectStart });
  }
}
