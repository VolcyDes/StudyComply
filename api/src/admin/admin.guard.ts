import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";

/**
 * MVP Admin Guard:
 * - Requires req.user to be populated by JwtAuthGuard
 * - Allows admin if:
 *   - req.user.role === "ADMIN" (future DB role)
 *   - OR req.user.email is in ADMIN_EMAILS env (comma-separated)
 */
function parseAdmins(raw?: string) {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (!user) throw new ForbiddenException("Not authenticated");

    const admins = parseAdmins(process.env.ADMIN_EMAILS);
    const email = typeof user.email === "string" ? user.email.toLowerCase() : "";

    // Future-proof: if later you add role in JWT payload or DB lookup
    if (user.role === "ADMIN") return true;
    if (admins.includes(email)) return true;

    throw new ForbiddenException("Admin only");
  }
}
