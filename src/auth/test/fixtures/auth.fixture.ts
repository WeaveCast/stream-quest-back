import { User } from '../../../generated/prisma/client';
import {
  JwtPayloadInterface,
  TwitchProfileInterface,
  TwitchTokenInterface,
  UserInformationsInterface,
} from '../../interface/auth.interface';

export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-123',
  twitchId: 'twitch-123',
  username: 'testuser',
  avatarUrl: 'https://static-cdn.jtvnw.net/avatar.jpg',
  overlayToken: 'overlay-token-123',
  twitchAccessToken: 'access-token-123',
  twitchRefreshToken: 'refresh-token-123',
  twitchTokenExpiresAt: new Date(Date.now() + 3600000), // 1h dans le futur
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockJwtPayload = (
  overrides: Partial<JwtPayloadInterface> = {},
): JwtPayloadInterface => ({
  sub: 'user-123',
  username: 'testuser',
  ...overrides,
});

export const createMockTwitchProfile = (
  overrides: Partial<TwitchProfileInterface> = {},
): TwitchProfileInterface => ({
  id: 'twitch-123',
  login: 'testuser',
  display_name: 'TestUser',
  profile_image_url: 'https://static-cdn.jtvnw.net/avatar.jpg',
  email: 'test@example.com',
  ...overrides,
});

export const createMockTwitchToken = (
  overrides: Partial<TwitchTokenInterface> = {},
): TwitchTokenInterface => ({
  access_token: 'access-token-123',
  refresh_token: 'refresh-token-123',
  expires_in: 3600,
  ...overrides,
});

export const createMockUserInformations = (
  overrides: Partial<UserInformationsInterface> = {},
): UserInformationsInterface => ({
  id: 'user-123',
  username: 'testuser',
  avatarUrl: 'https://static-cdn.jtvnw.net/avatar.jpg',
  overlayToken: 'overlay-token-123',
  createdAt: new Date('2024-01-01'),
  ...overrides,
});
