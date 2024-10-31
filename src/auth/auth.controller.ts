import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login/anonymous')
  async anonymousLogin() {
    console.log('Anonymous login');
    return await this.authService.anonymousLogin();
  }
}
