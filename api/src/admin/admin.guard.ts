import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

/**
 * Guard:
 * - ADMIN: full access
 * - UNIVERSITY: can manage requirements ONLY for its own universityId
 *
 * Assumes JwtAuthGuard ran before and set req.user = { sub, email, ... }
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const jwtUser = req.user;

    if (!jwtUser?.sub) throw new ForbiddenException("Not authenticated");

    const user = await this.prisma.user.findUnique({
      where: { id: String(jwtUser.sub) },
      select: { id: true, role: true, universityId: true },
    });

    if (!user) throw new ForbiddenException("Not authenticated");

    // ADMIN: ok
    if (user.role === "ADMIN") return true;

    // UNIVERSITY: scoped access
    if (user.role === "UNIVERSITY") {
      // For routes with :universityId param
      const universityIdParam = req.params?.universityId;

      // If this route is scoped by universityId, enforce match
      if (universityIdParam) {
        if (!user.universityId) throw new ForbiddenException("No university linked");
        if (user.universityId !== universityIdParam) {
          throw new ForbiddenException("University scope mismatch");
        }
        return true;
      }

      // For update/delete routes by requirement id, verify ownership
      const reqId = req.params?.id;
      if (reqId) {
        if (!user.universityId) throw new ForbiddenException("No university linked");

        const r = await this.prisma.universityRequirement.findUnique({
          where: { id: String(reqId) },
          select: { universityId: true },
        });

        if (!r) throw new ForbiddenException("Not found");
        if (r.universityId !== user.universityId) {
          throw new ForbiddenException("University scope mismatch");
        }
        return true;
      }

      // Otherwise deny by default
      throw new ForbiddenException("University not allowed");
    }

    throw new ForbiddenException("Admin only");
  }
}
