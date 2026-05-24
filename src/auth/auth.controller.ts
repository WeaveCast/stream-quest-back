import { Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';
import { UserInformationsInterface } from './interface/auth.interface';
import type { JwtPayloadInterface } from './interface/auth.interface';
import { ApiAuthRoute, ApiPublicRoute } from './decorator/api-auth.decorator';
import { ApiTags } from '@nestjs/swagger';
import { UserInformationsResponseDto } from './dto/user-informations-response.dto';
import { UserContext } from '../decorators/user.decorator';

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
    @UserContext() user: JwtPayloadInterface,
  ): Promise<UserInformationsInterface | null> {
    return await this.authService.getAuthenticatedUser(user);
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
  async twitchLogout(
    @UserContext() user: JwtPayloadInterface,
    @Res() res: Response,
  ): Promise<Response<{ code: number; message: string }>> {
    await this.authService.revokeTwitchToken(user.sub, res);
    return res
      .status(200)
      .json({ code: 200, message: 'Successfully logged out' });
  }
}
