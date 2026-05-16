import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCampaignDto } from '../dto/campaign/create-campaign.dto';
import { Request } from 'express';
import { CampaignResponseDto } from '../dto/campaign/campaign-response.dto';
import { UpdateCampaignDto } from '../dto/campaign/update-campaign.dto';
import { UpdateStatusDto } from '../dto/campaign/update-status.dto';
import { UpdateKarmaDto } from '../dto/campaign/update-karma.dto';
import {
  CampaignFilterDto,
  CampaignFilterStatus,
} from '../dto/campaign/campagn-filter.dto';
import { Prisma } from '../generated/prisma/client';
import { CampaignRepository } from './campaign.repository';

@Injectable()
export class CampaignService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reposity: CampaignRepository,
  ) {}

  async getCampaignList(
    req: Request,
    filterDto: CampaignFilterDto,
  ): Promise<CampaignResponseDto[]> {
    const whereClause: Prisma.CampaignWhereInput = {
      gameMasterId: req.user!.sub,
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

  async getCampaign(id: string, req: Request): Promise<CampaignResponseDto> {
    if (!id) {
      throw new BadRequestException('Campaign id is missing');
    }

    const whereClause = { id: id, gameMasterId: req.user?.sub };
    const campaign = await this.reposity.getCampaign(whereClause);

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return campaign;
  }

  async createCampaign(
    dto: CreateCampaignDto,
    req: Request,
  ): Promise<CampaignResponseDto> {
    const userId: string = req.user!.sub;

    this.validateThresholds({
      chaosThreshold: dto.chaosThreshold,
      blessingThreshold: dto.blessingThreshold,
    });

    const data = {
      gameMaster: {
        connect: {
          id: userId,
        },
      },
      ...dto,
    };

    return this.reposity.createCampaign(data);
  }

  async updateCampaign(
    dto: UpdateCampaignDto,
    req: Request,
  ): Promise<CampaignResponseDto> {
    const campaignId: string = req.campaign!.id;

    const chaosThreshold =
      dto.chaosThreshold !== undefined
        ? dto.chaosThreshold
        : req.campaign!.chaosThreshold;

    const blessingThreshold =
      dto.blessingThreshold !== undefined
        ? dto.blessingThreshold
        : req.campaign!.blessingThreshold;

    this.validateThresholds({ chaosThreshold, blessingThreshold });

    const whereClause = { id: campaignId };

    return this.reposity.updateCampaign(whereClause, dto);
  }

  async updateCampaignStatus(
    dto: UpdateStatusDto,
    req: Request,
  ): Promise<CampaignResponseDto> {
    const campaignId: string = req.campaign!.id;
    const whereClause = { id: campaignId };

    return this.reposity.updateCampaignStatus(whereClause, dto);
  }

  async updateCampaignKarma(
    dto: UpdateKarmaDto,
    req: Request,
  ): Promise<CampaignResponseDto> {
    const campaignId: string = req.campaign!.id;
    const whereClause = { id: campaignId };

    return this.reposity.updateCampaignKarma(whereClause, dto);
  }

  async softRemoveCampaign(req: Request): Promise<CampaignResponseDto> {
    const campaignId: string = req.campaign!.id;
    const whereClause = { id: campaignId };
    const data = { deletedAt: new Date() };

    return this.reposity.softRemoveCampaign(whereClause, data);
  }

  async restoreSoftRemovedCampaign(req: Request): Promise<CampaignResponseDto> {
    const campaignId: string = req.campaign!.id;

    if (!req.campaign!.deletedAt) {
      throw new BadRequestException('Campaign must be soft-deleted first');
    }

    const whereClause = { id: campaignId };
    const data = { deletedAt: null };

    return this.reposity.restoreSoftRemovedCampaign(whereClause, data);
  }

  async deleteCampaign(req: Request): Promise<CampaignResponseDto> {
    const campaignId: string = req.campaign!.id;

    if (!req.campaign!.deletedAt) {
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
