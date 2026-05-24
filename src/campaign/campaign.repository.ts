import { Injectable } from '@nestjs/common';
import {
  CampaignCreateInput,
  CampaignOrderByWithRelationInput,
  CampaignUpdateInput,
  CampaignWhereInput,
  CampaignWhereUniqueInput,
} from '../generated/prisma/models';
import { PrismaService } from '../prisma/prisma.service';
import { Campaign } from '../generated/prisma/client';

@Injectable()
export class CampaignRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getCampaignList(
    where: CampaignWhereInput,
    options?: {
      take?: number;
      cursor?: string;
      direction?: 'forward' | 'backward';
      orderBy?: CampaignOrderByWithRelationInput;
    },
  ): Promise<Campaign[]> {
    const isBackward = options?.direction === 'backward';
    const take = options?.take || 10;

    const result = (await this.prisma.campaign.findMany({
      where,
      take: isBackward ? -take : take,
      ...(options?.cursor && {
        skip: 1,
        cursor: { id: options.cursor },
      }),
      orderBy: options?.orderBy || { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            sessions: true,
            campaignEvents: true,
          },
        },
      },
    })) as Campaign[];

    return isBackward ? result.reverse() : result;
  }

  async getCampaign(where: CampaignWhereInput): Promise<Campaign | null> {
    return this.prisma.campaign.findFirst({
      where,
      include: {
        _count: {
          select: {
            sessions: true,
            campaignEvents: true,
          },
        },
      },
    });
  }

  async createCampaign(data: CampaignCreateInput): Promise<Campaign> {
    return this.prisma.campaign.create({
      data,
    });
  }

  async updateCampaign(
    where: CampaignWhereUniqueInput,
    data: CampaignUpdateInput,
  ): Promise<Campaign> {
    return this.prismaUpdate(where, data);
  }

  async updateCampaignStatus(
    where: CampaignWhereUniqueInput,
    data: CampaignUpdateInput,
  ): Promise<Campaign> {
    return this.prismaUpdate(where, data);
  }

  async updateCampaignKarma(
    where: CampaignWhereUniqueInput,
    data: CampaignUpdateInput,
  ): Promise<Campaign> {
    return this.prismaUpdate(where, data);
  }

  async softRemoveCampaign(
    where: CampaignWhereUniqueInput,
    data: CampaignUpdateInput,
  ): Promise<Campaign> {
    return this.prismaUpdate(where, data);
  }

  async restoreSoftRemovedCampaign(
    where: CampaignWhereUniqueInput,
    data: CampaignUpdateInput,
  ): Promise<Campaign> {
    return this.prismaUpdate(where, data);
  }

  async deleteCampaign(where: CampaignWhereUniqueInput): Promise<Campaign> {
    return this.prisma.campaign.delete({
      where,
    });
  }

  private async prismaUpdate(
    where: CampaignWhereUniqueInput,
    data: CampaignUpdateInput,
  ): Promise<Campaign> {
    return this.prisma.campaign.update({
      where,
      data,
      include: {
        _count: {
          select: {
            sessions: true,
            campaignEvents: true,
          },
        },
      },
    });
  }
}
