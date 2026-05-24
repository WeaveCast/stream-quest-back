import { JwtService } from '@nestjs/jwt';

export const createMockJwtService = (): Partial<JwtService> => ({
  sign: jest.fn().mockReturnValue('mocked-jwt-token'),
  verify: jest.fn(),
  decode: jest.fn(),
});
