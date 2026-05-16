import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayloadInterface } from '../interfaces/auth.interface';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

export const UserContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayloadInterface => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user;
  },
);
