import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../types';

export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(@Inject() configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.isAnonymous) {
      return payload;
    }

    return payload;
  }
}
