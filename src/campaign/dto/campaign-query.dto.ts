import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export enum CampaignFilterStatus {
  ACTIVE = 'active',
  DELETED = 'deleted',
  ALL = 'all',
}

export class CampaignQueryDto {
  // Filtres
  @ApiPropertyOptional({
    enum: CampaignFilterStatus,
    default: CampaignFilterStatus.ACTIVE,
    description: 'Filter campaigns by deletion status',
  })
  @IsOptional()
  @IsEnum(CampaignFilterStatus)
  status?: CampaignFilterStatus = CampaignFilterStatus.ACTIVE;

  // Pagination
  @ApiPropertyOptional({
    default: 10,
    minimum: 1,
    maximum: 100,
    description: 'Number of items per page',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({
    enum: ['forward', 'backward'],
    default: 'forward',
    description: 'Navigation direction',
  })
  @IsOptional()
  @IsEnum(['forward', 'backward'])
  direction?: 'forward' | 'backward' = 'forward';

  @ApiPropertyOptional({
    description: 'Cursor ID from previous page response',
  })
  @IsString()
  @IsOptional()
  cursor?: string;
}
