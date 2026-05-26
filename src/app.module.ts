import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CampaignModule } from './campaign/campaign.module';
import { SessionService } from './session/session.service';
import { SessionController } from './session/session.controller';
import { SessionModule } from './session/session.module';

@Module({
  imports: [PrismaModule, AuthModule, CampaignModule, SessionModule],
  controllers: [AppController, SessionController],
  providers: [AppService, SessionService],
})
export class AppModule {}
