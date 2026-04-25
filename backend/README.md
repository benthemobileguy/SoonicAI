# Soonic AI - Backend API

**NestJS backend for intelligent piano chord analysis**

---

## 📖 Overview

This is the backend API for Soonic AI, built with NestJS and TypeScript. It handles:

- YouTube audio extraction (yt-dlp)
- AI service integration (FastAPI)
- User authentication (Supabase)
- Usage tracking and limits
- Payment processing (Stripe)
- Database operations

---

## 🏗️ Architecture

```
Backend (Port 3001)
├── AnalysisModule          # Main orchestration
│   ├── analyzeUrl()        # Process YouTube videos
│   ├── getUserAnalyses()   # Get user's history
│   └── getUserStats()      # Get usage stats
├── YouTubeModule           # Audio extraction
│   ├── downloadAudio()     # yt-dlp integration
│   └── getVideoInfo()      # Metadata retrieval
├── AiServiceModule         # FastAPI integration
│   └── analyzeAudio()      # Send to AI service
├── DatabaseModule          # Supabase client
│   ├── User operations
│   ├── Analysis operations
│   └── Token verification
└── StripeModule (TODO)     # Payment processing
```

---

## 🚀 Quick Start

### Prerequisites

**System Requirements:**
- Node.js 20.x or higher
- npm or yarn
- yt-dlp installed globally
- FFmpeg installed

**External Services:**
- Supabase account (database & auth)
- Stripe account (payments)
- FastAPI AI service running on port 8000

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual credentials
   ```

3. **Set up Supabase database**
   ```bash
   # See: ../docs/04-setup/SUPABASE_SETUP.md
   ```

4. **Run in development mode**
   ```bash
   npm run start:dev
   ```

5. **Verify it's running**
   ```bash
   curl http://localhost:3001/analysis/health
   ```

---

## 🔧 Environment Variables

Create a `.env` file with these variables:

```bash
# App Configuration
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# AI Service (FastAPI)
AI_SERVICE_URL=http://localhost:8000

# File Processing
MAX_VIDEO_DURATION=300  # 5 minutes in seconds
TEMP_DIR=/tmp

# Supabase (get from https://app.supabase.com)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# Stripe (get from https://dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_test_your-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
STRIPE_PRICE_SUBSCRIPTION=price_your-price-id
```

**⚠️ SECURITY:** Never commit `.env` files to git!

---

## 📡 API Endpoints

### Public Endpoints

#### `GET /analysis/health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "services": {
    "aiService": "healthy"
  }
}
```

---

### Protected Endpoints (Require Authentication)

All protected endpoints require `Authorization: Bearer <token>` header.

#### `POST /analysis/url`
Analyze YouTube video URL.

**Request:**
```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

**Response:**
```json
{
  "success": true,
  "analysisId": "uuid",
  "source": "youtube",
  "url": "...",
  "result": {
    "key": "C major",
    "tempo": 120,
    "totalChords": 45,
    "chords": [
      {
        "timestamp": 0.5,
        "chord": "Cmaj7",
        "notes": ["C", "E", "G", "B"],
        "confidence": 0.85
      }
    ],
    "processingTime": 45.3
  }
}
```

#### `GET /analysis/me`
Get current user's analyses.

**Response:**
```json
{
  "analyses": [
    {
      "id": "uuid",
      "source_type": "youtube",
      "source_url": "...",
      "status": "completed",
      "detected_key": "C major",
      "tempo": 120,
      "created_at": "2026-04-24T10:00:00Z"
    }
  ]
}
```

#### `GET /analysis/me/stats`
Get current user's usage statistics.

**Response:**
```json
{
  "plan": "free",
  "analysesUsed": 2,
  "analysesLimit": 3,
  "canAnalyze": true,
  "creditsRemaining": 1
}
```

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

---

## 🛠️ Development Scripts

```bash
# Development (watch mode)
npm run start:dev

# Production build
npm run build

# Production mode
npm run start:prod

# Linting
npm run lint

# Format code
npm run format
```

---

## 🔒 Security Features

This backend implements multiple security layers:

✅ **Command Injection Protection**
- Uses `execFile()` instead of `exec()` to prevent shell injection
- All user inputs sanitized before shell execution

✅ **Input Validation**
- YouTube URLs validated with regex
- Max URL length enforced (2048 chars)
- SSRF protection (only YouTube domains allowed)

✅ **Authentication**
- JWT verification via Supabase
- Auth guards on protected endpoints
- Token validation on every request

✅ **Error Handling**
- Generic error messages to clients
- Detailed errors logged internally only
- No system paths or URLs exposed

✅ **Rate Limiting** (TODO)
- Protect against DoS attacks
- Usage-based throttling

**For full security audit, see:** `../SENIOR_AUDIT_REPORT.md`

---

## 📂 Project Structure

```
src/
├── main.ts                 # Application entry point
├── app.module.ts           # Root module
├── config/
│   └── configuration.ts    # Environment configuration
├── guards/
│   └── supabase-auth.guard.ts  # JWT authentication
├── decorators/
│   └── current-user.decorator.ts  # User extraction
├── database/
│   ├── database.module.ts
│   └── supabase.service.ts # Supabase client
├── modules/
│   ├── analysis/           # Main analysis logic
│   │   ├── analysis.controller.ts
│   │   ├── analysis.service.ts
│   │   ├── analysis.module.ts
│   │   └── dto/
│   │       └── analyze-url.dto.ts
│   ├── youtube/            # YouTube extraction
│   │   ├── youtube.service.ts
│   │   └── youtube.module.ts
│   ├── ai-service/         # FastAPI integration
│   │   ├── ai-service.service.ts
│   │   └── ai-service.module.ts
│   └── stripe/ (TODO)      # Payment processing
└── test/                   # E2E tests
```

---

## 🐛 Debugging

### Common Issues

**1. "yt-dlp: command not found"**
```bash
# macOS
brew install yt-dlp

# Ubuntu/Debian
sudo apt install yt-dlp

# Verify installation
yt-dlp --version
```

**2. "AI service is not running"**
```bash
# Check if AI service is running
curl http://localhost:8000/health

# Start AI service (in separate terminal)
cd ../ai-service
python main.py
```

**3. "Supabase connection failed"**
- Verify SUPABASE_URL and SUPABASE_SERVICE_KEY in `.env`
- Check Supabase project is not paused
- Verify database tables created (see setup guide)

**4. TypeScript compilation errors**
```bash
# Clean build
rm -rf dist/
npm run build
```

---

## 📊 Performance

**Benchmarks (local development):**

- Health check: ~5ms
- YouTube download (3min video): ~15-30s
- AI analysis (3min audio): ~60-180s
- Database query: ~50-200ms

**Production considerations:**
- Use Redis for caching
- Implement job queue (BullMQ)
- Scale AI service horizontally
- Use CDN for frontend assets

---

## 🚀 Deployment

### Environment Setup

1. **Production Environment Variables**
   ```bash
   NODE_ENV=production
   PORT=3001
   # Use production Supabase URL
   # Use production Stripe keys
   ```

2. **Build**
   ```bash
   npm run build
   ```

3. **Run**
   ```bash
   npm run start:prod
   ```

### Docker (TODO)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
CMD ["node", "dist/main"]
```

---

## 🤝 Contributing

1. Follow NestJS conventions
2. Write tests for new features
3. Update documentation
4. Ensure all tests pass
5. Follow security best practices

---

## 📚 Documentation

**Backend-specific:**
- API Specification: `../docs/02-architecture/API_SPECIFICATION.md`
- Database Schema: `../docs/04-setup/SUPABASE_SETUP.md`
- Security Audit: `../SENIOR_AUDIT_REPORT.md`

**General:**
- Project README: `../README.md`
- Complete docs: `../docs/README.md`

---

## 📝 License

MIT License - see root LICENSE file

---

**Built with NestJS • TypeScript • Supabase**

**Last Updated:** 2026-04-24

