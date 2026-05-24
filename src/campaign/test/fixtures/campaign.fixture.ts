import { Campaign, CampaignStatus } from '../../../generated/prisma/client';
import { JwtPayloadInterface } from '../../../auth/interface/auth.interface';

export const createMockCampaign = (
  overrides: Partial<Campaign> = {},
): Campaign => ({
  id: 'campaign-123',
  title: 'Test Campaign',
  description: 'A test campaign',
  status: CampaignStatus.ACTIVE,
  conclusion: null,
  karmaValue: 0,
  chaosThreshold: 50,
  blessingThreshold: 100,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  deletedAt: null,
  gameMasterId: 'user-123',
  ...overrides,
});

export const createMockUser = (
  overrides: Partial<JwtPayloadInterface> = {},
): JwtPayloadInterface => ({
  sub: 'user-123',
  username: 'testuser',
  ...overrides,
});
