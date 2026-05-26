import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateSessionDto {
  @ApiProperty({
    example: 'Session n°1',
    description: 'Session title',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({
    example: 'Group discover',
    description: 'Session description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Campaign UUID (foreign key)',
  })
  @IsUUID()
  @IsNotEmpty()
  campaignId: string;
}
