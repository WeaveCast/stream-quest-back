import {
  BadRequestException,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SessionGuard } from '../guard/session.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { createMockSession } from './fixtures/session.fixture';
import { createMockCampaign } from '../../campaign/test/fixtures/campaign.fixture';

const createMockPrismaService = () => ({
  session: {
    findUnique: jest.fn(),
  },
  campaign: {
    findUnique: jest.fn(),
  },
});

const createMockExecutionContext = (
  overrides: {
    userId?: string;
    sessionId?: string;
  } = {},
): ExecutionContext => {
  const request = {
    user:
      overrides.userId !== undefined ? { sub: overrides.userId } : undefined,
    params: { id: overrides.sessionId ?? 'session-123' },
    session: undefined,
    campaign: undefined,
  };

  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
};

describe('SessionGuard', () => {
  let guard: SessionGuard;
  let prismaService: PrismaService;

  const mockSession = createMockSession();
  const mockCampaign = createMockCampaign();
  const mockPrismaService = createMockPrismaService();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionGuard,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    guard = module.get(SessionGuard);
    prismaService = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should return true when user owns the session campaign', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        sessionId: 'session-123',
      });

      jest
        .spyOn(prismaService.session, 'findUnique')
        .mockResolvedValue(mockSession);
      jest
        .spyOn(prismaService.campaign, 'findUnique')
        .mockResolvedValue(mockCampaign);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should attach session and campaign to request', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        sessionId: 'session-123',
      });
      const request = context.switchToHttp().getRequest();

      jest
        .spyOn(prismaService.session, 'findUnique')
        .mockResolvedValue(mockSession);
      jest
        .spyOn(prismaService.campaign, 'findUnique')
        .mockResolvedValue(mockCampaign);

      await guard.canActivate(context);

      expect(request.session).toEqual(mockSession);
      expect(request.campaign).toEqual(mockCampaign);
    });

    it('should throw ForbiddenException when user is not authenticated', async () => {
      const context = createMockExecutionContext({
        userId: undefined,
        sessionId: 'session-123',
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'User not authenticated',
      );
    });

    it('should throw BadRequestException when session id is missing', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        sessionId: '',
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        BadRequestException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Session id not provided',
      );
    });

    it('should throw NotFoundException when session is not found', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        sessionId: 'not-found',
      });

      jest.spyOn(prismaService.session, 'findUnique').mockResolvedValue(null);

      await expect(guard.canActivate(context)).rejects.toThrow(
        NotFoundException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Session not found',
      );
    });

    it('should throw NotFoundException when campaign is not found', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        sessionId: 'session-123',
      });

      jest
        .spyOn(prismaService.session, 'findUnique')
        .mockResolvedValue(mockSession);
      jest.spyOn(prismaService.campaign, 'findUnique').mockResolvedValue(null);

      await expect(guard.canActivate(context)).rejects.toThrow(
        NotFoundException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Campaign not found',
      );
    });

    it('should throw ForbiddenException when user does not own the campaign', async () => {
      const context = createMockExecutionContext({
        userId: 'other-user',
        sessionId: 'session-123',
      });

      jest
        .spyOn(prismaService.session, 'findUnique')
        .mockResolvedValue(mockSession);
      jest
        .spyOn(prismaService.campaign, 'findUnique')
        .mockResolvedValue(mockCampaign); // gameMasterId: 'user-123'

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'You do not have permission to access this campaign',
      );
    });

    it('should query session with correct id', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        sessionId: 'session-123',
      });

      jest
        .spyOn(prismaService.session, 'findUnique')
        .mockResolvedValue(mockSession);
      jest
        .spyOn(prismaService.campaign, 'findUnique')
        .mockResolvedValue(mockCampaign);

      await guard.canActivate(context);

      expect(prismaService.session.findUnique).toHaveBeenCalledWith({
        where: { id: 'session-123' },
      });
    });

    it('should query campaign with session campaignId', async () => {
      const context = createMockExecutionContext({
        userId: 'user-123',
        sessionId: 'session-123',
      });

      jest
        .spyOn(prismaService.session, 'findUnique')
        .mockResolvedValue(mockSession); // campaignId: 'campaign-123'
      jest
        .spyOn(prismaService.campaign, 'findUnique')
        .mockResolvedValue(mockCampaign);

      await guard.canActivate(context);

      expect(prismaService.campaign.findUnique).toHaveBeenCalledWith({
        where: { id: 'campaign-123' },
      });
    });
  });
});
