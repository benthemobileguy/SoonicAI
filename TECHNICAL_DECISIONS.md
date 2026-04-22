# Soonic AI - Technical Decisions & Architecture Rationale

This document explains every major technical decision made for Soonic AI, including alternatives considered and trade-offs.

---

## Table of Contents

1. [Overall Architecture](#overall-architecture)
2. [Frontend Stack](#frontend-stack)
3. [Backend Stack](#backend-stack)
4. [Audio AI Service Stack](#audio-ai-service-stack)
5. [Database & Storage](#database--storage)
6. [Authentication](#authentication)
7. [Payment Processing](#payment-processing)
8. [Infrastructure & Hosting](#infrastructure--hosting)
9. [Development Tools](#development-tools)
10. [Third-Party Services](#third-party-services)

---

# Overall Architecture

## Decision: Microservices Architecture with Separated AI Service

**Choice:** Three-tier architecture
- Frontend (Next.js)
- Backend API (NestJS)
- Audio AI Service (Python FastAPI)

### Rationale

**Why Separated AI Service:**
1. **Language Optimization:** Python has superior ML/audio libraries (librosa, essentia, basic-pitch)
2. **Independent Scaling:** AI processing is CPU-intensive and needs different scaling strategy
3. **Technology Freedom:** Can swap AI models without touching main application
4. **Cost Optimization:** Can run AI service on GPU instances separately
5. **Development Speed:** Team can work on AI and app features independently

**Why Not Monolith:**
❌ Hard to scale processing separately from API
❌ Limited to one language/ecosystem
❌ Deployment complexity increases with size
❌ Changes to AI require redeploying entire app

**Why Not Serverless Functions:**
❌ Cold starts would make processing too slow
❌ Execution time limits (AWS Lambda: 15 min max)
❌ ML model loading takes time
❌ More expensive for consistent workload

### Trade-offs

**Pros:**
✅ Clear separation of concerns
✅ Independent scaling
✅ Technology flexibility
✅ Parallel development

**Cons:**
❌ More deployment complexity
❌ Network overhead between services
❌ More infrastructure to manage

**Verdict:** ✅ Microservices worth it for flexibility and scaling

---

# Frontend Stack

## Next.js 14+

**Alternatives Considered:**
- React (Create React App)
- Vue.js + Nuxt
- Svelte + SvelteKit
- Vanilla React with Vite

### Why Next.js

**Pros:**
✅ **SSR + SSG:** Better SEO for landing/marketing pages
✅ **API Routes:** Can proxy backend calls, handle auth tokens securely
✅ **File-based Routing:** Faster development
✅ **Image Optimization:** Built-in, crucial for performance
✅ **Vercel Deployment:** Zero-config deployment
✅ **Large Ecosystem:** Many tutorials, libraries, support
✅ **App Router:** Modern React features (Server Components)

**Cons:**
❌ Heavier than pure React
❌ Some vendor lock-in to Vercel (but can deploy elsewhere)
❌ Learning curve for SSR concepts

**Verdict:** ✅ Next.js provides best DX and performance out of the box

---

## React

**Why React over Vue/Svelte:**

**React Pros:**
✅ Largest ecosystem and community
✅ More developers available for hiring
✅ Mature libraries for audio/video (react-player, wavesurfer, etc.)
✅ Team likely already knows React
✅ Better Canvas/WebGL libraries for keyboard visualization

**Vue Pros:**
✅ Easier learning curve
✅ Better performance in some benchmarks
✅ Cleaner template syntax

**Svelte Pros:**
✅ Smallest bundle size
✅ Fastest runtime performance
✅ No virtual DOM

**Verdict:** ✅ React's ecosystem and familiarity outweigh alternatives

---

## Tailwind CSS

**Alternatives Considered:**
- CSS Modules
- Styled Components / Emotion
- Material-UI / Chakra UI
- Plain CSS / SASS

### Why Tailwind

**Pros:**
✅ **Rapid Development:** Build UIs 3-5x faster than custom CSS
✅ **Consistency:** Design system built-in
✅ **No CSS Bloat:** Purges unused styles automatically
✅ **Responsive Design:** Mobile-first utilities
✅ **Customizable:** Easy to extend with custom colors/spacing
✅ **No Naming Fatigue:** No need to invent class names

**Cons:**
❌ HTML can get verbose
❌ Learning curve for utility-first approach
❌ Harder to reuse complex styles (mitigated with @apply)

**Verdict:** ✅ Speed and consistency benefits are huge for MVP

---

## TypeScript

**Why TypeScript over JavaScript:**

**Pros:**
✅ **Type Safety:** Catch bugs at compile time
✅ **Better IDE Support:** Autocomplete, refactoring
✅ **Self-Documenting:** Types serve as inline documentation
✅ **Easier Refactoring:** Confidence when changing code
✅ **Team Scaling:** Easier for new developers to understand

**Cons:**
❌ Initial setup time
❌ Slight learning curve
❌ More verbose code

**Verdict:** ✅ TypeScript is essential for medium+ sized projects

---

# Backend Stack

## NestJS

**Alternatives Considered:**
- Express.js (vanilla)
- Fastify
- Koa
- Hono
- tRPC + Next.js API routes

### Why NestJS

**Pros:**
✅ **Structure:** Opinionated architecture (modules, services, controllers)
✅ **Scalability:** Built for enterprise-scale apps
✅ **TypeScript Native:** First-class TypeScript support
✅ **Dependency Injection:** Clean, testable code
✅ **Decorators:** Clean routing and validation syntax
✅ **Built-in Tools:** Logging, validation, guards, interceptors
✅ **Documentation:** Excellent docs and examples
✅ **Testing:** Built-in testing utilities
✅ **Job Queues:** Easy integration with Bull/BullMQ

**Express Pros:**
✅ Simpler, less opinionated
✅ Smaller bundle size
✅ More tutorials/examples

**Fastify Pros:**
✅ Faster performance
✅ Better schema validation

**Verdict:** ✅ NestJS structure worth the learning curve for a 4-month project

---

## BullMQ + Redis

**Alternatives Considered:**
- Bull (older version)
- Bee-Queue
- Kue
- RabbitMQ
- AWS SQS

### Why BullMQ + Redis

**Pros:**
✅ **Reliability:** Industry-proven for job queues
✅ **Performance:** Fast, in-memory
✅ **Features:** Retries, delays, priorities, repeatable jobs
✅ **Monitoring:** Bull Board for visual queue management
✅ **Node.js Native:** Excellent TypeScript support
✅ **Simple:** Easier than RabbitMQ
✅ **Cost:** Cheaper than AWS SQS for our scale

**RabbitMQ Pros:**
✅ More features (routing, exchanges)
✅ Better for complex messaging patterns

**AWS SQS Pros:**
✅ Fully managed
✅ No server to maintain

**Cons of BullMQ:**
❌ Requires Redis server
❌ Need to manage Redis ourselves

**Verdict:** ✅ BullMQ is perfect balance of features and simplicity

---

# Audio AI Service Stack

## Python + FastAPI

**Alternatives Considered:**
- Node.js with ML libraries
- Go + Python bridge
- Java + DL4J
- Keep everything in NestJS

### Why Python

**Pros:**
✅ **ML Ecosystem:** Best ML/audio libraries (librosa, essentia, tensorflow)
✅ **Basic Pitch:** Spotify's model is Python-only
✅ **Rapid Prototyping:** Experiment with models quickly
✅ **Documentation:** Most audio ML examples in Python
✅ **Community:** Largest ML community

**Node.js Cons:**
❌ Limited audio ML libraries
❌ ML models harder to integrate
❌ Performance worse for numeric computation

**Verdict:** ✅ Python is the only practical choice for audio ML

---

## FastAPI

**Alternatives Considered:**
- Flask
- Django + DRF
- Tornado
- Raw ASGI

### Why FastAPI

**Pros:**
✅ **Performance:** As fast as Node/Go (uses Starlette + uvicorn)
✅ **Type Hints:** Native Pydantic validation
✅ **Auto Documentation:** Swagger UI out of the box
✅ **Async Support:** Handle concurrent requests efficiently
✅ **Modern:** Best practices built-in
✅ **Easy Testing:** Simple test client
✅ **WebSocket Support:** For future real-time features

**Flask Cons:**
❌ Slower, synchronous
❌ Less modern
❌ Manual validation

**Django Cons:**
❌ Too heavy for microservice
❌ ORM not needed
❌ Slower than FastAPI

**Verdict:** ✅ FastAPI is perfect for AI microservices

---

## librosa

**Why librosa for audio processing:**

**Pros:**
✅ **Industry Standard:** Most widely used audio analysis library
✅ **Features:** Beat tracking, tempo, key detection, chromagram
✅ **Documentation:** Excellent docs and examples
✅ **Active Development:** Regular updates
✅ **Integration:** Works well with NumPy, SciPy

**Alternatives:**
- Essentia (also using, complementary)
- Madmom (less maintained)
- Aubio (less features)

**Verdict:** ✅ librosa is essential for audio analysis

---

## Basic Pitch (Spotify)

**Why Basic Pitch for pitch detection:**

**Pros:**
✅ **Accuracy:** State-of-the-art for polyphonic pitch detection
✅ **Open Source:** Free, no API costs
✅ **Spotify-Backed:** Well-maintained
✅ **Piano-Friendly:** Works well on piano (trained on diverse instruments)
✅ **Outputs MIDI:** Easy to work with

**Alternatives:**
- Crepe (monophonic only)
- Melodia (older, less accurate)
- Google Magenta models (more complex)
- Commercial APIs (Hooktheory, Chordify - expensive)

**Verdict:** ✅ Basic Pitch is best free option for piano

---

# Database & Storage

## Firebase Firestore

**Alternatives Considered:**
- PostgreSQL (self-hosted or Supabase)
- MongoDB Atlas
- DynamoDB
- MySQL

### Why Firestore

**Pros:**
✅ **Real-time:** Built-in real-time updates (for progress tracking)
✅ **No Setup:** Fully managed, zero server config
✅ **Scalability:** Auto-scales to millions of users
✅ **Security Rules:** Built-in access control
✅ **Free Tier:** Generous (50K reads/day, 20K writes/day)
✅ **SDKs:** Excellent client and server SDKs
✅ **Firebase Integration:** Works with Auth, Storage seamlessly
✅ **Offline Support:** Client caching built-in

**PostgreSQL Pros:**
✅ More powerful queries (joins, aggregations)
✅ Better for analytics
✅ ACID transactions

**MongoDB Pros:**
✅ More flexible schema
✅ Better for complex documents

**Cons of Firestore:**
❌ Limited query capabilities (no joins)
❌ Can get expensive at scale (pay per read/write)
❌ Vendor lock-in to Google

**Verdict:** ✅ Firestore's real-time and ease-of-use perfect for MVP

**Future Migration Path:**
- If costs get high: Migrate to PostgreSQL (Supabase)
- Keep Firestore for real-time features only
- Use Postgres for historical/analytical data

---

## AWS S3

**Alternatives Considered:**
- Firebase Storage
- Google Cloud Storage
- Cloudflare R2
- Self-hosted MinIO

### Why AWS S3

**Pros:**
✅ **Cost:** Cheapest storage ($0.023/GB/month)
✅ **Reliability:** 99.999999999% durability
✅ **Performance:** Fast uploads/downloads
✅ **CDN Integration:** Works with CloudFront
✅ **Lifecycle Policies:** Auto-delete old files
✅ **Scalability:** Unlimited storage
✅ **Mature:** Well-documented, stable

**Firebase Storage Cons:**
❌ More expensive ($0.026/GB/month)
❌ Fewer features (no lifecycle policies)

**Cloudflare R2 Pros:**
✅ Free egress (could save money)

**Cons:**
❌ Newer, less proven
❌ Fewer integrations

**Verdict:** ✅ S3 is the safest, cheapest choice

---

## Hybrid: Firestore + S3

**Why both instead of one?**

**Strategy:**
- **Firestore:** Metadata, user data, relationships, real-time status
- **S3:** Large files (videos, audio)

**Benefits:**
✅ **Cost Optimization:** S3 much cheaper for large files
✅ **Performance:** Firestore faster for metadata queries
✅ **Best of Both:** Use each service for what it's best at

**Trade-off:**
❌ More complexity managing two systems

**Verdict:** ✅ Hybrid approach optimizes cost and performance

---

# Authentication

## Firebase Authentication

**Alternatives Considered:**
- Auth0
- Clerk
- Supabase Auth
- Custom JWT
- NextAuth.js
- AWS Cognito

### Why Firebase Auth

**Pros:**
✅ **Free:** Generous free tier (unlimited users)
✅ **Simple:** 5 lines of code to implement
✅ **Providers:** Email, Google, GitHub, etc. built-in
✅ **SDK:** Excellent client and server SDKs
✅ **Security:** Google-managed, secure by default
✅ **Integration:** Works with Firestore security rules
✅ **No Backend Code:** Client-side auth, just verify tokens in backend

**Auth0 Pros:**
✅ More features (MFA, password policies)
✅ Better enterprise features

**Cons:**
❌ Expensive ($35/month for 1,000 users)

**Clerk Pros:**
✅ Beautiful pre-built UI
✅ Modern DX

**Cons:**
❌ $25/month after free tier

**Verdict:** ✅ Firebase Auth is free and perfect for MVP

---

# Payment Processing

## Stripe

**Alternatives Considered:**
- PayPal
- Square
- Paddle
- Braintree
- LemonSqueezy

### Why Stripe

**Pros:**
✅ **Industry Standard:** Most trusted payment processor
✅ **Developer Experience:** Best API and documentation
✅ **Features:** One-time payments + subscriptions
✅ **Customer Portal:** Built-in subscription management
✅ **Webhooks:** Reliable event system
✅ **PCI Compliance:** Handled for you
✅ **Global:** Supports 135+ currencies
✅ **Testing:** Excellent test mode
✅ **No Monthly Fee:** Pay per transaction only (2.9% + $0.30)

**PayPal Cons:**
❌ Worse developer experience
❌ Higher dispute rates
❌ More user friction

**Paddle Pros:**
✅ Handles sales tax globally (merchant of record)

**Cons:**
❌ Higher fees (5% + $0.50)
❌ Less control

**Verdict:** ✅ Stripe is the clear winner for SaaS

---

# Infrastructure & Hosting

## Frontend: Vercel

**Alternatives Considered:**
- Netlify
- AWS Amplify
- Self-hosted on AWS EC2
- Cloudflare Pages

### Why Vercel

**Pros:**
✅ **Next.js Native:** Made by Next.js creators
✅ **Zero Config:** Push to deploy
✅ **Free Tier:** Generous (100GB bandwidth/month)
✅ **Performance:** Edge network, automatic optimization
✅ **Preview Deployments:** Every PR gets a preview URL
✅ **SSL:** Automatic HTTPS
✅ **Custom Domains:** Easy setup
✅ **Environment Variables:** Easy management

**Netlify Pros:**
✅ Similar features
✅ Better for non-Next.js projects

**Self-hosted Cons:**
❌ Much more work to set up
❌ Need to manage nginx, SSL, CDN
❌ More expensive in time

**Verdict:** ✅ Vercel is perfect for Next.js

---

## Backend + AI Service: AWS EC2

**Alternatives Considered:**
- Heroku
- Railway
- Render
- DigitalOcean
- Google Cloud Run
- AWS ECS/Fargate
- Kubernetes

### Why AWS EC2

**Pros:**
✅ **Cost Control:** Pay for what you use ($10-50/month for t3.medium)
✅ **Flexibility:** Full control over server
✅ **Mature:** Well-documented, stable
✅ **Scaling:** Easy to upgrade instance size
✅ **Ecosystem:** Works with S3, CloudWatch, etc.
✅ **Predictable:** Fixed monthly cost

**Heroku Cons:**
❌ Expensive ($25-50/month for equivalent power)
❌ Less control

**Google Cloud Run Pros:**
✅ Serverless, auto-scaling
✅ Pay per request

**Cons:**
❌ Cold starts
❌ More expensive for steady traffic

**Kubernetes Cons:**
❌ Massive overkill for MVP
❌ Complex to manage

**Verdict:** ✅ EC2 is best cost/control balance for MVP

**Scaling Plan:**
- MVP: 1 EC2 instance for backend + 1 for AI service
- Growth: Add load balancer + auto-scaling
- Scale: Move to ECS/Fargate or Kubernetes if needed

---

## Why Not Fully Serverless?

**Could we use:**
- Next.js on Vercel (serverless)
- AWS Lambda for backend
- AWS Lambda for AI service

**Why Not:**

**Backend Serverless Cons:**
❌ BullMQ requires persistent Redis connection
❌ Background jobs need long-running processes
❌ WebSocket support harder
❌ More expensive for consistent traffic

**AI Service Serverless Cons:**
❌ ML model loading (1-2 GB) takes too long
❌ Cold starts would be 10-30 seconds
❌ Lambda timeout limits (15 min)
❌ More expensive for ML workloads

**Verdict:** ✅ Traditional servers better for our use case

---

# Development Tools

## Git + GitHub

**Why GitHub over GitLab/Bitbucket:**

**Pros:**
✅ **Industry Standard:** Most developers familiar
✅ **Integrations:** Works with Vercel, Sentry, etc.
✅ **Actions:** Free CI/CD (2,000 min/month)
✅ **Community:** Largest open source community
✅ **Copilot:** AI code completion (if using)

**Verdict:** ✅ GitHub is default choice

---

## Docker + Docker Compose

**Why containerization:**

**Pros:**
✅ **Consistency:** Same environment dev to prod
✅ **Isolation:** No dependency conflicts
✅ **Easy Onboarding:** New devs run `docker-compose up`
✅ **Deployment:** Easy to deploy anywhere
✅ **Versioning:** Pin exact versions of all dependencies

**Cons:**
❌ Slight overhead
❌ Learning curve

**Verdict:** ✅ Essential for professional development

---

## ESLint + Prettier

**Why linting and formatting:**

**Pros:**
✅ **Consistency:** Same code style across team
✅ **Catch Bugs:** ESLint finds common mistakes
✅ **Saves Time:** No debates about formatting
✅ **Auto-fix:** Prettier formats on save

**Verdict:** ✅ Non-negotiable for quality code

---

## Jest + React Testing Library

**Why these testing tools:**

**Jest:**
✅ Default for React/Next.js
✅ Fast, parallel test runner
✅ Snapshot testing
✅ Coverage reports

**React Testing Library:**
✅ Test user behavior, not implementation
✅ Encourages accessible components
✅ Integrates with Jest

**Verdict:** ✅ Industry standard for React testing

---

# Third-Party Services

## Sentry (Error Monitoring)

**Alternatives Considered:**
- LogRocket
- Rollbar
- Bugsnag
- CloudWatch Logs (AWS)

### Why Sentry

**Pros:**
✅ **Free Tier:** 5,000 events/month free
✅ **Source Maps:** See exact code where error occurred
✅ **Breadcrumbs:** User actions before error
✅ **Release Tracking:** Know which deploy caused issue
✅ **Performance Monitoring:** Find slow endpoints
✅ **Integrations:** Slack, GitHub, etc.

**Verdict:** ✅ Best-in-class error tracking

---

## UptimeRobot (Uptime Monitoring)

**Alternatives Considered:**
- Pingdom
- StatusCake
- AWS CloudWatch Alarms
- Self-hosted Uptime Kuma

### Why UptimeRobot

**Pros:**
✅ **Free:** 50 monitors free
✅ **Simple:** Just enter URL
✅ **Alerts:** Email, SMS, Slack
✅ **Public Status Page:** Share uptime with users
✅ **Reliable:** Industry standard

**Verdict:** ✅ Free and reliable

---

## Plausible / Google Analytics

**Why Plausible over Google Analytics:**

**Plausible Pros:**
✅ **Privacy-Friendly:** No cookies, GDPR compliant
✅ **Lightweight:** 1KB script vs 45KB (GA)
✅ **Simple:** One dashboard, easy to understand
✅ **Fast:** Doesn't slow down site

**Google Analytics Pros:**
✅ Free
✅ More features (funnels, cohorts)
✅ More integrations

**Verdict:**
- **MVP:** Use Plausible ($9/month) for clean analytics
- **Alternative:** Google Analytics if budget tight

---

# Architecture Diagrams

## System Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ↓
┌─────────────────────────────┐
│  Next.js Frontend (Vercel)  │
│  - React components         │
│  - Tailwind CSS             │
│  - Video player             │
│  - Virtual keyboard         │
└──────┬──────────────────────┘
       │
       ↓
┌─────────────────────────────┐
│  NestJS Backend (AWS EC2)   │
│  - REST API                 │
│  - File upload              │
│  - Job queue (BullMQ)       │
│  - FFmpeg audio extraction  │
└──┬───────┬──────────────────┘
   │       │
   │       ↓
   │  ┌─────────────────────────────┐
   │  │ Python FastAPI (AWS EC2)    │
   │  │ - Audio analysis            │
   │  │ - Pitch detection           │
   │  │ - Chord recognition         │
   │  │ - Key/tempo detection       │
   │  └─────────────────────────────┘
   │
   ↓
┌─────────────────────────────┐
│  Data Layer                 │
│  - Firebase Auth            │
│  - Firestore (metadata)     │
│  - Firebase Storage (files) │
│  - AWS S3 (videos/audio)    │
│  - Redis (job queue)        │
└─────────────────────────────┘
```

---

## Data Flow

```
1. User uploads video
   └→ Frontend → Backend → S3

2. Backend creates job
   └→ BullMQ → Redis

3. Worker picks up job
   └→ Download video → Extract audio → Upload to S3

4. Worker calls AI service
   └→ AI service downloads audio
   └→ Analyzes (pitch, chords, key, tempo)
   └→ Returns JSON result

5. Worker stores results
   └→ Firestore

6. Frontend polls for status
   └→ Gets results → Displays visualization
```

---

# Trade-offs Summary

## What We Chose

| Category | Choice | Why |
|----------|--------|-----|
| Frontend | Next.js + React + Tailwind | Best DX, SEO, deployment |
| Backend | NestJS + BullMQ | Structure, scalability |
| AI Service | Python + FastAPI | ML ecosystem |
| Database | Firestore | Real-time, ease of use |
| Storage | AWS S3 | Cost, reliability |
| Auth | Firebase Auth | Free, simple |
| Payments | Stripe | Best API, features |
| Hosting | Vercel + AWS EC2 | Optimized per service |

---

## What We Avoided

| Technology | Why Not |
|------------|---------|
| Monolith | Hard to scale, one language |
| Serverless AI | Cold starts, model size |
| PostgreSQL (now) | Overkill, more setup |
| Self-hosted everything | Too much DevOps for MVP |
| GraphQL | REST simpler for MVP |
| Kubernetes | Massive overkill |

---

# Cost Estimates

## Monthly Costs (MVP - 100 users, 400 analyses/month)

| Service | Cost | Notes |
|---------|------|-------|
| Vercel | $0 | Free tier (under 100GB bandwidth) |
| AWS EC2 (backend) | $15 | t3.small, 2GB RAM |
| AWS EC2 (AI service) | $30 | t3.medium, 4GB RAM |
| AWS S3 | $5 | 200GB storage, 1TB transfer |
| Firebase (Firestore + Auth) | $0 | Free tier |
| Redis Cloud | $0 | Free tier (30MB) |
| Stripe | $12 | 2.9% + $0.30 per transaction |
| Sentry | $0 | Free tier |
| UptimeRobot | $0 | Free tier |
| Domain | $12/year | soonic.ai |
| **Total** | **~$62/month** | (+ transaction fees) |

## At 1,000 Users ($1,200 MRR)

| Service | Cost | Notes |
|---------|------|-------|
| Vercel | $0 | Still free tier likely |
| AWS EC2 (backend) | $30 | t3.medium or 2x t3.small |
| AWS EC2 (AI service) | $60 | t3.large or 2x t3.medium |
| AWS S3 | $50 | 2TB storage |
| Firebase | $25 | Exceeding free tier |
| Redis Cloud | $10 | Paid plan |
| Stripe | 3% | ~$36 in fees |
| Monitoring | $20 | Upgraded plans |
| **Total** | **~$231/month** | Revenue: $1,200 |

**Gross Margin:** 81% ($969 profit/month)

---

# Future Technology Decisions

## When to Migrate

### PostgreSQL Migration
**When:** 10,000+ users or complex analytics needs
**Why:** Better queries, lower per-read cost
**Plan:** Use Supabase (managed Postgres)

### CDN for Videos
**When:** 1,000+ users
**Why:** Faster video loading globally
**Plan:** AWS CloudFront

### Separate Redis Instance
**When:** 5,000+ jobs/day
**Why:** Better performance, dedicated resources
**Plan:** AWS ElastiCache or Redis Cloud Pro

### Load Balancer
**When:** Need >2 backend instances
**Why:** Distribute traffic
**Plan:** AWS ALB

### Kubernetes
**When:** Never (probably)
**Why:** Complexity not worth it for this scale
**Alternative:** AWS ECS/Fargate if needed

---

# Security Considerations

## Backend Security

✅ **Implemented:**
- Firebase token verification on protected routes
- Input validation with class-validator
- Rate limiting (implement in Sprint 11)
- CORS restrictions
- Signed S3 URLs (time-limited)
- Firestore security rules
- Environment variables for secrets

✅ **Production Checklist:**
- [ ] Enable HTTPS only
- [ ] Set security headers (helmet.js)
- [ ] Rate limit upload endpoint
- [ ] Validate file types server-side
- [ ] Sanitize user inputs
- [ ] Enable CloudWatch logging
- [ ] Set up AWS WAF (optional)

## Frontend Security

✅ **Implemented:**
- No sensitive keys in client code
- Stripe publishable key only (safe to expose)
- Firebase client config (safe to expose)
- XSS prevention (React escapes by default)

## Data Privacy

✅ **GDPR Compliance:**
- [ ] Privacy policy
- [ ] Terms of service
- [ ] User data export (future)
- [ ] User data deletion
- [ ] Cookie consent (if using cookies)

---

# Performance Targets

## Frontend
- Lighthouse Score: 90+
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Bundle Size: < 500KB

## Backend
- API Response: < 500ms (95th percentile)
- Upload Speed: Limited by user bandwidth
- Job Queue Latency: < 1s to start processing

## AI Service
- Analysis Time: < 3 minutes for 5-minute audio
- Accuracy: 70%+ for chord detection
- Memory Usage: < 4GB per analysis

---

# Monitoring Strategy

## Metrics to Track

**Application:**
- Request rate (req/min)
- Error rate (%)
- Response time (p50, p95, p99)
- Active users
- Analyses per day

**Infrastructure:**
- CPU usage (%)
- Memory usage (%)
- Disk usage (%)
- Network I/O
- S3 costs

**Business:**
- Signups per day
- Conversion rate (free → paid)
- Churn rate
- MRR
- Customer acquisition cost

## Alerts

**Critical (wake me up):**
- Service down > 5 min
- Error rate > 10%
- Payment processing failing

**Warning (check in morning):**
- Error rate > 5%
- Response time > 2s
- CPU > 80% for 10 min

---

# Conclusion

These technical decisions prioritize:

1. **Speed to Market:** Managed services, proven tools
2. **Developer Experience:** Modern stack, good docs
3. **Cost Efficiency:** Free tiers, cheap hosting
4. **Scalability:** Can grow to 10,000+ users without rewrite
5. **Flexibility:** Microservices allow swapping components

**No perfect choices exist.** Every decision is a trade-off. These choices optimize for building an MVP in 4 months while maintaining path to scale.

---

**Last Updated:** [Today's date]
**Next Review:** After MVP launch (Month 5)

---

*End of Technical Decisions Document*
