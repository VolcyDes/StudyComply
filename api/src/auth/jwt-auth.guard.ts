import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

function tokenFromAuthHeader(h?: string | string[]) {
  const authHeader = Array.isArray(h) ? h[0] : h;
  if (!authHeader) return null;
  if (!authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice("Bearer ".length).trim() || null;
}

function tokenFromCookie(req: any) {
  // requires cookie-parser in main.ts (✅ you added it)
  const c = req?.cookies;
  if (!c) return null;
  const t = c["sc_token"];
  return typeof t === "string" && t.trim() ? t.trim() : null;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const bearer = tokenFromAuthHeader(req?.headers?.authorization);
    const cookie = tokenFromCookie(req);

    const token = cookie ?? bearer;
    if (!token) {
      throw new UnauthorizedException("Missing auth token");
    }

    try {
      const payload = await this.jwt.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      req.user = payload; // { sub, email, role, universityId, iat, exp }
      return true;
    } catch {
      throw new UnauthorizedException("Invalid token");
    }
  }
}
