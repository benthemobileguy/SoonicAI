import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { execFile } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execFileAsync = promisify(execFile);

@Injectable()
export class YouTubeService {
  private readonly tempDir: string;
  private readonly maxDuration: number;

  constructor(private config: ConfigService) {
    this.tempDir = this.config.get('processing.tempDir') || '/tmp';
    this.maxDuration = this.config.get('processing.maxDuration') || 300;
  }

  /**
   * Download audio from YouTube URL
   * Returns path to downloaded WAV file
   *
   * SECURITY: Uses execFile with argument array to prevent command injection
   *
   * @param url - YouTube video URL
   * @param maxDuration - Maximum allowed video duration in seconds (default: from config)
   */
  async downloadAudio(url: string, maxDuration?: number): Promise<string> {
    // Validate URL
    if (!this.isValidYouTubeUrl(url)) {
      throw new BadRequestException('Invalid YouTube URL');
    }

    // Use provided maxDuration or fallback to config default
    const durationLimit = maxDuration || this.maxDuration;

    const timestamp = Date.now();
    const outputPath = path.join(this.tempDir, `youtube-${timestamp}.wav`);

    // SECURITY FIX: Use argument array instead of shell command string
    // This prevents command injection attacks
    const args = [
      '-x',                              // Extract audio only
      '--audio-format', 'wav',           // Convert to WAV
      '--match-filter', `duration <= ${durationLimit}`,  // Limit duration
      '-o', outputPath,                  // Output file path
      url,                               // YouTube URL
    ];

    try {
      await execFileAsync('yt-dlp', args, {
        timeout: 60000, // 1 minute timeout for download
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer for output
      });

      // Verify file exists
      if (!fs.existsSync(outputPath)) {
        throw new InternalServerErrorException('Audio file not created');
      }

      return outputPath;
    } catch (error) {
      // Clean up if file was partially created
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }

      // Handle specific errors
      if (error.message.includes('Video duration')) {
        const minutes = Math.floor(durationLimit / 60);
        const seconds = durationLimit % 60;
        const durationText = seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes} minutes`;
        throw new BadRequestException(`Video exceeds maximum duration (${durationText})`);
      }

      if (error.message.includes('Video unavailable')) {
        throw new BadRequestException('Video is unavailable or private');
      }

      if (error.code === 'ETIMEDOUT') {
        throw new InternalServerErrorException('Download timed out');
      }

      // Log detailed error internally, return generic message to client
      console.error('[YouTubeService] Download failed:', {
        error: error.message,
        url: url.substring(0, 50), // Log partial URL only
        timestamp: new Date().toISOString(),
      });

      throw new InternalServerErrorException(
        'Failed to download audio from YouTube',
      );
    }
  }

  /**
   * Get video metadata (duration, title, etc.)
   * Useful for validation before downloading
   *
   * SECURITY: Uses execFile with argument array to prevent command injection
   */
  async getVideoInfo(url: string): Promise<any> {
    if (!this.isValidYouTubeUrl(url)) {
      throw new BadRequestException('Invalid YouTube URL');
    }

    // SECURITY FIX: Use argument array
    const args = ['--dump-json', '--no-download', url];

    try {
      const { stdout } = await execFileAsync('yt-dlp', args, {
        timeout: 10000,
        maxBuffer: 5 * 1024 * 1024, // 5MB buffer
      });

      // SECURITY FIX: Add try-catch for JSON parsing
      let info;
      try {
        info = JSON.parse(stdout);
      } catch (parseError) {
        console.error('[YouTubeService] JSON parse failed:', parseError.message);
        throw new InternalServerErrorException('Invalid video metadata received');
      }

      // SECURITY FIX: Validate required fields exist
      if (!info || typeof info !== 'object') {
        throw new InternalServerErrorException('Invalid video metadata structure');
      }

      return {
        title: info.title || 'Unknown',
        duration: typeof info.duration === 'number' ? info.duration : 0,
        uploader: info.uploader || 'Unknown',
      };
    } catch (error) {
      // Log detailed error internally
      console.error('[YouTubeService] Get video info failed:', {
        error: error.message,
        url: url.substring(0, 50),
        timestamp: new Date().toISOString(),
      });

      // Return generic message to client
      throw new InternalServerErrorException('Failed to retrieve video information');
    }
  }

  /**
   * Clean up downloaded file
   *
   * PERFORMANCE FIX: Uses async file operations to avoid blocking event loop
   */
  async cleanup(filePath: string): Promise<void> {
    try {
      // PERFORMANCE FIX: Use async unlink instead of unlinkSync
      await fs.promises.unlink(filePath);
    } catch (error) {
      // Only log if error is not "file not found" (ENOENT)
      if (error.code !== 'ENOENT') {
        console.error('[YouTubeService] Cleanup failed:', {
          filePath,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  /**
   * Validate YouTube URL format
   */
  private isValidYouTubeUrl(url: string): boolean {
    const patterns = [
      /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[\w-]+/,
      /^(https?:\/\/)?(www\.)?youtu\.be\/[\w-]+/,
    ];

    return patterns.some((pattern) => pattern.test(url));
  }
}
