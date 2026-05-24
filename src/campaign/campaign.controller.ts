import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateKarmaDto } from './dto/update-karma.dto';
import { CampaignService } from './campaign.service';
import { CampaignResponseDto } from './dto/campaign-response.dto';
import { CampaignQueryDto } from './dto/campaign-query.dto';
import {
  CreateCampaignRoute,
  DeleteCampaignFromTrashRoute,
  GetCampaignDetailsRoute,
  GetCampaignListRoute,
  RestoreSoftRemovedCampaignRoute,
  SoftRemoveCampaignRoute,
  UpdateCampaignKarmaRoute,
  UpdateCampaignRoute,
  UpdateCampaignStatusRoute,
} from './campaign-routes.decorator';
import type { JwtPayloadInterface } from '../auth/interface/auth.interface';
import { UserContext } from '../decorators/user.decorator';
import { CampaignContext } from './campaign.decorator';
import type { Campaign } from '../generated/prisma/client';
import { PaginationResponseDto } from '../dto/pagination-response.dto';

@ApiTags('Campaign')
@Controller('campaign')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Get('')
  @GetCampaignListRoute("Get user's campaigns")
  async campaignList(
    @Query() filterDto: CampaignQueryDto,
    @UserContext() user: JwtPayloadInterface,
  ): Promise<PaginationResponseDto<CampaignResponseDto>> {
    return this.campaignService.getCampaignList(user, filterDto);
  }

  @Get(':id')
  @GetCampaignDetailsRoute("Get a campaign's details")
  async campaignDetails(
    @Param('id') campaignId: string,
    @UserContext() user: JwtPayloadInterface,
  ): Promise<CampaignResponseDto> {
    return this.campaignService.getCampaign(campaignId, user);
  }

  @Post('')
  @CreateCampaignRoute('Create a campaign')
  async createCampaign(
    @Body() createDto: CreateCampaignDto,
    @UserContext() user: JwtPayloadInterface,
  ): Promise<CampaignResponseDto> {
    return this.campaignService.createCampaign(createDto, user);
  }

  @Patch(':id')
  @UpdateCampaignRoute('Update a campaign')
  async updateCampaign(
    @Body() updateDto: UpdateCampaignDto,
    @CampaignContext() campaign: Campaign,
  ): Promise<CampaignResponseDto> {
    return this.campaignService.updateCampaign(updateDto, campaign);
  }

  @Patch(':id/status')
  @UpdateCampaignStatusRoute('Update the status of a campaign')
  async updateCampaignStatus(
    @Body() updateDto: UpdateStatusDto,
    @CampaignContext() campaign: Campaign,
  ): Promise<CampaignResponseDto> {
    return this.campaignService.updateCampaignStatus(updateDto, campaign);
  }

  @Patch(':id/karma')
  @UpdateCampaignKarmaRoute('Update the karma of a campaign')
  async updateCampaignKarma(
    @Body() updateDto: UpdateKarmaDto,
    @CampaignContext() campaign: Campaign,
  ): Promise<CampaignResponseDto> {
    return this.campaignService.updateCampaignKarma(updateDto, campaign);
  }

  @Delete(':id')
  @SoftRemoveCampaignRoute('Temporary remove a campaign')
  async softRemoveCampaign(
    @CampaignContext() campaign: Campaign,
  ): Promise<CampaignResponseDto> {
    return this.campaignService.softRemoveCampaign(campaign);
  }

  @Patch(':id/restore')
  @RestoreSoftRemovedCampaignRoute('Restore a removed campaign')
  async restoreSoftRemovedCampaign(
    @CampaignContext() campaign: Campaign,
  ): Promise<CampaignResponseDto> {
    return this.campaignService.restoreSoftRemovedCampaign(campaign);
  }

  @Delete(':id/permanent')
  @DeleteCampaignFromTrashRoute('Permanently delete a campaign')
  async deleteCampaignFromTrash(
    @CampaignContext() campaign: Campaign,
  ): Promise<CampaignResponseDto> {
    return this.campaignService.deleteCampaign(campaign);
  }
}
