import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SessionService } from './session.service';
import {
  GetSessionListRoute,
  GetSessionDetailsRoute,
  CreateSessionRoute,
  UpdateSessionRoute,
  UpdateSessionStatusRoute,
  StartSessionRoute,
  GetContextSnapshotsRoute,
  UpdateContextSnapshotRoute,
  DeleteSessionRoute,
} from './decorator/session-routes.decorator';
import { SessionQueryDto } from './dto/session-query.dto';
import { PaginationResponseDto } from '../dto/pagination-response.dto';
import { SessionResponseDto } from './dto/session-response.dto';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import type { ContextSnapshot, Session } from '../generated/prisma/client';
import { SessionContext } from './decorator/session.decorator';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateContextSnapshotDto } from './dto/update-context.dto';

@ApiTags('Session')
@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get('')
  @GetSessionListRoute('Get sessions')
  async sessionList(
    @Query() filterDto: SessionQueryDto,
  ): Promise<PaginationResponseDto<SessionResponseDto>> {
    return await this.sessionService.getSessionList(filterDto);
  }

  @Get(':id')
  @GetSessionDetailsRoute("Get a session's details")
  async sessionDetails(
    @Param('id') sessionId: string,
  ): Promise<SessionResponseDto> {
    return await this.sessionService.getSession(sessionId);
  }

  @Post('')
  @CreateSessionRoute('Create a session')
  async createSession(
    @Body() createDto: CreateSessionDto,
  ): Promise<SessionResponseDto> {
    return await this.sessionService.createSession(createDto);
  }

  @Patch(':id')
  @UpdateSessionRoute('Update a session')
  async updateSession(
    @Body() updateDto: UpdateSessionDto,
    @SessionContext() session: Session,
  ): Promise<SessionResponseDto> {
    return await this.sessionService.updateSession(updateDto, session);
  }

  @Patch(':id/status')
  @UpdateSessionStatusRoute("Update a session's status")
  async updateSessionStatus(
    @Body() updateDto: UpdateStatusDto,
    @SessionContext() session: Session,
  ): Promise<SessionResponseDto> {
    return await this.sessionService.updateSessionStatus(updateDto, session);
  }

  @Patch(':id/start')
  @StartSessionRoute('Start a session')
  async startSession(
    @SessionContext() session: Session,
  ): Promise<SessionResponseDto> {
    return await this.sessionService.startSession(session);
  }

  @Patch(':id/end')
  @StartSessionRoute('End a session')
  async endSession(
    @SessionContext() session: Session,
  ): Promise<SessionResponseDto> {
    return await this.sessionService.endSession(session);
  }

  @Get(':id/snapshot')
  @GetContextSnapshotsRoute('Get session context snapshots')
  async getContextSnapshots(
    @SessionContext() session: Session,
  ): Promise<ContextSnapshot[]> {
    return await this.sessionService.getContextSnapshots(session);
  }

  @Patch(':id/snapshot')
  @UpdateContextSnapshotRoute('Take a snapshot of the session')
  async updateContextSnapshot(
    @Body() updateContextSnapshotDto: UpdateContextSnapshotDto,
    @SessionContext() session: Session,
  ): Promise<void> {
    await this.sessionService.updateContextSnapshot(
      updateContextSnapshotDto,
      session,
    );
  }

  @Delete(':id')
  @DeleteSessionRoute('Delete a session')
  async deleteSession(@SessionContext() session: Session): Promise<Session> {
    return await this.sessionService.deleteSession(session);
  }
}
