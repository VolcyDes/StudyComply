import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class UniversityGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    return true; // TODO: implement real logic
  }
}
