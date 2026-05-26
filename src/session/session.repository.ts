import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ContextSnapshotCreateInput,
  ContextSnapshotWhereInput,
  SessionCreateInput,
  SessionOrderByWithRelationInput,
  SessionUpdateInput,
  SessionWhereInput,
  SessionWhereUniqueInput,
} from '../generated/prisma/models';
import {
  ContextSnapshot,
  Session,
  SessionStatus,
} from '../generated/prisma/client';

@Injectable()
export class SessionRepository {
  private readonly includeCount = {
    _count: {
      select: {
        contextSnapshots: true,
        karmaEvents: true,
        sessionEvents: true,
        sessionPlayers: true,
        viewerInteractions: true,
      },
    },
  };

  constructor(private readonly prisma: PrismaService) {}

  async getSessionList(
    where: SessionWhereInput,
    options?: {
      take?: number;
      cursor?: string;
      direction?: 'forward' | 'backward';
      orderBy?: SessionOrderByWithRelationInput;
    },
  ): Promise<Session[]> {
    const isBackward = options?.direction === 'backward';
    const take = options?.take || 10;

    const result = (await this.prisma.session.findMany({
      where,
      take: isBackward ? -take : take,
      ...(options?.cursor && {
        skip: 1,
        cursor: { id: options.cursor },
      }),
      orderBy: options?.orderBy || { createdAt: 'desc' },
      include: this.includeCount,
    })) as Session[];

    return isBackward ? result.reverse() : result;
  }

  async getSession(where: SessionWhereUniqueInput): Promise<Session | null> {
    return await this.prisma.session.findUnique({
      where,
      include: this.includeCount,
    });
  }

  async createSession(data: SessionCreateInput): Promise<Session> {
    return await this.prisma.session.create({
      data,
      include: this.includeCount,
    });
  }

  async updateSession(
    where: SessionWhereUniqueInput,
    data: SessionUpdateInput,
  ): Promise<Session> {
    return await this.update(where, data);
  }

  async updateSessionStatus(
    where: SessionWhereUniqueInput,
    data: SessionUpdateInput,
  ): Promise<Session> {
    return await this.update(where, data);
  }

  async startSession(where: SessionWhereUniqueInput): Promise<Session> {
    return await this.update(where, {
      status: SessionStatus.LIVE,
      startedAt: new Date(),
    });
  }

  async endSession(where: SessionWhereUniqueInput): Promise<Session> {
    return await this.update(where, {
      status: SessionStatus.ENDED,
      endedAt: new Date(),
    });
  }

  async getContextSnapshots(
    where: ContextSnapshotWhereInput,
  ): Promise<ContextSnapshot[]> {
    return await this.prisma.contextSnapshot.findMany({
      where,
      orderBy: { snapshotAt: 'desc' },
    });
  }

  async createContextSnapshot(data: ContextSnapshotCreateInput): Promise<void> {
    await this.prisma.contextSnapshot.create({
      data,
    });
  }

  async deleteSession(where: SessionWhereUniqueInput): Promise<Session> {
    return await this.prisma.session.delete({ where });
  }

  private async update(
    where: SessionWhereUniqueInput,
    data: SessionUpdateInput,
  ): Promise<Session> {
    return await this.prisma.session.update({
      where,
      data,
      include: this.includeCount,
    });
  }
}
