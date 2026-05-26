import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { TimeOfDay } from '../../generated/prisma/enums';

export class UpdateContextDto {
  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Weather UUID (foreign key)',
  })
  @IsUUID()
  @IsOptional()
  weatherId?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Weather UUID (foreign key)',
  })
  @IsUUID()
  @IsOptional()
  locationId?: string;

  @ApiPropertyOptional({
    enum: TimeOfDay,
    enumName: 'TimeOfDay',
    example: TimeOfDay.DAY,
    description: 'Current time of day',
  })
  @IsEnum(TimeOfDay)
  @IsOptional()
  timeOfDay?: TimeOfDay;
}
