import { Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';
import { UserInformationsInterface } from '../interfaces/auth.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('twitch')
  twitchAuth(@Res() res: Response) {
    res.redirect(this.authService.getTwitchAuthUrl(res));
  }

  @Get('twitch/callback')
  async twitchCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.authService.handleTwitchCallback(code, state, req, res);
  }

  @Get('me')
  async myInformations(
    @Req() req: Request,
  ): Promise<UserInformationsInterface | null> {
    return await this.authService.getUserInformationsFromCookie(req);
  }

  @Post('logout')
  async twitchLogout(@Query('userId') userId: string, @Res() res: Response) {
    await this.authService.revokeTwitchToken(userId, res);
  }
}
