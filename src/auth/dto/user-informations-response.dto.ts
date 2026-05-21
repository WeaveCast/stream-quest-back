import { ApiProperty } from '@nestjs/swagger';

export class UserInformationsResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'User unique identifier',
  })
  id: string;

  @ApiProperty({ example: 'Maengdok', description: 'Twitch display name' })
  username: string;

  @ApiProperty({
    example: 'https://static-cdn.jtvnw.net/...',
    description: 'Twitch avatar URL',
    nullable: true,
  })
  avatarUrl: string | null;

  @ApiProperty({
    example: 'a3f2...',
    description: 'Unique token securing the OBS overlay URL',
  })
  overlayToken: string;

  @ApiProperty({
    example: '2026-05-10T00:00:00.000Z',
    description: 'Account creation date',
  })
  createdAt: Date;
}
