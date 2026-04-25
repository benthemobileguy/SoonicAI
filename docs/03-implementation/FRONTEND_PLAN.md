# Soonic AI - Frontend Plan (Simple & Focused)

**Last Updated:** 2026-04-24
**Tech Stack:** Next.js 15 + TypeScript + Tailwind CSS
**Timeline:** 10-12 days
**Backend:** Existing FastAPI (port 8000) - NO CHANGES NEEDED

---

## 🎯 Core Philosophy

**BUILD:**
- Clean upload → results flow
- Virtual keyboard (the "wow" feature)
- Video playback with chord sync
- Beautiful, simple UI

**DON'T BUILD (YET):**
- ❌ User accounts
- ❌ Authentication
- ❌ Payments
- ❌ Database
- ❌ User dashboard
- ❌ Video history

**Why?** Get users USING it first. Add complexity later.

---

## 🏗️ Architecture (Simple)

```
┌──────────────────────────────────────┐
│   Next.js Frontend (Port 3000)       │
│                                       │
│   ┌─────────┐  ┌──────────┐         │
│   │  Upload │  │ Results  │         │
│   │  Page   │→ │  Page    │         │
│   └─────────┘  └──────────┘         │
│                     ↓                 │
│              ┌──────────────┐        │
│              │   Virtual    │        │
│              │   Keyboard   │        │
│              └──────────────┘        │
└──────────────────────────────────────┘
                    ↓
              [HTTP POST]
                    ↓
┌──────────────────────────────────────┐
│   FastAPI Backend (Port 8000)        │
│   (ALREADY EXISTS - NO CHANGES)      │
│                                       │
│   POST /analyze                      │
│   - Receives video                   │
│   - Runs correction layer            │
│   - Returns chords                   │
└──────────────────────────────────────┘
```

**That's it. No backend changes. No infrastructure.**

---

## 📂 Project Structure

```
frontend/
├── app/
│   ├── page.tsx                 # Homepage (upload interface)
│   ├── results/
│   │   └── [id]/
│   │       └── page.tsx         # Results page
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
│
├── components/
│   ├── upload/
│   │   ├── UploadZone.tsx       # Drag & drop upload
│   │   ├── UploadProgress.tsx   # Upload progress bar
│   │   └── VideoPreview.tsx     # Video preview
│   │
│   ├── results/
│   │   ├── ChordTimeline.tsx    # Chord progression display
│   │   ├── VideoPlayer.tsx      # Video playback
│   │   └── HandSeparation.tsx   # Left/right hand stats
│   │
│   └── keyboard/
│       ├── VirtualKeyboard.tsx  # Piano keyboard component
│       └── KeyHighlight.tsx     # Key highlighting logic
│
├── lib/
│   ├── api.ts                   # API calls to FastAPI
│   ├── types.ts                 # TypeScript types
│   └── utils.ts                 # Helper functions
│
├── public/
│   └── (images, fonts, etc.)
│
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

---

## 📄 Pages (Only 2 Pages)

### 1. Homepage (`/`)

**Purpose:** Upload video

**What it shows:**
- Hero section with tagline
- Upload zone (drag & drop or click)
- "How it works" (3 steps)
- Example video/demo

**User flow:**
1. User lands on page
2. Drags video or clicks to select
3. Video uploads → Shows progress
4. Redirects to `/results/[id]`

**No auth. No signup. Just upload and go.**

---

### 2. Results Page (`/results/[id]`)

**Purpose:** Show chord analysis results

**What it shows:**
- Video player (uploaded video)
- Detected key & tempo
- Chord timeline (scrollable)
- Virtual keyboard (synced to video)
- Left hand / Right hand stats
- Download results (optional)

**User flow:**
1. Video finishes processing
2. Shows results immediately
3. User plays video → keyboard lights up
4. User learns chords

**No login required. Just works.**

---

## 🎨 Core Components

### 1. UploadZone Component

**File:** `components/upload/UploadZone.tsx`

**Features:**
- Drag and drop area
- Click to select file
- File validation (mp4, mov, max 500MB)
- Preview thumbnail
- Upload progress bar

**State:**
```typescript
const [file, setFile] = useState<File | null>(null);
const [uploading, setUploading] = useState(false);
const [progress, setProgress] = useState(0);
const [videoId, setVideoId] = useState<string | null>(null);
```

**API Call:**
```typescript
const uploadVideo = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('http://localhost:8000/analyze', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  // Redirect to results page
  router.push(`/results/${data.session_id}`);
};
```

---

### 2. ChordTimeline Component

**File:** `components/results/ChordTimeline.tsx`

**Features:**
- Shows chord progression in timeline
- Click chord → jump to that time in video
- Highlight current chord while video plays
- Shows confidence score
- Color-coded by hand (left/right)

**Data structure:**
```typescript
interface Chord {
  time: number;
  chord: string;
  notes: string[];
  confidence: number;
  hand: 'left' | 'right';
}
```

**Visual:**
```
0s    2s    4s    6s    8s
├─────┼─────┼─────┼─────┤
Cmaj7 Gmaj9 Em7   Amaj7
✓✓✓   ✓✓    ✓✓✓   ✓✓
```

---

### 3. VirtualKeyboard Component ⭐ (Critical Feature)

**File:** `components/keyboard/VirtualKeyboard.tsx`

**This is the "wow" feature that makes users want to pay.**

**Features:**
- 88-key piano keyboard (C1 to C8)
- Highlights keys for current chord
- Syncs with video playback
- Shows note names on keys
- Smooth transitions between chords
- Works on mobile (scrollable)

**Visual:**
```
Piano keyboard showing:
[C][D][E][F][G][A][B][C][D][E]...
 ●       ●       ●   ●
(highlighted keys = notes in current chord)
```

**Implementation:**
```typescript
const VirtualKeyboard = ({ currentChord }: Props) => {
  const chordToKeys = {
    'Cmaj7': ['C4', 'E4', 'G4', 'B4'],
    'Gmaj9': ['G3', 'B3', 'D4', 'F#4', 'A4'],
    // ... all chords
  };

  const activeKeys = chordToKeys[currentChord.chord] || [];

  return (
    <div className="keyboard">
      {allKeys.map(key => (
        <Key
          note={key}
          isActive={activeKeys.includes(key)}
        />
      ))}
    </div>
  );
};
```

---

### 4. VideoPlayer Component

**File:** `components/results/VideoPlayer.tsx`

**Features:**
- Plays uploaded video
- Shows current time
- Emits time updates → syncs keyboard
- Play/pause controls
- Seek bar

**Uses:**
- HTML5 `<video>` element (simple)
- OR React Player library (if needed)

**State sync:**
```typescript
const [currentTime, setCurrentTime] = useState(0);

const handleTimeUpdate = (time: number) => {
  setCurrentTime(time);
  // Find current chord based on time
  const chord = findChordAtTime(chords, time);
  setCurrentChord(chord);
};
```

---

## 🎨 UI Design (Simple & Clean)

### Design Principles:
- **Minimalist:** No clutter
- **Fast:** Loads quickly
- **Clear:** Obvious what to do
- **Mobile-friendly:** Works on phone/tablet

### Color Scheme:
- Primary: Blue/Purple (music vibes)
- Background: Dark mode friendly
- Accent: Green for success states
- Text: High contrast for readability

### Typography:
- Headings: Inter or DM Sans (clean, modern)
- Body: System font stack (fast load)
- Code/chords: Monospace

---

## 📊 Data Flow

### Upload Flow:
```
1. User selects video
   ↓
2. Frontend validates (size, type)
   ↓
3. POST to FastAPI /analyze
   ↓
4. FastAPI processes (1-2 min)
   ↓
5. Returns analysis result
   ↓
6. Frontend shows results
```

### Results Flow:
```
1. Load results from API response
   ↓
2. Parse chords, key, tempo
   ↓
3. Render video player
   ↓
4. Render chord timeline
   ↓
5. Render virtual keyboard
   ↓
6. Sync all on video play
```

---

## 🔌 API Integration

### Single API Call (to existing FastAPI):

```typescript
// lib/api.ts

export const analyzeVideo = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('http://localhost:8000/analyze', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Analysis failed');
  }

  return await response.json();
};

export interface AnalysisResult {
  session_id: string;
  detected_key: string;
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
}
```

**That's it. One API call. No complex state management.**

---

## 🛠️ Tech Stack Details

### Core:
- **Next.js 15** (App Router)
- **TypeScript** (type safety)
- **Tailwind CSS** (styling)

### Libraries (Minimal):
```json
{
  "dependencies": {
    "next": "15.0.0",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "typescript": "5.6.0",
    "tailwindcss": "3.4.0",

    // Optional (only if needed):
    "framer-motion": "^11.0.0",  // Animations
    "react-player": "^2.16.0",   // Video player (if HTML5 not enough)
    "lucide-react": "^0.400.0"   // Icons
  }
}
```

**No Redux. No Zustand. No complex state management.**

Just React hooks (`useState`, `useEffect`).

---

## 📅 Build Timeline (10-12 Days)

### Days 1-2: Project Setup
- [ ] Initialize Next.js project
- [ ] Set up Tailwind CSS
- [ ] Create basic layout
- [ ] Set up TypeScript types

### Days 3-4: Upload Page
- [ ] Build UploadZone component
- [ ] File validation
- [ ] Upload progress UI
- [ ] Test API integration

### Days 5-6: Results Page Foundation
- [ ] Build results page layout
- [ ] Video player component
- [ ] Chord timeline component
- [ ] Test with sample data

### Days 7-9: Virtual Keyboard ⭐
- [ ] Build keyboard component (88 keys)
- [ ] Chord → keys mapping
- [ ] Sync with video playback
- [ ] Smooth animations
- [ ] Mobile responsive

### Days 10-11: Polish & Testing
- [ ] Error states
- [ ] Loading states
- [ ] Mobile responsiveness
- [ ] Cross-browser testing
- [ ] Performance optimization

### Day 12: Final Testing
- [ ] End-to-end test with real videos
- [ ] Fix any bugs
- [ ] Deploy to Vercel

---

## 🎯 MVP Feature Checklist

### Must Have (Week 1-2):
- [ ] Upload video (drag & drop)
- [ ] Show processing status
- [ ] Display chord results
- [ ] Virtual keyboard with highlighting
- [ ] Video playback
- [ ] Chord → video sync
- [ ] Mobile responsive

### Nice to Have (Phase 2):
- [ ] Share results link
- [ ] Download chord sheet
- [ ] Dark mode toggle
- [ ] Keyboard shortcuts
- [ ] Tutorial/onboarding

### Not Building Yet:
- ❌ User accounts
- ❌ Save history
- ❌ Payments
- ❌ Multi-video upload

---

## 🚀 Deployment (Vercel - 1 Click)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Done!
```

**Environment Variables:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000  # Dev
NEXT_PUBLIC_API_URL=https://api.soonic.ai  # Prod
```

---

## ✅ Success Criteria

**Frontend is done when:**
- [ ] Can upload video easily
- [ ] Shows processing status clearly
- [ ] Displays chords beautifully
- [ ] Virtual keyboard syncs perfectly
- [ ] Works on mobile
- [ ] Loads fast (< 2s)
- [ ] No errors with real videos
- [ ] You can demo it to a musician

---

## 💡 Key Insights

### What Makes This Different:
1. **Virtual Keyboard** - Nobody else has this for chord learning
2. **Hand Separation** - Shows left vs right hand clearly
3. **Simple UX** - No signup, just upload and learn

### What Makes This Work:
1. **Simple stack** - Just Next.js + FastAPI
2. **No auth** - Remove friction
3. **Fast** - Results in 1-2 minutes
4. **Visual** - Keyboard makes it click

---

## 🎬 Next Steps

### To Start Building:

1. **Create Next.js Project**
```bash
npx create-next-app@latest soonic-frontend --typescript --tailwind --app
cd soonic-frontend
npm run dev
```

2. **Create Basic Structure**
- Set up folder structure
- Create layout
- Build upload page

3. **Connect to FastAPI**
- Test API call
- Handle response
- Show results

**Ready to build?**

Let me know and I'll help you build the frontend step-by-step!

---

**Related Docs:**
- [CURRENT_STATUS.md](./CURRENT_STATUS.md) - Project status
- [STRATEGIC_REALITY_CHECK.md](./STRATEGIC_REALITY_CHECK.md) - Product philosophy
