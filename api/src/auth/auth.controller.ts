import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const out = await this.authService.login(body.email, body.password);
    const isProd = process.env.NODE_ENV === 'production';

    // access token cookie
    res.cookie('sc_token', out.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // refresh token cookie (AuthService.login returns refreshToken)
    const refreshToken = (out as any).refreshToken as string | undefined;
    if (refreshToken) {
      res.cookie('sc_rt', refreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProd,
        path: '/',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
    }

    // account kind cookie
    const kind = (out.user?.role || 'USER').toString();
    res.cookie('sc_account_kind', kind, {
      httpOnly: false,
      sameSite: 'lax',
      secure: isProd,
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    // cookies-only response
    return { ok: true, user: out.user };
  }

  @Post('verify-email')
  async verifyEmail(@Body() body: { token: string }) {
    const userId = await this.authService.verifyEmailToken(body.token);
    await this.authService.markEmailVerified(userId);
    return { ok: true };
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Body() body: { refreshToken?: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const rt = (req as any).cookies?.sc_rt || body?.refreshToken;
    const out = await this.authService.refresh(rt);

    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('sc_token', out.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie('sc_rt', out.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return { ok: true };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const userId = (req as any).user?.sub || (req as any).user?.id;

    if (userId) {
      await this.authService.clearRefreshTokenForUser(userId).catch(() => undefined);
    }

    res.clearCookie('sc_token', { path: '/' });
    res.clearCookie('sc_rt', { path: '/' });
    res.clearCookie('sc_account_kind', { path: '/' });

    return { ok: true };
  }
}
