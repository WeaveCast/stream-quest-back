import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { CampaignResponseDto } from './dto/campaign-response.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateKarmaDto } from './dto/update-karma.dto';
import { CampaignQueryDto } from './dto/campaign-query.dto';
import { CampaignRepository } from './campaign.repository';
import { JwtPayloadInterface } from '../auth/interface/auth.interface';
import { PaginationResponseDto } from '../dto/pagination-response.dto';
import { CampaignWhereInput } from '../generated/prisma/models';
import { Campaign } from '../generated/prisma/client';
import { FilterDeletionStatus } from '../enum/filter-status.enum';

@Injectable()
export class CampaignService {
  constructor(private readonly repository: CampaignRepository) {}

  async getCampaignList(
    user: JwtPayloadInterface,
    queryDto: CampaignQueryDto,
  ): Promise<PaginationResponseDto<CampaignResponseDto>> {
    const whereClause: CampaignWhereInput = {
      gameMasterId: user.sub,
    };

    switch (queryDto.deletionStatus) {
      case FilterDeletionStatus.ACTIVE:
        whereClause.deletedAt = null;
        break;
      case FilterDeletionStatus.DELETED:
        whereClause.deletedAt = { not: null };
        break;
      case FilterDeletionStatus.ALL:
        break;
    }

    const limit = queryDto.limit || 10;
    const campaigns = await this.repository.getCampaignList(whereClause, {
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
    const campaign = await this.repository.getCampaign(whereClause);

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

    return this.repository.createCampaign(data);
  }

  async updateCampaign(
    dto: UpdateCampaignDto,
    campaign: Campaign,
  ): Promise<CampaignResponseDto> {
    this.validateThresholds({
      chaosThreshold: dto.chaosThreshold ?? campaign.chaosThreshold,
      blessingThreshold: dto.blessingThreshold ?? campaign.blessingThreshold,
    });

    const campaignId: string = campaign.id;
    const whereClause = { id: campaignId };

    return this.repository.updateCampaign(whereClause, dto);
  }

  async updateCampaignStatus(
    dto: UpdateStatusDto,
    campaign: Campaign,
  ): Promise<CampaignResponseDto> {
    const campaignId: string = campaign.id;
    const whereClause = { id: campaignId };

    return this.repository.updateCampaignStatus(whereClause, dto);
  }

  async updateCampaignKarma(
    dto: UpdateKarmaDto,
    campaign: Campaign,
  ): Promise<CampaignResponseDto> {
    const campaignId: string = campaign.id;
    const whereClause = { id: campaignId };

    return this.repository.updateCampaignKarma(whereClause, dto);
  }

  async softRemoveCampaign(campaign: Campaign): Promise<CampaignResponseDto> {
    const campaignId: string = campaign.id;
    const whereClause = { id: campaignId };
    const data = { deletedAt: new Date() };

    return this.repository.softRemoveCampaign(whereClause, data);
  }

  async restoreSoftRemovedCampaign(
    campaign: Campaign,
  ): Promise<CampaignResponseDto> {
    if (!campaign.deletedAt) {
      throw new BadRequestException('Campaign must be soft-deleted first');
    }

    const campaignId: string = campaign.id;
    const whereClause = { id: campaignId };
    const data = { deletedAt: null };

    return this.repository.restoreSoftRemovedCampaign(whereClause, data);
  }

  async deleteCampaign(campaign: Campaign): Promise<CampaignResponseDto> {
    if (!campaign.deletedAt) {
      throw new BadRequestException('Campaign must be soft-deleted first');
    }

    const campaignId: string = campaign.id;
    const whereClause = { id: campaignId };

    return this.repository.deleteCampaign(whereClause);
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
