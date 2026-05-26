export const createMockPrismaService = () => ({
  session: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  contextSnapshot: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
  campaign: {
    findUnique: jest.fn(),
  },
});
