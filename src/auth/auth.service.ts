import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '../generated/prisma/client';
import {
  TwitchProfileInterface,
  TwitchTokenInterface,
  JwtPayloadInterface,
  UserInformationsInterface,
} from '../interfaces/auth.interface';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly callbackUrl: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {
    this.clientId = process.env.TWITCH_CLIENT_ID ?? '';
    this.clientSecret = process.env.TWITCH_CLIENT_SECRET ?? '';
    this.callbackUrl = process.env.TWITCH_CALLBACK_URL ?? '';

    if (!this.clientId || !this.clientSecret || !this.callbackUrl) {
      throw new Error('Missing Twitch environment variables');
    }
  }

  getTwitchAuthUrl(res: Response): string {
    const csrfState = crypto.randomBytes(16).toString('hex');
    const fiveMinMaxAge = 5 * 60 * 1000;

    res.cookie('oauth_state', csrfState, {
      httpOnly: true,
      signed: true,
      maxAge: fiveMinMaxAge,
      sameSite: 'lax',
    });

    const params: URLSearchParams = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.callbackUrl,
      response_type: 'code',
      scope: [
        'user:read:email',
        'user:read:subscriptions',
        'channel:read:subscriptions',
        'bits:read',
      ].join(' '),
      state: csrfState,
    });

    return `https://id.twitch.tv/oauth2/authorize?${params.toString()}`;
  }

  async getAuthenticatedUser(
    req: Request,
  ): Promise<UserInformationsInterface | null> {
    return this.prisma.user.findUnique({
      where: { id: req.user!.sub },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        overlayToken: true,
        createdAt: true,
      },
    });
  }

  async getValidAccessToken(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const now = Date.now();
    const expiresAt = user.twitchTokenExpiresAt?.getTime();
    const tenMin = 10 * 60 * 1000;

    if (!expiresAt || expiresAt - now <= tenMin) {
      const tokenRefreshed = await this.refreshTwitchToken(user);
      const userUpdated = await this.updateUserInDatabase(user, tokenRefreshed);
      return userUpdated.twitchAccessToken!;
    }

    return user.twitchAccessToken!;
  }

  async revokeTwitchToken(userId: string, res: Response) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const params: URLSearchParams = new URLSearchParams({
      client_id: this.clientId,
      token: user.twitchAccessToken!,
    });

    const response = await fetch('https://id.twitch.tv/oauth2/revoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new UnauthorizedException('Failed to revoke Twitch token');
    }

    await this.clearTwitchTokenInDatabase(user);
    res.clearCookie('access_token');
  }

  async handleTwitchCallback(
    code: string,
    state: string,
    req: Request,
    res: Response,
  ): Promise<void> {
    const savedState: string | undefined = req.signedCookies['oauth_state'] as
      | string
      | undefined;

    if (!savedState || savedState !== state) {
      throw new UnauthorizedException('Invalid OAuth state');
    }

    res.clearCookie('oauth_state');

    const token = await this.exchangeCodeForToken(code);
    const profile = await this.getTwitchProfile(token.access_token);
    const user = await this.upsertUserInDatabase(profile, token);
    this.generateJwt(user, res);
  }

  private async exchangeCodeForToken(
    code: string,
  ): Promise<TwitchTokenInterface> {
    const params: URLSearchParams = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: this.callbackUrl,
    });

    const response = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
      signal: AbortSignal.timeout(30000), // 30 secondes
    });

    if (!response.ok) {
      throw new UnauthorizedException('Failed to exchange code for token');
    }

    return response.json() as Promise<TwitchTokenInterface>;
  }

  private async getTwitchProfile(
    accessToken: string,
  ): Promise<TwitchProfileInterface> {
    const response = await fetch('https://api.twitch.tv/helix/users', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Client-Id': this.clientId,
      },
    });

    if (!response.ok) {
      throw new UnauthorizedException('Failed to fetch Twitch profile');
    }

    const data = (await response.json()) as {
      data: Array<TwitchProfileInterface>;
    };

    return data.data[0];
  }

  private async upsertUserInDatabase(
    profile: TwitchProfileInterface,
    token: TwitchTokenInterface,
  ): Promise<User> {
    const twitchData = {
      username: profile.display_name,
      avatarUrl: profile.profile_image_url,
      twitchAccessToken: token.access_token,
      twitchRefreshToken: token.refresh_token,
      twitchTokenExpiresAt: new Date(Date.now() + token.expires_in * 1000),
    };

    return await this.prisma.user.upsert({
      where: { twitchId: profile.id },
      update: twitchData,
      create: {
        twitchId: profile.id,
        overlayToken: crypto.randomBytes(32).toString('hex'),
        ...twitchData,
      },
    });
  }

  private async updateUserInDatabase(
    user: User,
    token: TwitchTokenInterface,
  ): Promise<User> {
    const twitchData = {
      twitchAccessToken: token.access_token,
      twitchRefreshToken: token.refresh_token,
      twitchTokenExpiresAt: new Date(Date.now() + token.expires_in * 1000),
    };

    return await this.prisma.user.update({
      where: { id: user.id },
      data: twitchData,
    });
  }

  private async clearTwitchTokenInDatabase(user: User) {
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        twitchAccessToken: null,
        twitchRefreshToken: null,
        twitchTokenExpiresAt: null,
      },
    });
  }

  private generateJwt(user: User, res: Response) {
    const payload: JwtPayloadInterface = {
      sub: user.id,
      username: user.username,
    };
    const sevenDaysMaxAge = 7 * 24 * 60 * 60 * 1000;

    const jwt = this.jwtService.sign(payload);

    res.cookie('access_token', jwt, {
      httpOnly: true,
      signed: true,
      sameSite: 'lax',
      maxAge: sevenDaysMaxAge,
    });

    res.redirect(302, process.env.FRONTEND_URL ?? 'http://localhost:3000/');
  }

  private async refreshTwitchToken(user: User) {
    const params: URLSearchParams = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: user.twitchRefreshToken!,
    });

    const response = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new UnauthorizedException('Failed to refresh Twitch token');
    }

    return response.json() as Promise<TwitchTokenInterface>;
  }
}
