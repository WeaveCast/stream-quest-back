import { Session, SessionStatus } from '../../../generated/prisma/client';
import { JwtPayloadInterface } from '../../../auth/interface/auth.interface';

export const createMockSession = (
  overrides: Partial<Session> = {},
): Session => ({
  id: 'session-123',
  title: 'Test Session',
  description: 'A test session',
  status: SessionStatus.PLANNED,
  startedAt: null,
  endedAt: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  campaignId: 'campaign-123',
  ...overrides,
});

export const createMockUser = (
  overrides: Partial<JwtPayloadInterface> = {},
): JwtPayloadInterface => ({
  sub: 'user-123',
  username: 'testuser',
  ...overrides,
});
