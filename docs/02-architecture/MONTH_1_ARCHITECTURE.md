# Soonic AI - Month 1 Architecture (Clean & Focused)

**Last Updated:** 2026-04-24
**Philosophy:** Build something people depend on, not imaginary scale
**Timeline:** 30 days to first paying customer

---

## 🎯 Core Principle

**Serious ≠ Complex**
**Strong ≠ Many Tools**

We build for: **Current reality + Near future**
NOT for: **Imaginary scale**

---

## 📊 Month 1 vs Month 2 Split

### Month 1: CORE PRODUCT (Build Now)
Focus: **Reliable + Usable + Fast + Monetizable**

✅ **Build:**
- Next.js frontend with virtual keyboard
- NestJS API (clean architecture)
- Supabase (auth + database)
- Stripe (payments)
- FastAPI integration (existing)
- YouTube URL processing

✅ **Goal:** People use it and PAY

### Month 2: STRENGTHEN (Build Later)
Focus: **Scale + Reliability + Performance**

⏸️ **Defer:**
- BullMQ + Redis (async processing)
- AWS S3 (cloud storage)
- Advanced error handling
- Monitoring/logging infrastructure
- Auto-scaling

⏸️ **Why defer:** Prove value first, then harden

---

## 🏗️ Month 1 Architecture

```
┌──────────────────────────────────────┐
│   Next.js Frontend (Vercel)          │
│   - Upload UI                         │
│   - Virtual keyboard                  │
│   - Video player                      │
│   - Payment flow                      │
└────────────┬─────────────────────────┘
             │
             ↓ (HTTP/REST)
┌──────────────────────────────────────┐
│   NestJS Backend (Local/EC2)         │
│   ┌────────────────────────────┐     │
│   │ /analyze-upload            │     │
│   │ /analyze-url (YouTube)     │     │
│   │ /checkout                  │     │
│   │ /webhook/stripe            │     │
│   └────────────────────────────┘     │
└──────┬──────────┬────────────────────┘
       │          │
       │          ↓
       │    ┌─────────────────────┐
       │    │  Supabase            │
       │    │  - Auth              │
       │    │  - User DB           │
       │    │  - Usage tracking    │
       │    └─────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│   FastAPI AI Service (Existing)      │
│   - basic-pitch                       │
│   - correction layer (85-90%)        │
│   - chord detection                   │
└──────────────────────────────────────┘
```

**Key Points:**
- ✅ No Redis/BullMQ yet (synchronous processing)
- ✅ No S3 yet (temp file storage)
- ✅ Simple, fast, works
- ✅ Can handle 10-50 concurrent users

---

## 📂 NestJS Project Structure

```
backend/
├── src/
│   ├── main.ts                    # Entry point
│   ├── app.module.ts              # Root module
│   │
│   ├── config/
│   │   ├── config.module.ts       # Environment config
│   │   └── configuration.ts       # Config schema
│   │
│   ├── common/
│   │   ├── guards/
│   │   │   └── supabase-auth.guard.ts    # Auth middleware
│   │   ├── interceptors/
│   │   │   └── logging.interceptor.ts    # Request logging
│   │   └── filters/
│   │       └── http-exception.filter.ts  # Error handling
│   │
│   ├── modules/
│   │   │
│   │   ├── analysis/              # Video/URL analysis
│   │   │   ├── analysis.module.ts
│   │   │   ├── analysis.controller.ts
│   │   │   ├── analysis.service.ts
│   │   │   ├── dto/
│   │   │   │   ├── analyze-upload.dto.ts
│   │   │   │   └── analyze-url.dto.ts
│   │   │   └── interfaces/
│   │   │       └── analysis-result.interface.ts
│   │   │
│   │   ├── ai-service/            # FastAPI integration
│   │   │   ├── ai-service.module.ts
│   │   │   ├── ai-service.service.ts
│   │   │   └── interfaces/
│   │   │       └── ai-request.interface.ts
│   │   │
│   │   ├── youtube/               # YouTube processing
│   │   │   ├── youtube.module.ts
│   │   │   └── youtube.service.ts
│   │   │
│   │   ├── users/                 # User management
│   │   │   ├── users.module.ts
│   │   │   ├── users.service.ts
│   │   │   └── interfaces/
│   │   │       └── user.interface.ts
│   │   │
│   │   ├── payments/              # Stripe integration
│   │   │   ├── payments.module.ts
│   │   │   ├── payments.controller.ts
│   │   │   ├── payments.service.ts
│   │   │   └── dto/
│   │   │       └── create-checkout.dto.ts
│   │   │
│   │   └── webhooks/              # Stripe webhooks
│   │       ├── webhooks.module.ts
│   │       ├── webhooks.controller.ts
│   │       └── webhooks.service.ts
│   │
│   └── database/
│       ├── supabase.service.ts    # Supabase client
│       └── migrations/            # DB migrations (optional)
│
├── test/                          # E2E tests
├── .env                           # Environment variables
├── .env.example                   # Example env file
├── nest-cli.json
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔐 Supabase Setup

### Why Supabase (Not Firebase)

**Supabase Advantages:**
- ✅ PostgreSQL (real database, not NoSQL)
- ✅ Free tier generous
- ✅ Better for relational data
- ✅ Row-level security built-in
- ✅ Real-time subscriptions
- ✅ Open source (can self-host later)

**Cost:** $0 (free tier covers MVP)

### Database Schema

```sql
-- users table (managed by Supabase Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  plan TEXT DEFAULT 'free', -- 'free', 'pro', 'payg'
  analyses_used INTEGER DEFAULT 0,
  analyses_limit INTEGER DEFAULT 3,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- analyses table
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL, -- 'upload' or 'youtube'
  source_url TEXT, -- YouTube URL if applicable
  file_name TEXT,
  status TEXT DEFAULT 'processing', -- 'processing', 'completed', 'failed'

  -- Results
  detected_key TEXT,
  tempo INTEGER,
  chords JSONB, -- Array of chord objects
  processing_time_seconds INTEGER,
  confidence DECIMAL,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_payment_id TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL, -- in cents
  currency TEXT DEFAULT 'usd',
  type TEXT NOT NULL, -- 'payg' or 'subscription'
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_analyses_user_id ON analyses(user_id);
CREATE INDEX idx_analyses_status ON analyses(status);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_stripe_id ON payments(stripe_payment_id);
```

### Row-Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can view own analyses"
  ON analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);
```

---

## 🎬 Core Endpoints

### 1. POST /analysis/upload

**Purpose:** Upload video file for analysis

**Request:**
```http
POST /analysis/upload
Content-Type: multipart/form-data
Authorization: Bearer <supabase-jwt>

file: <video-file>
```

**Flow:**
1. Validate file (size, format)
2. Check user's usage limit
3. Save file temporarily (`/tmp/video.mp4`)
4. Extract audio with FFmpeg
5. Send audio to FastAPI
6. Get chord analysis
7. Save to Supabase
8. Delete temp files
9. Return results

**Response:**
```json
{
  "id": "uuid",
  "status": "completed",
  "result": {
    "key": "C major",
    "tempo": 120,
    "chords": [...]
  }
}
```

---

### 2. POST /analysis/url

**Purpose:** Analyze YouTube video by URL

**Request:**
```json
{
  "url": "https://youtube.com/watch?v=xxxx"
}
```

**Flow:**
1. Validate YouTube URL
2. Check user's usage limit
3. Download audio with `yt-dlp`:
   ```bash
   yt-dlp -x --audio-format wav --max-duration 300 -o "/tmp/audio.wav" <url>
   ```
4. Send audio to FastAPI
5. Get chord analysis
6. Save to Supabase
7. Delete temp file
8. Return results

**Important Limits:**
- Max duration: 5 minutes (300 seconds)
- Audio only (no video download)
- Temp storage only

**Response:** Same as /upload

---

### 3. POST /payments/checkout

**Purpose:** Create Stripe checkout session

**Request:**
```json
{
  "type": "subscription" | "payg"
}
```

**Flow:**
1. Get user from Supabase
2. Create or get Stripe customer
3. Create checkout session:
   - **Subscription:** $12/month
   - **Pay-as-you-go:** $2.50 one-time
4. Return checkout URL

**Response:**
```json
{
  "checkoutUrl": "https://checkout.stripe.com/..."
}
```

---

### 4. POST /webhooks/stripe

**Purpose:** Handle Stripe payment events

**Events:**
- `checkout.session.completed` → Update user plan
- `customer.subscription.deleted` → Downgrade to free
- `invoice.payment_failed` → Handle failed payment

**Flow:**
1. Verify webhook signature
2. Handle event type
3. Update Supabase user record
4. Return 200 OK

---

## 🔧 Implementation Details

### Supabase Integration

**Install:**
```bash
npm install @supabase/supabase-js
```

**Service (`database/supabase.service.ts`):**
```typescript
import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(private config: ConfigService) {
    this.supabase = createClient(
      this.config.get('SUPABASE_URL'),
      this.config.get('SUPABASE_SERVICE_KEY'),
    );
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  // User methods
  async getUser(userId: string) {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateUser(userId: string, updates: any) {
    const { data, error } = await this.supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  // Analysis methods
  async createAnalysis(analysis: any) {
    const { data, error } = await this.supabase
      .from('analyses')
      .insert(analysis)
      .single();

    if (error) throw error;
    return data;
  }

  async getAnalysis(id: string, userId: string) {
    const { data, error } = await this.supabase
      .from('analyses')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  async getUserAnalyses(userId: string, limit = 10) {
    const { data, error } = await this.supabase
      .from('analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }
}
```

---

### YouTube Download Service

**Install:**
```bash
# Install yt-dlp system-wide
brew install yt-dlp  # macOS
# or
apt install yt-dlp   # Ubuntu
```

**Service (`youtube/youtube.service.ts`):**
```typescript
import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

@Injectable()
export class YouTubeService {
  private readonly tempDir = '/tmp';

  async downloadAudio(url: string): Promise<string> {
    // Validate YouTube URL
    if (!this.isValidYouTubeUrl(url)) {
      throw new Error('Invalid YouTube URL');
    }

    const outputPath = path.join(this.tempDir, `${Date.now()}.wav`);

    // Download audio only, max 5 minutes
    const command = `yt-dlp -x --audio-format wav --max-duration 300 -o "${outputPath}" "${url}"`;

    try {
      await execAsync(command, { timeout: 60000 }); // 1 min timeout
      return outputPath;
    } catch (error) {
      throw new Error(`Failed to download audio: ${error.message}`);
    }
  }

  async cleanup(filePath: string): Promise<void> {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  private isValidYouTubeUrl(url: string): boolean {
    const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    return pattern.test(url);
  }

  async getVideoInfo(url: string): Promise<any> {
    const command = `yt-dlp --dump-json "${url}"`;
    const { stdout } = await execAsync(command);
    return JSON.parse(stdout);
  }
}
```

---

### FastAPI Integration

**Service (`ai-service/ai-service.service.ts`):**
```typescript
import { Injectable, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as FormData from 'form-data';
import * as fs from 'fs';

@Injectable()
export class AiServiceService {
  private readonly aiServiceUrl: string;

  constructor(private config: ConfigService) {
    this.aiServiceUrl = this.config.get('AI_SERVICE_URL') || 'http://localhost:8000';
  }

  async analyzeAudio(audioPath: string): Promise<any> {
    // Check file exists
    if (!fs.existsSync(audioPath)) {
      throw new HttpException('Audio file not found', 404);
    }

    // Create form data
    const formData = new FormData();
    formData.append('file', fs.createReadStream(audioPath));

    try {
      const response = await axios.post(
        `${this.aiServiceUrl}/analyze`,
        formData,
        {
          headers: formData.getHeaders(),
          timeout: 180000, // 3 minutes
        },
      );

      return response.data;
    } catch (error) {
      throw new HttpException(
        `AI service error: ${error.message}`,
        error.response?.status || 500,
      );
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.aiServiceUrl}/health`, {
        timeout: 5000,
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }
}
```

---

### Analysis Controller

**Controller (`analysis/analysis.controller.ts`):**
```typescript
import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AnalysisService } from './analysis.service';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { AnalyzeUrlDto } from './dto/analyze-url.dto';

@Controller('analysis')
@UseGuards(SupabaseAuthGuard)
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async analyzeUpload(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    return this.analysisService.analyzeUpload(file, req.user.id);
  }

  @Post('url')
  async analyzeUrl(@Body() dto: AnalyzeUrlDto, @Request() req) {
    return this.analysisService.analyzeUrl(dto.url, req.user.id);
  }

  @Get(':id')
  async getAnalysis(@Param('id') id: string, @Request() req) {
    return this.analysisService.getAnalysis(id, req.user.id);
  }

  @Get()
  async getUserAnalyses(@Request() req) {
    return this.analysisService.getUserAnalyses(req.user.id);
  }
}
```

---

### Analysis Service

**Service (`analysis/analysis.service.ts`):**
```typescript
import { Injectable, HttpException } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { AiServiceService } from '../ai-service/ai-service.service';
import { YouTubeService } from '../youtube/youtube.service';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class AnalysisService {
  constructor(
    private supabase: SupabaseService,
    private aiService: AiServiceService,
    private youtube: YouTubeService,
  ) {}

  async analyzeUpload(file: Express.Multer.File, userId: string) {
    // 1. Check usage limit
    const user = await this.supabase.getUser(userId);
    if (user.analyses_used >= user.analyses_limit && user.plan === 'free') {
      throw new HttpException('Usage limit exceeded. Please upgrade.', 402);
    }

    // 2. Validate file
    if (!file) {
      throw new HttpException('No file uploaded', 400);
    }

    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      throw new HttpException('File too large (max 500MB)', 400);
    }

    // 3. Save file temporarily
    const tempVideoPath = path.join('/tmp', `${Date.now()}-${file.originalname}`);
    fs.writeFileSync(tempVideoPath, file.buffer);

    try {
      // 4. Extract audio
      const audioPath = await this.extractAudio(tempVideoPath);

      // 5. Analyze with AI
      const result = await this.aiService.analyzeAudio(audioPath);

      // 6. Save to database
      const analysis = await this.supabase.createAnalysis({
        user_id: userId,
        source_type: 'upload',
        file_name: file.originalname,
        status: 'completed',
        detected_key: result.detected_key,
        tempo: result.tempo,
        chords: result.chords,
        processing_time_seconds: result.processing_time,
        confidence: result.confidence,
        completed_at: new Date(),
      });

      // 7. Increment usage
      await this.supabase.updateUser(userId, {
        analyses_used: user.analyses_used + 1,
      });

      // 8. Cleanup
      fs.unlinkSync(tempVideoPath);
      fs.unlinkSync(audioPath);

      return analysis;
    } catch (error) {
      // Cleanup on error
      if (fs.existsSync(tempVideoPath)) fs.unlinkSync(tempVideoPath);
      throw error;
    }
  }

  async analyzeUrl(url: string, userId: string) {
    // 1. Check usage limit
    const user = await this.supabase.getUser(userId);
    if (user.analyses_used >= user.analyses_limit && user.plan === 'free') {
      throw new HttpException('Usage limit exceeded. Please upgrade.', 402);
    }

    let audioPath: string;

    try {
      // 2. Download audio from YouTube
      audioPath = await this.youtube.downloadAudio(url);

      // 3. Analyze with AI
      const result = await this.aiService.analyzeAudio(audioPath);

      // 4. Save to database
      const analysis = await this.supabase.createAnalysis({
        user_id: userId,
        source_type: 'youtube',
        source_url: url,
        status: 'completed',
        detected_key: result.detected_key,
        tempo: result.tempo,
        chords: result.chords,
        processing_time_seconds: result.processing_time,
        confidence: result.confidence,
        completed_at: new Date(),
      });

      // 5. Increment usage
      await this.supabase.updateUser(userId, {
        analyses_used: user.analyses_used + 1,
      });

      // 6. Cleanup
      await this.youtube.cleanup(audioPath);

      return analysis;
    } catch (error) {
      // Cleanup on error
      if (audioPath) await this.youtube.cleanup(audioPath);
      throw error;
    }
  }

  async getAnalysis(id: string, userId: string) {
    return this.supabase.getAnalysis(id, userId);
  }

  async getUserAnalyses(userId: string) {
    return this.supabase.getUserAnalyses(userId);
  }

  private async extractAudio(videoPath: string): Promise<string> {
    const audioPath = videoPath.replace(/\.\w+$/, '.wav');
    const command = `ffmpeg -i "${videoPath}" -vn -acodec pcm_s16le -ar 44100 -ac 1 "${audioPath}"`;

    await execAsync(command);
    return audioPath;
  }
}
```

---

## 💳 Stripe Integration

### Setup

**Install:**
```bash
npm install stripe
```

**Environment:**
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_SUBSCRIPTION=price_...  # $12/month
STRIPE_PRICE_PAYG=price_...          # $2.50 one-time
```

### Payments Service

**Service (`payments/payments.service.ts`):**
```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { SupabaseService } from '../database/supabase.service';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private config: ConfigService,
    private supabase: SupabaseService,
  ) {
    this.stripe = new Stripe(this.config.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
    });
  }

  async createCheckoutSession(userId: string, type: 'subscription' | 'payg') {
    const user = await this.supabase.getUser(userId);

    // Get or create Stripe customer
    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: userId },
      });
      customerId = customer.id;

      await this.supabase.updateUser(userId, {
        stripe_customer_id: customerId,
      });
    }

    // Create checkout session
    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: type === 'subscription' ? 'subscription' : 'payment',
      line_items: [
        {
          price: this.config.get(
            type === 'subscription'
              ? 'STRIPE_PRICE_SUBSCRIPTION'
              : 'STRIPE_PRICE_PAYG',
          ),
          quantity: 1,
        },
      ],
      success_url: `${this.config.get('FRONTEND_URL')}/dashboard?payment=success`,
      cancel_url: `${this.config.get('FRONTEND_URL')}/pricing?payment=cancel`,
      metadata: {
        user_id: userId,
        type,
      },
    });

    return { checkoutUrl: session.url };
  }

  async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object);
        break;
    }
  }

  private async handleCheckoutCompleted(session: any) {
    const userId = session.metadata.user_id;
    const type = session.metadata.type;

    if (type === 'subscription') {
      // Upgrade to Pro
      await this.supabase.updateUser(userId, {
        plan: 'pro',
        analyses_limit: null, // Unlimited
        stripe_subscription_id: session.subscription,
      });
    } else if (type === 'payg') {
      // Add 1 credit
      const user = await this.supabase.getUser(userId);
      await this.supabase.updateUser(userId, {
        analyses_limit: user.analyses_limit + 1,
      });
    }

    // Record payment
    await this.supabase.getClient().from('payments').insert({
      user_id: userId,
      stripe_payment_id: session.payment_intent,
      amount: session.amount_total,
      currency: session.currency,
      type,
      status: 'completed',
    });
  }

  private async handleSubscriptionDeleted(subscription: any) {
    const { data: user } = await this.supabase
      .getClient()
      .from('profiles')
      .select('*')
      .eq('stripe_subscription_id', subscription.id)
      .single();

    if (user) {
      await this.supabase.updateUser(user.id, {
        plan: 'free',
        analyses_limit: 3,
        stripe_subscription_id: null,
      });
    }
  }

  private async handlePaymentFailed(invoice: any) {
    // Log failed payment, send email, etc.
    console.error('Payment failed:', invoice);
  }
}
```

---

## 🔐 Authentication Guard

**Guard (`common/guards/supabase-auth.guard.ts`):**
```typescript
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private supabase;

  constructor(private config: ConfigService) {
    this.supabase = createClient(
      this.config.get('SUPABASE_URL'),
      this.config.get('SUPABASE_ANON_KEY'),
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const { data, error } = await this.supabase.auth.getUser(token);

      if (error || !data.user) {
        throw new UnauthorizedException('Invalid token');
      }

      // Attach user to request
      request.user = data.user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Authentication failed');
    }
  }

  private extractToken(request: any): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) return null;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
```

---

## 🌐 Environment Variables

**`.env`:**
```env
# App
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_SUBSCRIPTION=price_...
STRIPE_PRICE_PAYG=price_...

# AI Service
AI_SERVICE_URL=http://localhost:8000

# File Upload
MAX_FILE_SIZE=524288000  # 500MB
ALLOWED_FORMATS=mp4,mov,avi,webm
```

---

## 📦 Dependencies

**`package.json`:**
```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@supabase/supabase-js": "^2.38.0",
    "stripe": "^14.0.0",
    "axios": "^1.6.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "form-data": "^4.0.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  }
}
```

---

## 🚀 Deployment (Month 1)

### Development
```bash
# Backend
npm run start:dev

# AI Service (existing)
cd soonic-test/backend
python api.py
```

### Production (Simple)
```bash
# Deploy backend to cheap VPS (DigitalOcean, Hetzner)
# $5-10/month

# Or use Railway/Render free tier
```

**No AWS, no complex infrastructure yet**

---

## 📊 Success Metrics (Month 1)

**Technical:**
- ✅ Processing time < 3 minutes
- ✅ 95% success rate
- ✅ < 1 second response time (non-analysis endpoints)

**Business:**
- ✅ 10-50 signups
- ✅ 3-5 paying customers
- ✅ $30-60 MRR

**User Experience:**
- ✅ "Wow" reaction to virtual keyboard
- ✅ Users can complete flow without help
- ✅ 3/5 users say "I'd pay for this"

---

## 🔄 What Happens in Month 2

**After proving value:**
- Add BullMQ + Redis (async processing)
- Add S3 (persistent storage)
- Add proper monitoring (Sentry, logging)
- Add email notifications
- Optimize performance
- Scale infrastructure

**But ONLY after Month 1 works.**

---

## 💡 Key Principles

1. **Synchronous is OK for MVP**
   - User waits 1-3 minutes → perfectly fine
   - Don't need job queue yet

2. **Temp files are OK**
   - `/tmp` storage works fine
   - Clean up after processing
   - Don't need S3 yet

3. **Simple auth is OK**
   - Supabase handles everything
   - Don't need custom JWT yet

4. **Monolith deployment is OK**
   - Single server handles everything
   - Don't need microservices scaling yet

5. **Focus on UX, not infrastructure**
   - Virtual keyboard > Perfect architecture
   - User can pay > Perfect job queue

---

## 🎯 Final Architecture Diagram

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       ↓
┌──────────────────────────────┐
│   Next.js Frontend            │
│   - Virtual keyboard ⭐       │
│   - Upload/YouTube URL        │
│   - Stripe checkout           │
└──────┬───────────────────────┘
       │
       ↓ (Supabase Auth JWT)
┌──────────────────────────────┐
│   NestJS Backend              │
│   ┌────────────────────┐     │
│   │ /analysis/upload   │────┐│
│   │ /analysis/url      │────┤│
│   └────────────────────┘    ││
└──────┬──────────────────────┘│
       │                       │
       │   ┌───────────────────┘
       │   │
       │   ↓
       │  ┌──────────────────┐
       │  │ FastAPI (AI)     │
       │  │ - basic-pitch    │
       │  │ - correction     │
       │  └──────────────────┘
       │
       ↓
┌──────────────────────────────┐
│   Supabase                    │
│   - Auth                      │
│   - PostgreSQL DB             │
└──────────────────────────────┘
```

**Simple. Focused. Works.**

---

## 🚦 Next Steps

1. **Set up Supabase project** (15 min)
2. **Initialize NestJS backend** (30 min)
3. **Build core endpoints** (2-3 days)
4. **Test with real videos** (1 day)
5. **Build Next.js frontend** (3-4 days)
6. **Add Stripe** (1 day)
7. **Test with users** (ongoing)

**Total: ~1 week to working MVP**

---

**Remember:** Serious ≠ Complex. Strong ≠ Many Tools.

Build something people **depend on**, not imaginary scale.
