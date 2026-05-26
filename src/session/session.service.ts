import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SessionRepository } from './session.repository';
import { SessionQueryDto } from './dto/session-query.dto';
import { PaginationResponseDto } from '../dto/pagination-response.dto';
import { SessionResponseDto } from './dto/session-response.dto';
import { SessionWhereInput } from '../generated/prisma/models';
import { paginate } from '../helpers/pagination.helper';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { ContextSnapshot, Session } from '../generated/prisma/client';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateContextSnapshotDto } from './dto/update-context.dto';

@Injectable()
export class SessionService {
  constructor(private readonly repository: SessionRepository) {}

  async getSessionList(
    queryDto: SessionQueryDto,
  ): Promise<PaginationResponseDto<SessionResponseDto>> {
    const whereClause: SessionWhereInput = {
      status: queryDto.status ?? undefined,
      campaignId: queryDto.campaignId ?? undefined,
    };

    const sessions = await this.repository.getSessionList(whereClause, {
      take: (queryDto.limit || 10) + 1,
      cursor: queryDto.cursor,
      direction: queryDto.direction,
      orderBy: { createdAt: 'desc' },
    });

    return paginate(sessions, queryDto);
  }

  async getSession(id: string): Promise<SessionResponseDto> {
    if (!id) {
      throw new BadRequestException('Session id is missing');
    }

    const whereClause = { id };
    const session = await this.repository.getSession(whereClause);

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return session;
  }

  async createSession(dto: CreateSessionDto): Promise<SessionResponseDto> {
    return await this.repository.createSession(dto);
  }

  async updateSession(
    dto: UpdateSessionDto,
    session: Session,
  ): Promise<SessionResponseDto> {
    const whereClause = { id: session.id };

    return await this.repository.updateSession(whereClause, dto);
  }

  async updateSessionStatus(
    dto: UpdateStatusDto,
    session: Session,
  ): Promise<SessionResponseDto> {
    return await this.repository.updateSession({ id: session.id }, dto);
  }

  async startSession(session: Session): Promise<Session> {
    return await this.repository.startSession({ id: session.id });
  }

  async endSession(session: Session): Promise<Session> {
    return await this.repository.endSession({ id: session.id });
  }

  async getContextSnapshots(session: Session): Promise<ContextSnapshot[]> {
    return await this.repository.getContextSnapshots({ sessionId: session.id });
  }

  async deleteSession(session: Session): Promise<Session> {
    return await this.repository.deleteSession({ id: session.id });
  }

  async updateContextSnapshot(
    dto: UpdateContextSnapshotDto,
    session: Session,
  ): Promise<void> {
    await this.repository.createContextSnapshot(dto, session.id);
  }
}
