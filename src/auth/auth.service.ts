import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { JwtPayload } from './types';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  async anonymousLogin() {
    const userId = uuidv4();

    const tokens = await this.getJwtTokens({
      sub: userId,
      isAnonymous: true,
    });

    return tokens;
  }

  async getJwtTokens(jwtPayload: JwtPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: '1d',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '1y',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
