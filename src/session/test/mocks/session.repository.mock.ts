export const createMockSessionRepository = () => ({
  getSessionList: jest.fn(),
  getSession: jest.fn(),
  createSession: jest.fn(),
  updateSession: jest.fn(),
  updateSessionStatus: jest.fn(),
  startSession: jest.fn(),
  endSession: jest.fn(),
  getContextSnapshots: jest.fn(),
  createContextSnapshot: jest.fn(),
  deleteSession: jest.fn(),
});
