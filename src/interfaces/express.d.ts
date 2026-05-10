import { JwtPayloadInterface } from './auth.interface';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayloadInterface;
    }
  }
}
