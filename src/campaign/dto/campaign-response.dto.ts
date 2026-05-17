import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CampaignStatus, ConclusionType } from '../../generated/prisma/enums';
import { PlayerCharacter, Session } from '../../generated/prisma/client';

export class CampaignResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Campaign unique identifier',
  })
  id: string;

  @ApiProperty({
    example: 'Campaign n°1',
    description: 'Campaign title',
  })
  title: string;

  @ApiPropertyOptional({
    example: 'A classic D&D campaign',
    description: 'Campaign description',
  })
  description: string | null;

  @ApiProperty({
    enum: CampaignStatus,
    example: CampaignStatus.ACTIVE,
    description: 'Campaign status',
  })
  status: CampaignStatus;

  @ApiPropertyOptional({
    enum: ConclusionType,
    example: ConclusionType.VICTORY,
    description: 'Campaign conclusion',
  })
  conclusion?: ConclusionType | null;

  @ApiProperty({
    example: 0,
    description: 'Current karma value',
  })
  karmaValue: number;

  @ApiProperty({
    example: -100,
    description: 'Chaos threshold',
  })
  chaosThreshold: number;

  @ApiProperty({
    example: 100,
    description: 'Blessing threshold',
  })
  blessingThreshold: number;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Game master ID',
  })
  gameMasterId: string;

  @ApiProperty({
    example: '2026-05-13T10:00:00.000Z',
    description: 'Creation date',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-05-13T12:00:00.000Z',
    description: 'Last update date',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Campaign sessions',
    type: 'array',
    items: { type: 'object' },
  })
  sessions?: Session[];

  @ApiPropertyOptional({
    description: 'Player characters',
    type: 'array',
    items: { type: 'object' },
  })
  playerCharacters?: PlayerCharacter[];

  @ApiPropertyOptional({
    description: 'Counts of related entities',
    example: { sessions: 5, campaignEvents: 12 },
  })
  _count?: {
    sessions: number;
    campaignEvents: number;
  };
}
