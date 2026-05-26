import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { SessionRepository } from './session.repository';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [SessionController],
  providers: [SessionService, SessionRepository, JwtAuthGuard],
})
export class SessionModule {}
