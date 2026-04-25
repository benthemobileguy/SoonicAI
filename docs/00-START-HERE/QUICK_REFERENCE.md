# 🎯 Soonic AI - Quick Reference Card

**Print this. Put it on your wall. Read it when in doubt.**

---

## The Mission

```
Build a tool that saves worship pianists 90 minutes
NOT: Perfect AI chord detection
```

---

## The Strategy

```
Pipeline:
Audio → basic-pitch → Raw Chords → CORRECTION LAYER → Output
                                          ↑
                                   70% effort here
```

---

## Success = 8/10 Musicians Say "I'd Use This"

NOT: 95% chord accuracy
NOT: Perfect transcription
NOT: Replacing human musicians

---

## Accuracy Targets

| What | Target |
|------|--------|
| Raw ML | 60-70% |
| After correction | 75-85% |
| MVP goal | 70%+ |

**70% is ENOUGH if output makes musical sense**

---

## Revenue Targets (Realistic)

| When | Target |
|------|--------|
| Launch (Week 16) | $100-300 MRR |
| Month 6 | $1K MRR |
| Year 1 | $1.5K-3K MRR |

**Don't quit day job until $5K+ sustained**

---

## Timeline

- Weeks 1-6: Backend + AI
- Weeks 7-11: Frontend
- Weeks 12-15: Business
- Weeks 16-20: Launch
- **Total: 18-20 weeks**

---

## The Correction Layer (Your Secret Weapon)

1. **Key-aware** - Boost diatonic chords
2. **Progression smoothing** - No random jumps
3. **Voicing normalization** - C/E → C
4. **Simplify complexity** - Cmaj7(#11,b9) → Cmaj9
5. **Remove duplicates** - Clean output

**This beats competitors, not better ML**

---

## First Working Output (Definition)

**Valid output MUST have:**
- ✅ Key detection 80%+ accurate
- ✅ Chord progression 60%+ correct
- ✅ Stable segments (≥ 0.5 sec hold)
- ✅ Musically sensible (no random jumps)

**If output doesn't meet this:**
→ DO NOT build frontend
→ Fix AI first

---

## Virtual Keyboard Strategy

**DO:**
- Chord-based visualization
- Gmaj9 → highlight G, B, D, F#, A
- Simple chord → notes mapping

**DON'T:**
- Performance-accurate MIDI
- Exact timing/velocity
- Complex voicing detection

**Why:** Your output is chords, not MIDI events

**🚨 EXPLICIT LIMITATION:**
We show chord composition ONLY.
Not timing, velocity, or real voicing.
This is a FEATURE (keeps it simple).

---

## What's In MVP

✅ Upload video
✅ Extract audio
✅ Detect chords (70% OK)
✅ Chord timeline
✅ Virtual keyboard (simple)
✅ Video sync
✅ Auth
✅ Payments

---

## What's NOT In MVP

❌ Chord explanations
❌ Relative pitch training
❌ Slow playback
❌ Loop sections
❌ Mobile responsive
❌ Shareable links

**Cut ruthlessly. Ship fast.**

---

## Tech Stack (Don't Change Mid-Flight)

**Frontend:** Next.js + Tailwind
**Backend:** NestJS + BullMQ + Redis
**AI:** Python + FastAPI + basic-pitch + librosa
**Infra:** Vercel + AWS EC2
**DB:** Firebase Firestore
**Storage:** AWS S3
**Auth:** Firebase Auth
**Payments:** Stripe

---

## Go/No-Go Checkpoints

**Week 5:** Raw accuracy ≥ 60%?
**Week 6.5:** Corrected accuracy ≥ 70%?
**Week 11:** 3 musicians say "I'd use this"?
**Week 16:** 5 people willing to pay?

**If NO → Stop and reassess**

---

## Common Traps (Avoid)

### ❌ TRAP: "Let me improve the ML model..."
✅ FIX: Focus on correction layer

### ❌ TRAP: "This needs to be perfect before launch"
✅ FIX: Ship at 70% quality

### ❌ TRAP: "Let me add just one more feature..."
✅ FIX: Reference MVP scope

### ❌ TRAP: "I'll get users after launch"
✅ FIX: Get 5 beta users by Week 8

### ❌ TRAP: "I can make $5K MRR Month 1"
✅ FIX: Plan for $1K, hope for $3K

---

## Daily Mantras

### When coding:
> "Good enough is better than perfect"

### When planning features:
> "Is this in MVP scope?"

### When debugging AI:
> "Does it make musical sense?"

### When setting goals:
> "70% of solo SaaS make < $1K/month"

### When shipping:
> "Done is better than perfect"

---

## The North Star

```
If a musician says:
"This saved me 30 minutes"

You win.
```

---

## Emergency Decision Framework

**Stuck on a decision?**

Ask:
1. Does this help ship faster? → Do it
2. Does this improve accuracy > 5%? → Maybe
3. Does this add complexity? → Don't do it
4. Is this in MVP scope? → If no, defer

---

## 🚨 HARD GATES (Non-Negotiable)

### Before Writing Code:
- [ ] 3/5 pianists say "I'd pay $12/month"
- [ ] basic-pitch accuracy > 60% on test videos
- [ ] Have $5K buffer
- [ ] Can commit 30-40 hrs/week for 5 months

**If ANY is NO → STOP PROJECT**

### After Sprint 4 (AI Core):
- [ ] Raw chord detection ≥ 60%
- [ ] Output is stable (no jittery chords)
- [ ] Output is musically sensible

**If < 60% → Simplify to maj/min/7 only**

### After Sprint 4.5 (Correction Layer):
- [ ] Corrected accuracy ≥ 70%
- [ ] 8/10 musicians say "makes sense"

**If fails → SIMPLIFY, don't add complexity**

---

## Failure Strategy

**If accuracy < 60%:**
→ Switch to simple chords only (maj/min/7)

**If correction can't reach 70%:**
→ Reduce complexity (remove extensions)

**If users say "not useful":**
→ Focus on stability over accuracy

**DO NOT:**
- Add more ML models
- Increase complexity
- Chase perfection

**INSTEAD:**
- SIMPLIFY
- Make output STABLE
- Make output CONSISTENT

---

## Week 1 TODO (VALIDATION)

**TODAY (1-2 hours):**
- [ ] Install: `pip3 install basic-pitch`
- [ ] Download 1 SHORT gospel clip (30-60 sec)
- [ ] Run basic-pitch on it
- [ ] Load MIDI and LISTEN (DAW or online player)
- [ ] Ask: "Does this capture the harmonic structure?"

**THIS WEEK:**
- [ ] Interview 5 pianists (need 3/5 "yes")
- [ ] Test basic-pitch on 5 SHORT clips
- [ ] Measure "musical usefulness" (≥60% needed)
- [ ] If PASS → start Sprint 0
- [ ] If FAIL → STOP

**How to Measure Accuracy:**
```
Expected: Cmaj7 → Gmaj9 → Em7
Detected: Cmaj7 → Gmaj7 → Em7

Count as correct:
✅ Cmaj7 (exact)
✅ Gmaj9 vs Gmaj7 (close enough - same root+quality)
✅ Em7 (exact)

Score: 3/3 = 100% USABLE
```

**Rule:** Measure musical usefulness, not exact theory

---

## Success Metrics

**Good:**
- 70% chord accuracy
- < 5 min processing
- 10 paying customers
- $1K MRR Month 6

**Great:**
- 80% chord accuracy
- < 3 min processing
- 50 paying customers
- $3K MRR Year 1

---

## When In Doubt

1. Read [STRATEGIC_REALITY_CHECK.md](./STRATEGIC_REALITY_CHECK.md)
2. Ask: "Does this help musicians learn faster?"
3. Ship and get feedback
4. Iterate

---

## Remember

**You're NOT building the next Spotify**
**You ARE building a $3K/month learning tool**

**That's enough.**

---

**Now go build.**

---

*Keep this handy. Reference often.*
*Updated: 2026-04-22*
