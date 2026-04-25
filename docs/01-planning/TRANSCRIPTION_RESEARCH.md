# Music Transcription Research 2026
## Comparing Basic Pitch vs Alternatives for Gospel/Jazz Piano

**Research Date:** April 2026
**Focus:** Chord detection, piano transcription, gospel/jazz accuracy

---

## 🎯 EXECUTIVE SUMMARY

**Is Basic Pitch the best?**
**Answer:** No - there are better alternatives for chord-specific and piano-specific transcription in 2026.

**Key Finding:** Basic Pitch is excellent for general note transcription but NOT optimized for:
- Chord detection specifically
- Gospel/jazz complex harmonies
- Piano-specific voicings

---

## 📊 BASIC PITCH (Your Current Tool)

**Source:** [Spotify Basic Pitch](https://github.com/spotify/basic-pitch)

**Strengths:**
- ✅ Lightweight and fast
- ✅ Open source and free
- ✅ Good general multi-pitch detection
- ✅ Works best on one instrument at a time
- ✅ Competes with much larger AMT systems

**Limitations:**
- ❌ Not chord-aware (detects notes, not chords)
- ❌ No context about key or harmony
- ❌ No special handling for jazz/gospel voicings
- ❌ Outputs raw MIDI notes (requires heavy post-processing)

**Verdict:** Good for note extraction, but you need significant correction layer work.

---

## 🏆 BETTER ALTERNATIVES FOR YOUR USE CASE

### 1. **Chord AI** (BEST FOR CHORD DETECTION)
**Source:** [Chord AI](https://chordai.net/)

**Why it's better:**
- ✅ Specifically designed for chord detection
- ✅ Accurate recognition of common AND jazz chords
- ✅ Uses recent AI advances with unprecedented accuracy
- ✅ Understands harmonic context

**Use case fit:** If your product is about CHORDS (not note-for-note transcription), this is better than Basic Pitch.

---

### 2. **Klangio/Piano2Notes** (BEST FOR PIANO)
**Sources:**
- [Klangio](https://klang.io/)
- [Piano2Notes](https://klang.io/piano2notes/)

**Why it's better:**
- ✅ Piano-specific AI model
- ✅ Detects chords, melodies, rhythm, and timing
- ✅ Handles polyphonic playing effortlessly
- ✅ Lead sheet-style notation (ideal for jazz)
- ✅ Can isolate piano even when other instruments play

**Use case fit:** If your users upload piano videos (not isolated audio), this handles it better.

---

### 3. **Ivory** (BEST FOR COMPLEX PIANO)
**Source:** [Ivory App](https://ivory-app.com/)

**Why it's better:**
- ✅ Captures full depth of piano playing
- ✅ Complex dynamics and chord voicings
- ✅ Automatic staff separation
- ✅ Well-suited for analyzing complex performances

**Use case fit:** For gospel shout or advanced jazz, this handles complexity better.

---

### 4. **Melody Scanner** (BEST FOR JAZZ)
**Source:** [Melody Scanner](https://melodyscanner.com/)

**Why it's better:**
- ✅ Up to 86% accuracy for polyphony
- ✅ Specifically mentions jazz saxophone transcription
- ✅ Hand separation for piano
- ✅ Velocity detection

**Use case fit:** Strong jazz capabilities.

---

## 🔧 HOW TO IMPROVE CHORD DETECTION

### Post-Processing Techniques

**Sources:**
- [Symbolic Chord Detection](https://musicinformationretrieval.wordpress.com/2017/01/25/symbolic-chord-detection-3/)
- [Improving Audio Chord Estimation](https://transactions.ismir.net/articles/10.5334/tismir.81)

**Key strategies:**

1. **Weight notes by duration**
   - Longer notes = more important for chord identity
   - Short passing tones = ignore

2. **Rhythmic strength weighting**
   - Notes on strong beats = more weight
   - Gospel shout: emphasize downbeats

3. **Key-aware detection**
   - Detect key signature first
   - Use diatonic chord expectations
   - Gospel/jazz: expect extensions (9ths, 11ths, 13ths)

4. **Template matching**
   - Compare detected notes to pre-computed chord tables
   - Include jazz chord templates (maj7, m7, dom7, dim, aug, sus)

5. **Hybrid approach**
   - Combine MIDI (symbolic) + audio features
   - Use chroma features from librosa
   - Cross-reference for higher accuracy

---

## 🎹 DETECTING PIANO RUNS AND SCALES

**Sources:**
- [Klangio](https://klang.io/)
- [Songscription AI](https://www.songscription.ai)

**Current capabilities (2026):**

**What AI CAN detect:**
- ✅ Note sequences (runs)
- ✅ Scale patterns
- ✅ Melody lines
- ✅ Polyphonic playing
- ✅ Hand separation (left vs right hand)
- ✅ Velocity (dynamics)
- ✅ Expressive markings (trills, staccato)

**What's challenging:**
- ⚠️ Fast runs in dense arrangements
- ⚠️ Overlapping instruments
- ⚠️ Gospel shout polyrhythms
- ⚠️ Jazz accidentals and chromatic runs

**Tools that handle runs best:**
- **Klangio**: Handles complex arrangements
- **Songscription AI**: Detects trills, expressive markings
- **Melody Scanner**: 86% polyphony accuracy

---

## 🎵 GOSPEL/JAZZ SPECIFIC CHALLENGES

**Source:** [Melodyne Chord Recognition](https://helpcenter.celemony.com/M5/doc/melodyneStudio5/en/M5tour_ChordTrackAndDetection?env=standAlone)

**Special considerations:**

### Gospel Music:
- Fast chord changes
- Complex voicings (add9, sus chords)
- Organ + piano + bass (multiple instruments)
- Percussive playing style
- **Recommendation:** Use piano isolation first, then chord detection

### Jazz Music:
- Extended chords (9ths, 11ths, 13ths)
- Chromatic alterations
- Accidental notes (blue notes)
- **Melodyne solution:** "Expanded chords" option specifically for jazz
- **Issue:** Blues/jazz accidental notes confuse detection systems

---

## 💰 COST COMPARISON

| Tool | Price | Best For |
|------|-------|----------|
| **Basic Pitch** | FREE | General note transcription |
| **Chord AI** | Unknown | Chord detection |
| **Klangio** | Paid | Piano-specific, complex arrangements |
| **Ivory** | Paid | Advanced piano performances |
| **Melody Scanner** | Paid | Jazz, hand separation |
| **AnthemScore** | Paid | General transcription with high accuracy |

---

## 🎯 RECOMMENDATIONS FOR YOUR PRODUCT

### Option 1: Stick with Basic Pitch + Heavy Post-Processing
**Pros:**
- Free
- Already validated
- Full control over correction layer

**Cons:**
- More work to build correction layer
- Lower baseline accuracy
- Not chord-aware

**Best if:** You want to build proprietary IP in the correction layer

---

### Option 2: Switch to Chord AI or Klangio
**Pros:**
- Better baseline accuracy
- Chord-aware from the start
- Piano-optimized (Klangio)
- Less correction layer work needed

**Cons:**
- May not be free
- Less control over algorithm
- May have API limitations

**Best if:** You want faster time-to-market with better accuracy

---

### Option 3: Hybrid Approach
**Use Basic Pitch for notes + Chord AI for chords**

**Workflow:**
1. Basic Pitch → Extract all notes
2. Chord AI → Detect chord labels
3. Your correction layer → Reconcile differences, smooth transitions

**Best if:** You want highest accuracy by cross-referencing multiple sources

---

## 🔬 TECHNICAL IMPROVEMENTS YOU CAN IMPLEMENT

### With Music21 (Python)
**Source:** [Music21 Chord Detection](https://medium.com/data-science/midi-music-data-extraction-using-music21-and-word2vec-on-kaggle-cb383261cd4e)

```python
# Improve chord detection accuracy
from music21 import *

# 1. Use chordify() on MIDI
midi_score = converter.parse('input.mid')
chords = midi_score.chordify()

# 2. Weight by duration
for chord in chords:
    weight = chord.duration.quarterLength

# 3. Detect key first
key = midi_score.analyze('key')

# 4. Filter to diatonic chords in detected key
```

### With Librosa (Python)
**Source:** [Librosa Chroma Features](https://groups.google.com/g/librosa/c/EN-x1f3sk4w)

```python
import librosa

# Extract chroma features for chord detection
y, sr = librosa.load('audio.wav', sr=22050)
chroma_cqt = librosa.feature.chroma_cqt(y=y, sr=sr, hop_length=256)

# Use Constant-Q Transform for better harmonic resolution
```

---

## 🚨 CRITICAL INSIGHT FOR YOUR PRODUCT

**From research:** [MusicRadar Review](https://www.musicradar.com/music-tech/humans-will-be-doing-all-the-serious-music-transcription-for-the-foreseeable-future-songscription-review)

> "Humans will be doing all the serious music transcription for the foreseeable future"

**What this means:**
- Even in 2026, AI transcription is NOT perfect
- Your "correction layer" strategy is EXACTLY right
- The gap between AI output and human quality = YOUR PRODUCT OPPORTUNITY

**Tools struggle most with:**
- Dense arrangements with overlapping instruments
- Vocals overlapping with instruments
- Gospel shout (multiple instruments, fast changes)
- Jazz (complex chords, accidentals)

**This validates your approach:** Build the tool that makes imperfect AI useful.

---

## 📝 FINAL VERDICT

### Is Basic Pitch good enough?

**For MVP: YES, but with caveats**

**Reasons to keep it:**
- Free and open source
- You've already validated it works
- Forces you to build strong correction layer (your competitive advantage)

**Reasons to switch:**
- Chord AI or Klangio would give 2-3x better baseline accuracy
- Less correction layer work
- Faster time to "good enough" accuracy

### Recommended Path Forward:

1. **Short term (MVP):** Stick with Basic Pitch
   - Build your correction layer
   - Validate product-market fit
   - Learn what users actually need

2. **Medium term (v2):** Add Chord AI or Klangio as alternative
   - Give users choice of engines
   - Compare accuracy
   - Use best of both

3. **Long term (v3+):** Proprietary model
   - Train on gospel/jazz specifically
   - Use user corrections as training data
   - Build competitive moat

---

## Sources

- [Spotify Basic Pitch](https://github.com/spotify/basic-pitch)
- [Chord AI](https://chordai.net/)
- [Klangio Piano Transcription](https://klang.io/)
- [Ivory AI Transcription](https://ivory-app.com/)
- [Melody Scanner](https://melodyscanner.com/)
- [Best Chord AI Tools 2026](https://theaisurf.com/best-chord-ai-tools/)
- [AI Music Transcription Guide](https://askpro.blog/ai-music-transcription-tools-free)
- [Music Information Retrieval - Chord Detection](https://musicinformationretrieval.wordpress.com/2017/01/25/symbolic-chord-detection-3/)
- [Improving Chord Estimation (ISMIR)](https://transactions.ismir.net/articles/10.5334/tismir.81)
- [Melodyne Chord Recognition](https://helpcenter.celemony.com/M5/doc/melodyneStudio5/en/M5tour_ChordTrackAndDetection)
- [MusicRadar Transcription Review](https://www.musicradar.com/music-tech/humans-will-be-doing-all-the-serious-music-transcription-for-the-foreseeable-future-songscription-review)
- [Top Music Transcription Software 2026](https://worldmetrics.org/best/transcribe-music-software/)
- [Songscription AI](https://www.songscription.ai)
- [AnthemScore](https://www.lunaverus.com/)
