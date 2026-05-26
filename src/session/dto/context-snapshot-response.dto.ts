import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TimeOfDay } from '../../generated/prisma/enums';

export class ContextSnapshotResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Snapshot unique identifier',
  })
  id!: string;

  @ApiPropertyOptional({
    enum: TimeOfDay,
    enumName: 'TimeOfDay',
    example: TimeOfDay.DAY,
    description: 'Time of day',
  })
  timeOfDay?: TimeOfDay;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Weather UUID',
  })
  weatherId?: string | null;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Location UUID',
  })
  locationId?: string | null;

  @ApiProperty({
    example: '2026-05-26T14:30:00.000Z',
    description: 'When this snapshot was created',
  })
  snapshotAt!: Date;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Session UUID',
  })
  sessionId!: string;
}
