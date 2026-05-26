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
export class SessionGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = request.user?.sub;
    const sessionId = request.params.id;

    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!sessionId) {
      throw new BadRequestException('Session id not provided');
    }

    const session = await this.prisma.session.findUnique({
      where: { id: sessionId as string },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const campaign = await this.prisma.campaign.findUnique({
      where: { id: session.campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (campaign.gameMasterId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this campaign',
      );
    }

    request.session = session;
    request.campaign = campaign;

    return true;
  }
}
