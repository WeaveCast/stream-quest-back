import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CreateCampaignDto } from '../dto/campaign/create-campaign.dto';
import { UpdateCampaignDto } from '../dto/campaign/update-campaign.dto';
import { UpdateStatusDto } from '../dto/campaign/update-status.dto';
import { UpdateKarmaDto } from '../dto/campaign/update-karma.dto';
import { CampaignService } from './campaign.service';
import { CampaignResponseDto } from '../dto/campaign/campaign-response.dto';
import { CampaignFilterDto } from '../dto/campaign/campagn-filter.dto';
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
} from '../decorators/campaign-routes.decorator';

@ApiTags('Campaign')
@Controller('campaign')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Get('')
  @GetCampaignListRoute("Get user's campaigns")
  async campaignList(
    @Query() filterDto: CampaignFilterDto,
    @Req() req: Request,
  ): Promise<CampaignResponseDto[]> {
    return this.campaignService.getCampaignList(req, filterDto);
  }

  @Get(':id')
  @GetCampaignDetailsRoute("Get a campaign's details")
  async campaignDetails(
    @Param('id') campaignId: string,
    @Req() req: Request,
  ): Promise<CampaignResponseDto> {
    return this.campaignService.getCampaign(campaignId, req);
  }

  @Post('')
  @CreateCampaignRoute('Create a campaign')
  async createCampaign(
    @Body() createDto: CreateCampaignDto,
    @Req() req: Request,
  ): Promise<CampaignResponseDto> {
    return this.campaignService.createCampaign(createDto, req);
  }

  @Patch(':id')
  @UpdateCampaignRoute('Update a campaign')
  async updateCampaign(
    @Body() updateDto: UpdateCampaignDto,
    @Req() req: Request,
  ): Promise<CampaignResponseDto> {
    return this.campaignService.updateCampaign(updateDto, req);
  }

  @Patch(':id/status')
  @UpdateCampaignStatusRoute('Update the status of a campaign')
  async updateCampaignStatus(
    @Body() updateDto: UpdateStatusDto,
    @Req() req: Request,
  ): Promise<CampaignResponseDto> {
    return this.campaignService.updateCampaignStatus(updateDto, req);
  }

  @Patch(':id/karma')
  @UpdateCampaignKarmaRoute('Update the karma of a campaign')
  async updateCampaignKarma(
    @Body() updateDto: UpdateKarmaDto,
    @Req() req: Request,
  ): Promise<CampaignResponseDto> {
    return this.campaignService.updateCampaignKarma(updateDto, req);
  }

  @Delete(':id')
  @SoftRemoveCampaignRoute('Temporary remove a campaign')
  async softRemoveCampaign(@Req() req: Request): Promise<CampaignResponseDto> {
    return this.campaignService.softRemoveCampaign(req);
  }

  @Patch(':id/restore')
  @RestoreSoftRemovedCampaignRoute('Restore a removed campaign')
  async restoreSoftRemovedCampaign(
    @Req() req: Request,
  ): Promise<CampaignResponseDto> {
    return this.campaignService.restoreSoftRemovedCampaign(req);
  }

  @Delete(':id/permanent')
  @DeleteCampaignFromTrashRoute('Permanently delete a campaign')
  async deleteCampaignFromTrash(
    @Req() req: Request,
  ): Promise<CampaignResponseDto> {
    return this.campaignService.deleteCampaign(req);
  }
}
