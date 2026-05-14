import { Module } from '@nestjs/common';
import { CampaignController } from './campaign.controller';
import { CampaignService } from './campaign.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../guards/auth/jwt-auth.guard';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [CampaignController],
  providers: [CampaignService, JwtAuthGuard],
})
export class CampaignModule {}
