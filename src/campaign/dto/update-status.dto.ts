import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CampaignStatus, ConclusionType } from '../../generated/prisma/enums';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateStatusDto {
  @ApiProperty({
    enum: CampaignStatus,
    example: CampaignStatus.ACTIVE,
    description: 'Campaign status',
  })
  @IsEnum(CampaignStatus)
  status: CampaignStatus;

  @ApiPropertyOptional({
    enum: ConclusionType,
    example: ConclusionType.VICTORY,
    description: 'Campaign conclusion type',
  })
  @IsEnum(ConclusionType)
  @IsOptional()
  conclusion: ConclusionType;
}
