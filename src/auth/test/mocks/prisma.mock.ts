import { PrismaService } from '../../../prisma/prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

export type MockPrismaService = DeepMockProxy<PrismaService>;

export const createMockPrismaService = (): MockPrismaService => {
  return mockDeep<PrismaService>();
};
