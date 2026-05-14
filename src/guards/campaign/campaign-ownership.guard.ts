import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Request } from 'express';

@Injectable()
export class CampaignOwnershipGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = request.user?.sub;
    const campaignId = request.params.id;

    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!campaignId) {
      throw new ForbiddenException('Campaign id not provided');
    }

    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId as string, gameMasterId: userId },
    });

    if (!campaign) {
      return false;
    }

    request.campaign = campaign;

    return true;
  }
}
