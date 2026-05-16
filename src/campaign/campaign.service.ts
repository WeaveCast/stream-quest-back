import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCampaignDto } from '../dto/campaign/create-campaign.dto';
import { CampaignResponseDto } from '../dto/campaign/campaign-response.dto';
import { UpdateCampaignDto } from '../dto/campaign/update-campaign.dto';
import { UpdateStatusDto } from '../dto/campaign/update-status.dto';
import { UpdateKarmaDto } from '../dto/campaign/update-karma.dto';
import {
  CampaignFilterDto,
  CampaignFilterStatus,
} from '../dto/campaign/campagn-filter.dto';
import { Campaign, Prisma } from '../generated/prisma/client';
import { CampaignRepository } from './campaign.repository';
import { JwtPayloadInterface } from '../interfaces/auth.interface';

@Injectable()
export class CampaignService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reposity: CampaignRepository,
  ) {}

  async getCampaignList(
    user: JwtPayloadInterface,
    filterDto: CampaignFilterDto,
  ): Promise<CampaignResponseDto[]> {
    const whereClause: Prisma.CampaignWhereInput = {
      gameMasterId: user.sub,
    };

    switch (filterDto.status) {
      case CampaignFilterStatus.ACTIVE:
        whereClause.deletedAt = null;
        break;
      case CampaignFilterStatus.DELETED:
        whereClause.deletedAt = { not: null };
        break;
      case CampaignFilterStatus.ALL:
        break;
    }

    return this.reposity.getCampaignList(whereClause);
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
