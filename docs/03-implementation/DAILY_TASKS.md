# Soonic AI - Daily Task Breakdown
## Detailed Day-by-Day Implementation Guide

This document breaks down the first 8 sprints into daily tasks with time estimates and dependencies.

---

# SPRINT 0: Setup & Planning (Week 1)

**🔥 CRITICAL PHILOSOPHY CHANGE:**

**OLD APPROACH (WRONG):**
Day 1: Install everything (Docker, Redis, AWS, etc.)
Day 2: Set up cloud infra
Day 3: Maybe test basic-pitch

**NEW APPROACH (CORRECT):**
Day 1: Install ONLY essentials
Day 2: VALIDATE basic-pitch (CRITICAL GATE 🚨)
Day 3: Build simple pipeline
Days 4-5: Infra (only if validation passed)

**👉 Pipeline FIRST, infra SECOND**

---

## Day 1 (Monday) - Minimal Local Setup
**Goal:** Install ONLY what's needed to test basic-pitch

**⚠️ DO NOT install Docker, AWS, Firebase, Stripe today. Too early.**

### Morning (3 hours)
- [ ] Install Python 3.11+ (30 min)
  ```bash
  # macOS
  brew install python@3.11

  # Verify
  python3 --version  # Should show 3.11+
  ```

- [ ] Install FFmpeg (30 min)
  ```bash
  # macOS
  brew install ffmpeg

  # Linux
  sudo apt-get install ffmpeg

  # Verify
  ffmpeg -version
  ```

- [ ] Install basic-pitch (30 min)
  ```bash
  pip3 install basic-pitch

  # Verify
  basic-pitch --help
  ```

- [ ] Test basic-pitch on ONE SHORT CLIP (1 hour)
  ```bash
  # Download a gospel piano video from YouTube
  # Cut to 30-60 seconds ONLY (faster iteration)
  ffmpeg -i video.mp4 -t 60 -ss 0 short_clip.wav

  # Run basic-pitch
  basic-pitch output/ short_clip.wav

  # Check output folder - you'll see MIDI file
  ```

- [ ] LISTEN to the output (30 min)
  ```bash
  # CRITICAL: Don't just look at MIDI data
  # Load MIDI file into:
  # - GarageBand / Logic / FL Studio
  # - OR online MIDI viewer (https://cifkao.github.io/html-midi-player/)

  # Play it and LISTEN
  # Ask: "Does this sound like the original chord progression?"
  ```

  **⚠️ IMPORTANT EXPECTATIONS:**
  - Output will be MESSY (overlapping notes, noise)
  - NOT clean/perfect MIDI
  - You're checking: "Can I roughly hear the harmonic structure?"
  - Your ears won't lie - numbers might

### Afternoon (3 hours)
- [ ] Set up Git (30 min)
  ```bash
  git config --global user.name "Your Name"
  git config --global user.email "your@email.com"
  ```

- [ ] Create GitHub repository (30 min)
  - Create repo: `SoonicAI`
  - Clone locally
  - Create simple .gitignore

- [ ] Create minimal project structure (30 min)
  ```bash
  mkdir SoonicAI
  cd SoonicAI
  mkdir test-scripts docs
  ```

- [ ] Install VSCode/IDE with Python extension (30 min)

- [ ] Write simple test script (1 hour)
  ```python
  # test-scripts/test_basic_pitch.py
  import basic_pitch
  # Simple script to load audio and run basic-pitch
  ```

**End of Day Checkpoint:**
✅ Python, FFmpeg, basic-pitch installed
✅ Ran basic-pitch on 1 audio file successfully
✅ Git repository created
✅ Ready for validation testing tomorrow

**🚨 If basic-pitch didn't work → debug before Day 2**

---

## Day 2 (Tuesday) - 🔥 VALIDATION DAY (CRITICAL GATE)
**Goal:** Test basic-pitch accuracy on 5 gospel piano videos

**⚠️ THIS IS THE MOST IMPORTANT DAY OF SPRINT 0**
**If validation fails, you STOP the project. No exceptions.**

### Morning (4 hours)
- [ ] Download 5 SHORT gospel piano clips from YouTube (1 hour)
  - Find videos with piano only (no vocals)
  - Different keys, tempos, styles
  - **CRITICAL: Use 30-60 second clips ONLY**
  - Save as: `test1.mp4`, `test2.mp4`, etc.

- [ ] Convert to audio (30 min)
  ```bash
  for i in {1..5}; do
    # Cut to first 60 seconds only
    ffmpeg -i test$i.mp4 -t 60 -ss 0 test$i.wav
  done
  ```

- [ ] Run basic-pitch on all 5 (30 min)
  ```bash
  for i in {1..5}; do
    basic-pitch output/test$i/ test$i.wav
  done
  ```

- [ ] Load MIDI and LISTEN to each output (30 min)
  - Use DAW (GarageBand/Logic) or online MIDI player
  - Play alongside original video
  - Ask: "Does this capture the harmonic progression?"

- [ ] Manually transcribe first 30-60 seconds of EACH video (2 hours)
  - Listen carefully
  - Write down chords you hear
  - Save as: `test1_manual.txt`, etc.
  - Format: `0:00 Cmaj7, 0:04 Gmaj9, ...`

### Afternoon (4 hours)
- [ ] Measure "MUSICAL USEFULNESS" accuracy (3 hours)

  **🎯 CRITICAL: Use This Method (Not Vague Comparison)**

  For each video:

  **Step 1:** Write your expected chords
  ```
  Expected: Dmaj7 → Gmaj9 → Em7 → A13
  ```

  **Step 2:** Extract detected chords from MIDI
  ```
  Detected: Dmaj7 → Gmaj7 → Em7 → A7
  ```

  **Step 3:** Count "musically useful" matches
  ```
  Dmaj7 ✅ (exact match)
  Gmaj9 vs Gmaj7 ✅ (close enough - both G major quality)
  Em7 ✅ (exact match)
  A13 vs A7 ✅ (both A dominant - close enough)

  Score: 4/4 = 100% USABLE
  ```

  **🎯 RULE: We measure MUSICAL USEFULNESS, not exact theory correctness**

  **Count as CORRECT if:**
  - ✅ Exact match (Cmaj7 = Cmaj7)
  - ✅ Same root + quality (Gmaj9 = Gmaj7, both G major)
  - ✅ Same function (A13 = A7, both dominant)

  **Count as WRONG if:**
  - ❌ Different root (C vs G)
  - ❌ Different quality (Cmaj vs Cmin)
  - ❌ Nonsensical (random chord in wrong key)

- [ ] Document results (1 hour)
  ```
  Test 1: 85% musically useful (17/20 chords)
  Test 2: 60% musically useful (12/20 chords)
  Test 3: 75% musically useful (15/20 chords)
  Test 4: 65% musically useful (13/20 chords)
  Test 5: 70% musically useful (14/20 chords)

  AVERAGE: 71% USABLE ✅
  ```

**End of Day Checkpoint:**
✅ Tested basic-pitch on 5 videos
✅ Calculated average accuracy

### 🚨 HARD GATE DECISION:

**If average accuracy ≥ 60%:**
→ ✅ PROCEED to Day 3

**If average accuracy < 60%:**
→ ❌ STOP PROJECT or pivot approach
→ Do NOT continue building

**This gate exists to prevent wasting 3-5 months.**

---

## Day 3 (Wednesday) - Simple Pipeline Test
**Goal:** Build minimal audio → chord JSON script

**⚠️ ONLY do this if Day 2 validation passed (≥60% accuracy)**

### Morning (4 hours)
- [ ] Create simple Python script (2 hours)
  ```python
  # test-scripts/audio_to_chords.py

  import basic_pitch
  import librosa

  def extract_chords(audio_file):
      # 1. Load audio
      y, sr = librosa.load(audio_file)

      # 2. Run basic-pitch
      model_output, midi_data, note_events = basic_pitch.inference.predict(audio_file)

      # 3. Convert notes to rough chords (simple logic)
      chords = convert_notes_to_chords(note_events)

      # 4. Return JSON
      return {
          "key": "C",  # placeholder
          "tempo": 120,  # placeholder
          "chords": chords
      }
  ```

- [ ] Test script on 3 videos (1 hour)
  - Run on test1.wav, test2.wav, test3.wav
  - Verify it produces JSON output
  - Check if output makes some musical sense

- [ ] Document output format (1 hour)
  ```json
  {
    "key": "C major",
    "tempo": 120,
    "chords": [
      {"timestamp": 0.0, "chord": "Cmaj7", "notes": ["C","E","G","B"]},
      {"timestamp": 2.5, "chord": "Gmaj9", "notes": ["G","B","D","F#","A"]}
    ]
  }
  ```

### Afternoon (3 hours)
- [ ] Add basic key detection with librosa (2 hours)
  ```python
  def detect_key(audio_file):
      y, sr = librosa.load(audio_file)
      chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
      # Simple key detection logic
      return "C major"
  ```

- [ ] Test complete pipeline (1 hour)
  - Run: `python audio_to_chords.py test1.wav`
  - Output: JSON file with key, tempo, chords
  - Verify: Output is valid JSON and musically sensible

**End of Day Checkpoint:**
✅ Simple pipeline working locally
✅ Can go from audio → chord JSON
✅ Output format defined
✅ **PROOF OF CONCEPT CONFIRMED**

---

## Day 4 (Thursday) - Minimal Infrastructure (Only If Pipeline Works)
**Goal:** Set up ONLY essential infra

**⚠️ ONLY do this if Days 2-3 validation passed**

### Morning (3 hours)
- [ ] Install Node.js (30 min)
  ```bash
  # macOS
  brew install node@20

  # Verify
  node --version  # Should show v20.x
  ```

- [ ] Create GitHub repository structure (1 hour)
  ```bash
  cd SoonicAI
  mkdir frontend backend audio-service
  git add .
  git commit -m "Initial structure"
  git push
  ```

- [ ] Create Firebase project (1.5 hours)
  - Go to console.firebase.google.com
  - Create project: "Soonic AI"
  - Enable Firestore (test mode)
  - Note project ID
  - **SKIP:** Auth, Storage (do later)

### Afternoon (2 hours)
- [ ] Write SETUP.md (1 hour)
  - Document what you learned
  - Document basic-pitch installation
  - Document test results
  - Document pipeline script

- [ ] Document validation results (1 hour)
  - Create: `docs/VALIDATION_RESULTS.md`
  - Include accuracy numbers
  - Include sample outputs
  - Include decision to proceed

**End of Day Checkpoint:**
✅ Node.js installed
✅ Firebase project created (minimal)
✅ Documentation written
✅ Ready to start Sprint 1

**🚨 DEFER TO LATER SPRINTS:**
- ❌ Docker (not needed yet)
- ❌ Redis (not needed yet)
- ❌ AWS (not needed until Sprint 2)
- ❌ Stripe (not needed until Sprint 13)

---

## Day 5 (Friday) - Review & Plan Next Sprint
**Goal:** Consolidate learnings and plan Sprint 1

### Morning (3 hours)
- [ ] Review all test results (1 hour)
  - Did basic-pitch meet 60% threshold?
  - What chord types work best?
  - What chord types fail?
  - Any patterns in failures?

- [ ] Create simplified chord strategy (1 hour)
  ```
  Based on tests, we will focus on:
  ✅ Major triads (C, F, G)
  ✅ Minor triads (Am, Dm, Em)
  ✅ 7th chords (Cmaj7, G7, Am7)
  ⚠️ 9th chords (if accuracy good)
  ❌ 11th, 13th (defer to Phase 2)
  ```

- [ ] Document "First Working Output" definition (1 hour)
  - Based on test results
  - Set realistic targets
  - Define what "musically sensible" means

### Afternoon (2 hours)
- [ ] Plan Sprint 1 tasks (1 hour)
  - Review IMPLEMENTATION_PLAN.md Sprint 1
  - Adjust based on learnings
  - Create task checklist

- [ ] Sprint 0 retrospective (1 hour)
  - What went well?
  - What was harder than expected?
  - Do we still believe this is achievable?
  - Should we continue? (honest assessment)

**End of Day Checkpoint:**
✅ Validation complete
✅ Decision made (continue or stop)
✅ Sprint 1 planned
✅ Learnings documented

### 🎯 Sprint 0 Success Criteria:

**MUST HAVE:**
- ✅ basic-pitch accuracy ≥ 60%
- ✅ Simple pipeline produces valid JSON
- ✅ Output makes musical sense
- ✅ Clear decision to continue

**If ANY failed → STOP before Sprint 1**

---

**Sprint 0 Complete! 🎉**

**Next:** Only start Sprint 1 if ALL validation gates passed.
  - Install AWS CLI: `brew install awscli` or download
  - Configure: `aws configure` (enter access key)
- [ ] Create S3 bucket (1 hour)
  - Name: `soonic-ai-videos-dev` (must be globally unique)
  - Region: us-east-1 or your preferred region
  - Block public access: OFF (we'll use signed URLs)
  - Enable versioning: NO (optional, saves cost)
  - Set up CORS policy:
    ```json
    [
      {
        "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
        "AllowedMethods": ["GET", "PUT", "POST"],
        "AllowedHeaders": ["*"],
        "MaxAgeSeconds": 3000
      }
    ]
    ```
- [ ] Create Stripe account (1 hour)
  - Sign up at stripe.com
  - Complete business verification (can take days, start early)
  - Get API keys from Dashboard → Developers → API keys
  - Save Publishable key and Secret key (test mode for now)

**End of Day Checkpoint:**
✅ Firebase project configured
✅ AWS account and S3 bucket ready
✅ Stripe account created

---

## Day 3 (Wednesday) - Monitoring & Documentation Setup
**Goal:** Set up monitoring tools and create documentation templates

### Morning (4 hours)
- [ ] Create Sentry account (30 min)
  - Sign up at sentry.io
  - Create new project for "Soonic AI Frontend"
  - Create another project for "Soonic AI Backend"
  - Save DSN keys for both
- [ ] Create UptimeRobot account (30 min)
  - Sign up at uptimerobot.com
  - Note: Will configure monitors after deployment
- [ ] Set up Vercel account (30 min)
  - Sign up at vercel.com with GitHub
  - Connect GitHub account
  - Note: Will deploy frontend later
- [ ] Create environment variable templates (2 hours)

  Create `backend/.env.example`:
  ```
  # Server
  PORT=3001
  NODE_ENV=development

  # Firebase
  FIREBASE_PROJECT_ID=your-project-id
  FIREBASE_PRIVATE_KEY_PATH=/path/to/firebase-admin-key.json

  # AWS S3
  AWS_ACCESS_KEY_ID=your-access-key
  AWS_SECRET_ACCESS_KEY=your-secret-key
  AWS_REGION=us-east-1
  AWS_S3_BUCKET=soonic-ai-videos-dev

  # Redis
  REDIS_HOST=localhost
  REDIS_PORT=6379

  # Stripe
  STRIPE_SECRET_KEY=sk_test_...
  STRIPE_WEBHOOK_SECRET=whsec_...

  # Audio Service
  AUDIO_SERVICE_URL=http://localhost:8000
  ```

  Create `audio-service/.env.example`:
  ```
  # Server
  PORT=8000

  # AWS S3 (for downloading audio)
  AWS_ACCESS_KEY_ID=your-access-key
  AWS_SECRET_ACCESS_KEY=your-secret-key
  AWS_REGION=us-east-1
  ```

  Create `frontend/.env.example`:
  ```
  # API
  NEXT_PUBLIC_API_URL=http://localhost:3001

  # Firebase Client
  NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
  NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
  NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

  # Stripe
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

  # Sentry
  NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
  ```

### Afternoon (4 hours)
- [ ] Create SETUP.md documentation (2 hours)
  ```markdown
  # Soonic AI Development Setup

  ## Prerequisites
  - Node.js 20+
  - Python 3.11+
  - Docker Desktop
  - Redis
  - FFmpeg

  ## Initial Setup
  1. Clone repository
  2. Copy .env.example files
  3. Fill in credentials
  4. Install dependencies
  5. Start services

  ## Backend Setup
  [Detailed steps...]

  ## Frontend Setup
  [Detailed steps...]

  ## Audio Service Setup
  [Detailed steps...]
  ```
- [ ] Create CONTRIBUTING.md (1 hour)
  - Git workflow (branch naming, commit messages)
  - Pull request process
  - Code style guidelines
- [ ] Create basic architecture diagram (1 hour)
  - Use Mermaid syntax in markdown or draw.io
  - Show: Frontend → Backend → Audio Service → S3/Firebase
  - Save as `docs/ARCHITECTURE.md`

**End of Day Checkpoint:**
✅ All monitoring accounts created
✅ Environment templates documented
✅ Setup documentation complete

---

## Day 4 (Thursday) - Docker Compose & Local Development Setup
**Goal:** Create docker-compose for easy local development

### Morning (4 hours)
- [ ] Create docker-compose.yml in root (2 hours)
  ```yaml
  version: '3.8'

  services:
    redis:
      image: redis:7-alpine
      ports:
        - "6379:6379"
      volumes:
        - redis-data:/data

    backend:
      build:
        context: ./backend
        dockerfile: Dockerfile.dev
      ports:
        - "3001:3001"
      environment:
        - NODE_ENV=development
        - REDIS_HOST=redis
        - REDIS_PORT=6379
      env_file:
        - ./backend/.env
      volumes:
        - ./backend:/app
        - /app/node_modules
      depends_on:
        - redis
      command: npm run start:dev

    audio-service:
      build:
        context: ./audio-service
        dockerfile: Dockerfile.dev
      ports:
        - "8000:8000"
      env_file:
        - ./audio-service/.env
      volumes:
        - ./audio-service:/app
      command: uvicorn main:app --host 0.0.0.0 --port 8000 --reload

    frontend:
      build:
        context: ./frontend
        dockerfile: Dockerfile.dev
      ports:
        - "3000:3000"
      environment:
        - NEXT_PUBLIC_API_URL=http://localhost:3001
      env_file:
        - ./frontend/.env.local
      volumes:
        - ./frontend:/app
        - /app/node_modules
        - /app/.next
      command: npm run dev

  volumes:
    redis-data:
  ```

- [ ] Create Dockerfile.dev for each service (2 hours)

  `backend/Dockerfile.dev`:
  ```dockerfile
  FROM node:20-alpine

  WORKDIR /app

  # Install FFmpeg
  RUN apk add --no-cache ffmpeg

  COPY package*.json ./
  RUN npm install

  COPY . .

  EXPOSE 3001

  CMD ["npm", "run", "start:dev"]
  ```

  `audio-service/Dockerfile.dev`:
  ```dockerfile
  FROM python:3.11-slim

  WORKDIR /app

  # Install system dependencies
  RUN apt-get update && apt-get install -y \
      ffmpeg \
      libsndfile1 \
      && rm -rf /var/lib/apt/lists/*

  COPY requirements.txt .
  RUN pip install --no-cache-dir -r requirements.txt

  COPY . .

  EXPOSE 8000

  CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
  ```

  `frontend/Dockerfile.dev`:
  ```dockerfile
  FROM node:20-alpine

  WORKDIR /app

  COPY package*.json ./
  RUN npm install

  COPY . .

  EXPOSE 3000

  CMD ["npm", "run", "dev"]
  ```

### Afternoon (4 hours)
- [ ] Update SETUP.md with Docker instructions (1 hour)
- [ ] Test docker-compose build (1 hour)
  ```bash
  docker-compose build
  ```
- [ ] Fix any build errors (1 hour)
- [ ] Create helper scripts (1 hour)

  `scripts/dev.sh`:
  ```bash
  #!/bin/bash
  echo "Starting Soonic AI development environment..."
  docker-compose up
  ```

  `scripts/reset.sh`:
  ```bash
  #!/bin/bash
  echo "Resetting development environment..."
  docker-compose down -v
  docker-compose build --no-cache
  docker-compose up
  ```

  Make executable: `chmod +x scripts/*.sh`

**End of Day Checkpoint:**
✅ Docker Compose configured
✅ All services can build
✅ Development scripts created

---

## Day 5 (Friday) - Testing & Documentation Review
**Goal:** Verify entire setup works and document any issues

### Morning (4 hours)
- [ ] Test complete setup from scratch (2 hours)
  - Create new directory
  - Clone repository
  - Copy .env.example to .env files
  - Fill in real credentials
  - Run `docker-compose up`
  - Verify all services start
- [ ] Document any issues encountered (1 hour)
  - Add troubleshooting section to SETUP.md
  - Note common errors and solutions
- [ ] Create initial test checklist (1 hour)
  - Save as `docs/TEST_CHECKLIST.md`
  - Will be used throughout development

### Afternoon (4 hours)
- [ ] Review all documentation (1 hour)
  - README.md
  - SETUP.md
  - CONTRIBUTING.md
  - ARCHITECTURE.md
- [ ] Update README with project status (1 hour)
  - Add "Project Status" section
  - Mark Sprint 0 as complete
  - Add links to documentation
- [ ] Create initial project board (1 hour)
  - Will create detailed board in separate file
  - Set up columns: Backlog, To Do, In Progress, Done
- [ ] Sprint 0 retrospective (1 hour)
  - What went well?
  - What was challenging?
  - What to improve for Sprint 1?
  - Document learnings

**End of Day Checkpoint:**
✅ Complete setup verified working
✅ All documentation reviewed and polished
✅ Ready to start Sprint 1 on Monday

**Sprint 0 Complete! 🎉**

---

# SPRINT 1: Backend API Foundation (Week 2)

## Day 6 (Monday) - NestJS Project Initialization
**Goal:** Set up NestJS project with basic structure

### Morning (4 hours)
- [ ] Initialize NestJS project (30 min)
  ```bash
  cd backend
  npm i -g @nestjs/cli
  nest new . --skip-git
  # Choose npm as package manager
  ```
- [ ] Install core dependencies (30 min)
  ```bash
  npm install @nestjs/config
  npm install @nestjs/platform-express
  npm install class-validator class-transformer
  npm install firebase-admin
  npm install bullmq
  npm install ioredis
  npm install @aws-sdk/client-s3
  npm install @aws-sdk/s3-request-presigner
  npm install multer
  npm install @types/multer -D
  ```
- [ ] Set up environment configuration (1 hour)
  - Create `src/config/configuration.ts`
  - Load environment variables
  - Export typed config
- [ ] Configure Firebase Admin SDK (1 hour)
  - Create `src/firebase/firebase.module.ts`
  - Initialize Firebase with service account
  - Export Firebase services (auth, firestore, storage)
- [ ] Set up project structure (1 hour)
  ```
  src/
  ├── config/
  │   └── configuration.ts
  ├── firebase/
  │   ├── firebase.module.ts
  │   └── firebase.service.ts
  ├── video/
  │   ├── video.controller.ts
  │   ├── video.service.ts
  │   ├── video.module.ts
  │   └── dto/
  ├── queue/
  │   ├── queue.module.ts
  │   └── video-processing.consumer.ts
  ├── common/
  │   ├── filters/
  │   └── interceptors/
  ├── app.module.ts
  └── main.ts
  ```

### Afternoon (4 hours)
- [ ] Configure global pipes and filters (1 hour)
  - ValidationPipe for DTO validation
  - HttpExceptionFilter for error handling
  - LoggingInterceptor for request/response logging
- [ ] Set up logging with Winston (1 hour)
  ```bash
  npm install winston nest-winston
  ```
  - Configure logger in main.ts
  - Create logger module
- [ ] Configure CORS (30 min)
  - Allow localhost:3000 in development
  - Configure for production later
- [ ] Create health check endpoint (30 min)
  - GET /health
  - Return status, version, timestamp
- [ ] Test server starts (1 hour)
  ```bash
  npm run start:dev
  ```
  - Visit http://localhost:3001/health
  - Verify logs appear
  - Test hot reload

**End of Day Checkpoint:**
✅ NestJS server running
✅ Firebase configured
✅ Basic structure in place

---

## Day 7 (Tuesday) - Video Upload Endpoint
**Goal:** Implement video upload API

### Morning (4 hours)
- [ ] Create Video DTOs (1 hour)

  `src/video/dto/upload-video.dto.ts`:
  ```typescript
  import { IsString, IsOptional } from 'class-validator';

  export class UploadVideoDto {
    @IsString()
    fileName: string;

    @IsOptional()
    @IsString()
    userId?: string;
  }
  ```

  `src/video/dto/video-response.dto.ts`:
  ```typescript
  export class VideoResponseDto {
    id: string;
    userId: string | null;
    fileName: string;
    fileUrl: string;
    status: 'uploading' | 'processing' | 'completed' | 'failed';
    uploadedAt: Date;
  }
  ```

- [ ] Create Firestore service (1 hour)

  `src/firebase/firestore.service.ts`:
  ```typescript
  @Injectable()
  export class FirestoreService {
    private db: Firestore;

    constructor(private firebaseService: FirebaseService) {
      this.db = getFirestore(this.firebaseService.app);
    }

    async createVideo(data: any) {
      const docRef = await addDoc(collection(this.db, 'videos'), {
        ...data,
        uploadedAt: Timestamp.now(),
      });
      return docRef.id;
    }

    async getVideo(videoId: string) {
      const docRef = doc(this.db, 'videos', videoId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      return { id: docSnap.id, ...docSnap.data() };
    }

    async updateVideo(videoId: string, data: any) {
      const docRef = doc(this.db, 'videos', videoId);
      await updateDoc(docRef, data);
    }
  }
  ```

- [ ] Set up S3 service (1 hour)

  `src/aws/s3.service.ts`:
  ```typescript
  import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
  import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

  @Injectable()
  export class S3Service {
    private s3Client: S3Client;
    private bucket: string;

    constructor(private configService: ConfigService) {
      this.s3Client = new S3Client({
        region: configService.get('AWS_REGION'),
        credentials: {
          accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
          secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
        },
      });
      this.bucket = configService.get('AWS_S3_BUCKET');
    }

    async uploadFile(file: Express.Multer.File, key: string) {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);
      return `https://${this.bucket}.s3.amazonaws.com/${key}`;
    }

    async getSignedDownloadUrl(key: string) {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      return await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
    }
  }
  ```

- [ ] Create upload validation (1 hour)
  - Max file size: 500MB
  - Allowed formats: mp4, mov, avi, mkv
  - Create custom pipe for validation

### Afternoon (4 hours)
- [ ] Implement upload controller (2 hours)

  `src/video/video.controller.ts`:
  ```typescript
  @Controller('api/videos')
  export class VideoController {
    constructor(private videoService: VideoService) {}

    @Post('upload')
    @UseInterceptors(FileInterceptor('video'))
    async uploadVideo(
      @UploadedFile() file: Express.Multer.File,
      @Body() uploadDto: UploadVideoDto,
    ) {
      return await this.videoService.uploadVideo(file, uploadDto);
    }

    @Get(':videoId')
    async getVideo(@Param('videoId') videoId: string) {
      return await this.videoService.getVideo(videoId);
    }
  }
  ```

- [ ] Implement upload service (2 hours)

  `src/video/video.service.ts`:
  ```typescript
  @Injectable()
  export class VideoService {
    constructor(
      private s3Service: S3Service,
      private firestoreService: FirestoreService,
    ) {}

    async uploadVideo(file: Express.Multer.File, dto: UploadVideoDto) {
      // Generate unique key
      const videoId = uuidv4();
      const key = `videos/${videoId}/${dto.fileName}`;

      // Upload to S3
      const fileUrl = await this.s3Service.uploadFile(file, key);

      // Save metadata to Firestore
      await this.firestoreService.createVideo({
        id: videoId,
        userId: dto.userId || null,
        fileName: dto.fileName,
        fileUrl,
        status: 'uploading',
      });

      return { videoId, fileUrl, status: 'uploading' };
    }

    async getVideo(videoId: string) {
      return await this.firestoreService.getVideo(videoId);
    }
  }
  ```

**End of Day Checkpoint:**
✅ Upload endpoint working
✅ Files uploading to S3
✅ Metadata saved to Firestore

---

## Day 8 (Wednesday) - Job Queue Setup
**Goal:** Implement BullMQ job queue system

### Morning (4 hours)
- [ ] Install BullMQ dependencies (30 min)
  ```bash
  npm install bullmq ioredis
  ```
- [ ] Create queue module (1 hour)

  `src/queue/queue.module.ts`:
  ```typescript
  import { Module } from '@nestjs/common';
  import { BullModule } from '@nestjs/bull';
  import { ConfigModule, ConfigService } from '@nestjs/config';

  @Module({
    imports: [
      BullModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          connection: {
            host: configService.get('REDIS_HOST'),
            port: configService.get('REDIS_PORT'),
          },
        }),
        inject: [ConfigService],
      }),
      BullModule.registerQueue({
        name: 'video-processing',
      }),
    ],
  })
  export class QueueModule {}
  ```

- [ ] Create queue service (1.5 hours)

  `src/queue/video-processing.service.ts`:
  ```typescript
  @Injectable()
  export class VideoProcessingService {
    constructor(
      @InjectQueue('video-processing') private videoQueue: Queue,
    ) {}

    async addVideoToQueue(videoId: string, fileUrl: string) {
      await this.videoQueue.add(
        'process-video',
        { videoId, fileUrl },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      );
    }

    async getJobStatus(jobId: string) {
      const job = await this.videoQueue.getJob(jobId);
      if (!job) return null;

      return {
        id: job.id,
        status: await job.getState(),
        progress: job.progress,
        data: job.data,
      };
    }
  }
  ```

- [ ] Create basic worker/consumer (1 hour)

  `src/queue/video-processing.consumer.ts`:
  ```typescript
  @Processor('video-processing')
  export class VideoProcessingConsumer {
    private readonly logger = new Logger(VideoProcessingConsumer.name);

    @Process('process-video')
    async processVideo(job: Job) {
      this.logger.log(`Processing video ${job.data.videoId}`);

      try {
        // Update status to processing
        await job.updateProgress(10);

        // Placeholder: Will implement in Sprint 2
        this.logger.log('Processing logic will go here');

        await job.updateProgress(100);
        return { success: true };
      } catch (error) {
        this.logger.error(`Failed to process video: ${error.message}`);
        throw error;
      }
    }
  }
  ```

### Afternoon (4 hours)
- [ ] Update video service to use queue (1 hour)
  - After upload, add job to queue
  - Return job ID to client
  - Update Firestore with job ID
- [ ] Create job status endpoint (1 hour)
  - GET /api/jobs/:jobId
  - Return job state, progress, data
- [ ] Test queue system (1 hour)
  - Upload video
  - Verify job created in Redis
  - Check worker picks up job
  - Verify progress updates
- [ ] Add queue monitoring (1 hour)
  - Install Bull Board (optional UI)
  ```bash
  npm install @bull-board/express @bull-board/api
  ```
  - Set up dashboard at /admin/queues
  - View jobs in browser

**End of Day Checkpoint:**
✅ Job queue system operational
✅ Jobs being created and processed
✅ Progress tracking working

---

## Day 9 (Thursday) - Database Schema & Error Handling
**Goal:** Finalize Firestore schema and add robust error handling

### Morning (4 hours)
- [ ] Define complete Firestore schema (1 hour)

  Create `src/firebase/schemas.ts`:
  ```typescript
  export interface VideoDocument {
    id: string;
    userId: string | null;
    fileName: string;
    fileUrl: string;
    audioUrl?: string;
    status: 'uploading' | 'processing' | 'audio_extracted' | 'analyzing' | 'completed' | 'failed';
    jobId?: string;
    progress: number;
    uploadedAt: Timestamp;
    processedAt?: Timestamp;
    analysisResult?: AnalysisResult;
    error?: string;
  }

  export interface AnalysisResult {
    key: string;
    tempo: number;
    chords: Chord[];
  }

  export interface Chord {
    timestamp: number;
    chord: string;
    notes: string[];
  }
  ```

- [ ] Extend Firestore service with full CRUD (2 hours)
  - updateVideoStatus(videoId, status)
  - updateVideoProgress(videoId, progress)
  - setAnalysisResult(videoId, result)
  - setVideoError(videoId, error)
  - listUserVideos(userId, limit, offset)
  - deleteVideo(videoId)

- [ ] Create custom exceptions (1 hour)

  `src/common/exceptions/video-not-found.exception.ts`:
  ```typescript
  export class VideoNotFoundException extends NotFoundException {
    constructor(videoId: string) {
      super(`Video with ID ${videoId} not found`);
    }
  }
  ```

  Similar for: InvalidFileException, UploadFailedException, etc.

### Afternoon (4 hours)
- [ ] Implement global exception filter (1 hour)

  `src/common/filters/http-exception.filter.ts`:
  ```typescript
  @Catch()
  export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      const request = ctx.getRequest();

      const status = exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

      const message = exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

      Logger.error(
        `${request.method} ${request.url}`,
        JSON.stringify(exception),
        'ExceptionFilter',
      );

      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message,
      });
    }
  }
  ```

- [ ] Add request logging interceptor (1 hour)
  - Log all incoming requests
  - Log response time
  - Log errors

- [ ] Set up Firestore security rules (1 hour)
  - Users can only read/write their own videos
  - Authenticated access only (except initial upload)

  In Firebase Console → Firestore → Rules:
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /videos/{videoId} {
        allow read: if request.auth != null && resource.data.userId == request.auth.uid;
        allow create: if true; // Allow anonymous uploads
        allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
      }

      match /users/{userId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
  ```

- [ ] Write unit tests (1 hour)
  - Test VideoService.uploadVideo
  - Test error handling
  - Test validation

**End of Day Checkpoint:**
✅ Complete Firestore schema implemented
✅ Error handling robust
✅ Security rules in place

---

## Day 10 (Friday) - Testing & Sprint Review
**Goal:** Integration testing and Sprint 1 wrap-up

### Morning (4 hours)
- [ ] End-to-end testing (2 hours)
  - Test full upload flow:
    1. Upload video via API
    2. Verify S3 upload
    3. Verify Firestore record
    4. Verify job queued
    5. Verify worker processes job
  - Test with different file sizes
  - Test with different formats
  - Test error scenarios
- [ ] Performance testing (1 hour)
  - Test upload of 100MB file
  - Test upload of 500MB file
  - Measure response times
- [ ] Fix bugs found (1 hour)

### Afternoon (4 hours)
- [ ] Write API documentation (2 hours)
  - Document all endpoints
  - Add request/response examples
  - Use Swagger/OpenAPI if time permits
  ```bash
  npm install @nestjs/swagger swagger-ui-express
  ```
- [ ] Update SETUP.md with backend instructions (1 hour)
- [ ] Sprint 1 retrospective (1 hour)
  - What went well?
  - What was challenging?
  - Update project board
  - Plan for Sprint 2

**End of Day Checkpoint:**
✅ Backend API fully functional
✅ Upload and job queue working end-to-end
✅ Tests passing
✅ Documentation complete

**Sprint 1 Complete! 🎉**

---

# SPRINT 2: Audio Extraction & FFmpeg Integration (Week 3)

## Day 11 (Monday) - FFmpeg Service Setup
**Goal:** Create audio extraction service using FFmpeg

### Morning (4 hours)
- [ ] Install FFmpeg in backend (already done, verify)
  - Test: `ffmpeg -version` in Docker container
- [ ] Create AudioService (2 hours)

  `src/audio/audio.service.ts`:
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

    async extractAudio(
      videoPath: string,
      outputPath: string,
    ): Promise<string> {
      // Ensure temp directory exists
      await fs.mkdir(this.tempDir, { recursive: true });

      const ffmpegCommand = [
        'ffmpeg',
        '-i', videoPath,
        '-vn', // No video
        '-acodec', 'pcm_s16le', // 16-bit PCM
        '-ar', '44100', // 44.1kHz sample rate
        '-ac', '1', // Mono
        outputPath,
      ].join(' ');

      this.logger.log(`Extracting audio: ${ffmpegCommand}`);

      try {
        const { stdout, stderr } = await execAsync(ffmpegCommand);
        this.logger.log(`FFmpeg output: ${stderr}`);
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

- [ ] Test audio extraction locally (1 hour)
  - Download sample video
  - Extract audio
  - Verify output format
  - Check file size
- [ ] Handle FFmpeg errors (1 hour)
  - Corrupted video
  - Missing audio track
  - Unsupported codec

### Afternoon (4 hours)
- [ ] Create download helper (1 hour)

  `src/audio/download.service.ts`:
  ```typescript
  @Injectable()
  export class DownloadService {
    async downloadFile(url: string, destination: string): Promise<string> {
      const writer = fs.createWriteStream(destination);
      const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
      });

      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(destination));
        writer.on('error', reject);
      });
    }
  }
  ```

- [ ] Integrate S3 upload for audio files (1 hour)
  - After extraction, upload audio to S3
  - Store in `audio/{videoId}/audio.wav`
  - Return audio URL
- [ ] Update Firestore with audio URL (30 min)
  - Add audioUrl field to video document
- [ ] Test complete flow (1.5 hours)
  - Download video from S3
  - Extract audio
  - Upload audio to S3
  - Update Firestore

**End of Day Checkpoint:**
✅ Audio extraction working
✅ Audio files uploaded to S3
✅ Integration tested

---

## Day 12 (Tuesday) - Job Worker Implementation
**Goal:** Update job worker to handle audio extraction

### Morning (4 hours)
- [ ] Update video processing consumer (3 hours)

  `src/queue/video-processing.consumer.ts`:
  ```typescript
  @Processor('video-processing')
  export class VideoProcessingConsumer {
    constructor(
      private audioService: AudioService,
      private downloadService: DownloadService,
      private s3Service: S3Service,
      private firestoreService: FirestoreService,
    ) {}

    @Process('process-video')
    async processVideo(job: Job) {
      const { videoId, fileUrl } = job.data;

      try {
        // Step 1: Update status
        await this.firestoreService.updateVideoStatus(videoId, 'processing');
        await job.updateProgress(10);

        // Step 2: Download video
        const videoPath = `/tmp/soonic/${videoId}.mp4`;
        await this.downloadService.downloadFile(fileUrl, videoPath);
        await job.updateProgress(30);

        // Step 3: Extract audio
        const audioPath = `/tmp/soonic/${videoId}.wav`;
        await this.audioService.extractAudio(videoPath, audioPath);
        await job.updateProgress(60);

        // Step 4: Upload audio to S3
        const audioBuffer = await fs.readFile(audioPath);
        const audioUrl = await this.s3Service.uploadBuffer(
          audioBuffer,
          `audio/${videoId}/audio.wav`,
          'audio/wav',
        );
        await job.updateProgress(80);

        // Step 5: Update Firestore
        await this.firestoreService.updateVideo(videoId, {
          audioUrl,
          status: 'audio_extracted',
        });
        await job.updateProgress(100);

        // Step 6: Cleanup
        await this.audioService.cleanupFile(videoPath);
        await this.audioService.cleanupFile(audioPath);

        return { success: true, audioUrl };
      } catch (error) {
        await this.firestoreService.updateVideo(videoId, {
          status: 'failed',
          error: error.message,
        });
        throw error;
      }
    }
  }
  ```

- [ ] Add retry logic (1 hour)
  - Configure Bull to retry failed jobs 3 times
  - Exponential backoff
  - Log retry attempts

### Afternoon (4 hours)
- [ ] Add progress tracking (2 hours)
  - Update Firestore progress field at each step
  - Emit events for real-time updates (optional)
  - Add detailed status messages
- [ ] Test with real videos (2 hours)
  - Test with 1-minute video
  - Test with 5-minute video
  - Test with 15-minute video
  - Measure processing times
  - Verify audio quality

**End of Day Checkpoint:**
✅ Worker processes videos completely
✅ Audio extracted and uploaded
✅ Progress updates working

---

## Day 13 (Wednesday) - Error Handling & Edge Cases
**Goal:** Handle all error scenarios gracefully

### Morning (4 hours)
- [ ] Handle corrupted video files (1 hour)
  - Detect when FFmpeg fails
  - Return user-friendly error
  - Mark video as failed
- [ ] Handle missing audio track (1 hour)
  - Some videos might have no audio
  - Detect and report to user
- [ ] Handle unsupported formats (1 hour)
  - Test with various formats: avi, mkv, flv, webm
  - Document supported formats
  - Validate format before processing
- [ ] Handle timeout scenarios (1 hour)
  - Set max processing time (10 minutes)
  - Cancel job if timeout exceeded
  - Clean up resources

### Afternoon (4 hours)
- [ ] Add file size optimizations (2 hours)
  - Compress audio if too large
  - Set max audio file size
  - Consider downsampling for very long videos
- [ ] Test error scenarios (2 hours)
  - Upload corrupted file
  - Upload video with no audio
  - Upload extremely long video
  - Verify all errors handled gracefully

**End of Day Checkpoint:**
✅ All edge cases handled
✅ Error messages user-friendly
✅ No crashes on invalid input

---

## Day 14 (Thursday) - Testing & Optimization
**Goal:** Optimize performance and test thoroughly

### Morning (4 hours)
- [ ] Performance optimization (2 hours)
  - Measure processing time for various video lengths
  - Identify bottlenecks (download, extraction, upload)
  - Optimize FFmpeg parameters
  - Consider parallel processing if possible
- [ ] Memory optimization (1 hour)
  - Ensure files cleaned up after processing
  - Monitor memory usage
  - Fix memory leaks if any
- [ ] Logging improvements (1 hour)
  - Add detailed logs for debugging
  - Log processing times at each step
  - Add metrics collection

### Afternoon (4 hours)
- [ ] Integration testing (3 hours)
  - Test with 10 different videos
  - Verify all complete successfully
  - Check processing times < 3 minutes for 5-min videos
  - Verify audio quality
- [ ] Fix bugs found (1 hour)

**End of Day Checkpoint:**
✅ Performance optimized
✅ Processing time acceptable
✅ All tests passing

---

## Day 15 (Friday) - Documentation & Sprint Review
**Goal:** Document everything and prepare for Sprint 3

### Morning (4 hours)
- [ ] Update API documentation (1 hour)
  - Document new status values
  - Document error responses
  - Add processing time estimates
- [ ] Create troubleshooting guide (1 hour)
  - Common FFmpeg errors
  - Solutions for each error type
- [ ] Write deployment notes (1 hour)
  - FFmpeg must be installed on server
  - Temp directory requirements
  - Resource requirements (CPU, memory, disk)
- [ ] Update SETUP.md (1 hour)

### Afternoon (4 hours)
- [ ] End-to-end testing (2 hours)
  - Upload video → Extract audio → Verify result
  - Test full flow multiple times
  - Verify everything works
- [ ] Sprint 2 retrospective (1 hour)
- [ ] Prepare for Sprint 3 (1 hour)
  - Review Sprint 3 goals
  - Set up Python environment
  - Research audio ML libraries

**End of Day Checkpoint:**
✅ Audio extraction pipeline complete
✅ Documentation up to date
✅ Ready for AI service development

**Sprint 2 Complete! 🎉**

---

# SPRINT 3: Audio AI Service - Setup (Week 4)

## Day 16 (Monday) - Python Project Setup
**Goal:** Initialize FastAPI project and set up structure

### Morning (4 hours)
- [ ] Create Python virtual environment (30 min)
  ```bash
  cd audio-service
  python3 -m venv venv
  source venv/bin/activate  # or venv\Scripts\activate on Windows
  ```
- [ ] Create requirements.txt (1 hour)
  ```
  fastapi==0.104.1
  uvicorn[standard]==0.24.0
  pydantic==2.5.0
  python-multipart==0.0.6

  # Audio processing
  librosa==0.10.1
  soundfile==0.12.1
  numpy==1.24.3
  scipy==1.11.4

  # ML models
  basic-pitch==0.2.5
  essentia-tensorflow==2.1b6.dev1110

  # HTTP client
  httpx==0.25.1

  # AWS
  boto3==1.29.7

  # Environment
  python-dotenv==1.0.0
  ```
- [ ] Install dependencies (1 hour)
  ```bash
  pip install -r requirements.txt
  ```
  Note: This may take a while due to ML libraries
- [ ] Create project structure (1.5 hours)
  ```
  audio-service/
  ├── main.py
  ├── config.py
  ├── routers/
  │   └── analysis.py
  ├── services/
  │   ├── audio_loader.py
  │   ├── pitch_detector.py
  │   ├── chord_detector.py
  │   └── key_detector.py
  ├── models/
  │   └── schemas.py
  ├── utils/
  │   └── helpers.py
  ├── tests/
  │   └── test_analysis.py
  ├── requirements.txt
  ├── .env.example
  └── Dockerfile
  ```

### Afternoon (4 hours)
- [ ] Set up FastAPI app (2 hours)

  `main.py`:
  ```python
  from fastapi import FastAPI
  from fastapi.middleware.cors import CORSMiddleware
  from routers import analysis
  import uvicorn

  app = FastAPI(
      title="Soonic AI Audio Analysis Service",
      version="1.0.0",
      description="AI-powered audio analysis for piano performances"
  )

  # CORS
  app.add_middleware(
      CORSMiddleware,
      allow_origins=["*"],  # Configure properly for production
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
  )

  # Routers
  app.include_router(analysis.router, prefix="/api", tags=["analysis"])

  @app.get("/health")
  async def health_check():
      return {
          "status": "healthy",
          "service": "audio-analysis",
          "version": "1.0.0"
      }

  if __name__ == "__main__":
      uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
  ```

- [ ] Create Pydantic models (1 hour)

  `models/schemas.py`:
  ```python
  from pydantic import BaseModel, HttpUrl
  from typing import List, Optional

  class AnalyzeRequest(BaseModel):
      audio_url: HttpUrl
      video_id: str

  class Chord(BaseModel):
      timestamp: float
      chord: str
      notes: List[str]
      confidence: Optional[float] = None

  class AnalysisResult(BaseModel):
      video_id: str
      key: str
      mode: str
      tempo: float
      chords: List[Chord]
      processing_time: float
  ```

- [ ] Create analysis router skeleton (1 hour)

  `routers/analysis.py`:
  ```python
  from fastapi import APIRouter, HTTPException
  from models.schemas import AnalyzeRequest, AnalysisResult
  import time

  router = APIRouter()

  @router.post("/analyze", response_model=AnalysisResult)
  async def analyze_audio(request: AnalyzeRequest):
      start_time = time.time()

      try:
          # Placeholder - will implement in next days
          result = {
              "video_id": request.video_id,
              "key": "C",
              "mode": "major",
              "tempo": 120.0,
              "chords": [],
              "processing_time": time.time() - start_time
          }

          return result
      except Exception as e:
          raise HTTPException(status_code=500, detail=str(e))
  ```

**End of Day Checkpoint:**
✅ FastAPI app running
✅ /health endpoint working
✅ /api/analyze endpoint created (placeholder)

---

## Day 17 (Tuesday) - Audio Loader Service
**Goal:** Download and load audio files from URLs

### Morning (4 hours)
- [ ] Create audio loader service (2 hours)

  `services/audio_loader.py`:
  ```python
  import httpx
  import librosa
  import soundfile as sf
  import numpy as np
  from pathlib import Path
  import tempfile
  import logging

  logger = logging.getLogger(__name__)

  class AudioLoader:
      def __init__(self):
          self.temp_dir = Path(tempfile.gettempdir()) / "soonic"
          self.temp_dir.mkdir(exist_ok=True)

      async def download_audio(self, url: str) -> Path:
          """Download audio file from URL"""
          file_path = self.temp_dir / f"{hash(url)}.wav"

          async with httpx.AsyncClient(timeout=300.0) as client:
              response = await client.get(url)
              response.raise_for_status()

              with open(file_path, 'wb') as f:
                  f.write(response.content)

          logger.info(f"Downloaded audio to {file_path}")
          return file_path

      def load_audio(self, file_path: Path, sr: int = 44100) -> tuple:
          """Load audio file with librosa"""
          try:
              y, sr = librosa.load(file_path, sr=sr, mono=True)
              logger.info(f"Loaded audio: {len(y)} samples at {sr}Hz")
              return y, sr
          except Exception as e:
              logger.error(f"Failed to load audio: {e}")
              raise

      def cleanup(self, file_path: Path):
          """Delete temporary file"""
          try:
              file_path.unlink()
              logger.info(f"Cleaned up {file_path}")
          except Exception as e:
              logger.warning(f"Failed to cleanup {file_path}: {e}")
  ```

- [ ] Test audio loading (1 hour)
  - Download sample audio file
  - Load with librosa
  - Verify sample rate
  - Check array shape
- [ ] Add error handling (1 hour)
  - Handle download failures
  - Handle corrupt audio files
  - Handle unsupported formats

### Afternoon (4 hours)
- [ ] Add audio preprocessing (2 hours)

  Update `audio_loader.py`:
  ```python
  def preprocess_audio(self, y: np.ndarray, sr: int) -> np.ndarray:
      """Normalize and prepare audio for analysis"""
      # Normalize to [-1, 1]
      y = librosa.util.normalize(y)

      # Remove silence at start and end
      y, _ = librosa.effects.trim(y, top_db=20)

      return y
  ```

- [ ] Integrate into analysis router (1 hour)

  Update `routers/analysis.py`:
  ```python
  from services.audio_loader import AudioLoader

  audio_loader = AudioLoader()

  @router.post("/analyze")
  async def analyze_audio(request: AnalyzeRequest):
      # Download and load audio
      audio_path = await audio_loader.download_audio(str(request.audio_url))
      y, sr = audio_loader.load_audio(audio_path)
      y = audio_loader.preprocess_audio(y, sr)

      # ... rest of analysis

      # Cleanup
      audio_loader.cleanup(audio_path)
  ```

- [ ] Test end-to-end (1 hour)
  - Call /api/analyze with real audio URL
  - Verify download works
  - Verify loading works
  - Check logs

**End of Day Checkpoint:**
✅ Audio downloading working
✅ Audio loading with librosa working
✅ Preprocessing implemented

---

## Day 18 (Wednesday) - API Testing & Validation
**Goal:** Test API thoroughly and add validation

### Morning (4 hours)
- [ ] Add request validation (1 hour)
  - Validate URL format
  - Check file size before download (if possible)
  - Validate video_id format
- [ ] Add response validation (1 hour)
  - Ensure all required fields present
  - Validate data types
  - Add confidence scores
- [ ] Create test suite (2 hours)

  `tests/test_analysis.py`:
  ```python
  import pytest
  from fastapi.testclient import TestClient
  from main import app

  client = TestClient(app)

  def test_health_check():
      response = client.get("/health")
      assert response.status_code == 200
      assert response.json()["status"] == "healthy"

  def test_analyze_endpoint():
      payload = {
          "audio_url": "https://example.com/audio.wav",
          "video_id": "test-123"
      }
      response = client.post("/api/analyze", json=payload)
      assert response.status_code == 200
      assert "key" in response.json()
      assert "tempo" in response.json()
  ```

### Afternoon (4 hours)
- [ ] Add logging throughout (2 hours)
  - Configure Python logging
  - Log all API requests
  - Log processing steps
  - Log errors with stack traces
- [ ] Add metrics collection (1 hour)
  - Track processing time
  - Track success/failure rate
  - Track audio file sizes
- [ ] Test with various audio files (1 hour)
  - Different lengths (30s, 5min, 15min)
  - Different formats (wav, mp3)
  - Different sample rates

**End of Day Checkpoint:**
✅ Validation working
✅ Tests passing
✅ Logging comprehensive

---

## Day 19 (Thursday) - Docker & Integration
**Goal:** Containerize service and integrate with backend

### Morning (4 hours)
- [ ] Create Dockerfile (2 hours)

  `Dockerfile`:
  ```dockerfile
  FROM python:3.11-slim

  WORKDIR /app

  # Install system dependencies
  RUN apt-get update && apt-get install -y \
      ffmpeg \
      libsndfile1 \
      gcc \
      g++ \
      && rm -rf /var/lib/apt/lists/*

  # Copy requirements
  COPY requirements.txt .

  # Install Python dependencies
  RUN pip install --no-cache-dir -r requirements.txt

  # Copy application
  COPY . .

  # Expose port
  EXPOSE 8000

  # Run application
  CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
  ```

- [ ] Test Docker build (1 hour)
  ```bash
  docker build -t soonic-audio-service .
  docker run -p 8000:8000 soonic-audio-service
  ```
- [ ] Update docker-compose.yml (1 hour)
  - Ensure audio-service included
  - Set environment variables
  - Configure networking

### Afternoon (4 hours)
- [ ] Test backend → audio service communication (2 hours)
  - Backend calls audio service /api/analyze
  - Audio service processes and returns result
  - Verify data flow
- [ ] Add health check to backend (1 hour)
  - Backend checks if audio service is running
  - Return status in backend health endpoint
- [ ] End-to-end test (1 hour)
  - Upload video to backend
  - Backend extracts audio
  - Backend calls audio service
  - Verify flow works

**End of Day Checkpoint:**
✅ Audio service containerized
✅ Backend integration working
✅ Ready for AI implementation

---

## Day 20 (Friday) - Sprint Review & Prep
**Goal:** Review Sprint 3 progress and prepare for Sprint 4

### Morning (4 hours)
- [ ] Code review (2 hours)
  - Review all code written this sprint
  - Refactor if needed
  - Ensure code quality
- [ ] Documentation (2 hours)
  - Document all API endpoints
  - Add code comments
  - Update README

### Afternoon (4 hours)
- [ ] Performance testing (2 hours)
  - Test with various audio lengths
  - Measure response times
  - Identify bottlenecks
- [ ] Sprint 3 retrospective (1 hour)
- [ ] Research for Sprint 4 (1 hour)
  - Research Basic Pitch model
  - Research chord detection algorithms
  - Review music theory for chord recognition

**End of Day Checkpoint:**
✅ Audio service foundation complete
✅ Ready for AI model integration
✅ Documentation complete

**Sprint 3 Complete! 🎉**

---

# SPRINT 4: Audio AI Service - Core Analysis (Week 5)

## Day 21 (Monday) - Pitch Detection Setup
**Goal:** Implement pitch detection using Basic Pitch

### Morning (4 hours)
- [ ] Research Basic Pitch (1 hour)
  - Review documentation
  - Understand model outputs
  - Test with sample audio
- [ ] Create pitch detector service (3 hours)

  `services/pitch_detector.py`:
  ```python
  import numpy as np
  from basic_pitch.inference import predict
  from basic_pitch import ICASSP_2022_MODEL_PATH
  import logging

  logger = logging.getLogger(__name__)

  class PitchDetector:
      def __init__(self):
          self.model_path = ICASSP_2022_MODEL_PATH

      def detect_pitches(self, audio_path: str) -> dict:
          """
          Detect pitches from audio file
          Returns: dict with 'midi', 'notes', 'contours'
          """
          logger.info("Starting pitch detection...")

          model_output, midi_data, note_events = predict(
              audio_path,
              self.model_path
          )

          logger.info(f"Detected {len(note_events)} note events")

          return {
              'model_output': model_output,
              'midi_data': midi_data,
              'note_events': note_events
          }

      def note_events_to_list(self, note_events) -> list:
          """
          Convert note events to simple list format
          Returns: [{time: float, pitch: int, duration: float, velocity: float}]
          """
          notes = []
          for interval, pitch, velocity in note_events:
              notes.append({
                  'time': float(interval[0]),
                  'end_time': float(interval[1]),
                  'duration': float(interval[1] - interval[0]),
                  'pitch': int(pitch),
                  'velocity': float(velocity)
              })

          return sorted(notes, key=lambda x: x['time'])

      def midi_to_note_name(self, midi_pitch: int) -> str:
          """Convert MIDI pitch to note name (e.g., 60 -> C4)"""
          notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
          octave = (midi_pitch // 12) - 1
          note = notes[midi_pitch % 12]
          return f"{note}{octave}"
  ```

### Afternoon (4 hours)
- [ ] Test pitch detection (2 hours)
  - Test with simple piano recording (single notes)
  - Test with chord progression
  - Verify accuracy
  - Check MIDI output
- [ ] Optimize for piano (1 hour)
  - Tune parameters for piano frequency range
  - Filter out noise
- [ ] Add error handling (1 hour)

**End of Day Checkpoint:**
✅ Pitch detection working
✅ MIDI notes extracted
✅ Note names generated

---

## Day 22 (Tuesday) - Chord Detection Algorithm
**Goal:** Build chord detection from pitch data

### Morning (4 hours)
- [ ] Research chord detection algorithms (1 hour)
- [ ] Create chord detector service (3 hours)

  `services/chord_detector.py`:
  ```python
  import numpy as np
  from collections import Counter
  from typing import List, Dict
  import logging

  logger = logging.getLogger(__name__)

  class ChordDetector:
      def __init__(self):
          self.chord_templates = self._init_chord_templates()

      def _init_chord_templates(self) -> dict:
          """Define chord templates based on intervals"""
          return {
              'maj': [0, 4, 7],
              'min': [0, 3, 7],
              'dim': [0, 3, 6],
              'aug': [0, 4, 8],
              'maj7': [0, 4, 7, 11],
              'min7': [0, 3, 7, 10],
              '7': [0, 4, 7, 10],  # dominant 7th
              'maj9': [0, 4, 7, 11, 14],
              'min9': [0, 3, 7, 10, 14],
              '9': [0, 4, 7, 10, 14],
              'maj11': [0, 4, 7, 11, 14, 17],
              '13': [0, 4, 7, 10, 14, 21],
          }

      def group_notes_into_chords(self, notes: List[dict], frame_size: float = 0.5) -> List[dict]:
          """
          Group simultaneous/overlapping notes into chord frames
          frame_size: time window in seconds
          """
          if not notes:
              return []

          chords = []
          max_time = max(note['end_time'] for note in notes)
          current_time = 0

          while current_time < max_time:
              frame_end = current_time + frame_size

              # Find all notes active in this frame
              active_notes = [
                  note for note in notes
                  if note['time'] <= frame_end and note['end_time'] >= current_time
              ]

              if active_notes:
                  chord = self.identify_chord(active_notes)
                  chord['timestamp'] = current_time
                  chords.append(chord)

              current_time += frame_size

          return chords

      def identify_chord(self, notes: List[dict]) -> dict:
          """Identify chord from a group of notes"""
          if not notes:
              return {'chord': 'N', 'notes': [], 'pitches': []}

          # Get unique pitches (mod 12 for pitch class)
          pitches = [note['pitch'] for note in notes]
          pitch_classes = list(set([p % 12 for p in pitches]))

          # Try to find matching chord
          best_match = self._find_best_chord_match(pitch_classes)

          # Convert MIDI to note names
          note_names = [self.midi_to_note_name(p) for p in pitches]

          return {
              'chord': best_match['name'],
              'notes': list(set(note_names)),
              'pitches': pitches,
              'confidence': best_match['confidence']
          }

      def _find_best_chord_match(self, pitch_classes: List[int]) -> dict:
          """Find best matching chord template"""
          if len(pitch_classes) < 2:
              return {'name': 'N', 'confidence': 0.0}

          best_match = None
          best_score = 0

          # Try each pitch class as potential root
          for root in pitch_classes:
              # Normalize to root
              intervals = sorted([(pc - root) % 12 for pc in pitch_classes])

              # Compare with templates
              for quality, template in self.chord_templates.items():
                  score = self._match_score(intervals, template)

                  if score > best_score:
                      best_score = score
                      root_name = self._pitch_class_to_name(root)
                      best_match = {
                          'name': f"{root_name}{quality}",
                          'confidence': score
                      }

          return best_match or {'name': 'Unknown', 'confidence': 0.0}

      def _match_score(self, intervals: List[int], template: List[int]) -> float:
          """Calculate how well intervals match template"""
          matches = sum(1 for i in intervals if i in template)
          total = max(len(intervals), len(template))
          return matches / total if total > 0 else 0.0

      def _pitch_class_to_name(self, pitch_class: int) -> str:
          """Convert pitch class (0-11) to note name"""
          notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
          return notes[pitch_class]

      @staticmethod
      def midi_to_note_name(midi_pitch: int) -> str:
          notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
          octave = (midi_pitch // 12) - 1
          note = notes[midi_pitch % 12]
          return f"{note}{octave}"
  ```

### Afternoon (4 hours)
- [ ] Test chord detection (3 hours)
  - Test with simple triads (C, F, G)
  - Test with 7th chords
  - Test with extended chords (9th, 11th)
  - Compare results with expected
- [ ] Debug and improve accuracy (1 hour)

**End of Day Checkpoint:**
✅ Chord detection working
✅ Basic chords identified correctly
✅ Extended chords partially working

---

## Day 23 (Wednesday) - Key & Tempo Detection
**Goal:** Implement key detection and tempo detection

### Morning (4 hours)
- [ ] Create key detector service (2 hours)

  `services/key_detector.py`:
  ```python
  import librosa
  import numpy as np
  import logging

  logger = logging.getLogger(__name__)

  class KeyDetector:
      def __init__(self):
          self.keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

      def detect_key(self, y: np.ndarray, sr: int) -> dict:
          """
          Detect musical key using chromagram analysis
          Returns: {'key': str, 'mode': str, 'confidence': float}
          """
          logger.info("Detecting key...")

          # Compute chroma features
          chroma = librosa.feature.chroma_cqt(y=y, sr=sr)

          # Average over time to get key profile
          chroma_mean = np.mean(chroma, axis=1)

          # Normalize
          chroma_mean = chroma_mean / np.max(chroma_mean)

          # Find dominant pitch class
          dominant_pitch_class = np.argmax(chroma_mean)
          key = self.keys[dominant_pitch_class]

          # Determine mode (major vs minor)
          mode = self._determine_mode(chroma_mean, dominant_pitch_class)

          # Calculate confidence
          confidence = float(chroma_mean[dominant_pitch_class])

          logger.info(f"Detected key: {key} {mode} (confidence: {confidence:.2f})")

          return {
              'key': key,
              'mode': mode,
              'confidence': confidence
          }

      def _determine_mode(self, chroma: np.ndarray, root: int) -> str:
          """Determine if mode is major or minor"""
          # Check third interval
          major_third = (root + 4) % 12
          minor_third = (root + 3) % 12

          if chroma[major_third] > chroma[minor_third]:
              return 'major'
          else:
              return 'minor'
  ```

- [ ] Create tempo detector (2 hours)

  `services/tempo_detector.py`:
  ```python
  import librosa
  import numpy as np
  import logging

  logger = logging.getLogger(__name__)

  class TempoDetector:
      def detect_tempo(self, y: np.ndarray, sr: int) -> dict:
          """
          Detect tempo (BPM) using librosa
          Returns: {'tempo': float, 'confidence': float}
          """
          logger.info("Detecting tempo...")

          tempo, beats = librosa.beat.beat_track(y=y, sr=sr)

          # Get tempo as float
          tempo_value = float(tempo)

          # Calculate confidence based on beat strength
          onset_env = librosa.onset.onset_strength(y=y, sr=sr)
          confidence = float(np.mean(onset_env))

          logger.info(f"Detected tempo: {tempo_value} BPM (confidence: {confidence:.2f})")

          return {
              'tempo': tempo_value,
              'confidence': confidence
          }
  ```

### Afternoon (4 hours)
- [ ] Test key detection (2 hours)
  - Test with C major piece
  - Test with A minor piece
  - Test with other keys
  - Verify accuracy
- [ ] Test tempo detection (1 hour)
  - Test with different tempos (60, 120, 180 BPM)
  - Verify accuracy
- [ ] Handle edge cases (1 hour)
  - Very slow tempo
  - Very fast tempo
  - Ambiguous key

**End of Day Checkpoint:**
✅ Key detection working
✅ Tempo detection working
✅ Basic accuracy validated

---

## Day 24 (Thursday) - Harmonic Correction & Integration
**Goal:** Add music intelligence layer and integrate all services

### Morning (4 hours)
- [ ] Create harmonic corrector (2 hours)

  `services/harmonic_corrector.py`:
  ```python
  from typing import List, Dict
  import logging

  logger = logging.getLogger(__name__)

  class HarmonicCorrector:
      def __init__(self, key: str, mode: str):
          self.key = key
          self.mode = mode
          self.scale = self._get_scale_degrees()

      def _get_scale_degrees(self) -> List[str]:
          """Get diatonic chords for the key"""
          # Simplified - would need full implementation
          # For now, return common chords
          if self.mode == 'major':
              return [f"{self.key}maj7", f"{self.key}min7", f"{self.key}maj9"]
          else:
              return [f"{self.key}min7", f"{self.key}7", f"{self.key}min9"]

      def correct_chord_progression(self, chords: List[dict]) -> List[dict]:
          """Apply musical rules to improve chord detection"""
          corrected = []

          for i, chord in enumerate(chords):
              # Remove duplicate adjacent chords
              if i > 0 and chord['chord'] == corrected[-1]['chord']:
                  continue

              # Prefer diatonic chords over non-diatonic
              # (simplified logic)

              corrected.append(chord)

          logger.info(f"Corrected {len(chords)} → {len(corrected)} chords")
          return corrected
  ```

- [ ] Integrate all services (2 hours)

  Update `routers/analysis.py`:
  ```python
  from services.pitch_detector import PitchDetector
  from services.chord_detector import ChordDetector
  from services.key_detector import KeyDetector
  from services.tempo_detector import TempoDetector
  from services.harmonic_corrector import HarmonicCorrector

  pitch_detector = PitchDetector()
  chord_detector = ChordDetector()
  key_detector = KeyDetector()
  tempo_detector = TempoDetector()

  @router.post("/analyze")
  async def analyze_audio(request: AnalyzeRequest):
      # 1. Download and load
      audio_path = await audio_loader.download_audio(str(request.audio_url))
      y, sr = audio_loader.load_audio(audio_path)

      # 2. Detect key
      key_result = key_detector.detect_key(y, sr)

      # 3. Detect tempo
      tempo_result = tempo_detector.detect_tempo(y, sr)

      # 4. Detect pitches
      pitch_result = pitch_detector.detect_pitches(str(audio_path))
      notes = pitch_detector.note_events_to_list(pitch_result['note_events'])

      # 5. Detect chords
      chords = chord_detector.group_notes_into_chords(notes)

      # 6. Apply harmonic correction
      corrector = HarmonicCorrector(key_result['key'], key_result['mode'])
      chords = corrector.correct_chord_progression(chords)

      # 7. Format result
      result = AnalysisResult(
          video_id=request.video_id,
          key=key_result['key'],
          mode=key_result['mode'],
          tempo=tempo_result['tempo'],
          chords=[
              Chord(
                  timestamp=c['timestamp'],
                  chord=c['chord'],
                  notes=c['notes']
              )
              for c in chords
          ],
          processing_time=time.time() - start_time
      )

      # Cleanup
      audio_loader.cleanup(audio_path)

      return result
  ```

### Afternoon (4 hours)
- [ ] End-to-end testing (3 hours)
  - Test complete pipeline with real piano audio
  - Verify all components work together
  - Check output quality
- [ ] Fix integration bugs (1 hour)

**End of Day Checkpoint:**
✅ All services integrated
✅ Complete analysis pipeline working
✅ Results look reasonable

---

## Day 25 (Friday) - Testing & Accuracy Improvement
**Goal:** Test thoroughly and improve accuracy

### Morning (4 hours)
- [ ] Create test dataset (1 hour)
  - 10 piano recordings with known chords
  - Various styles (classical, jazz, gospel)
  - Different keys and tempos
- [ ] Run accuracy tests (2 hours)
  - Analyze all test recordings
  - Compare results with ground truth
  - Calculate accuracy percentage
  - Document failures
- [ ] Improve chord detection (1 hour)
  - Adjust parameters based on test results
  - Improve chord templates
  - Add more chord types

### Afternoon (4 hours)
- [ ] Optimize performance (2 hours)
  - Profile code to find bottlenecks
  - Optimize slow functions
  - Target < 2 minutes for 5-minute audio
- [ ] Sprint 4 retrospective (1 hour)
  - Review accuracy achieved
  - Document known issues
  - Plan improvements
- [ ] Documentation (1 hour)
  - Document all services
  - Add usage examples
  - Document accuracy metrics

**End of Day Checkpoint:**
✅ Accuracy baseline established (target: 70%+)
✅ Performance acceptable
✅ AI core complete

**Sprint 4 Complete! 🎉**

---

# Continue?

I've created detailed daily breakdowns for the first 4 sprints (25 days). This should give you a very clear picture of:
- What to work on each day
- Time estimates for each task
- Code examples and structure
- Testing checkpoints

Would you like me to:
1. Continue with daily breakdowns for Sprints 5-8?
2. Move on to creating the project board?
3. Start documenting technical decisions?

Let me know which would be most valuable!
