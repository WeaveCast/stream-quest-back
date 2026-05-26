import { ApiPropertyOptional } from '@nestjs/swagger';
import { FilterDeletionStatus } from '../enum/filter-status.enum';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class BaseQueryDto {
  // Filters
  @ApiPropertyOptional({
    enum: FilterDeletionStatus,
    default: FilterDeletionStatus.ACTIVE,
    description: 'Filter by deletion status',
  })
  @IsOptional()
  @IsEnum(FilterDeletionStatus)
  deletionStatus?: FilterDeletionStatus = FilterDeletionStatus.ACTIVE;

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
