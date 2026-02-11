import { CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

export class UniversityGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (!user || user.role !== 'UNIVERSITY') {
      throw new ForbiddenException('University access only');
    }

    return true;
  }
}
