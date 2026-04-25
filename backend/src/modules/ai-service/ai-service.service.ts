import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import FormData from 'form-data';
import * as fs from 'fs';
import { retryWithBackoff } from '../../utils/retry.util';

export interface ChordAnalysisResult {
  detected_key: string;
  tempo?: number;
  total_chords: number;
  hand_separation: {
    left_hand_notes: number;
    right_hand_notes: number;
    total_notes: number;
  };
  chords: Array<{
    time: number;
    chord: string;
    confidence: number;
    notes: string[];
    note_names: string[];
    hand: 'left' | 'right';
  }>;
  melody: Array<{
    time: number;
    note_names: string[];
    hand: 'right';
  }>;
  processing_time?: number;
}

@Injectable()
export class AiServiceService {
  private readonly aiServiceUrl: string;
  private readonly timeout: number;

  constructor(private config: ConfigService) {
    this.aiServiceUrl = this.config.get('aiService.url') || 'http://localhost:8000';
    this.timeout = this.config.get('aiService.timeout') || 180000;
  }

  /**
   * Send audio file to FastAPI for chord analysis
   *
   * Implements retry logic with exponential backoff to handle temporary failures.
   * Will retry up to 3 times for network errors and 503 responses.
   */
  async analyzeAudio(audioPath: string): Promise<ChordAnalysisResult> {
    // Verify file exists
    if (!fs.existsSync(audioPath)) {
      throw new InternalServerErrorException('Audio file not found');
    }

    // Wrap the API call in retry logic
    return retryWithBackoff(
      async () => {
        // Create form data with audio file
        // Note: We create a new FormData for each retry attempt
        const formData = new FormData();
        formData.append('file', fs.createReadStream(audioPath));

        try {
          console.log(`Sending audio to AI service: ${this.aiServiceUrl}/analyze`);

          const response = await axios.post<ChordAnalysisResult>(
            `${this.aiServiceUrl}/analyze`,
            formData,
            {
              headers: {
                ...formData.getHeaders(),
              },
              timeout: this.timeout,
              maxContentLength: Infinity,
              maxBodyLength: Infinity,
            },
          );

          console.log('AI analysis completed successfully');
          return response.data;
        } catch (error) {
          // Enhance error messages for specific error types
          if (error.code === 'ECONNREFUSED') {
            error.message = 'AI service is not running. Please start FastAPI server.';
          } else if (error.code === 'ETIMEDOUT') {
            error.message = 'AI analysis timed out. Audio may be too long or complex.';
          } else if (error.response?.data?.detail) {
            error.message = `AI service error: ${error.response.data.detail}`;
          }

          // Rethrow for retry logic to handle
          throw error;
        }
      },
      {
        maxRetries: 3,
        baseDelay: 1000,  // Start with 1 second
        maxDelay: 8000,   // Max 8 seconds
        jitter: true,     // Add randomization to prevent thundering herd
      },
    ).catch((error) => {
      // After all retries failed, throw user-friendly error
      const errorMessage = error.message || 'Unknown error';
      throw new InternalServerErrorException(errorMessage);
    });
  }

  /**
   * Health check for AI service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.aiServiceUrl}/`, {
        timeout: 5000,
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }
}
