import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCampaignDto } from '../dto/campaign/create-campaign.dto';
import { CampaignResponseDto } from '../dto/campaign/campaign-response.dto';
import { UpdateCampaignDto } from '../dto/campaign/update-campaign.dto';
import { UpdateStatusDto } from '../dto/campaign/update-status.dto';
import { UpdateKarmaDto } from '../dto/campaign/update-karma.dto';
import {
  CampaignFilterStatus,
  CampaignQueryDto,
} from '../dto/campaign/campaign-query.dto';
import { CampaignRepository } from './campaign.repository';
import { JwtPayloadInterface } from '../interfaces/auth.interface';
import { PaginationResponseDto } from '../dto/pagination-response.dto';
import { CampaignWhereInput } from '../generated/prisma/models';
import { Campaign } from '../generated/prisma/client';

@Injectable()
export class CampaignService {
  constructor(private readonly reposity: CampaignRepository) {}

  async getCampaignList(
    user: JwtPayloadInterface,
    queryDto: CampaignQueryDto,
  ): Promise<PaginationResponseDto<CampaignResponseDto>> {
    const whereClause: CampaignWhereInput = {
      gameMasterId: user.sub,
    };

    switch (queryDto.status) {
      case CampaignFilterStatus.ACTIVE:
        whereClause.deletedAt = null;
        break;
      case CampaignFilterStatus.DELETED:
        whereClause.deletedAt = { not: null };
        break;
      case CampaignFilterStatus.ALL:
        break;
    }

    const limit = queryDto.limit || 10;
    const campaigns = await this.reposity.getCampaignList(whereClause, {
      take: limit + 1,
      cursor: queryDto.cursor,
      direction: queryDto.direction,
      orderBy: { createdAt: 'desc' },
    });
    const hasMore = campaigns.length > limit;
    const data = hasMore ? campaigns.slice(0, limit) : campaigns;

    return {
      data,
      nextCursor: hasMore ? data[data.length - 1].id : null,
      previousCursor: data.length > 0 ? data[0].id : null,
      count: data.length,
      hasMore,
      hasPrevious: !!queryDto.cursor,
    };
  }

  async getCampaign(
    id: string,
    user: JwtPayloadInterface,
  ): Promise<CampaignResponseDto> {
    if (!id) {
      throw new BadRequestException('Campaign id is missing');
    }

    const whereClause = { id: id, gameMasterId: user.sub };
    const campaign = await this.reposity.getCampaign(whereClause);

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return campaign;
  }

  async createCampaign(
    dto: CreateCampaignDto,
    user: JwtPayloadInterface,
  ): Promise<CampaignResponseDto> {
    this.validateThresholds({
      chaosThreshold: dto.chaosThreshold,
      blessingThreshold: dto.blessingThreshold,
    });

    const data = {
      gameMaster: {
        connect: {
          id: user.sub,
        },
      },
      ...dto,
    };

    return this.reposity.createCampaign(data);
  }

  async updateCampaign(
    dto: UpdateCampaignDto,
    campaign: Campaign,
  ): Promise<CampaignResponseDto> {
    const campaignId: string = campaign.id;

    const chaosThreshold =
      dto.chaosThreshold !== undefined
        ? dto.chaosThreshold
        : campaign.chaosThreshold;

    const blessingThreshold =
      dto.blessingThreshold !== undefined
        ? dto.blessingThreshold
        : campaign.blessingThreshold;

    this.validateThresholds({ chaosThreshold, blessingThreshold });

    const whereClause = { id: campaignId };

    return this.reposity.updateCampaign(whereClause, dto);
  }

  async updateCampaignStatus(
    dto: UpdateStatusDto,
    campaign: Campaign,
  ): Promise<CampaignResponseDto> {
    const campaignId: string = campaign.id;
    const whereClause = { id: campaignId };

    return this.reposity.updateCampaignStatus(whereClause, dto);
  }

  async updateCampaignKarma(
    dto: UpdateKarmaDto,
    campaign: Campaign,
  ): Promise<CampaignResponseDto> {
    const campaignId: string = campaign.id;
    const whereClause = { id: campaignId };

    return this.reposity.updateCampaignKarma(whereClause, dto);
  }

  async softRemoveCampaign(campaign: Campaign): Promise<CampaignResponseDto> {
    const campaignId: string = campaign.id;
    const whereClause = { id: campaignId };
    const data = { deletedAt: new Date() };

    return this.reposity.softRemoveCampaign(whereClause, data);
  }

  async restoreSoftRemovedCampaign(
    campaign: Campaign,
  ): Promise<CampaignResponseDto> {
    const campaignId: string = campaign.id;

    if (!campaign.deletedAt) {
      throw new BadRequestException('Campaign must be soft-deleted first');
    }

    const whereClause = { id: campaignId };
    const data = { deletedAt: null };

    return this.reposity.restoreSoftRemovedCampaign(whereClause, data);
  }

  async deleteCampaign(campaign: Campaign): Promise<CampaignResponseDto> {
    const campaignId: string = campaign.id;

    if (!campaign.deletedAt) {
      throw new BadRequestException('Campaign must be soft-deleted first');
    }

    const whereClause = { id: campaignId };

    return this.reposity.deleteCampaign(whereClause);
  }

  private validateThresholds(thresholds: {
    chaosThreshold: number;
    blessingThreshold: number;
  }) {
    if (thresholds.chaosThreshold >= thresholds.blessingThreshold) {
      throw new BadRequestException(
        'Chaos threshold must be less than Blessing threshold',
      );
    }
  }
}
