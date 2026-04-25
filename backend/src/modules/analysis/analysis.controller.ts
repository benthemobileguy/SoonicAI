import {
  Controller,
  Post,
  Get,
  Body,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { AnalysisService } from './analysis.service';
import { AnalyzeUrlDto } from './dto/analyze-url.dto';
import { SupabaseAuthGuard } from '../../guards/supabase-auth.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';

@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  /**
   * POST /analysis/url
   *
   * Analyze YouTube video by URL (requires authentication)
   *
   * Headers:
   * Authorization: Bearer <supabase-jwt-token>
   *
   * Request body:
   * {
   *   "url": "https://youtube.com/watch?v=xxxx"
   * }
   *
   * Response:
   * {
   *   "success": true,
   *   "analysisId": "uuid",
   *   "source": "youtube",
   *   "url": "...",
   *   "result": {
   *     "key": "C major",
   *     "tempo": 120,
   *     "chords": [...]
   *   }
   * }
   */
  @Post('url')
  @UseGuards(SupabaseAuthGuard)
  async analyzeUrl(
    @Body(ValidationPipe) dto: AnalyzeUrlDto,
    @CurrentUser() user: { userId: string; email: string },
  ) {
    return this.analysisService.analyzeUrl(dto.url, user.userId, user.email);
  }

  /**
   * GET /analysis/me
   *
   * Get current user's analyses (requires authentication)
   */
  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  async getMyAnalyses(@CurrentUser() user: { userId: string }) {
    const analyses = await this.analysisService.getUserAnalyses(user.userId);
    return { analyses };
  }

  /**
   * GET /analysis/me/stats
   *
   * Get current user's usage stats (requires authentication)
   */
  @Get('me/stats')
  @UseGuards(SupabaseAuthGuard)
  async getMyStats(@CurrentUser() user: { userId: string }) {
    return this.analysisService.getUserStats(user.userId);
  }

  /**
   * GET /analysis/health
   *
   * Check if AI service is running
   *
   * Note: Rate limiting is disabled for health checks
   * to allow monitoring systems to check frequently
   */
  @SkipThrottle()
  @Get('health')
  async healthCheck() {
    return this.analysisService.healthCheck();
  }
}
