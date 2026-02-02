import { Controller, Get, Req, UseGuards, Query } from "@nestjs/common";
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequirementsService } from './requirements.service';
import { PassportsService } from "../passports/passports.service";
import { evaluateEntry } from "./travel/engine";
import type { DestinationZone, StayBucket } from "./travel/types";
import { resolveUK, resolveUSA, resolveCANADA } from "src/rules/travel";

@Controller('api/v1/requirements')
@UseGuards(JwtAuthGuard)
export class RequirementsController {
  constructor(private readonly reqs: RequirementsService,
    private readonly passportsService: PassportsService
  ) {}

  @Get()
  compute(@Req() req: any) {
    return this.reqs.compute(req.user.sub);
  }
  @Get("travel")
  async travel(@Req() req: any, @Query("destination") destination = "SCHENGEN", @Query("passport") passport = "BEST", @Query("stayBucket") stayBucket = "SHORT") {
    const zone = destination.toString().toUpperCase() as DestinationZone;

    // assumes auth guard attaches req.user
    const userId = req.user?.sub;

    const passports = await this.passportsService.findAll(userId);
    const codesAll = passports.map((p: any) => p.countryCode);
    const forced = (passport ?? "BEST").toString().trim().toUpperCase();
    const codes = forced && forced !== "BEST" ? [forced] : codesAll;
    const bucket = (stayBucket ?? "SHORT").toString().trim().toUpperCase() as StayBucket;
    return evaluateEntry(zone, codes, bucket);
  }

}
