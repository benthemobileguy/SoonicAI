import { Module } from '@nestjs/common';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';
import { YouTubeModule } from '../youtube/youtube.module';
import { AiServiceModule } from '../ai-service/ai-service.module';

@Module({
  imports: [YouTubeModule, AiServiceModule],
  controllers: [AnalysisController],
  providers: [AnalysisService],
})
export class AnalysisModule {}
