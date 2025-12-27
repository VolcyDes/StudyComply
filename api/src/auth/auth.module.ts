import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MeController } from './me.controller';
import { AuthCommonModule } from './auth-common.module';

@Module({
  imports: [AuthCommonModule],
  controllers: [AuthController, MeController],
  providers: [AuthService],
})
export class AuthModule {}
