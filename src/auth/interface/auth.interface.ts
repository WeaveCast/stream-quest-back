export interface TwitchProfileInterface {
  id: string;
  login: string;
  display_name: string;
  profile_image_url: string;
  email: string;
}

export interface TwitchTokenInterface {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface JwtPayloadInterface {
  sub: string;
  username: string;
}

export interface UserInformationsInterface {
  id: string;
  username: string;
  avatarUrl: string | null;
  overlayToken: string;
  createdAt: Date;
}
