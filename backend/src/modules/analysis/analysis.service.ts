import { Injectable, ForbiddenException } from '@nestjs/common';
import { YouTubeService } from '../youtube/youtube.service';
import { AiServiceService } from '../ai-service/ai-service.service';
import { SupabaseService } from '../../database/supabase.service';

@Injectable()
export class AnalysisService {
  constructor(
    private youtube: YouTubeService,
    private aiService: AiServiceService,
    private supabase: SupabaseService,
  ) {}

  /**
   * Analyze YouTube video URL
   *
   * Flow:
   * 1. Check if user exists (create if not)
   * 2. Check usage limits
   * 3. Create analysis record (status: processing)
   * 4. Download audio from YouTube (yt-dlp)
   * 5. Send audio to AI service (FastAPI)
   * 6. Store results in database
   * 7. Increment usage counter
   * 8. Clean up temp files
   * 9. Return results
   */
  async analyzeUrl(url: string, userId: string, email: string) {
    let audioPath: string | undefined;
    let analysisId: string | undefined;

    try {
      console.log(`Starting analysis for URL: ${url} (user: ${userId})`);

      // Step 1: Ensure user exists
      let user = await this.supabase.getUser(userId);
      if (!user) {
        console.log(`Creating new user: ${userId}`);
        user = await this.supabase.createUser(userId, email);
      }

      // Step 2: Check if user can analyze
      const canAnalyze = await this.supabase.canUserAnalyze(userId);
      if (!canAnalyze) {
        if (user.plan === 'free') {
          throw new ForbiddenException(
            'You have used all 3 free analyses. Purchase credits or upgrade to Pro to continue.',
          );
        } else {
          throw new ForbiddenException(
            'You have no credits remaining. Purchase more credits to continue.',
          );
        }
      }

      // Step 2b: Set duration limit based on plan
      const maxDuration = user.plan === 'free' ? 60 : 300; // Free: 60s, Paid: 300s
      console.log(`User plan: ${user.plan}, Max duration: ${maxDuration}s`);

      // Step 3: Create analysis record
      const analysis = await this.supabase.createAnalysis({
        user_id: userId,
        source_type: 'youtube',
        source_url: url,
        status: 'processing',
      });
      analysisId = analysis.id;
      console.log(`Created analysis record: ${analysisId}`);

      // Step 4: Download audio from YouTube (with plan-based duration limit)
      console.log(`Downloading audio from YouTube (max ${maxDuration}s)...`);
      audioPath = await this.youtube.downloadAudio(url, maxDuration);
      console.log(`Audio downloaded: ${audioPath}`);

      // Step 5: Send to AI service for chord analysis
      console.log('Analyzing chords with AI service...');
      const startTime = Date.now();
      const result = await this.aiService.analyzeAudio(audioPath);
      const processingTime = (Date.now() - startTime) / 1000;
      console.log(`Analysis completed in ${processingTime}s`);

      // Step 6: Store results in database
      await this.supabase.updateAnalysis(analysisId, {
        status: 'completed',
        detected_key: result.detected_key,
        tempo: result.tempo,
        chords: result.chords,
        processing_time_seconds: processingTime,
        completed_at: new Date().toISOString(),
      });

      // Step 7: Increment usage counter
      await this.supabase.incrementAnalysisCount(userId);
      console.log('Usage counter incremented');

      // Step 8: Return results
      return {
        success: true,
        analysisId,
        source: 'youtube',
        url,
        result: {
          key: result.detected_key,
          tempo: result.tempo,
          totalChords: result.total_chords,
          chords: result.chords.map((chord) => ({
            timestamp: chord.time,
            chord: chord.chord,
            notes: chord.note_names,
            confidence: chord.confidence,
            hand: chord.hand,
          })),
          handSeparation: {
            leftHand: result.hand_separation.left_hand_notes,
            rightHand: result.hand_separation.right_hand_notes,
            total: result.hand_separation.total_notes,
          },
          melody: result.melody,
          processingTime,
        },
      };
    } catch (error) {
      console.error('Analysis failed:', error.message);

      // Update analysis status to failed if we created one
      if (analysisId) {
        await this.supabase.updateAnalysis(analysisId, {
          status: 'failed',
        });
      }

      throw error;
    } finally {
      // Step 9: Always clean up temp file
      if (audioPath) {
        console.log('Cleaning up temp file...');
        await this.youtube.cleanup(audioPath);
      }
    }
  }

  /**
   * Get user's analyses
   */
  async getUserAnalyses(userId: string, limit = 10) {
    return this.supabase.getUserAnalyses(userId, limit);
  }

  /**
   * Get user's usage stats
   */
  async getUserStats(userId: string) {
    const user = await this.supabase.getUser(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Determine if user can analyze based on their plan
    let canAnalyze = false;
    if (user.plan === 'pro') {
      canAnalyze = true; // Pro users have unlimited
    } else if (user.plan === 'free') {
      canAnalyze = user.analyses_used < user.analyses_limit; // Check free analyses
    } else {
      canAnalyze = (user.credits_remaining || 0) > 0; // Check credits
    }

    return {
      plan: user.plan,
      analysesUsed: user.analyses_used,
      analysesLimit: user.analyses_limit,
      creditsRemaining: user.credits_remaining || 0, // Actual credits from DB
      canAnalyze,
      maxDuration: user.plan === 'free' ? 60 : 300, // Free: 60s, Paid: 300s
    };
  }

  /**
   * Health check - verify AI service is running
   */
  async healthCheck() {
    const aiServiceHealthy = await this.aiService.healthCheck();

    return {
      status: aiServiceHealthy ? 'ok' : 'degraded',
      services: {
        aiService: aiServiceHealthy ? 'healthy' : 'unhealthy',
      },
    };
  }
}
