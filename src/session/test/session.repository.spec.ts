import { Test, TestingModule } from '@nestjs/testing';
import { SessionRepository } from '../session.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { SessionStatus, TimeOfDay } from '../../generated/prisma/client';
import { createMockSession } from './fixtures/session.fixture';
import { createMockPrismaService } from './mocks/session.prisma.mock';

describe('SessionRepository', () => {
  let repository: SessionRepository;
  let prismaService: PrismaService;

  const mockSession = createMockSession();
  const mockPrismaService = createMockPrismaService();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get(SessionRepository);
    prismaService = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('getSession', () => {
    it('should return a session when found', async () => {
      jest
        .spyOn(prismaService.session, 'findUnique')
        .mockResolvedValue(mockSession);

      const result = await repository.getSession({ id: 'session-123' });

      expect(result).toEqual(mockSession);
      expect(prismaService.session.findUnique).toHaveBeenCalledWith({
        where: { id: 'session-123' },
        include: expect.objectContaining({
          _count: expect.objectContaining({
            select: expect.objectContaining({
              contextSnapshots: true,
              karmaEvents: true,
              sessionEvents: true,
              sessionPlayers: true,
              viewerInteractions: true,
            }),
          }),
        }),
      });
    });

    it('should return null when session not found', async () => {
      jest.spyOn(prismaService.session, 'findUnique').mockResolvedValue(null);

      const result = await repository.getSession({ id: 'not-found' });

      expect(result).toBeNull();
    });
  });

  describe('getSessionList', () => {
    const mockSessions = [
      createMockSession({ id: 'session-1', title: 'Session 1' }),
      createMockSession({ id: 'session-2', title: 'Session 2' }),
    ];

    it('should return sessions in forward direction', async () => {
      jest
        .spyOn(prismaService.session, 'findMany')
        .mockResolvedValue(mockSessions);

      const result = await repository.getSessionList(
        { campaignId: 'campaign-123' },
        { take: 10, direction: 'forward' },
      );

      expect(result).toEqual(mockSessions);
      expect(prismaService.session.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { campaignId: 'campaign-123' },
          take: 10,
          orderBy: { createdAt: 'desc' },
        }),
      );
    });

    it('should return sessions in backward direction (reversed)', async () => {
      jest
        .spyOn(prismaService.session, 'findMany')
        .mockResolvedValue([...mockSessions]);

      const result = await repository.getSessionList(
        { campaignId: 'campaign-123' },
        { take: 10, direction: 'backward', cursor: 'cursor-123' },
      );

      expect(result).toEqual([...mockSessions].reverse());
      expect(prismaService.session.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: -10,
          skip: 1,
          cursor: { id: 'cursor-123' },
        }),
      );
    });

    it('should use default take value of 10', async () => {
      jest
        .spyOn(prismaService.session, 'findMany')
        .mockResolvedValue(mockSessions);

      await repository.getSessionList({ campaignId: 'campaign-123' });

      expect(prismaService.session.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10 }),
      );
    });

    it('should apply cursor when provided', async () => {
      jest
        .spyOn(prismaService.session, 'findMany')
        .mockResolvedValue(mockSessions);

      await repository.getSessionList(
        { campaignId: 'campaign-123' },
        { take: 10, cursor: 'session-1', direction: 'forward' },
      );

      expect(prismaService.session.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 1,
          cursor: { id: 'session-1' },
        }),
      );
    });
  });

  describe('createSession', () => {
    it('should create and return a session', async () => {
      jest
        .spyOn(prismaService.session, 'create')
        .mockResolvedValue(mockSession);

      const createData = {
        title: 'New Session',
        description: 'A new session',
        campaignId: 'campaign-123',
      };

      const result = await repository.createSession(createData);

      expect(result).toEqual(mockSession);
      expect(prismaService.session.create).toHaveBeenCalledWith({
        data: {
          title: 'New Session',
          description: 'A new session',
          campaign: { connect: { id: 'campaign-123' } },
        },
        include: expect.anything(),
      });
    });
  });

  describe('updateSession', () => {
    it('should update and return a session', async () => {
      const updatedSession = createMockSession({ title: 'Updated Title' });
      jest
        .spyOn(prismaService.session, 'update')
        .mockResolvedValue(updatedSession);

      const result = await repository.updateSession(
        { id: 'session-123' },
        { title: 'Updated Title' },
      );

      expect(result).toEqual(updatedSession);
      expect(prismaService.session.update).toHaveBeenCalledWith({
        where: { id: 'session-123' },
        data: { title: 'Updated Title' },
        include: expect.anything(),
      });
    });
  });

  describe('startSession', () => {
    it('should set status to LIVE and set startedAt', async () => {
      const startedSession = createMockSession({
        status: SessionStatus.LIVE,
        startedAt: new Date(),
      });
      jest
        .spyOn(prismaService.session, 'update')
        .mockResolvedValue(startedSession);

      const result = await repository.startSession({ id: 'session-123' });

      expect(result).toEqual(startedSession);
      expect(prismaService.session.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'session-123' },
          data: expect.objectContaining({
            status: SessionStatus.LIVE,
            startedAt: expect.any(Date),
          }),
        }),
      );
    });
  });

  describe('endSession', () => {
    it('should set status to ENDED and set endedAt', async () => {
      const endedSession = createMockSession({
        status: SessionStatus.ENDED,
        endedAt: new Date(),
      });
      jest
        .spyOn(prismaService.session, 'update')
        .mockResolvedValue(endedSession);

      const result = await repository.endSession({ id: 'session-123' });

      expect(result).toEqual(endedSession);
      expect(prismaService.session.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'session-123' },
          data: expect.objectContaining({
            status: SessionStatus.ENDED,
            endedAt: expect.any(Date),
          }),
        }),
      );
    });
  });

  describe('getContextSnapshots', () => {
    it('should return context snapshots ordered by snapshotAt desc', async () => {
      const mockSnapshots = [
        {
          id: 'snapshot-1',
          sessionId: 'session-123',
          timeOfDay: TimeOfDay.DAY,
          weatherId: null,
          locationId: null,
          snapshotAt: new Date('2024-01-02'),
        },
        {
          id: 'snapshot-2',
          sessionId: 'session-123',
          timeOfDay: TimeOfDay.NIGHT,
          weatherId: null,
          locationId: null,
          snapshotAt: new Date('2024-01-01'),
        },
      ];
      jest
        .spyOn(prismaService.contextSnapshot, 'findMany')
        .mockResolvedValue(mockSnapshots);

      const result = await repository.getContextSnapshots({
        sessionId: 'session-123',
      });

      expect(result).toEqual(mockSnapshots);
      expect(prismaService.contextSnapshot.findMany).toHaveBeenCalledWith({
        where: { sessionId: 'session-123' },
        orderBy: { snapshotAt: 'desc' },
      });
    });
  });

  describe('createContextSnapshot', () => {
    it('should create a context snapshot', async () => {
      jest.spyOn(prismaService.contextSnapshot, 'create').mockResolvedValue({
        id: 'snapshot-1',
        sessionId: 'session-123',
        timeOfDay: null,
        weatherId: null,
        locationId: null,
        snapshotAt: new Date(),
      });

      await repository.createContextSnapshot(
        { timeOfDay: 'DAY' },
        'session-123',
      );

      expect(prismaService.contextSnapshot.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            session: { connect: { id: 'session-123' } },
            timeOfDay: 'DAY',
            snapshotAt: expect.any(Date),
          }),
        }),
      );
    });

    it('should connect weather when weatherId is provided', async () => {
      jest.spyOn(prismaService.contextSnapshot, 'create').mockResolvedValue({
        id: 'snapshot-1',
        sessionId: 'session-123',
        timeOfDay: null,
        weatherId: null,
        locationId: null,
        snapshotAt: new Date(),
      });

      await repository.createContextSnapshot(
        { weatherId: 'weather-123', timeOfDay: 'DAY' },
        'session-123',
      );

      expect(prismaService.contextSnapshot.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            weather: { connect: { id: 'weather-123' } },
          }),
        }),
      );
    });

    it('should connect location when locationId is provided', async () => {
      jest.spyOn(prismaService.contextSnapshot, 'create').mockResolvedValue({
        id: 'snapshot-1',
        sessionId: 'session-123',
        timeOfDay: null,
        weatherId: null,
        locationId: null,
        snapshotAt: new Date(),
      });

      await repository.createContextSnapshot(
        { locationId: 'location-123' },
        'session-123',
      );

      expect(prismaService.contextSnapshot.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            location: { connect: { id: 'location-123' } },
          }),
        }),
      );
    });
  });

  describe('deleteSession', () => {
    it('should delete and return a session', async () => {
      jest
        .spyOn(prismaService.session, 'delete')
        .mockResolvedValue(mockSession);

      const result = await repository.deleteSession({ id: 'session-123' });

      expect(result).toEqual(mockSession);
      expect(prismaService.session.delete).toHaveBeenCalledWith({
        where: { id: 'session-123' },
      });
    });
  });
});
