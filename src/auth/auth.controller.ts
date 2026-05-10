import { Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';
import { UserInformationsInterface } from '../interfaces/auth.interface';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

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
  @UseGuards(JwtAuthGuard)
  async myInformations(
    @Req() req: Request,
  ): Promise<UserInformationsInterface | null> {
    return await this.authService.getAuthenticatedUser(req);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async twitchLogout(@Req() req: Request, @Res() res: Response) {
    await this.authService.revokeTwitchToken(req.user!.sub, res);
  }
}
