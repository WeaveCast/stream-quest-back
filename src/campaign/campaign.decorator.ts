import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequestWithCampaign } from '../interfaces/authenticated-request.interface';
import { Campaign } from '../generated/prisma/client';

export const CampaignContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Campaign => {
    const request = ctx
      .switchToHttp()
      .getRequest<AuthenticatedRequestWithCampaign>();
    return request.campaign;
  },
);
