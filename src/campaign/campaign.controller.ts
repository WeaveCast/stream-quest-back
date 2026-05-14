import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiAuthRoute } from '../decorators/api-auth.decorator';
import type { Request } from 'express';
import { CreateCampaignDto } from '../dto/campaign/create-campaign.dto';
import { UpdateCampaignDto } from '../dto/campaign/update-campaign.dto';
import { UpdateStatusDto } from '../dto/campaign/update-status.dto';
import { UpdateKarmaDto } from '../dto/campaign/update-karma.dto';
import { CampaignOwnershipGuard } from '../guards/campaign/campaign-ownership.guard';
import { CampaignService } from './campaign.service';
import { CampaignResponseDto } from '../dto/campaign/campaign-response.dto';

@ApiTags('Campaign')
@Controller('campaign')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Get('')
  @ApiAuthRoute("Get the user's list of campaigns", {
    responses: [
      {
        status: 200,
        description: 'Returns the list of campaigns of the logged user',
        type: [CampaignResponseDto],
      },
    ],
  })
  async campaignList(@Req() req: Request): Promise<CampaignResponseDto[]> {
    return this.campaignService.getCampaignList(req);
  }

  @Get(':id')
  @ApiAuthRoute("Get a campaign's details", {
    params: [
      {
        name: 'id',
        description: 'Campaign id',
        example: '550e8400-e29b-41d4-a716-446655440000',
      },
    ],
    responses: [
      {
        status: 200,
        description: "Returns a user's campaing from its id",
        type: CampaignResponseDto,
      },
    ],
  })
  async campaignDetails(
    @Param('id') campaignId: string,
    @Req() req: Request,
  ): Promise<CampaignResponseDto> {
    return this.campaignService.getCampaign(campaignId, req);
  }

  @Post('')
  @ApiAuthRoute('Create a campaign', {
    responses: [
      {
        status: 201,
        description: 'Creates and returns the created campaign',
        type: CampaignResponseDto,
      },
    ],
  })
  async createCampaign(
    @Body() createDto: CreateCampaignDto,
    @Req() req: Request,
  ): Promise<CampaignResponseDto> {
    return this.campaignService.createCampaign(createDto, req);
  }

  @Patch(':id')
  @ApiAuthRoute('Update a campaign', {
    params: [
      {
        name: 'id',
        description: 'Campaign id',
        example: '550e8400-e29b-41d4-a716-446655440000',
      },
    ],
    responses: [
      {
        status: 200,
        description: 'Updates and returns the updated campaign',
        type: CampaignResponseDto,
      },
    ],
  })
  @UseGuards(CampaignOwnershipGuard)
  async updateCampaign(
    @Body() updateDto: UpdateCampaignDto,
    @Req() req: Request,
  ): Promise<CampaignResponseDto> {
    return this.campaignService.updateCampaign(updateDto, req);
  }

  @Patch(':id/status')
  @ApiAuthRoute('Update the status of a campaign', {
    params: [
      {
        name: 'id',
        description: 'Campaign id',
        example: '550e8400-e29b-41d4-a716-446655440000',
      },
    ],
    responses: [
      {
        status: 200,
        description:
          'Updates the status of a campaign and returns the updated campaign',
        type: CampaignResponseDto,
      },
    ],
  })
  @UseGuards(CampaignOwnershipGuard)
  async updateCampaignStatus(
    @Body() updateDto: UpdateStatusDto,
    @Req() req: Request,
  ): Promise<CampaignResponseDto> {
    return this.campaignService.updateCampaignStatus(updateDto, req);
  }

  @Patch(':id/karma')
  @ApiAuthRoute('Update the karma of a campaign', {
    params: [
      {
        name: 'id',
        description: 'Campaign id',
        example: '550e8400-e29b-41d4-a716-446655440000',
      },
    ],
    responses: [
      {
        status: 200,
        description:
          'Updates the karma of a campaign and returns the updated campaign',
        type: CampaignResponseDto,
      },
    ],
  })
  @UseGuards(CampaignOwnershipGuard)
  async updateCampaignKarma(
    @Body() updateDto: UpdateKarmaDto,
    @Req() req: Request,
  ): Promise<CampaignResponseDto> {
    return this.campaignService.updateCampaignKarma(updateDto, req);
  }

  @Delete(':id')
  @ApiAuthRoute('Temporary remove a campaign', {
    params: [
      {
        name: 'id',
        description: 'Campaign id',
        example: '550e8400-e29b-41d4-a716-446655440000',
      },
    ],
    responses: [
      {
        status: 200,
        description: 'Soft remove a campaign',
        type: CampaignResponseDto,
      },
    ],
  })
  @UseGuards(CampaignOwnershipGuard)
  async softRemoveCampaign(@Req() req: Request): Promise<CampaignResponseDto> {
    return this.campaignService.softRemoveCampaign(req);
  }

  @Patch(':id/restore')
  @ApiAuthRoute('Restore a removed campaign', {
    params: [
      {
        name: 'id',
        description: 'Campaign id',
        example: '550e8400-e29b-41d4-a716-446655440000',
      },
    ],
    responses: [
      {
        status: 200,
        description: 'Restore a campaign that has been soft removed',
        type: CampaignResponseDto,
      },
    ],
  })
  @UseGuards(CampaignOwnershipGuard)
  async restoreSoftRemovedCampaign(
    @Req() req: Request,
  ): Promise<CampaignResponseDto> {
    return this.campaignService.restoreSoftRemovedCampaign(req);
  }

  @Delete(':id/permanent')
  @ApiAuthRoute('Permanently delete a campaign', {
    params: [
      {
        name: 'id',
        description: 'Campaign id',
        example: '550e8400-e29b-41d4-a716-446655440000',
      },
    ],
    responses: [
      {
        status: 200,
        description: 'Permanently delete a campaign that has been soft removed',
        type: CampaignResponseDto,
      },
    ],
  })
  @UseGuards(CampaignOwnershipGuard)
  async deleteCampaignFromTrash(
    @Req() req: Request,
  ): Promise<CampaignResponseDto> {
    return this.campaignService.deleteCampaign(req);
  }
}
