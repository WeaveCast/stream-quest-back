import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationResponseDto<T> {
  @ApiProperty({
    description: 'Array of items for current page',
    isArray: true,
  })
  data: T[];

  @ApiPropertyOptional({
    description: 'Cursor for next page (null if last page)',
    nullable: true,
  })
  nextCursor: string | null;

  @ApiPropertyOptional({
    description: 'Cursor for previous page (null if first page)',
    nullable: true,
  })
  previousCursor: string | null;

  @ApiProperty({
    description: 'Number of items in current page',
  })
  count: number;

  @ApiProperty({
    description: 'Whether there are more pages',
  })
  hasMore: boolean;

  @ApiProperty({
    description: 'Where there are previous pages',
  })
  hasPrevious: boolean;
}
