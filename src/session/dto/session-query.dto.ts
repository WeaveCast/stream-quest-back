import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseQueryDto } from '../../dto/base-query.dto';
import { SessionStatus } from '../../generated/prisma/enums';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class SessionQueryDto extends BaseQueryDto {
  @ApiPropertyOptional({
    enum: SessionStatus,
    default: SessionStatus.LIVE,
    description: 'Filter by session status',
  })
  @IsEnum(SessionStatus)
  @IsOptional()
  status?: SessionStatus | null;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Campaign UUID (foreign key)',
  })
  @IsUUID()
  @IsOptional()
  campaignId?: string | null;
}
