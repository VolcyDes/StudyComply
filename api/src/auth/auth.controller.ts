import { Body, Controller, Post, Res } from "@nestjs/common";
import type { Response } from "express";
import { Throttle } from "@nestjs/throttler";
import { AuthService } from "./auth.service";

@Controller("api/v1/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  register(
    @Body()
    body: { email: string; password: string; role?: "USER" | "UNIVERSITY"; universitySlug?: string }
  ) {
    return this.authService.register(body.email, body.password, body.role, body.universitySlug);
  }

  // ✅ Stronger rate-limit for brute-force protection
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post("login")
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response
  ) {
    const out: any = await this.authService.login(body.email, body.password);

    const token: string | undefined = out?.token;
    if (token) {
      const isProd = process.env.NODE_ENV === "production";

      // HttpOnly session cookie (JWT)
      res.cookie("sc_token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: isProd,
        path: "/",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      });

      // Account kind cookie for routing guard (client-readable)
      const kind = String(out?.user?.role ?? out?.role ?? "").toUpperCase().trim();
      if (kind) {
        res.cookie("sc_account_kind", kind, {
          httpOnly: false,
          sameSite: "lax",
          secure: isProd,
          path: "/",
          maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
        });
      }
    }

    // keep JSON return for now
    return out;
  }

  @Post("logout")
  logout(@Res({ passthrough: true }) res: Response) {
    const isProd = process.env.NODE_ENV === "production";

    res.cookie("sc_token", "", {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      path: "/",
      maxAge: 0,
    });

    res.cookie("sc_account_kind", "", {
      httpOnly: false,
      sameSite: "lax",
      secure: isProd,
      path: "/",
      maxAge: 0,
    });

    return { ok: true };
  }
}
