import { Injectable } from '@nestjs/common';
import { CampaignResponseDto } from '../dto/campaign/campaign-response.dto';
import {
  CampaignCreateInput,
  CampaignUpdateInput,
  CampaignWhereInput,
  CampaignWhereUniqueInput,
} from '../generated/prisma/models';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CampaignRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getCampaignList(
    where: CampaignWhereInput,
  ): Promise<CampaignResponseDto[]> {
    return this.prisma.campaign.findMany({
      where: where,
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

  async getCampaign(
    where: CampaignWhereInput,
  ): Promise<CampaignResponseDto | null> {
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

  async createCampaign(
    data: CampaignCreateInput,
  ): Promise<CampaignResponseDto> {
    return this.prisma.campaign.create({
      data,
    });
  }

  async updateCampaign(
    where: CampaignWhereUniqueInput,
    data: CampaignUpdateInput,
  ): Promise<CampaignResponseDto> {
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

  async updateCampaignStatus(
    where: CampaignWhereUniqueInput,
    data: CampaignUpdateInput,
  ): Promise<CampaignResponseDto> {
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

  async updateCampaignKarma(
    where: CampaignWhereUniqueInput,
    data: CampaignUpdateInput,
  ): Promise<CampaignResponseDto> {
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

  async softRemoveCampaign(
    where: CampaignWhereUniqueInput,
    data: CampaignUpdateInput,
  ): Promise<CampaignResponseDto> {
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

  async restoreSoftRemovedCampaign(
    where: CampaignWhereUniqueInput,
    data: CampaignUpdateInput,
  ): Promise<CampaignResponseDto> {
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

  async deleteCampaign(
    where: CampaignWhereUniqueInput,
  ): Promise<CampaignResponseDto> {
    return this.prisma.campaign.delete({
      where,
    });
  }
}
