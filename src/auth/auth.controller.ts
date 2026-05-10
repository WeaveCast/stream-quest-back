import { Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';
import { UserInformationsInterface } from '../interfaces/auth.interface';
import { ApiAuthRoute, ApiPublicRoute } from '../decorators/api-auth.decorator';
import { ApiTags } from '@nestjs/swagger';
import { UserInformationsResponseDto } from '../dto/auth/user-informations-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('twitch')
  @ApiPublicRoute('Route used to log into Twitch account', {
    queries: [],
    responses: [{ status: 302, description: 'Redirects to twitch login page' }],
  })
  twitchAuth(@Res() res: Response) {
    res.redirect(302, this.authService.getTwitchAuthUrl(res));
  }

  @Get('twitch/callback')
  @ApiPublicRoute('Route used for the Twitch callback', {
    queries: [
      { name: 'code', description: 'Authorization code', example: 'abc123' },
      { name: 'state', description: 'CSRF state token', example: 'f3a2b1' },
    ],
    responses: [{ status: 302, description: 'Redirects to frontend' }],
  })
  async twitchCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.authService.handleTwitchCallback(code, state, req, res);
  }

  @Get('me')
  @ApiAuthRoute('Get current authenticated user', {
    queries: [],
    responses: [
      {
        status: 200,
        description: 'Returns the authenticated user',
        type: UserInformationsResponseDto,
      },
    ],
  })
  async userInformations(
    @Req() req: Request,
  ): Promise<UserInformationsInterface | null> {
    return await this.authService.getAuthenticatedUser(req);
  }

  @Post('logout')
  @ApiAuthRoute('Logout and clean access_token', {
    queries: [],
    responses: [
      {
        status: 200,
        description: 'Correctly remove access_token',
      },
    ],
  })
  async twitchLogout(@Req() req: Request, @Res() res: Response) {
    await this.authService.revokeTwitchToken(req.user!.sub, res);
  }
}
