import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { createMockUserInformations } from './fixtures/auth.fixture';

describe('AuthController', () => {
  let controller: AuthController;

  const mockUserInfo = createMockUserInformations();

  const mockAuthService = {
    getTwitchAuthUrl: jest.fn(),
    getAuthenticatedUser: jest.fn(),
    revokeTwitchToken: jest.fn(),
    handleTwitchCallback: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.user = { sub: 'user-123', username: 'testuser' };
      return true;
    }),
  };

  let mockResponse: any;
  let mockRequest: any;

  beforeEach(async () => {
    mockResponse = {
      redirect: jest.fn(),
      cookie: jest.fn(),
      clearCookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockRequest = {
      user: { sub: 'user-123', username: 'testuser' },
      signedCookies: {},
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get(AuthController);

    jest.clearAllMocks();
  });

  describe('twitchAuth', () => {
    it('should redirect to Twitch auth URL', () => {
      const authUrl = 'https://id.twitch.tv/oauth2/authorize?client_id=123';
      mockAuthService.getTwitchAuthUrl.mockReturnValue(authUrl);

      controller.twitchAuth(mockResponse);

      expect(mockResponse.redirect).toHaveBeenCalledWith(302, authUrl);
      expect(mockAuthService.getTwitchAuthUrl).toHaveBeenCalledWith(
        mockResponse,
      );
    });
  });

  describe('twitchCallback', () => {
    it('should handle Twitch callback', async () => {
      const code = 'auth-code';
      const state = 'state-token';

      await controller.twitchCallback(code, state, mockRequest, mockResponse);

      expect(mockAuthService.handleTwitchCallback).toHaveBeenCalledWith(
        code,
        state,
        mockRequest,
        mockResponse,
      );
    });
  });

  describe('userInformations', () => {
    it('should return user information', async () => {
      mockAuthService.getAuthenticatedUser.mockResolvedValue(mockUserInfo);

      const result = await controller.userInformations(mockRequest);

      expect(result).toEqual(mockUserInfo);
      expect(mockAuthService.getAuthenticatedUser).toHaveBeenCalledWith(
        mockRequest,
      );
    });
  });

  describe('twitchLogout', () => {
    it('should logout and revoke token', async () => {
      const mockUser = { sub: 'user-123', username: 'testuser' };

      await controller.twitchLogout(mockUser, mockResponse);

      expect(mockAuthService.revokeTwitchToken).toHaveBeenCalledWith(
        'user-123',
        mockResponse,
      );
    });
  });
});
