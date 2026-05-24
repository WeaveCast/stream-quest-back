import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  createMockUser,
  createMockTwitchProfile,
  createMockTwitchToken,
} from './fixtures/auth.fixture';
import { createMockJwtService } from './mocks/jwt.service.mock';
import { createMockPrismaService } from './mocks/prisma.mock';

global.fetch = jest.fn();

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;

  const mockUser = createMockUser();
  const mockJwtService = createMockJwtService();
  const mockPrismaService = createMockPrismaService();

  let mockResponse: any;
  let mockRequest: any;

  beforeAll(() => {
    process.env.TWITCH_CLIENT_ID = 'test-client-id';
    process.env.TWITCH_CLIENT_SECRET = 'test-client-secret';
    process.env.TWITCH_CALLBACK_URL =
      'http://localhost:3999/auth/twitch/callback';
    process.env.FRONTEND_URL = 'http://localhost:3000';
  });

  beforeEach(async () => {
    mockResponse = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
      redirect: jest.fn(),
    };

    mockRequest = {
      user: { sub: 'user-123', username: 'testuser' },
      signedCookies: {},
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
    prismaService = module.get(PrismaService);

    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('getTwitchAuthUrl', () => {
    it('should generate Twitch auth URL with state cookie', () => {
      const url = service.getTwitchAuthUrl(mockResponse);

      expect(url).toContain('https://id.twitch.tv/oauth2/authorize');
      expect(url).toContain('client_id=test-client-id');
      expect(url).toContain('response_type=code');
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'oauth_state',
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          signed: true,
          sameSite: 'lax',
        }),
      );
    });
  });

  describe('getAuthenticatedUser', () => {
    it('should return user information', async () => {
      const userInfo = {
        id: 'user-123',
        username: 'testuser',
        avatarUrl: 'https://avatar.url',
        overlayToken: 'token-123',
        createdAt: new Date(),
      };

      const mockJwtPayload = { sub: 'user-123', username: 'testuser' };

      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(userInfo as any);

      const result = await service.getAuthenticatedUser(mockJwtPayload);

      expect(result).toEqual(userInfo);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          overlayToken: true,
          createdAt: true,
        },
      });
    });

    it('should return null if user not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      const result = await service.getAuthenticatedUser(mockRequest);

      expect(result).toBeNull();
    });
  });

  describe('getValidAccessToken', () => {
    it('should return valid access token if not expired', async () => {
      const futureDate = new Date(Date.now() + 3600000); // 1h dans le futur
      const user = createMockUser({ twitchTokenExpiresAt: futureDate });

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);

      const result = await service.getValidAccessToken('user-123');

      expect(result).toBe('access-token-123');
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(service.getValidAccessToken('user-123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should refresh token if expired', async () => {
      const pastDate = new Date(Date.now() - 3600000); // 1h dans le passé
      const user = createMockUser({ twitchTokenExpiresAt: pastDate });
      const newToken = createMockTwitchToken();

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(newToken),
      });
      jest.spyOn(prismaService.user, 'update').mockResolvedValue({
        ...user,
        twitchAccessToken: newToken.access_token,
      });

      const result = await service.getValidAccessToken('user-123');

      expect(result).toBe(newToken.access_token);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should clear tokens if refresh fails', async () => {
      const pastDate = new Date(Date.now() - 3600000);
      const user = createMockUser({ twitchTokenExpiresAt: pastDate });

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
      });
      jest.spyOn(prismaService.user, 'update').mockResolvedValue(user);

      await expect(service.getValidAccessToken('user-123')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          twitchAccessToken: null,
          twitchRefreshToken: null,
          twitchTokenExpiresAt: null,
        },
      });
    });
  });

  describe('revokeTwitchToken', () => {
    it('should revoke token and clear cookie', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);
      (global.fetch as jest.Mock).mockResolvedValue({ ok: true });
      jest.spyOn(prismaService.user, 'update').mockResolvedValue(mockUser);

      await service.revokeTwitchToken('user-123', mockResponse);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://id.twitch.tv/oauth2/revoke',
        expect.objectContaining({ method: 'POST' }),
      );
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('access_token');
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(
        service.revokeTwitchToken('user-123', mockResponse),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if revoke fails', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);
      (global.fetch as jest.Mock).mockResolvedValue({ ok: false });

      await expect(
        service.revokeTwitchToken('user-123', mockResponse),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('handleTwitchCallback', () => {
    it('should handle successful callback', async () => {
      const code = 'auth-code-123';
      const state = 'state-123';
      const token = createMockTwitchToken();
      const profile = createMockTwitchProfile();

      mockRequest.signedCookies['oauth_state'] = state;

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(token),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ data: [profile] }),
        });

      jest.spyOn(prismaService.user, 'upsert').mockResolvedValue(mockUser);

      await service.handleTwitchCallback(
        code,
        state,
        mockRequest,
        mockResponse,
      );

      expect(mockResponse.clearCookie).toHaveBeenCalledWith('oauth_state');
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'access_token',
        expect.any(String),
        expect.any(Object),
      );
      expect(mockResponse.redirect).toHaveBeenCalledWith(
        302,
        'http://localhost:3000',
      );
    });

    it('should throw UnauthorizedException on invalid state', async () => {
      const code = 'auth-code-123';
      const state = 'state-123';

      mockRequest.signedCookies['oauth_state'] = 'different-state';

      await expect(
        service.handleTwitchCallback(code, state, mockRequest, mockResponse),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if state cookie missing', async () => {
      const code = 'auth-code-123';
      const state = 'state-123';

      mockRequest.signedCookies = {};

      await expect(
        service.handleTwitchCallback(code, state, mockRequest, mockResponse),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
