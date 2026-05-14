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

@Injectable()
export class CampaignService {
  constructor(private readonly prisma: PrismaService) {}

  async getCampaignList(req: Request): Promise<CampaignResponseDto[]> {
    return await this.prisma.campaign.findMany({
      where: { gameMasterId: req.user?.sub, deletedAt: null },
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

  async getCampaign(id: string, req: Request): Promise<CampaignResponseDto> {
    if (!id) {
      throw new BadRequestException('Campaign id is missing');
    }

    const campaign = await this.prisma.campaign.findFirst({
      where: { id: id, gameMasterId: req.user?.sub, deletedAt: null },
      include: {
        _count: {
          select: {
            sessions: true,
            campaignEvents: true,
          },
        },
      },
    });

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

    return await this.prisma.campaign.create({
      data: { gameMasterId: userId, ...dto },
    });
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

    return await this.prisma.campaign.update({
      where: { id: campaignId },
      data: { ...dto },
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
    dto: UpdateStatusDto,
    req: Request,
  ): Promise<CampaignResponseDto> {
    const campaignId: string = req.campaign!.id;

    return await this.prisma.campaign.update({
      where: { id: campaignId },
      data: { ...dto },
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
    dto: UpdateKarmaDto,
    req: Request,
  ): Promise<CampaignResponseDto> {
    const campaignId: string = req.campaign!.id;

    return await this.prisma.campaign.update({
      where: { id: campaignId },
      data: { ...dto },
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

  async softRemoveCampaign(req: Request): Promise<CampaignResponseDto> {
    const campaignId: string = req.campaign!.id;
    const deletedAt = new Date();
    const definitiveDeletionAt = new Date(deletedAt);
    definitiveDeletionAt.setDate(definitiveDeletionAt.getDate() + 30);

    return await this.prisma.campaign.update({
      where: { id: campaignId },
      data: {
        deletedAt: deletedAt,
        definitiveDeletionAt: definitiveDeletionAt,
      },
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

  async restoreSoftRemovedCampaign(req: Request): Promise<CampaignResponseDto> {
    const campaignId: string = req.campaign!.id;

    if (!req.campaign!.deletedAt) {
      throw new BadRequestException('Campaign is not in trash');
    }

    return await this.prisma.campaign.update({
      where: { id: campaignId },
      data: {
        deletedAt: null,
        definitiveDeletionAt: null,
      },
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

  async deleteCampaign(req: Request): Promise<CampaignResponseDto> {
    const campaignId: string = req.campaign!.id;

    if (!req.campaign!.deletedAt) {
      throw new BadRequestException('Campaign must be soft-deleted first');
    }

    return await this.prisma.campaign.delete({
      where: { id: campaignId },
    });
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
