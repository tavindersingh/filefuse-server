import {
  Controller,
  Get,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Get('me')
  async me(@Req() req: Request) {
    console.log('Get user details');
    const userId = req.user['sub'];
    const isAnonymous = req.user['isAnonymous'] || false;

    if (isAnonymous) {
      return {
        id: userId,
      };
    }

    throw new UnauthorizedException('User not found');
  }
}
