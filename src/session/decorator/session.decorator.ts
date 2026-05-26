import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequestWithSession } from '../../interfaces/authenticated-request.interface';
import { Session } from '../../generated/prisma/client';

export const SessionContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Session => {
    const request = ctx
      .switchToHttp()
      .getRequest<AuthenticatedRequestWithSession>();

    return request.session;
  },
);
