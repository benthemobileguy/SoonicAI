# Soonic AI - Backend Implementation Plan

**Last Updated:** 2026-04-24
**Status:** Planning Phase - Ready to Build
**Tech Stack:** NestJS + BullMQ + Redis + Firebase + AWS S3

---

## 🎯 Overview

This document provides the complete, step-by-step plan to build the production NestJS backend for Soonic AI.

**Timeline:** 10 days (2 weeks)
**Prerequisites:** Node.js 20+, AWS account, Firebase project, Redis

---

## 📋 What The Backend Does

The backend is responsible for:

1. **Video Upload** - Accepts video files from frontend
2. **Storage Management** - Stores videos/audio in AWS S3
3. **Job Orchestration** - Manages async processing with job queue
4. **Audio Extraction** - Runs FFmpeg to extract audio from video
5. **AI Service Integration** - Calls Python AI service for chord detection
6. **Data Persistence** - Stores metadata and results in Firestore
7. **API Endpoints** - Provides REST API for frontend

---

## 🏗️ Architecture

```
Frontend (Next.js)
       ↓
    [HTTPS]
       ↓
┌──────────────────────────────────┐
│   BACKEND (NestJS on Port 3001)  │
│                                   │
│  ├─ Video Upload Controller      │
│  ├─ Job Queue Service (BullMQ)   │
│  ├─ FFmpeg Audio Service          │
│  ├─ S3 Storage Service            │
│  ├─ Firestore Database Service   │
│  └─ AI Service HTTP Client        │
└──────────────────────────────────┘
       │         │         │
       ▼         ▼         ▼
   AWS S3    Firebase   AI Service
            Firestore  (FastAPI:8000)
       │
       ▼
    Redis (Job Queue)
```

---

## 📂 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── configuration.ts           # Environment config loader
│   │   └── firebase.config.ts         # Firebase initialization
│   │
│   ├── modules/
│   │   ├── video/
│   │   │   ├── video.controller.ts    # Upload & status endpoints
│   │   │   ├── video.service.ts       # Business logic
│   │   │   ├── video.module.ts
│   │   │   └── dto/
│   │   │       ├── upload-video.dto.ts
│   │   │       └── video-response.dto.ts
│   │   │
│   │   ├── queue/
│   │   │   ├── queue.module.ts
│   │   │   ├── video.processor.ts     # Job worker
│   │   │   └── queue.service.ts       # Job management
│   │   │
│   │   ├── storage/
│   │   │   ├── s3.service.ts          # AWS S3 operations
│   │   │   └── storage.module.ts
│   │   │
│   │   ├── database/
│   │   │   ├── firestore.service.ts   # Firestore CRUD
│   │   │   └── database.module.ts
│   │   │
│   │   ├── audio/
│   │   │   ├── audio.service.ts       # FFmpeg operations
│   │   │   └── audio.module.ts
│   │   │
│   │   ├── ai/
│   │   │   ├── ai.service.ts          # Call AI service
│   │   │   └── ai.module.ts
│   │   │
│   │   └── auth/ (Sprint 11+)
│   │       ├── auth.guard.ts
│   │       └── auth.module.ts
│   │
│   ├── common/
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── interceptors/
│   │   │   └── logging.interceptor.ts
│   │   └── guards/
│   │       └── auth.guard.ts
│   │
│   ├── app.module.ts
│   └── main.ts
│
├── test/
│   ├── video.e2e-spec.ts
│   └── app.e2e-spec.ts
│
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 SPRINT 1: Backend Foundation (Week 1 - Days 1-5)

### Day 1: NestJS Project Setup

**Goal:** Initialize NestJS project with basic configuration

#### Tasks

1. **Create NestJS Project**
```bash
cd /Users/apple/BNOTION/SoonicAI
npx @nestjs/cli new backend
# Choose npm as package manager
cd backend
```

2. **Install Core Dependencies**
```bash
npm install @nestjs/config
npm install @nestjs/platform-express
npm install class-validator class-transformer
npm install @nestjs/bull bullmq ioredis
npm install firebase-admin
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
npm install multer @types/multer
npm install axios
npm install winston nest-winston
```

3. **Create Configuration Module**

File: `src/config/configuration.ts`
```typescript
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',

  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKeyPath: process.env.FIREBASE_PRIVATE_KEY_PATH,
  },

  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
    s3: {
      videosBucket: process.env.AWS_S3_BUCKET_VIDEOS,
      audioBucket: process.env.AWS_S3_BUCKET_AUDIO,
    },
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  },

  aiService: {
    url: process.env.AI_SERVICE_URL || 'http://localhost:8000',
    timeout: parseInt(process.env.AI_SERVICE_TIMEOUT, 10) || 600000,
  },
});
```

4. **Configure Main App**

File: `src/main.ts`
```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}`);
}

bootstrap();
```

5. **Create Environment File**

File: `.env.example`
```bash
# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_PATH=./firebase-admin-key.json

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET_VIDEOS=soonic-videos-dev
AWS_S3_BUCKET_AUDIO=soonic-audio-dev

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# AI Service
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_TIMEOUT=600000
```

**End of Day 1 Checkpoint:**
- ✅ NestJS project initialized
- ✅ Dependencies installed
- ✅ Configuration module created
- ✅ Server starts on port 3001

---

### Day 2: Video Upload Module

**Goal:** Create video upload endpoint with file validation

#### Tasks

1. **Create Video Module**
```bash
nest g module modules/video
nest g controller modules/video
nest g service modules/video
```

2. **Create DTOs**

File: `src/modules/video/dto/upload-video.dto.ts`
```typescript
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UploadVideoDto {
  @IsString()
  @MaxLength(255)
  fileName: string;

  @IsOptional()
  @IsString()
  userId?: string;
}
```

File: `src/modules/video/dto/video-response.dto.ts`
```typescript
export class VideoResponseDto {
  id: string;
  userId: string | null;
  fileName: string;
  fileUrl: string;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;
  uploadedAt: Date;
  processedAt?: Date;
  analysisResult?: any;
}
```

3. **Create Video Controller**

File: `src/modules/video/video.controller.ts`
```typescript
import {
  Controller,
  Post,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VideoService } from './video.service';
import { UploadVideoDto } from './dto/upload-video.dto';

@Controller('videos')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('video'))
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadVideoDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file size (500MB max)
    const MAX_SIZE = 500 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new BadRequestException('File too large (max 500MB)');
    }

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only mp4, mov, avi allowed');
    }

    return await this.videoService.uploadVideo(file, uploadDto);
  }

  @Get(':videoId')
  async getVideo(@Param('videoId') videoId: string) {
    return await this.videoService.getVideo(videoId);
  }
}
```

4. **Create Video Service (Placeholder)**

File: `src/modules/video/video.service.ts`
```typescript
import { Injectable } from '@nestjs/common';
import { UploadVideoDto } from './dto/upload-video.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class VideoService {
  async uploadVideo(file: Express.Multer.File, dto: UploadVideoDto) {
    const videoId = uuidv4();

    // Placeholder - will integrate S3 on Day 3
    console.log(`Uploading video ${dto.fileName} (${file.size} bytes)`);

    return {
      videoId,
      fileName: dto.fileName,
      status: 'uploading',
      message: 'Video upload started',
    };
  }

  async getVideo(videoId: string) {
    // Placeholder - will integrate Firestore on Day 4
    return {
      id: videoId,
      status: 'uploading',
    };
  }
}
```

**End of Day 2 Checkpoint:**
- ✅ Video upload endpoint working
- ✅ File validation in place
- ✅ Can receive video files via multipart/form-data

---

### Day 3: AWS S3 Integration

**Goal:** Upload videos to S3 and generate signed URLs

#### Tasks

1. **Create Storage Module**
```bash
nest g module modules/storage
nest g service modules/storage/s3
```

2. **Create S3 Service**

File: `src/modules/storage/s3.service.ts`
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client: S3Client;
  private readonly videosBucket: string;
  private readonly audioBucket: string;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get('aws.region'),
      credentials: {
        accessKeyId: this.configService.get('aws.accessKeyId'),
        secretAccessKey: this.configService.get('aws.secretAccessKey'),
      },
    });

    this.videosBucket = this.configService.get('aws.s3.videosBucket');
    this.audioBucket = this.configService.get('aws.s3.audioBucket');
  }

  async uploadVideo(file: Express.Multer.File, key: string): Promise<string> {
    this.logger.log(`Uploading video to S3: ${key}`);

    const command = new PutObjectCommand({
      Bucket: this.videosBucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);

    const url = `https://${this.videosBucket}.s3.${this.configService.get('aws.region')}.amazonaws.com/${key}`;
    this.logger.log(`Video uploaded successfully: ${url}`);

    return url;
  }

  async uploadAudio(buffer: Buffer, key: string): Promise<string> {
    this.logger.log(`Uploading audio to S3: ${key}`);

    const command = new PutObjectCommand({
      Bucket: this.audioBucket,
      Key: key,
      Body: buffer,
      ContentType: 'audio/wav',
    });

    await this.s3Client.send(command);

    return `https://${this.audioBucket}.s3.${this.configService.get('aws.region')}.amazonaws.com/${key}`;
  }

  async getSignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.videosBucket,
      Key: key,
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn });
  }
}
```

3. **Update Video Service to Use S3**

File: `src/modules/video/video.service.ts`
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { S3Service } from '../storage/s3.service';
import { UploadVideoDto } from './dto/upload-video.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);

  constructor(private readonly s3Service: S3Service) {}

  async uploadVideo(file: Express.Multer.File, dto: UploadVideoDto) {
    const videoId = uuidv4();
    const key = `videos/${videoId}/${dto.fileName}`;

    this.logger.log(`Processing upload for video: ${videoId}`);

    // Upload to S3
    const fileUrl = await this.s3Service.uploadVideo(file, key);

    // TODO: Save to Firestore (Day 4)
    // TODO: Add to job queue (Day 5)

    return {
      videoId,
      fileName: dto.fileName,
      fileUrl,
      status: 'uploading',
    };
  }

  async getVideo(videoId: string) {
    // TODO: Implement with Firestore (Day 4)
    return { id: videoId, status: 'uploading' };
  }
}
```

**End of Day 3 Checkpoint:**
- ✅ S3 service implemented
- ✅ Videos uploading to AWS S3
- ✅ Signed URLs working

---

### Day 4: Firestore Database Integration

**Goal:** Save and retrieve video metadata from Firestore

#### Tasks

1. **Create Database Module**
```bash
nest g module modules/database
nest g service modules/database/firestore
```

2. **Initialize Firebase**

File: `src/config/firebase.config.ts`
```typescript
import { initializeApp, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let firebaseApp: App;
let firestoreDb: Firestore;

export const initializeFirebase = (privateKeyPath: string, projectId: string) => {
  if (!firebaseApp) {
    firebaseApp = initializeApp({
      credential: cert(privateKeyPath),
      projectId,
    });

    firestoreDb = getFirestore(firebaseApp);
  }

  return { app: firebaseApp, db: firestoreDb };
};

export const getFirestoreDb = (): Firestore => {
  if (!firestoreDb) {
    throw new Error('Firebase not initialized');
  }
  return firestoreDb;
};
```

3. **Create Firestore Service**

File: `src/modules/database/firestore.service.ts`
```typescript
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Firestore, Timestamp } from 'firebase-admin/firestore';
import { initializeFirebase, getFirestoreDb } from '../../config/firebase.config';

export interface VideoDocument {
  id: string;
  userId: string | null;
  fileName: string;
  fileUrl: string;
  audioUrl?: string;
  status: 'uploading' | 'processing' | 'audio_extracted' | 'analyzing' | 'completed' | 'failed';
  progress: number;
  jobId?: string;
  uploadedAt: Timestamp;
  processedAt?: Timestamp;
  analysisResult?: any;
  error?: string;
}

@Injectable()
export class FirestoreService implements OnModuleInit {
  private readonly logger = new Logger(FirestoreService.name);
  private db: Firestore;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const privateKeyPath = this.configService.get('firebase.privateKeyPath');
    const projectId = this.configService.get('firebase.projectId');

    initializeFirebase(privateKeyPath, projectId);
    this.db = getFirestoreDb();

    this.logger.log('Firestore initialized successfully');
  }

  async createVideo(data: Partial<VideoDocument>): Promise<string> {
    const docRef = this.db.collection('videos').doc(data.id);

    await docRef.set({
      ...data,
      uploadedAt: Timestamp.now(),
      progress: 0,
    });

    this.logger.log(`Video document created: ${data.id}`);
    return data.id;
  }

  async getVideo(videoId: string): Promise<VideoDocument | null> {
    const docRef = this.db.collection('videos').doc(videoId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return null;
    }

    return doc.data() as VideoDocument;
  }

  async updateVideoStatus(
    videoId: string,
    status: VideoDocument['status'],
  ): Promise<void> {
    await this.db.collection('videos').doc(videoId).update({ status });
    this.logger.log(`Video ${videoId} status updated to: ${status}`);
  }

  async updateVideoProgress(videoId: string, progress: number): Promise<void> {
    await this.db.collection('videos').doc(videoId).update({ progress });
  }

  async setAudioUrl(videoId: string, audioUrl: string): Promise<void> {
    await this.db.collection('videos').doc(videoId).update({
      audioUrl,
      status: 'audio_extracted',
    });
  }

  async setAnalysisResult(videoId: string, result: any): Promise<void> {
    await this.db.collection('videos').doc(videoId).update({
      analysisResult: result,
      status: 'completed',
      processedAt: Timestamp.now(),
      progress: 100,
    });
  }

  async setError(videoId: string, error: string): Promise<void> {
    await this.db.collection('videos').doc(videoId).update({
      error,
      status: 'failed',
    });
  }
}
```

4. **Update Video Service to Use Firestore**

File: `src/modules/video/video.service.ts`
```typescript
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { S3Service } from '../storage/s3.service';
import { FirestoreService } from '../database/firestore.service';
import { UploadVideoDto } from './dto/upload-video.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);

  constructor(
    private readonly s3Service: S3Service,
    private readonly firestoreService: FirestoreService,
  ) {}

  async uploadVideo(file: Express.Multer.File, dto: UploadVideoDto) {
    const videoId = uuidv4();
    const key = `videos/${videoId}/${dto.fileName}`;

    this.logger.log(`Processing upload for video: ${videoId}`);

    // Upload to S3
    const fileUrl = await this.s3Service.uploadVideo(file, key);

    // Save to Firestore
    await this.firestoreService.createVideo({
      id: videoId,
      userId: dto.userId || null,
      fileName: dto.fileName,
      fileUrl,
      status: 'uploading',
    });

    // TODO: Add to job queue (Day 5)

    return {
      videoId,
      fileName: dto.fileName,
      fileUrl,
      status: 'uploading',
    };
  }

  async getVideo(videoId: string) {
    const video = await this.firestoreService.getVideo(videoId);

    if (!video) {
      throw new NotFoundException(`Video ${videoId} not found`);
    }

    return video;
  }
}
```

**End of Day 4 Checkpoint:**
- ✅ Firestore service implemented
- ✅ Video metadata saving to database
- ✅ Can retrieve video status

---

### Day 5: Job Queue System (BullMQ)

**Goal:** Set up async job queue for video processing

#### Tasks

1. **Install and Start Redis**
```bash
# Using Docker
docker run -d -p 6379:6379 redis:7-alpine

# Or install locally on Mac
brew install redis
brew services start redis
```

2. **Create Queue Module**
```bash
nest g module modules/queue
nest g service modules/queue/queue
```

3. **Configure BullMQ**

File: `src/modules/queue/queue.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QueueService } from './queue.service';
import { VideoProcessor } from './video.processor';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'video-processing',
    }),
  ],
  providers: [QueueService, VideoProcessor],
  exports: [QueueService],
})
export class QueueModule {}
```

4. **Create Queue Service**

File: `src/modules/queue/queue.service.ts`
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, Job } from 'bullmq';

export interface VideoJobData {
  videoId: string;
  fileUrl: string;
  fileName: string;
}

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue('video-processing') private videoQueue: Queue,
  ) {}

  async addVideoProcessingJob(data: VideoJobData): Promise<string> {
    const job = await this.videoQueue.add('process-video', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: false,
      removeOnFail: false,
    });

    this.logger.log(`Job ${job.id} added to queue for video ${data.videoId}`);
    return job.id;
  }

  async getJobStatus(jobId: string): Promise<any> {
    const job = await this.videoQueue.getJob(jobId);

    if (!job) {
      return null;
    }

    return {
      id: job.id,
      status: await job.getState(),
      progress: job.progress,
      data: job.data,
      returnvalue: job.returnvalue,
      failedReason: job.failedReason,
    };
  }
}
```

5. **Create Video Processor (Placeholder)**

File: `src/modules/queue/video.processor.ts`
```typescript
import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { VideoJobData } from './queue.service';

@Processor('video-processing')
export class VideoProcessor {
  private readonly logger = new Logger(VideoProcessor.name);

  @Process('process-video')
  async processVideo(job: Job<VideoJobData>) {
    this.logger.log(`Processing video ${job.data.videoId}`);

    try {
      // Update progress
      await job.updateProgress(10);

      // TODO: Download video (Sprint 2, Day 7)
      // TODO: Extract audio (Sprint 2, Day 6)
      // TODO: Call AI service (Sprint 2, Day 9)

      // Placeholder
      this.logger.log('Video processing logic will go here (Sprint 2)');

      await job.updateProgress(100);

      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to process video: ${error.message}`);
      throw error;
    }
  }
}
```

6. **Update Video Service to Use Queue**

File: `src/modules/video/video.service.ts`
```typescript
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { S3Service } from '../storage/s3.service';
import { FirestoreService } from '../database/firestore.service';
import { QueueService } from '../queue/queue.service';
import { UploadVideoDto } from './dto/upload-video.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);

  constructor(
    private readonly s3Service: S3Service,
    private readonly firestoreService: FirestoreService,
    private readonly queueService: QueueService,
  ) {}

  async uploadVideo(file: Express.Multer.File, dto: UploadVideoDto) {
    const videoId = uuidv4();
    const key = `videos/${videoId}/${dto.fileName}`;

    this.logger.log(`Processing upload for video: ${videoId}`);

    // Upload to S3
    const fileUrl = await this.s3Service.uploadVideo(file, key);

    // Save to Firestore
    await this.firestoreService.createVideo({
      id: videoId,
      userId: dto.userId || null,
      fileName: dto.fileName,
      fileUrl,
      status: 'uploading',
    });

    // Add to job queue
    const jobId = await this.queueService.addVideoProcessingJob({
      videoId,
      fileUrl,
      fileName: dto.fileName,
    });

    // Update with job ID
    await this.firestoreService.updateVideoStatus(videoId, 'processing');

    this.logger.log(`Video ${videoId} queued for processing (job: ${jobId})`);

    return {
      videoId,
      jobId,
      fileName: dto.fileName,
      fileUrl,
      status: 'processing',
    };
  }

  async getVideo(videoId: string) {
    const video = await this.firestoreService.getVideo(videoId);

    if (!video) {
      throw new NotFoundException(`Video ${videoId} not found`);
    }

    return video;
  }
}
```

7. **Add Job Status Endpoint**

File: `src/modules/queue/queue.controller.ts` (create new file)
```typescript
import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { QueueService } from './queue.service';

@Controller('jobs')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Get(':jobId')
  async getJobStatus(@Param('jobId') jobId: string) {
    const status = await this.queueService.getJobStatus(jobId);

    if (!status) {
      throw new NotFoundException(`Job ${jobId} not found`);
    }

    return status;
  }
}
```

**End of Day 5 Checkpoint:**
- ✅ Redis running
- ✅ BullMQ configured
- ✅ Jobs being created and queued
- ✅ Job status endpoint working
- ✅ Sprint 1 COMPLETE

---

## 🚀 SPRINT 2: Audio Processing (Week 2 - Days 6-10)

### Day 6: FFmpeg Audio Extraction Service

**Goal:** Extract audio from video files using FFmpeg

#### Tasks

1. **Create Audio Module**
```bash
nest g module modules/audio
nest g service modules/audio
```

2. **Create Audio Service**

File: `src/modules/audio/audio.service.ts`
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

@Injectable()
export class AudioService {
  private readonly logger = new Logger(AudioService.name);
  private readonly tempDir = '/tmp/soonic';

  async extractAudio(videoPath: string, outputPath: string): Promise<string> {
    // Ensure temp directory exists
    await fs.mkdir(this.tempDir, { recursive: true });

    const ffmpegCommand = [
      'ffmpeg',
      '-i', videoPath,
      '-vn',                    // No video
      '-acodec', 'pcm_s16le',   // 16-bit PCM
      '-ar', '44100',           // 44.1kHz sample rate
      '-ac', '1',               // Mono
      '-y',                     // Overwrite
      outputPath,
    ].join(' ');

    this.logger.log(`Extracting audio: ${ffmpegCommand}`);

    try {
      const { stdout, stderr } = await execAsync(ffmpegCommand);
      this.logger.log(`FFmpeg output: ${stderr}`);

      // Verify file was created
      const stats = await fs.stat(outputPath);
      this.logger.log(`Audio file created: ${outputPath} (${stats.size} bytes)`);

      return outputPath;
    } catch (error) {
      this.logger.error(`FFmpeg error: ${error.message}`);
      throw new Error(`Audio extraction failed: ${error.message}`);
    }
  }

  async cleanupFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
      this.logger.log(`Cleaned up file: ${filePath}`);
    } catch (error) {
      this.logger.warn(`Failed to cleanup file ${filePath}: ${error.message}`);
    }
  }
}
```

3. **Test FFmpeg Service**

Create a simple test script to validate FFmpeg works:

```typescript
// test-ffmpeg.ts
import { AudioService } from './src/modules/audio/audio.service';

const audioService = new AudioService();

async function test() {
  const videoPath = '/path/to/test-video.mp4';
  const audioPath = '/tmp/soonic/test-audio.wav';

  await audioService.extractAudio(videoPath, audioPath);
  console.log('Audio extracted successfully!');

  await audioService.cleanupFile(audioPath);
}

test();
```

**End of Day 6 Checkpoint:**
- ✅ FFmpeg service implemented
- ✅ Audio extraction working
- ✅ Cleanup function working

---

### Day 7: Download Service

**Goal:** Download files from S3 to local filesystem

#### Tasks

1. **Add Download Method to S3 Service**

Update: `src/modules/storage/s3.service.ts`
```typescript
import * as fs from 'fs';
import * as stream from 'stream';
import { promisify } from 'util';

const pipeline = promisify(stream.pipeline);

// Add to S3Service class:

async downloadFile(key: string, destinationPath: string): Promise<string> {
  this.logger.log(`Downloading from S3: ${key}`);

  const command = new GetObjectCommand({
    Bucket: this.videosBucket,
    Key: key,
  });

  const response = await this.s3Client.send(command);

  // Stream to file
  await pipeline(
    response.Body as stream.Readable,
    fs.createWriteStream(destinationPath)
  );

  this.logger.log(`Downloaded to: ${destinationPath}`);
  return destinationPath;
}

async downloadFromUrl(url: string, destinationPath: string): Promise<string> {
  // Extract bucket and key from URL
  const urlParts = new URL(url);
  const key = urlParts.pathname.substring(1); // Remove leading /

  return this.downloadFile(key, destinationPath);
}
```

**End of Day 7 Checkpoint:**
- ✅ S3 download working
- ✅ Can download videos from S3 to local filesystem

---

### Day 8: Complete Video Processor

**Goal:** Implement full video processing pipeline

#### Tasks

1. **Update Video Processor**

File: `src/modules/queue/video.processor.ts`
```typescript
import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { VideoJobData } from './queue.service';
import { S3Service } from '../storage/s3.service';
import { AudioService } from '../audio/audio.service';
import { FirestoreService } from '../database/firestore.service';
import * as path from 'path';
import * as fs from 'fs/promises';

@Processor('video-processing')
export class VideoProcessor {
  private readonly logger = new Logger(VideoProcessor.name);

  constructor(
    private readonly s3Service: S3Service,
    private readonly audioService: AudioService,
    private readonly firestoreService: FirestoreService,
  ) {}

  @Process('process-video')
  async processVideo(job: Job<VideoJobData>) {
    const { videoId, fileUrl, fileName } = job.data;

    this.logger.log(`Processing video ${videoId}`);

    const videoPath = `/tmp/soonic/${videoId}_video${path.extname(fileName)}`;
    const audioPath = `/tmp/soonic/${videoId}_audio.wav`;

    try {
      // Step 1: Update status to processing
      await this.firestoreService.updateVideoStatus(videoId, 'processing');
      await job.updateProgress(10);

      // Step 2: Download video from S3
      this.logger.log(`Downloading video from S3...`);
      await this.s3Service.downloadFromUrl(fileUrl, videoPath);
      await job.updateProgress(30);

      // Step 3: Extract audio
      this.logger.log(`Extracting audio with FFmpeg...`);
      await this.audioService.extractAudio(videoPath, audioPath);
      await job.updateProgress(60);

      // Step 4: Upload audio to S3
      this.logger.log(`Uploading audio to S3...`);
      const audioBuffer = await fs.readFile(audioPath);
      const audioUrl = await this.s3Service.uploadAudio(
        audioBuffer,
        `audio/${videoId}/audio.wav`,
      );
      await job.updateProgress(80);

      // Step 5: Update Firestore with audio URL
      await this.firestoreService.setAudioUrl(videoId, audioUrl);

      // Step 6: TODO - Call AI service (Day 9)
      this.logger.log('AI service call will go here');

      await job.updateProgress(100);

      // Step 7: Cleanup
      await this.audioService.cleanupFile(videoPath);
      await this.audioService.cleanupFile(audioPath);

      this.logger.log(`Video ${videoId} processed successfully`);

      return { success: true, audioUrl };
    } catch (error) {
      this.logger.error(`Failed to process video ${videoId}: ${error.message}`);

      // Update Firestore with error
      await this.firestoreService.setError(videoId, error.message);

      // Cleanup files
      await this.audioService.cleanupFile(videoPath);
      await this.audioService.cleanupFile(audioPath);

      throw error;
    }
  }
}
```

**End of Day 8 Checkpoint:**
- ✅ Complete video → audio pipeline working
- ✅ Progress tracking implemented
- ✅ Error handling in place

---

### Day 9: AI Service Integration

**Goal:** Call Python AI service for chord detection

#### Tasks

1. **Create AI Module**
```bash
nest g module modules/ai
nest g service modules/ai
```

2. **Create AI Service**

File: `src/modules/ai/ai.service.ts`
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface AIAnalysisRequest {
  audio_url: string;
  video_id: string;
}

export interface AIAnalysisResponse {
  video_id: string;
  key: string;
  mode: string;
  tempo: number;
  chords: Array<{
    timestamp: number;
    chord: string;
    notes: string[];
    confidence?: number;
    hand?: 'left' | 'right';
  }>;
  processing_time: number;
}

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private readonly aiServiceUrl: string;
  private readonly timeout: number;

  constructor(private configService: ConfigService) {
    this.aiServiceUrl = this.configService.get('aiService.url');
    this.timeout = this.configService.get('aiService.timeout');
  }

  async analyzeAudio(audioUrl: string, videoId: string): Promise<AIAnalysisResponse> {
    this.logger.log(`Calling AI service for video ${videoId}`);

    const request: AIAnalysisRequest = {
      audio_url: audioUrl,
      video_id: videoId,
    };

    try {
      const response = await axios.post<AIAnalysisResponse>(
        `${this.aiServiceUrl}/api/analyze`,
        request,
        {
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`AI analysis complete for video ${videoId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`AI service call failed: ${error.message}`);

      if (error.response) {
        throw new Error(`AI service error: ${error.response.data?.detail || error.message}`);
      }

      throw new Error(`AI service unavailable: ${error.message}`);
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.aiServiceUrl}/health`, {
        timeout: 5000,
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}
```

3. **Update Video Processor to Call AI Service**

Update: `src/modules/queue/video.processor.ts`
```typescript
import { AIService } from '../ai/ai.service';

// In constructor, inject AIService
constructor(
  private readonly s3Service: S3Service,
  private readonly audioService: AudioService,
  private readonly firestoreService: FirestoreService,
  private readonly aiService: AIService,
) {}

// In processVideo method, after Step 5 (setAudioUrl):

// Step 6: Call AI service for analysis
this.logger.log(`Calling AI service for chord detection...`);
await this.firestoreService.updateVideoStatus(videoId, 'analyzing');

const analysisResult = await this.aiService.analyzeAudio(audioUrl, videoId);
await job.updateProgress(90);

// Step 7: Save analysis result
await this.firestoreService.setAnalysisResult(videoId, analysisResult);
await job.updateProgress(100);
```

**End of Day 9 Checkpoint:**
- ✅ AI service HTTP client implemented
- ✅ Can call AI service from backend
- ✅ Analysis results saved to Firestore

---

### Day 10: Testing & Refinement

**Goal:** Test complete end-to-end flow and fix bugs

#### Tasks

1. **End-to-End Test**
- Upload a video via API
- Monitor job queue
- Check Firestore for status updates
- Verify audio extracted and uploaded
- Verify AI service called
- Verify results saved

2. **Add Comprehensive Logging**
- Log every step of the process
- Add timing information
- Log file sizes
- Log API calls

3. **Write Unit Tests**

File: `src/modules/video/video.service.spec.ts`
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { VideoService } from './video.service';
import { S3Service } from '../storage/s3.service';
import { FirestoreService } from '../database/firestore.service';
import { QueueService } from '../queue/queue.service';

describe('VideoService', () => {
  let service: VideoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideoService,
        {
          provide: S3Service,
          useValue: { uploadVideo: jest.fn() },
        },
        {
          provide: FirestoreService,
          useValue: { createVideo: jest.fn() },
        },
        {
          provide: QueueService,
          useValue: { addVideoProcessingJob: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<VideoService>(VideoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Add more tests...
});
```

4. **Document API Endpoints**

Create `backend/API.md` with complete API documentation

**End of Day 10 Checkpoint:**
- ✅ Complete end-to-end flow tested
- ✅ All tests passing
- ✅ Sprint 2 COMPLETE
- ✅ BACKEND COMPLETE

---

## 📊 Testing Strategy

### Unit Tests
- Test each service in isolation
- Mock dependencies
- Test error scenarios

### Integration Tests
- Test module interactions
- Test database operations
- Test S3 operations

### E2E Tests
- Test complete upload flow
- Test processing pipeline
- Test error handling

---

## 🔍 Monitoring & Logging

### Logging Levels
- **INFO:** Normal operations
- **WARN:** Unusual but handled situations
- **ERROR:** Errors that need attention

### What to Log
- All API requests/responses
- Job queue events
- S3 uploads/downloads
- FFmpeg operations
- AI service calls
- Database operations
- Errors with stack traces

---

## 🚨 Error Handling

### Common Errors

**File Upload Errors:**
- File too large → 400 Bad Request
- Invalid file type → 400 Bad Request
- S3 upload fails → Retry 3 times, then fail

**Processing Errors:**
- FFmpeg fails → Log error, mark video as failed
- AI service timeout → Retry, then fail
- Download fails → Retry 3 times

**Database Errors:**
- Firestore write fails → Retry with backoff
- Document not found → 404 Not Found

---

## 📦 Deployment

### Prerequisites
- AWS EC2 instance (t3.medium or larger)
- Node.js 20+ installed
- Redis installed or AWS ElastiCache
- FFmpeg installed
- Firebase service account JSON

### Deployment Steps
1. Clone repository to EC2
2. Install dependencies: `npm install`
3. Copy environment variables
4. Copy Firebase service account key
5. Build: `npm run build`
6. Start with PM2: `pm2 start dist/main.js`
7. Configure Nginx reverse proxy
8. Set up SSL certificate

---

## ✅ Success Criteria

**Backend is complete when:**
- [ ] Videos upload to S3 successfully
- [ ] Jobs created and processed via queue
- [ ] Audio extracted with FFmpeg
- [ ] AI service called and results saved
- [ ] All data persisted in Firestore
- [ ] Error handling robust
- [ ] Processing success rate > 90%
- [ ] Average processing time < 3 minutes
- [ ] API documentation complete
- [ ] Tests passing

---

**Next Steps After Backend Complete:**
- Build AI Service (Python FastAPI) with correction layer
- Build Frontend (Next.js)
- Add authentication and payments
- Deploy to production

