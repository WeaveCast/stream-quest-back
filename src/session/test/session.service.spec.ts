import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SessionService } from '../session.service';
import { SessionRepository } from '../session.repository';
import { SessionStatus, TimeOfDay } from '../../generated/prisma/client';
import { createMockSession } from './fixtures/session.fixture';
import { createMockSessionRepository } from './mocks/session.repository.mock';

describe('SessionService', () => {
  let service: SessionService;
  let repository: SessionRepository;

  const mockSession = createMockSession();
  const mockRepository = createMockSessionRepository();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        {
          provide: SessionRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get(SessionService);
    repository = module.get(SessionRepository);

    jest.clearAllMocks();
  });

  describe('getSessionList', () => {
    it('should return paginated session list', async () => {
      const mockSessions = [
        createMockSession({ id: 'session-1' }),
        createMockSession({ id: 'session-2' }),
      ];
      const spy = jest
        .spyOn(repository, 'getSessionList')
        .mockResolvedValue(mockSessions);

      const result = await service.getSessionList({
        limit: 10,
      });

      expect(result.data).toEqual(mockSessions);
      expect(result.count).toBe(2);
      expect(result.hasMore).toBe(false);
      expect(spy).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ take: 11 }),
      );
    });

    it('should filter by campaignId when provided', async () => {
      const spy = jest
        .spyOn(repository, 'getSessionList')
        .mockResolvedValue([]);

      await service.getSessionList({
        campaignId: 'campaign-123',
        limit: 10,
      });

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ campaignId: 'campaign-123' }),
        expect.anything(),
      );
    });

    it('should detect hasMore when results exceed limit', async () => {
      const mockSessions = Array.from({ length: 11 }, (_, i) =>
        createMockSession({ id: `session-${i}` }),
      );
      jest.spyOn(repository, 'getSessionList').mockResolvedValue(mockSessions);

      const result = await service.getSessionList({ limit: 10 });

      expect(result.data.length).toBe(10);
      expect(result.hasMore).toBe(true);
      expect(result.nextCursor).toBe('session-9');
    });

    it('should set hasPrevious when cursor is present', async () => {
      jest.spyOn(repository, 'getSessionList').mockResolvedValue([mockSession]);

      const result = await service.getSessionList({
        cursor: 'some-cursor',
        limit: 10,
      });

      expect(result.hasPrevious).toBe(true);
    });
  });

  describe('getSession', () => {
    it('should return a session when found', async () => {
      const spy = jest
        .spyOn(repository, 'getSession')
        .mockResolvedValue(mockSession);

      const result = await service.getSession('session-123');

      expect(result).toEqual(mockSession);
      expect(spy).toHaveBeenCalledWith({ id: 'session-123' });
    });

    it('should throw NotFoundException when session not found', async () => {
      jest.spyOn(repository, 'getSession').mockResolvedValue(null);

      await expect(service.getSession('not-found')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when id is missing', async () => {
      await expect(service.getSession('')).rejects.toThrow(BadRequestException);
    });
  });

  describe('createSession', () => {
    it('should create a session', async () => {
      const spy = jest
        .spyOn(repository, 'createSession')
        .mockResolvedValue(mockSession);

      const dto = {
        title: 'New Session',
        description: 'A new session',
        campaignId: 'campaign-123',
      };

      const result = await service.createSession(dto);

      expect(result).toEqual(mockSession);
      expect(spy).toHaveBeenCalledWith(dto);
    });
  });

  describe('updateSession', () => {
    it('should update a session', async () => {
      const updatedSession = createMockSession({ title: 'Updated Title' });
      const spy = jest
        .spyOn(repository, 'updateSession')
        .mockResolvedValue(updatedSession);

      const dto = { title: 'Updated Title' };

      const result = await service.updateSession(dto, mockSession);

      expect(result).toEqual(updatedSession);
      expect(spy).toHaveBeenCalledWith({ id: 'session-123' }, dto);
    });
  });

  describe('updateSessionStatus', () => {
    it('should update session status', async () => {
      const updatedSession = createMockSession({
        status: SessionStatus.LIVE,
      });
      const spy = jest
        .spyOn(repository, 'updateSession')
        .mockResolvedValue(updatedSession);

      const dto = { status: SessionStatus.LIVE };

      const result = await service.updateSessionStatus(dto, mockSession);

      expect(result).toEqual(updatedSession);
      expect(spy).toHaveBeenCalledWith({ id: 'session-123' }, dto);
    });
  });

  describe('startSession', () => {
    it('should start a PLANNED session', async () => {
      const startedSession = createMockSession({
        status: SessionStatus.LIVE,
        startedAt: new Date(),
      });
      const spy = jest
        .spyOn(repository, 'startSession')
        .mockResolvedValue(startedSession);

      const result = await service.startSession(mockSession);

      expect(result).toEqual(startedSession);
      expect(spy).toHaveBeenCalledWith({
        id: 'session-123',
      });
    });
  });

  describe('endSession', () => {
    it('should end a LIVE session', async () => {
      const liveSession = createMockSession({ status: SessionStatus.LIVE });
      const endedSession = createMockSession({
        status: SessionStatus.ENDED,
        endedAt: new Date(),
      });
      const spy = jest
        .spyOn(repository, 'endSession')
        .mockResolvedValue(endedSession);

      const result = await service.endSession(liveSession);

      expect(result).toEqual(endedSession);
      expect(spy).toHaveBeenCalledWith({ id: 'session-123' });
    });
  });

  describe('getContextSnapshots', () => {
    it('should return context snapshots for a session', async () => {
      const mockSnapshots = [
        {
          id: 'snapshot-1',
          sessionId: 'session-123',
          timeOfDay: TimeOfDay.DAY,
          weatherId: null,
          locationId: null,
          snapshotAt: new Date(),
        },
      ];
      const spy = jest
        .spyOn(repository, 'getContextSnapshots')
        .mockResolvedValue(mockSnapshots);

      const result = await service.getContextSnapshots(mockSession);

      expect(result).toEqual(mockSnapshots);
      expect(spy).toHaveBeenCalledWith({ sessionId: 'session-123' });
    });
  });

  describe('updateContextSnapshot', () => {
    it('should create a context snapshot', async () => {
      const spy = jest
        .spyOn(repository, 'createContextSnapshot')
        .mockResolvedValue(undefined);

      const dto = { timeOfDay: 'DAY' as const };

      await service.updateContextSnapshot(dto, mockSession);

      expect(spy).toHaveBeenCalledWith(dto, 'session-123');
    });
  });

  describe('deleteSession', () => {
    it('should delete a session', async () => {
      const spy = jest
        .spyOn(repository, 'deleteSession')
        .mockResolvedValue(mockSession);

      const result = await service.deleteSession(mockSession);

      expect(result).toEqual(mockSession);
      expect(spy).toHaveBeenCalledWith({
        id: 'session-123',
      });
    });
  });
});
