import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCampaignDto {
  @ApiProperty({
    example: 'Campaign n°1',
    description: 'Campaign title',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({
    example: 'A classic D&D campaign',
    description: 'Campaign description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: -100,
    description: 'Chaos threshold (karma value triggering chaos event)',
  })
  @IsInt()
  chaosThreshold: number;

  @ApiProperty({
    example: 100,
    description: 'Blessing threshold (karma value triggering blessing event)',
  })
  @IsInt()
  blessingThreshold: number;
}
