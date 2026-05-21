import { Module } from '@nestjs/common';
import { CampaignController } from './campaign.controller';
import { CampaignService } from './campaign.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CampaignRepository } from './campaign.repository';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [CampaignController],
  providers: [CampaignService, CampaignRepository, JwtAuthGuard],
})
export class CampaignModule {}
