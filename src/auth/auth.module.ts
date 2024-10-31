import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { AccessTokenStrategy } from './strategies/access-token.strategy';

@Module({
  imports: [JwtModule.register({}), ConfigModule],
  controllers: [AuthController],
  providers: [AuthService, AccessTokenStrategy, RefreshTokenStrategy],
})
export class AuthModule {}
