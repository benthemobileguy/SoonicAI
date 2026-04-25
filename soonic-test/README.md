# Soonic AI - Thin Vertical Slice Test Interface

**Purpose:** Validate if users find chord detection useful.

**NOT:** Production application
**IS:** Truth machine to test user reaction

---

## Quick Start (5 minutes)

### Prerequisites
- Python 3.9+
- Docker Desktop (running)
- FFmpeg installed

### 1. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Start Backend Server

```bash
cd backend
python api.py
```

Backend runs at: http://localhost:8000

### 3. Open Frontend

Open `frontend/index.html` in your browser.

---

## Usage

1. Click "Choose File" and select a video or audio file
2. Click "Analyze Chords"
3. Wait 1-2 minutes for processing
4. View detected key and chord progression

---

## What It Does

```
User uploads video/audio
        ↓
FFmpeg extracts audio → WAV
        ↓
basic-pitch detects notes → MIDI
        ↓
Correction Layer analyzes → Chords
        ↓
Display: Key + Chord Timeline
```

---

## File Structure

```
soonic-test/
├── backend/
│   ├── api.py                    # FastAPI server
│   ├── correction_layer_v1.py    # Music intelligence
│   └── requirements.txt
├── frontend/
│   └── index.html                # Simple upload UI
├── uploads/                      # Temporary uploads
├── output/                       # Processing output
└── README.md
```

---

## Testing Instructions

### Test with 2-3 musicians

Ask them:
1. "Does this help you learn the chords?"
2. "Would you use this on YouTube videos?"
3. "What's missing or confusing?"

### Expected Results
- Key detection (e.g., "G minor")
- Chord progression with timestamps
- Confidence scores (✓✓✓ = high, ✓ = low)

---

## Important Notes

⚠️ **This is a test interface, not production code**

- Processing takes 1-2 minutes (Docker startup + AI)
- No authentication or user accounts
- Files stored temporarily, then deleted
- Not optimized for scale or speed

🎯 **Goal:** Answer "Is this useful to musicians?"

---

## Troubleshooting

**"Docker error"**
- Make sure Docker Desktop is running

**"FFmpeg not found"**
- Install: `brew install ffmpeg` (Mac) or `apt install ffmpeg` (Linux)

**"Processing timeout"**
- File may be too long (limit ~5 minutes of audio)

**"No MIDI file generated"**
- basic-pitch may have failed - check Docker logs

---

## Next Steps After Testing

If users say **"Yes, this is helpful"**:
→ Build full application (NestJS + Next.js)

If users say **"Not really useful"**:
→ Fix correction layer, test again

If unsure:
→ Test with more musicians
