import { Campaign } from '../generated/prisma/client';
import { JwtPayloadInterface } from './auth.interface';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayloadInterface;
      campaign?: Campaign;
    }
  }
}
