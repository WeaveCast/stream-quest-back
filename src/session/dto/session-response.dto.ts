import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SessionStatus } from '../../generated/prisma/enums';

export class SessionResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Session unique identifier',
  })
  id: string;

  @ApiProperty({
    example: 'Session n°1',
    description: 'Session title',
  })
  title: string;

  @ApiPropertyOptional({
    example: 'Group discover',
    description: 'Session description',
  })
  description?: string | null;

  @ApiPropertyOptional({
    enum: SessionStatus,
    example: SessionStatus.LIVE,
    description: 'Session status',
  })
  status: SessionStatus;

  @ApiPropertyOptional({
    example: '2026-05-13T10:00:00.000Z',
    description: 'Session starting date',
  })
  startedAt?: Date | null;

  @ApiPropertyOptional({
    example: '2026-05-13T10:00:00.000Z',
    description: 'Session ending date',
  })
  endedAt?: Date | null;

  @ApiProperty({
    example: '2026-05-13T10:00:00.000Z',
    description: 'Creation date',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-05-13T10:00:00.000Z',
    description: 'Last update date',
  })
  updatedAt: Date;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Campaign UUID (foreign key)',
  })
  campaignId: string;

  @ApiPropertyOptional({
    example: {
      contextSnapshots: 5,
      karmaEvents: 10,
      sessionEvents: 12,
      sessionPlayers: 4,
      viewerInteractions: 100,
    },
    description: 'Relation counts',
  })
  _count?: {
    contextSnapshots: number;
    karmaEvents: number;
    sessionEvents: number;
    sessionPlayers: number;
    viewerInteractions: number;
  };
}
