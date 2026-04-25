# Soonic AI - Intelligent Piano Chord Analysis

**A chord detection and learning tool for worship pianists**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![NestJS](https://img.shields.io/badge/NestJS-11.x-red.svg)](https://nestjs.com/)
[![Node](https://img.shields.io/badge/Node-20.x-green.svg)](https://nodejs.org/)

---

## 🎯 What is Soonic AI?

Soonic AI is an intelligent chord analysis tool that helps worship pianists learn songs **10x faster**. Upload a YouTube video of a piano performance, and our AI analyzes the chords, displays them on a virtual keyboard, and syncs everything to the video playback.

**Not perfect AI, but perfectly useful** - We deliver 70-85% accuracy with intelligent corrections, saving musicians 90 minutes per song.

---

## ✨ Key Features

- **YouTube URL Analysis** - Paste a YouTube link, get instant chord analysis
- **Intelligent Correction Layer** - Music theory rules ensure musically sensible output
- **Virtual Keyboard Visualization** - See which keys to play in real-time
- **Video Sync** - Chords update as the video plays
- **Smart Pricing** - Credits system + subscription (flexible for sporadic usage)
- **Usage Limits** - 3 free analyses, then pay-as-you-go or unlimited subscription

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (Next.js)                 │
│  Upload • Results • Virtual Keyboard • Dashboard    │
└──────────────────────┬──────────────────────────────┘
                       │
                       ↓
┌──────────────────────────────────────────────────────┐
│              Backend (NestJS + TypeScript)           │
│  • YouTube Download (yt-dlp)                         │
│  • Authentication (Supabase)                         │
│  • Usage Tracking                                    │
│  • Payment Processing (Stripe)                       │
└──────────────────────┬──────────────────────────────┘
                       │
                       ↓
┌──────────────────────────────────────────────────────┐
│             AI Service (FastAPI + Python)            │
│  • Chord Detection (basic-pitch)                     │
│  • Key Detection (librosa)                           │
│  • Tempo Detection                                   │
│  • Correction Layer (music theory rules)            │
└──────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
SoonicAI/
├── backend/              # NestJS backend API
│   ├── src/
│   │   ├── modules/
│   │   │   ├── analysis/    # Analysis orchestration
│   │   │   ├── youtube/     # YouTube audio extraction
│   │   │   ├── ai-service/  # FastAPI integration
│   │   │   └── stripe/      # Payment processing (TODO)
│   │   ├── database/        # Supabase integration
│   │   ├── guards/          # Authentication guards
│   │   └── config/          # Configuration
│   └── test/                # Tests
├── frontend/             # Next.js frontend (TODO)
├── ai-service/           # FastAPI AI service (separate repo)
├── docs/                 # Complete documentation
│   ├── 00-START-HERE/   # Getting started guides
│   ├── 01-planning/     # Strategy & research
│   ├── 02-architecture/ # System design
│   ├── 03-implementation/ # Build guides
│   └── 04-setup/        # Setup instructions
└── samples/              # Sample test files
```

---

## 🚀 Quick Start

### Prerequisites

**Required:**
- Node.js 20.x or higher
- npm or yarn
- Python 3.11+ (for AI service)
- yt-dlp (for YouTube downloads)
- FFmpeg (for audio processing)

**Accounts Needed:**
- Supabase account (database)
- Stripe account (payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/soonic-ai.git
   cd soonic-ai
   ```

2. **Set up backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your credentials
   npm run start:dev
   ```

3. **Set up Supabase database**
   ```bash
   # Follow the guide:
   cat docs/04-setup/SUPABASE_SETUP.md
   ```

4. **Install system dependencies**
   ```bash
   # macOS
   brew install yt-dlp ffmpeg

   # Ubuntu/Debian
   sudo apt install yt-dlp ffmpeg

   # Windows
   # Download from official websites
   ```

5. **Test the backend**
   ```bash
   curl http://localhost:3001/analysis/health
   ```

**For detailed setup instructions, see:** `docs/00-START-HERE/WHAT_NEXT.md`

---

## 📚 Documentation

All documentation is in the `/docs` folder, organized for easy navigation:

- **[START_HERE.md](docs/00-START-HERE/START_HERE.md)** - Read this first!
- **[WHAT_NEXT.md](docs/00-START-HERE/WHAT_NEXT.md)** - Action plan and next steps
- **[STRATEGIC_REALITY_CHECK.md](docs/01-planning/STRATEGIC_REALITY_CHECK.md)** - Product philosophy
- **[PRICING_STRATEGY.md](docs/02-architecture/PRICING_STRATEGY.md)** - Revenue model
- **[IMPLEMENTATION_PLAN.md](docs/03-implementation/IMPLEMENTATION_PLAN.md)** - 18-week sprint plan
- **[SUPABASE_SETUP.md](docs/04-setup/SUPABASE_SETUP.md)** - Database setup guide

**See full index:** [docs/README.md](docs/README.md)

---

## 🔒 Security

**IMPORTANT:** This project handles user data and payments. Security is critical.

- ✅ Command injection protection (uses `execFile` instead of `exec`)
- ✅ Input validation (YouTube URLs validated, max length enforced)
- ✅ Authentication guards (JWT verification via Supabase)
- ✅ Secrets management (`.env` files excluded from git)
- ✅ Error sanitization (no internal details exposed to clients)

**For security audit report, see:** `SENIOR_AUDIT_REPORT.md`

---

## 💰 Pricing Model

**Free Tier:** 3 analyses (forever)

**Credits (Pay-as-you-go):**
- Starter: $9.90 for 5 credits
- Standard: $24.90 for 15+2 bonus credits ⭐ Most Popular
- Pro: $49.90 for 35+5 bonus credits

**Subscriptions:**
- Monthly: $19.90/month (unlimited)
- Yearly: $149/year (save 37%)

**For detailed pricing strategy, see:** `docs/02-architecture/PRICING_STRATEGY.md`

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

---

## 🛠️ Development

### Running Locally

```bash
# Backend (NestJS)
cd backend
npm run start:dev  # http://localhost:3001

# Frontend (Next.js) - Coming soon
cd frontend
npm run dev  # http://localhost:3000
```

### Available Scripts

```bash
npm run start       # Production mode
npm run start:dev   # Development mode (watch)
npm run build       # Build for production
npm run lint        # Lint code
npm run format      # Format code with Prettier
```

---

## 📊 Current Status

**Phase:** Backend Integration Complete ✅

**Completed:**
- ✅ Backend API (NestJS)
- ✅ YouTube audio extraction
- ✅ AI service integration
- ✅ Supabase authentication & database
- ✅ Usage tracking & limits
- ✅ Security hardening

**In Progress:**
- ⏳ Stripe payment integration
- ⏳ Frontend development

**Next Up:**
- 🔜 Virtual keyboard visualization
- 🔜 Pricing page
- 🔜 User dashboard

**For detailed status, see:** `docs/00-START-HERE/CURRENT_STATUS.md`

---

## 🎯 Core Philosophy

**What we're building:**
- NOT: "Perfect AI chord detection"
- YES: "A tool that saves worship pianists 90 minutes per song"

**Success metric:**
- NOT: "95% accuracy"
- YES: "8/10 musicians say 'I would use this'"

**Our approach:**
- 70-85% chord accuracy is **enough** if output is musically sensible
- Focus on **correction layer** (music theory rules), not perfect ML
- Ship fast, iterate based on feedback

**For full philosophy, see:** `docs/01-planning/STRATEGIC_REALITY_CHECK.md`

---

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines before submitting PRs.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Please ensure:**
- All tests pass
- Code is linted and formatted
- Security best practices followed
- Documentation updated

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Basic Pitch** (Spotify) - Audio transcription
- **yt-dlp** - YouTube download
- **NestJS** - Backend framework
- **Supabase** - Database & authentication
- **Stripe** - Payment processing

---

## 📧 Contact

- **Documentation:** [docs/README.md](docs/README.md)
- **Issues:** [GitHub Issues](https://github.com/your-org/soonic-ai/issues)
- **Discussions:** [GitHub Discussions](https://github.com/your-org/soonic-ai/discussions)

---

## 🗺️ Roadmap

### Month 1 (MVP)
- [x] Backend API
- [x] YouTube integration
- [x] AI service integration
- [x] Database & auth
- [ ] Stripe payments
- [ ] Frontend (basic)

### Month 2 (Launch)
- [ ] Virtual keyboard
- [ ] Pricing page
- [ ] User dashboard
- [ ] Deployment
- [ ] Beta testing

### Month 3+ (Growth)
- [ ] Chord explanations
- [ ] Slow playback mode
- [ ] Loop sections
- [ ] Relative pitch training
- [ ] Mobile app

---

**Built with ❤️ for worship musicians**

**Last Updated:** 2026-04-24
