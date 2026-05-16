import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
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
      throw new BadRequestException('Campaign id not provided');
    }

    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId as string },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (campaign.gameMasterId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this campaign',
      );
    }

    request.campaign = campaign;

    return true;
  }
}
