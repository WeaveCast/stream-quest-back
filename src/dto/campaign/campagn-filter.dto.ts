import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export enum CampaignFilterStatus {
  ACTIVE = 'active',
  DELETED = 'deleted',
  ALL = 'all',
}

export class CampaignFilterDto {
  @ApiPropertyOptional({
    enum: CampaignFilterStatus,
    default: CampaignFilterStatus.ACTIVE,
    description: 'Filter campaigns by deletion status',
  })
  @IsOptional()
  @IsEnum(CampaignFilterStatus)
  status?: CampaignFilterStatus = CampaignFilterStatus.ACTIVE;
}
