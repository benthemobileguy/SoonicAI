# Soonic AI - Complete Implementation Plan
## From Zero to MVP Launch (16 Weeks)

---

## 📋 Overview

This plan takes Soonic AI from empty repository to production MVP in **4 months (16 weeks)**. Each sprint is 1 week with specific deliverables, dependencies, and success criteria.

**MVP Goal:** Users can upload piano videos, get chord analysis within 3 minutes, view results with virtual keyboard visualization, and pay for the service.

---

## 🎯 Success Metrics for MVP Launch

- [ ] Stranger can upload video at soonic.ai without help
- [ ] Analysis completes within 3 minutes for 5-minute video
- [ ] Chord timeline is musically correct (8/10 musicians agree)
- [ ] Virtual keyboard highlights correct keys in real-time
- [ ] Users can sign up and pay $12/month via Stripe
- [ ] At least 10 paying customers
- [ ] 2+ weeks uptime without major outage

---

# SPRINT 0: Setup & Planning (Week 1)

## Objectives
Set up development environment, project structure, and infrastructure accounts.

## Tasks

### Development Environment
- [ ] Install Node.js 20+ and npm/yarn
- [ ] Install Python 3.11+
- [ ] Install FFmpeg for video/audio processing
- [ ] Install Docker and Docker Compose
- [ ] Install Redis locally
- [ ] Set up Git repository and GitHub/GitLab
- [ ] Install VSCode/IDE with ESLint, Prettier, Python extensions

### Project Structure
```
SoonicAI/
├── frontend/          # Next.js application
├── backend/           # NestJS API
├── audio-service/     # Python FastAPI for AI
├── docs/              # Documentation (already exists)
├── docker-compose.yml # Local development
└── README.md          # Setup instructions
```

- [ ] Create monorepo structure with folders above
- [ ] Initialize Git repository with .gitignore
- [ ] Create README.md with project overview

### Infrastructure Accounts
- [ ] Create Firebase project (Authentication, Firestore, Storage)
- [ ] Create AWS account and set up IAM user
- [ ] Create S3 bucket for video/audio storage
- [ ] Set up AWS EC2 for later deployment (can defer to Sprint 15)
- [ ] Create Vercel account for frontend hosting
- [ ] Create Stripe account for payments
- [ ] Set up monitoring: Sentry account, UptimeRobot

### Documentation
- [ ] Create SETUP.md with environment setup instructions
- [ ] Create .env.example files for each service
- [ ] Document architecture diagram (simple text/mermaid)

## Deliverables
- ✅ Complete development environment
- ✅ Repository structure created
- ✅ All infrastructure accounts ready
- ✅ Team can run `git clone` and follow SETUP.md

---

# SPRINT 1: Backend API Foundation (Week 2)

## Objectives
Build the NestJS backend with video upload endpoints and job queue system.

## Tasks

### NestJS Setup
- [ ] Initialize NestJS project in `backend/`
- [ ] Install dependencies: @nestjs/core, @nestjs/common, bullmq, redis, firebase-admin
- [ ] Set up environment variables (.env) for Firebase, AWS, Redis
- [ ] Configure Firebase Admin SDK for server-side auth
- [ ] Set up basic logging with Winston or built-in logger

### Video Upload Module
- [ ] Create `VideoUploadController` with POST /api/upload endpoint
- [ ] Implement file validation (max 500MB, mp4/mov formats)
- [ ] Set up Multer for multipart file uploads
- [ ] Create service to upload video to Firebase Storage or AWS S3
- [ ] Return upload confirmation with video ID

### Job Queue Setup
- [ ] Install and configure BullMQ with Redis
- [ ] Create `video-processing` queue
- [ ] Set up queue event listeners (completed, failed, progress)
- [ ] Create `VideoProcessingService` to handle job lifecycle
- [ ] Implement basic job status endpoint: GET /api/jobs/:jobId

### Database Schema (Firestore)
```
collections:
  videos/
    - id: string
    - userId: string
    - fileName: string
    - fileUrl: string
    - status: 'uploading' | 'processing' | 'completed' | 'failed'
    - uploadedAt: timestamp
    - processedAt: timestamp | null
    - analysisResult: object | null
```

- [ ] Create Firestore service wrapper
- [ ] Implement CRUD operations for video metadata
- [ ] Add Firestore security rules (basic)

### Testing
- [ ] Write unit tests for upload service
- [ ] Write integration test for upload endpoint
- [ ] Test job queue creation and status updates

## Deliverables
- ✅ Working upload API endpoint
- ✅ Videos saved to cloud storage
- ✅ Job queue system operational
- ✅ Basic status tracking in Firestore

---

# SPRINT 2: Audio Extraction & FFmpeg Integration (Week 3)

## Objectives
Extract audio from uploaded videos and prepare for AI analysis.

## Tasks

### FFmpeg Service
- [ ] Create `AudioExtractionService` in backend
- [ ] Implement video → audio extraction (mp4 → wav/mp3)
- [ ] Set output format: 44.1kHz, mono, 16-bit WAV
- [ ] Save extracted audio to S3/Firebase Storage
- [ ] Handle FFmpeg errors gracefully

### Job Queue Worker
- [ ] Create BullMQ worker for `video-processing` queue
- [ ] Implement job processor:
  1. Download video from storage
  2. Extract audio with FFmpeg
  3. Upload audio file
  4. Update job status to 'audio_extracted'
- [ ] Add retry logic (3 attempts with exponential backoff)
- [ ] Log all processing steps

### Processing Pipeline
- [ ] Update video status workflow:
  - `uploading` → `processing` → `audio_extracted` → `analyzing` → `completed`
- [ ] Store audio file URL in Firestore
- [ ] Add processing time tracking

### Error Handling
- [ ] Handle corrupted video files
- [ ] Handle unsupported formats
- [ ] Return user-friendly error messages
- [ ] Clean up temporary files after processing

### Testing
- [ ] Test with various video formats (mp4, mov, avi)
- [ ] Test with different video lengths (30s, 5min, 15min)
- [ ] Test error scenarios (corrupted files, missing codec)
- [ ] Verify audio quality of extracted files

## Deliverables
- ✅ Audio extraction working end-to-end
- ✅ Extracted audio files stored in cloud
- ✅ Job status updates correctly
- ✅ Error handling in place

---

# SPRINT 3: Audio AI Service - Setup (Week 4)

## Objectives
Build Python FastAPI service foundation for audio analysis.

## Tasks

### Python Service Setup
- [ ] Initialize FastAPI project in `audio-service/`
- [ ] Set up virtual environment (venv or poetry)
- [ ] Create requirements.txt with dependencies:
  - fastapi, uvicorn, librosa, essentia-tensorflow, basic-pitch, numpy, pydantic
- [ ] Configure CORS for backend communication
- [ ] Set up environment variables
- [ ] Create Dockerfile for containerization

### API Structure
```
POST /analyze
  - Input: { "audio_url": "https://..." }
  - Output: {
      "key": "C major",
      "tempo": 120,
      "chords": [{"timestamp": 0.5, "chord": "Cmaj7"}]
    }
```

- [ ] Create `/analyze` endpoint
- [ ] Set up request/response models with Pydantic
- [ ] Implement audio file download from URL
- [ ] Add basic error handling and validation

### Audio Loading
- [ ] Create `AudioLoader` class to download and load audio
- [ ] Use librosa to load audio files
- [ ] Convert to mono if stereo
- [ ] Normalize audio levels
- [ ] Handle various audio formats

### Project Structure
```
audio-service/
├── main.py              # FastAPI app
├── routers/
│   └── analysis.py      # Analysis endpoints
├── services/
│   ├── audio_loader.py
│   ├── pitch_detector.py
│   ├── chord_detector.py
│   └── key_detector.py
├── models/
│   └── schemas.py       # Pydantic models
├── requirements.txt
└── Dockerfile
```

### Testing
- [ ] Set up pytest for Python tests
- [ ] Test audio loading from URLs
- [ ] Test API endpoint with mock data
- [ ] Verify response format matches schema

## Deliverables
- ✅ FastAPI service running locally
- ✅ `/analyze` endpoint accessible
- ✅ Audio files can be downloaded and loaded
- ✅ Basic service containerized with Docker

---

# SPRINT 4: Audio AI Service - Core Analysis (Week 5)

## Objectives
Implement pitch detection, chord recognition, key detection, and tempo detection.

## Tasks

### Pitch Detection
- [ ] Install and configure `basic-pitch` model
- [ ] Create `PitchDetector` service
- [ ] Extract MIDI notes from audio with timestamps
- [ ] Convert MIDI to note names (C4, D#5, etc.)
- [ ] Return note events: `[{time: 1.5, pitch: 60, velocity: 0.8}]`

### Chord Detection
- [ ] Create `ChordDetector` service
- [ ] Group simultaneous/overlapping notes into chord frames
- [ ] Implement chord recognition algorithm:
  1. Detect root note
  2. Identify intervals (3rd, 5th, 7th, 9th, 11th, 13th)
  3. Classify chord quality (maj, min, dom7, maj7, etc.)
- [ ] Handle chord extensions (#11, b9, etc.)
- [ ] Output: `[{timestamp: 2.5, chord: "Gmaj9", notes: ["G","B","D","F#","A"]}]`

### Key Detection
- [ ] Use librosa or Essentia for key detection
- [ ] Implement chromagram analysis
- [ ] Return key and mode: `{key: "C", mode: "major"}`
- [ ] Add confidence score

### Tempo Detection
- [ ] Use librosa.beat.beat_track for BPM
- [ ] Return tempo: `{tempo: 120, confidence: 0.92}`

### Music Intelligence Layer
- [ ] Create `HarmonicCorrector` service
- [ ] Implement rules to fix common AI errors:
  - Prefer diatonic chords over exotic ones
  - Smooth chord transitions (V → I more likely than random jumps)
  - Normalize voicings (Cmaj7 regardless of inversion)
- [ ] Add context-aware corrections based on key

### Integration
- [ ] Connect all services in `/analyze` endpoint:
  1. Load audio
  2. Detect pitch
  3. Detect chords
  4. Detect key
  5. Detect tempo
  6. Apply harmonic corrections
  7. Return complete analysis
- [ ] Add processing time logging

### Testing
- [ ] Test with simple piano recordings (single chords)
- [ ] Test with chord progressions (I-IV-V-I)
- [ ] Test with complex jazz/gospel voicings
- [ ] Compare results with manual analysis
- [ ] Aim for 70%+ accuracy on MVP dataset

## Deliverables
- ✅ Complete audio analysis pipeline
- ✅ Chord detection working with extensions
- ✅ Key and tempo detection functional
- ✅ Initial accuracy baseline established

---

# SPRINT 5: Backend ↔ Audio Service Integration (Week 6)

## Objectives
Connect NestJS backend to Python audio service and complete processing pipeline.

## Tasks

### HTTP Client Setup
- [ ] Install axios or node-fetch in backend
- [ ] Create `AudioAnalysisService` in backend
- [ ] Implement POST request to audio-service `/analyze`
- [ ] Handle timeouts (set 3-minute timeout)
- [ ] Handle connection errors and retries

### Job Worker Update
- [ ] Update BullMQ worker to call audio service after audio extraction
- [ ] Pass audio file URL to audio-service
- [ ] Store analysis results in Firestore:
```javascript
analysisResult: {
  key: "C major",
  tempo: 120,
  chords: [
    {timestamp: 0.5, chord: "Cmaj7", notes: ["C","E","G","B"]},
    {timestamp: 2.0, chord: "Am7", notes: ["A","C","E","G"]}
  ]
}
```
- [ ] Update video status to `completed` after successful analysis
- [ ] Handle analysis failures and update status to `failed`

### Progress Tracking
- [ ] Implement progress updates during processing:
  - 10%: Upload complete
  - 30%: Audio extracted
  - 60%: Analysis started
  - 90%: Analysis complete
  - 100%: Results saved
- [ ] Store progress in Firestore
- [ ] Emit real-time updates (optional: use Firebase Realtime DB or websockets)

### API Endpoints
- [ ] GET /api/videos/:videoId - Get video metadata and status
- [ ] GET /api/videos/:videoId/analysis - Get full analysis results
- [ ] GET /api/videos - List user's videos (paginated)
- [ ] DELETE /api/videos/:videoId - Delete video and analysis

### Testing
- [ ] End-to-end test: Upload video → Extract audio → Analyze → Store results
- [ ] Test with 5 different piano videos
- [ ] Verify processing time < 3 minutes
- [ ] Test error scenarios (audio service down, timeout, etc.)

### Docker Compose
- [ ] Create docker-compose.yml for local development:
  - Redis service
  - Backend service
  - Audio service
- [ ] Document how to run full stack locally

## Deliverables
- ✅ Backend fully integrated with audio service
- ✅ Complete video processing pipeline operational
- ✅ Analysis results stored in Firestore
- ✅ Local development environment with Docker Compose

---

# SPRINT 6: Frontend Foundation (Week 7)

## Objectives
Build Next.js frontend with upload page and basic UI.

## Tasks

### Next.js Setup
- [ ] Initialize Next.js 14+ project in `frontend/`
- [ ] Install dependencies: react, tailwindcss, axios, firebase
- [ ] Configure Tailwind CSS
- [ ] Set up environment variables for API URL, Firebase config
- [ ] Configure Next.js API routes (if needed for proxying)

### Design System
- [ ] Set up color palette (primary, secondary, neutral)
- [ ] Configure Tailwind theme with custom colors
- [ ] Create basic components:
  - Button (primary, secondary, disabled states)
  - Input
  - Card
  - Loading spinner
  - Toast notifications
- [ ] Set up typography scale

### Firebase Client Setup
- [ ] Initialize Firebase client SDK
- [ ] Configure Firebase Storage for uploads
- [ ] Set up Firebase Auth (defer login to Sprint 11)

### Upload Page
```
Route: /upload
Features:
- Drag-and-drop zone
- File selection button
- Upload progress bar
- File validation feedback
```

- [ ] Create `/upload` page
- [ ] Implement drag-and-drop file upload with react-dropzone
- [ ] Add file validation (max 500MB, video formats only)
- [ ] Show file preview (thumbnail, name, size)
- [ ] Implement upload to backend API
- [ ] Show upload progress bar
- [ ] Redirect to processing page on success

### Processing Page
```
Route: /processing/:videoId
Features:
- Progress indicator (10% → 100%)
- Status messages ("Extracting audio...", "Analyzing chords...")
- Estimated time remaining
```

- [ ] Create `/processing/:videoId` page
- [ ] Poll backend for job status every 2 seconds
- [ ] Display progress with animated progress bar
- [ ] Show current processing step
- [ ] Redirect to results page when complete
- [ ] Handle errors with retry option

### Landing Page
- [ ] Create simple landing page at `/`
- [ ] Hero section with value proposition
- [ ] "Upload Video" CTA button → /upload
- [ ] Basic footer with links

### Layout & Navigation
- [ ] Create main layout component
- [ ] Add simple header with logo
- [ ] Add responsive navigation
- [ ] Set up route structure

## Deliverables
- ✅ Next.js app running on localhost:3000
- ✅ Upload page functional
- ✅ Processing page shows real-time status
- ✅ Basic UI design system in place

---

# SPRINT 7: Results Page - Video Player (Week 8)

## Objectives
Build results page with video player and basic chord display.

## Tasks

### Results Page Layout
```
Route: /results/:videoId
Layout:
┌─────────────────────────────┐
│  Video Player               │
│  (50% height)               │
├─────────────────────────────┤
│  Chord Timeline             │
│  (30% height)               │
├─────────────────────────────┤
│  Virtual Keyboard           │
│  (20% height)               │
└─────────────────────────────┘
```

- [ ] Create `/results/:videoId` page
- [ ] Fetch video metadata and analysis from backend
- [ ] Set up responsive grid layout
- [ ] Handle loading states
- [ ] Handle error states (video not found, analysis failed)

### Video Player Integration
- [ ] Implement HTML5 video player or use react-player
- [ ] Load video from Firebase Storage/S3
- [ ] Add playback controls (play/pause, seek, volume)
- [ ] Display current timestamp
- [ ] Implement keyboard shortcuts (spacebar = play/pause)

### Playback State Management
- [ ] Create React context or state for:
  - currentTime (updated every 100ms)
  - isPlaying
  - duration
- [ ] Sync state with video player events
- [ ] Expose controls to child components

### Basic Chord Display
- [ ] Display detected key and tempo above video
- [ ] Show current chord name based on video timestamp
- [ ] Update chord in real-time as video plays
- [ ] Style chord display prominently

### Analysis Data Handling
- [ ] Parse analysis JSON from API
- [ ] Convert timestamps to seconds
- [ ] Create utility functions:
  - `getChordAtTime(time)` - returns current chord
  - `getNextChord(time)` - returns upcoming chord
  - `formatChordName(chord)` - formats display text

### Testing
- [ ] Test with analyzed videos
- [ ] Verify video playback smooth
- [ ] Verify chord updates sync with audio
- [ ] Test seeking to different timestamps
- [ ] Test responsive layout on mobile

## Deliverables
- ✅ Results page displays video and analysis
- ✅ Video player works with all controls
- ✅ Current chord displays and updates in real-time
- ✅ Basic usable results interface

---

# SPRINT 8: Chord Timeline Component (Week 9)

## Objectives
Build interactive chord timeline visualization.

## Tasks

### Timeline Component Design
```
[C maj7]  [Am7]  [Dm7]  [G7]  [C maj7]
|---------|------|------|-----|---------|
0s       2s     4s     6s    8s       10s
```

- [ ] Create `ChordTimeline` component
- [ ] Display all chords as horizontal blocks
- [ ] Size blocks proportionally to duration
- [ ] Show chord names inside blocks
- [ ] Add time markers every 5-10 seconds

### Interactivity
- [ ] Highlight current chord as video plays
- [ ] Make chords clickable to seek video to that timestamp
- [ ] Add hover effect to show chord details
- [ ] Show playhead indicator moving along timeline

### Chord Details Modal/Panel
- [ ] Create modal/panel to show chord details on click:
  - Chord name
  - Notes in chord
  - Timestamp
  - Duration
  - (Optional: basic description for now)
- [ ] Add close button
- [ ] Make modal accessible (ESC to close)

### Timeline Scrolling
- [ ] Make timeline horizontally scrollable for long videos
- [ ] Auto-scroll timeline to keep current chord in view
- [ ] Add minimap (optional) for long videos

### Visual Design
- [ ] Color-code chords by type:
  - Major chords: blue
  - Minor chords: purple
  - Dominant chords: orange
  - Diminished/augmented: red
- [ ] Use consistent typography
- [ ] Add smooth animations

### Testing
- [ ] Test with short videos (1 min)
- [ ] Test with long videos (15 min)
- [ ] Test clicking on chords seeks correctly
- [ ] Verify highlight follows playback
- [ ] Test on different screen sizes

## Deliverables
- ✅ Interactive chord timeline component
- ✅ Chords clickable to seek video
- ✅ Current chord highlighted during playback
- ✅ Chord details accessible

---

# SPRINT 9: Virtual Keyboard Visualization - Part 1 (Week 10)

## Objectives
Build static 88-key piano keyboard visualization.

## Tasks

### Keyboard Rendering
- [ ] Create `VirtualKeyboard` component
- [ ] Render 88 keys (A0 to C8) using SVG or Canvas
- [ ] Draw white keys and black keys correctly
- [ ] Label octaves (C1, C2, C3, etc.)
- [ ] Make keyboard responsive to container width

### Key Layout
```
Standard piano layout:
- White keys: C, D, E, F, G, A, B (7 per octave)
- Black keys: C#, D#, F#, G#, A# (5 per octave)
- 88 keys total = 7 octaves + 3 extra keys
```

- [ ] Calculate key positions and dimensions
- [ ] Render keys with proper spacing
- [ ] Add visual hierarchy (black keys on top)
- [ ] Handle edge cases (keyboard start/end)

### Keyboard Component Structure
```javascript
<VirtualKeyboard
  activeNotes={["C4", "E4", "G4"]} // Current notes to highlight
  width={1200}
  height={200}
/>
```

- [ ] Accept `activeNotes` prop (array of note names)
- [ ] Accept size props for responsive design
- [ ] Create Note → Key mapping utility

### Key Highlighting
- [ ] Highlight active keys with distinct color
- [ ] Support multiple simultaneous active keys
- [ ] Add glow/shadow effect for active keys
- [ ] Smooth transition when keys change

### Performance Optimization
- [ ] Optimize rendering (use Canvas if SVG is slow)
- [ ] Memoize keyboard layout calculations
- [ ] Debounce updates to 60fps max

### Testing
- [ ] Test rendering all 88 keys correctly
- [ ] Test highlighting single notes
- [ ] Test highlighting chords (3-5 notes)
- [ ] Verify performance with rapid note changes
- [ ] Test responsive behavior

## Deliverables
- ✅ Virtual keyboard renders correctly
- ✅ Keys highlight when passed as props
- ✅ Performance acceptable (60fps)
- ✅ Responsive design works

---

# SPRINT 10: Virtual Keyboard Visualization - Part 2 (Week 11)

## Objectives
Sync virtual keyboard with video playback and chord analysis.

## Tasks

### Real-Time Note Sync
- [ ] Parse chord data to extract note names
- [ ] Convert note names to MIDI numbers
- [ ] Map MIDI numbers to keyboard keys
- [ ] Update activeNotes based on current video time

### Chord → Notes Conversion
```javascript
// Example:
chord = {timestamp: 2.5, chord: "Cmaj7", notes: ["C4","E4","G4","B4"]}
// Convert to: activeNotes = ["C4","E4","G4","B4"]
```

- [ ] Create utility: `parseNotesFromChord(chord)`
- [ ] Handle different octave representations
- [ ] Support chord voicings across multiple octaves
- [ ] Default to middle octaves if octave not specified

### Playback Integration
- [ ] Subscribe to video currentTime updates
- [ ] Find current chord at playhead position
- [ ] Extract notes from current chord
- [ ] Update VirtualKeyboard activeNotes prop
- [ ] Clear notes when chord changes

### Transitions
- [ ] Add smooth fade out when notes end
- [ ] Add fade in when new notes start
- [ ] Handle overlapping chords gracefully
- [ ] Prevent flickering during transitions

### Controls & Features
- [ ] Add toggle to show/hide keyboard
- [ ] Add option to transpose keyboard view
- [ ] (Optional) Add piano sound on key press

### Edge Cases
- [ ] Handle missing note data gracefully
- [ ] Handle invalid note names
- [ ] Handle chords with >10 notes
- [ ] Handle rapid chord changes

### Testing
- [ ] Test synchronization accuracy (notes match audio)
- [ ] Test with simple progressions (I-IV-V-I)
- [ ] Test with complex jazz/gospel voicings
- [ ] Verify transitions are smooth
- [ ] Test across different browsers

## Deliverables
- ✅ Virtual keyboard fully synced to video playback
- ✅ Notes highlight accurately as music plays
- ✅ Smooth transitions between chords
- ✅ "Wow moment" achieved - users see sound

---

# SPRINT 11: Authentication & User Management (Week 12)

## Objectives
Implement Firebase Authentication and user account system.

## Tasks

### Firebase Auth Setup
- [ ] Configure Firebase Authentication in console
- [ ] Enable Email/Password provider
- [ ] Enable Google OAuth provider
- [ ] Set up OAuth consent screen
- [ ] Configure authorized domains

### Auth Context/State
- [ ] Create AuthContext with React Context API
- [ ] Implement hooks: `useAuth()`, `useUser()`
- [ ] Store user state: `{id, email, displayName, photoURL}`
- [ ] Handle auth state persistence
- [ ] Listen to Firebase auth state changes

### Sign Up Page
- [ ] Create `/signup` page
- [ ] Email + password form
- [ ] Password validation (min 8 chars)
- [ ] "Sign up with Google" button
- [ ] Link to login page
- [ ] Handle errors (email already exists, etc.)

### Login Page
- [ ] Create `/login` page
- [ ] Email + password form
- [ ] "Login with Google" button
- [ ] "Forgot password" link
- [ ] Link to signup page
- [ ] Redirect to dashboard after login

### Password Reset
- [ ] Create `/forgot-password` page
- [ ] Send password reset email via Firebase
- [ ] Show confirmation message
- [ ] Handle errors gracefully

### Protected Routes
- [ ] Create ProtectedRoute wrapper component
- [ ] Redirect unauthenticated users to /login
- [ ] Allow unauthenticated upload (store temp video)
- [ ] Prompt for login after first analysis completes

### User Dashboard
- [ ] Create `/dashboard` page
- [ ] Display user's analyzed videos (list view)
- [ ] Show video thumbnail, title, upload date, status
- [ ] Link to results page for each video
- [ ] Show usage stats (analyses used / limit)

### Backend Auth Middleware
- [ ] Verify Firebase ID tokens in backend
- [ ] Create AuthGuard middleware for protected endpoints
- [ ] Associate videos with userId
- [ ] Filter videos by userId in list endpoints

### Profile Page
- [ ] Create `/profile` page
- [ ] Display user email, name
- [ ] Allow profile updates (display name, photo)
- [ ] Add logout button

### Testing
- [ ] Test signup flow (email + Google)
- [ ] Test login flow
- [ ] Test password reset
- [ ] Test protected route redirects
- [ ] Test token verification in backend
- [ ] Test logout clears state

## Deliverables
- ✅ Complete authentication system
- ✅ Users can sign up and log in
- ✅ Protected routes functional
- ✅ User dashboard shows videos
- ✅ Backend validates auth tokens

---

# SPRINT 12: Usage Limits & Free Tier (Week 13)

## Objectives
Implement free tier limits (3 analyses) and usage tracking.

## Tasks

### Database Schema Update
```
users/ collection in Firestore:
  - userId: string
  - email: string
  - createdAt: timestamp
  - plan: 'free' | 'payAsYouGo' | 'pro'
  - analysesUsed: number
  - analysesLimit: number (3 for free, null for pro)
  - stripeCustomerId: string | null
```

- [ ] Create users collection in Firestore
- [ ] Create user document on first signup
- [ ] Set default plan to 'free' with 3 analysis limit
- [ ] Add Firestore security rules for users collection

### Usage Tracking
- [ ] Increment `analysesUsed` when video analysis completes
- [ ] Check usage before allowing new uploads
- [ ] Display usage in dashboard: "2 / 3 analyses used"
- [ ] Show progress bar for usage

### Limit Enforcement
- [ ] Block upload if user reached limit
- [ ] Show paywall modal: "You've used all 3 free analyses"
- [ ] Offer two options:
  1. Pay $2.50 for one analysis (Pay-as-you-go)
  2. Subscribe to Pro for $12/month (unlimited)
- [ ] Disable upload button when limit reached

### Paywall Modal Component
- [ ] Create PaywallModal component
- [ ] Show current usage and limit
- [ ] Display pricing options side-by-side
- [ ] Add "Choose Plan" buttons
- [ ] Link to pricing page

### Pricing Page
- [ ] Create `/pricing` page
- [ ] Display all tiers:
  - Free: 3 analyses, $0
  - Pay-as-you-go: $2.50 per analysis
  - Pro: Unlimited, $12/month (or $120/year)
- [ ] Highlight Pro plan as recommended
- [ ] Add feature comparison table
- [ ] Add FAQ section
- [ ] Add "Start Free" and "Subscribe" CTAs

### Backend Validation
- [ ] Create middleware to check usage limits
- [ ] Return 402 Payment Required if limit exceeded
- [ ] Include upgrade URL in error response

### Testing
- [ ] Create test user and upload 3 videos
- [ ] Verify 4th upload blocked
- [ ] Test paywall modal appears
- [ ] Test usage counter updates correctly
- [ ] Test Pro users have unlimited access

## Deliverables
- ✅ Free tier limited to 3 analyses
- ✅ Usage tracking functional
- ✅ Paywall modal shown when limit reached
- ✅ Pricing page complete

---

# SPRINT 13: Stripe Payment Integration - Pay-As-You-Go (Week 14)

## Objectives
Implement Stripe checkout for $2.50 one-time payments.

## Tasks

### Stripe Setup
- [ ] Install Stripe dependencies: stripe (backend), @stripe/stripe-js (frontend)
- [ ] Add Stripe API keys to environment variables
- [ ] Initialize Stripe in backend
- [ ] Create Stripe webhook endpoint

### Backend Payment Endpoints
- [ ] POST /api/payments/create-checkout-session
  - Create Stripe checkout session for $2.50
  - Set mode to 'payment' (one-time)
  - Include metadata: {userId, type: 'payAsYouGo'}
  - Return checkout URL
- [ ] POST /api/webhooks/stripe
  - Verify webhook signature
  - Handle `checkout.session.completed` event
  - Increment user's analysesLimit by 1
  - Store payment record in Firestore

### Payment Records Schema
```
payments/ collection:
  - id: string
  - userId: string
  - amount: number
  - currency: 'usd'
  - type: 'payAsYouGo' | 'subscription'
  - stripePaymentId: string
  - status: 'pending' | 'completed' | 'failed'
  - createdAt: timestamp
```

- [ ] Create payments collection
- [ ] Store payment on webhook success
- [ ] Link payment to user

### Frontend Checkout Flow
- [ ] Add "Pay $2.50" button in paywall modal
- [ ] Call backend to create checkout session
- [ ] Redirect to Stripe Checkout
- [ ] Handle success redirect to /dashboard?payment=success
- [ ] Handle cancel redirect to /dashboard?payment=cancel
- [ ] Show success message after payment

### Success Handling
- [ ] Show toast notification: "Payment successful! You now have 1 more analysis."
- [ ] Refresh user data to reflect new limit
- [ ] Enable upload button

### Testing
- [ ] Test checkout flow with Stripe test mode
- [ ] Use test card: 4242 4242 4242 4242
- [ ] Verify webhook received and processed
- [ ] Verify user's limit incremented
- [ ] Test failed payments
- [ ] Test duplicate webhook prevention

## Deliverables
- ✅ Pay-as-you-go checkout functional
- ✅ $2.50 payment adds 1 analysis credit
- ✅ Webhook handling robust
- ✅ Payment records stored

---

# SPRINT 14: Stripe Payment Integration - Pro Subscription (Week 15)

## Objectives
Implement Stripe subscriptions for Pro plan ($12-15/month).

## Tasks

### Stripe Product Setup
- [ ] Create Product in Stripe Dashboard: "Soonic AI Pro"
- [ ] Create Price: $12/month recurring
- [ ] Create Price: $120/year recurring (optional, 17% discount)
- [ ] Get price IDs for backend

### Subscription Endpoints
- [ ] POST /api/subscriptions/create-checkout-session
  - Create Stripe checkout session for subscription
  - Set mode to 'subscription'
  - Include metadata: {userId, plan: 'pro'}
  - Return checkout URL
- [ ] GET /api/subscriptions/portal
  - Create customer portal session
  - Return portal URL (for managing subscription)

### Webhook Handling for Subscriptions
- [ ] Handle `customer.subscription.created` event
  - Update user plan to 'pro'
  - Set analysesLimit to null (unlimited)
  - Store Stripe subscription ID
- [ ] Handle `customer.subscription.updated` event
  - Handle plan changes
- [ ] Handle `customer.subscription.deleted` event
  - Downgrade user to free plan
  - Set analysesLimit to 3
  - Keep analysesUsed as-is (don't reset)

### User Schema Update
```
users/:
  - subscriptionId: string | null
  - subscriptionStatus: 'active' | 'canceled' | 'past_due' | null
  - subscriptionCurrentPeriodEnd: timestamp | null
```

### Frontend Subscription Flow
- [ ] Add "Subscribe to Pro - $12/month" button in paywall
- [ ] Add "Subscribe" button on /pricing page
- [ ] Redirect to Stripe Checkout
- [ ] Handle success: redirect to /dashboard?subscribed=true
- [ ] Show success message and confetti animation (optional)

### Subscription Management
- [ ] Add "Manage Subscription" button in /profile or /dashboard
- [ ] Link to Stripe Customer Portal
- [ ] Allow users to:
  - Cancel subscription
  - Update payment method
  - View invoices

### Pro User Experience
- [ ] Remove usage limits for Pro users
- [ ] Show "Pro" badge in dashboard
- [ ] Hide paywall modal
- [ ] Show "Unlimited analyses" in dashboard

### Testing
- [ ] Test subscription checkout
- [ ] Test subscription activation via webhook
- [ ] Test subscription cancellation
- [ ] Verify Pro users have unlimited uploads
- [ ] Test failed payment scenarios
- [ ] Test reactivation after cancellation

## Deliverables
- ✅ Pro subscription checkout functional
- ✅ Subscriptions update user plan correctly
- ✅ Pro users have unlimited analyses
- ✅ Customer portal accessible
- ✅ Subscription lifecycle handled

---

# SPRINT 15: Testing, Bug Fixes & Polish (Week 16)

## Objectives
End-to-end testing, bug fixes, performance optimization, and UI polish.

## Tasks

### End-to-End Testing
- [ ] Create test checklist for full user journey:
  1. Sign up
  2. Upload video
  3. Wait for processing
  4. View results with keyboard visualization
  5. Hit free tier limit
  6. Purchase pay-as-you-go
  7. Upload again
  8. Subscribe to Pro
- [ ] Test on multiple browsers (Chrome, Firefox, Safari)
- [ ] Test on mobile devices
- [ ] Record bugs and create issues

### Bug Fixes
- [ ] Fix all critical bugs (crashes, data loss)
- [ ] Fix high-priority bugs (broken features)
- [ ] Fix UI/UX issues (confusing flows, poor feedback)
- [ ] Prioritize bugs by severity

### Performance Optimization
- [ ] Optimize video upload speed
- [ ] Reduce processing time (target < 3 min for 5-min video)
- [ ] Optimize frontend bundle size
- [ ] Lazy load heavy components
- [ ] Add loading skeletons
- [ ] Optimize images and assets

### UI Polish
- [ ] Improve error messages (user-friendly language)
- [ ] Add loading animations
- [ ] Improve empty states (no videos yet, etc.)
- [ ] Add tooltips for unclear features
- [ ] Improve mobile responsiveness
- [ ] Fix visual bugs (alignment, spacing, colors)

### Accessibility
- [ ] Add alt text to images
- [ ] Ensure keyboard navigation works
- [ ] Add ARIA labels
- [ ] Test with screen reader
- [ ] Ensure color contrast meets WCAG AA

### Analytics Setup
- [ ] Add Google Analytics or Plausible
- [ ] Track key events:
  - Sign ups
  - Video uploads
  - Analyses completed
  - Payments (pay-as-you-go, subscriptions)
  - Churn events
- [ ] Set up conversion funnels

### Documentation
- [ ] Write user guide (How to use Soonic AI)
- [ ] Create FAQ page
- [ ] Document common issues and solutions
- [ ] Add terms of service and privacy policy (critical for payments)

### Security Review
- [ ] Review Firestore security rules
- [ ] Ensure all API endpoints validate auth
- [ ] Check for XSS vulnerabilities
- [ ] Validate all user inputs
- [ ] Rate limit upload endpoints
- [ ] Sanitize file uploads

## Deliverables
- ✅ All critical bugs fixed
- ✅ Performance targets met
- ✅ UI polished and professional
- ✅ Analytics tracking key metrics
- ✅ Security hardened

---

# SPRINT 16: Deployment & Launch Preparation (Week 17)

## Objectives
Deploy to production and prepare for public launch.

## Tasks

### Domain Setup
- [ ] Purchase domain (soonic.ai)
- [ ] Configure DNS records
- [ ] Set up SSL certificates

### Frontend Deployment (Vercel)
- [ ] Connect GitHub repo to Vercel
- [ ] Configure environment variables in Vercel
- [ ] Set up production and preview deployments
- [ ] Configure custom domain
- [ ] Test production build

### Backend Deployment (AWS EC2)
- [ ] Launch EC2 instance (t3.small or t3.medium)
- [ ] Install Node.js, Redis, FFmpeg, Docker
- [ ] Clone repository and install dependencies
- [ ] Configure environment variables
- [ ] Set up PM2 or systemd for process management
- [ ] Configure nginx as reverse proxy
- [ ] Set up SSL with Let's Encrypt
- [ ] Open required ports (80, 443, API port)

### Audio Service Deployment (AWS EC2)
- [ ] Launch separate EC2 instance (t3.medium or t3.large)
- [ ] Install Python, Docker
- [ ] Clone repository and install dependencies
- [ ] Configure environment variables
- [ ] Set up PM2/systemd for FastAPI service
- [ ] Configure nginx
- [ ] Set up SSL

### Database & Storage
- [ ] Verify Firebase Firestore production mode
- [ ] Configure Firestore indexes
- [ ] Review and tighten security rules
- [ ] Configure Firebase Storage buckets
- [ ] Set up AWS S3 bucket for videos
- [ ] Configure S3 bucket policies and CORS

### Monitoring & Logging
- [ ] Set up Sentry for error tracking
- [ ] Configure Sentry in frontend and backend
- [ ] Set up UptimeRobot for uptime monitoring
- [ ] Configure log aggregation (CloudWatch, Loggly, etc.)
- [ ] Set up alerts for errors and downtime

### Stripe Production Mode
- [ ] Switch Stripe keys to production
- [ ] Test payment flow in production
- [ ] Configure webhook endpoint with production URL
- [ ] Verify webhook signatures

### Pre-Launch Checklist
- [ ] Test complete user flow in production
- [ ] Verify payments work (real credit card)
- [ ] Check all environment variables set correctly
- [ ] Verify SSL certificates valid
- [ ] Test from multiple devices and networks
- [ ] Verify email notifications work (if any)
- [ ] Check analytics tracking works
- [ ] Review terms of service live
- [ ] Test password reset flow
- [ ] Verify OAuth redirect URLs correct

### Backup & Recovery
- [ ] Set up automated Firestore backups
- [ ] Document backup/restore procedures
- [ ] Create disaster recovery plan
- [ ] Store credentials securely (1Password, etc.)

### Soft Launch
- [ ] Launch to small group (10-20 beta users)
- [ ] Collect feedback
- [ ] Monitor errors and performance
- [ ] Fix any critical issues
- [ ] Iterate based on feedback

## Deliverables
- ✅ Frontend live at soonic.ai
- ✅ Backend and audio service deployed
- ✅ All production services configured
- ✅ Monitoring and alerts active
- ✅ Ready for public launch

---

# POST-LAUNCH: Marketing & Growth (Ongoing)

## First 30 Days After Launch

### User Acquisition
- [ ] Launch on Product Hunt
- [ ] Post in music production subreddits (r/piano, r/musictheory, r/worship)
- [ ] Share in Facebook groups (church musicians, gospel pianists)
- [ ] Post in WhatsApp musician communities
- [ ] Reach out to music YouTubers for reviews
- [ ] Create demo video showing value proposition

### Content Marketing
- [ ] Write blog post: "How Soonic AI helps you learn chord progressions"
- [ ] Create tutorial videos (YouTube, TikTok)
- [ ] Share before/after examples on social media
- [ ] Write SEO-optimized content

### Metrics to Track
- Daily active users (DAU)
- Weekly active users (WAU)
- Sign-up conversion rate
- Free → Paid conversion rate
- Average analyses per user
- Churn rate
- Processing success rate
- Average processing time
- Customer acquisition cost (CAC)
- Lifetime value (LTV)

### Goals for Month 1
- 100 sign-ups
- 10 paying customers
- $120-150 MRR (Monthly Recurring Revenue)
- 70%+ analysis accuracy
- < 3 min processing time
- 99% uptime

---

# PHASE 2 PREVIEW (Months 5-8)

After MVP launch and initial traction, next features to build:

## Sprint 17-20: Enhanced Features
- [ ] Detailed chord explanations with music theory context
- [ ] Slow playback mode (0.5x, 0.75x speed)
- [ ] Loop sections of video
- [ ] Scale/mode detection
- [ ] Modulation detection
- [ ] Shareable analysis links (public/private)
- [ ] Improved chord accuracy on complex voicings

## Sprint 21-24: Relative Pitch Training
- [ ] Exercise builder from analyzed videos
- [ ] Interval recognition drills
- [ ] Chord quality recognition
- [ ] Progression pattern training
- [ ] Progress tracking and analytics
- [ ] Adaptive difficulty

---

# APPENDIX: Technical Decisions & Trade-offs

## Why NestJS for Backend?
- Structured, scalable architecture
- Built-in dependency injection
- TypeScript support
- Easy to test
- Good documentation

## Why FastAPI for Audio Service?
- Python ecosystem for audio/ML libraries
- Fast, async performance
- Automatic API documentation
- Easy to containerize
- Separate from main app for scalability

## Why Firebase + AWS?
- Firebase: Fast to implement auth, real-time updates, easy SDKs
- AWS S3: Cheaper storage for large video files
- Hybrid approach: Best of both worlds

## Why Stripe?
- Industry standard for payments
- Easy integration
- Handles PCI compliance
- Subscription management built-in
- Good developer experience

## Why Vercel for Frontend?
- Zero-config Next.js deployment
- Excellent DX (developer experience)
- Free SSL, CDN, preview deployments
- Automatic scaling

---

# RISK MITIGATION

## Top Risks & Mitigation Strategies

### 1. Audio Analysis Accuracy Too Low
**Risk:** Chord detection < 60% accurate, users lose trust
**Mitigation:**
- Test with diverse piano recordings early (Sprint 4-5)
- Build music intelligence correction layer
- Allow users to report incorrect chords
- Iterate on model with user feedback

### 2. Processing Takes Too Long
**Risk:** Processing > 5 minutes, users abandon
**Mitigation:**
- Optimize audio processing pipeline
- Use faster EC2 instances (GPU if needed)
- Show engaging progress indicators
- Parallelize processing steps where possible

### 3. Server Costs Too High
**Risk:** AWS bills exceed revenue
**Mitigation:**
- Start with smaller EC2 instances
- Implement auto-scaling carefully
- Monitor costs weekly
- Optimize video storage (compression, expiration)
- Use spot instances for audio processing

### 4. No One Pays
**Risk:** Users love free tier, won't convert
**Mitigation:**
- Make free tier genuinely valuable (3 analyses)
- Make paywall timing strategic (after first "wow")
- Offer compelling Pro benefits
- Test pricing with early users
- Implement aggressive onboarding

### 5. Technical Complexity Delays Launch
**Risk:** MVP takes > 4 months
**Mitigation:**
- Cut scope aggressively if behind schedule
- Defer nice-to-have features to Phase 2
- Use managed services (Firebase, Vercel) to save time
- Focus on core value: chord detection + visualization

---

# SUCCESS CRITERIA

## MVP is successful if (within 60 days of launch):
1. ✅ 100+ sign-ups
2. ✅ 10+ paying customers ($120+ MRR)
3. ✅ 70%+ chord accuracy (user-reported)
4. ✅ < 3 min processing time (avg)
5. ✅ 40%+ Day 7 retention
6. ✅ < 1 hour downtime/week

If these metrics are hit, proceed with Phase 2. If not, iterate on MVP core value before adding features.

---

# RESOURCES & REFERENCES

## Documentation to Review
- Next.js: https://nextjs.org/docs
- NestJS: https://docs.nestjs.com
- FastAPI: https://fastapi.tiangolo.com
- Firebase: https://firebase.google.com/docs
- Stripe: https://stripe.com/docs
- librosa: https://librosa.org/doc
- Basic Pitch: https://github.com/spotify/basic-pitch

## Tools & Services
- Figma (design mockups)
- Postman (API testing)
- GitHub (version control)
- Linear/Jira (project management)
- Sentry (error monitoring)
- Plausible/Google Analytics (analytics)

---

**END OF IMPLEMENTATION PLAN**

**Next Steps:**
1. Review this plan with team
2. Set up Sprint 0 immediately
3. Adjust timeline based on team capacity
4. Begin execution!

**Questions or need clarification on any sprint?** Let's build Soonic AI! 🎹🎵
