# 🚀 START HERE - Soonic AI Execution Guide

**Last Updated:** 2026-04-22
**Status:** Pre-development - Use this as your north star

---

## 📚 Document Reading Order

Before you write a single line of code, read these in order:

### 1. **STRATEGIC_REALITY_CHECK.md** (READ FIRST) 🔥
**Why:** Sets the right mindset. Explains what you're actually building vs what you think you're building.

**Key takeaway:** You're building "80% useful" not "100% accurate"

### 2. **FEASIBILITY_ASSESSMENT.md**
**Why:** Research-backed analysis of what's achievable.

**Key takeaway:** 70-85% accuracy is achievable and valuable. $1K-3K MRR Year 1 is realistic.

### 3. **TECHNICAL_DECISIONS.md**
**Why:** Explains every tech choice and the correction layer strategy.

**Key takeaway:** 70% of effort goes to the correction layer, not ML.

### 4. **IMPLEMENTATION_PLAN.md**
**Why:** Detailed 18-20 week sprint plan.

**Key takeaway:** Sprint 4.5 (Correction Layer) is more important than Sprint 4 (AI Core).

### 5. **DAILY_TASKS.md** (When you start coding)
**Why:** Day-by-day breakdown of what to build.

---

## 🎯 The Core Strategy (Never Forget This)

### What You're Actually Building:

```
NOT: "Perfect AI chord detection system"

BUT: "A tool that saves worship pianists 90 minutes of manual work"
```

### How You're Building It:

```
Pipeline:
Audio → Notes (basic-pitch) → Raw Chords → CORRECTION LAYER → Musical Output
                                                    ↑
                                            70% OF EFFORT GOES HERE
```

### Success Criteria:

```
NOT: "95% chord detection accuracy"

BUT: "8/10 musicians say 'I would use this'"
```

---

## 🔥 Critical Decisions Summary

### 1. **Accuracy Target: 70-85%**
- Raw ML detection: 60-70%
- After correction layer: 75-85%
- This is **enough** if output makes musical sense

### 2. **Timeline: 18-20 Weeks (Not 16)**
- Solo developer needs buffer
- Expect iterations on AI accuracy
- Account for real-world delays

### 3. **Revenue Target: $1K-3K MRR Year 1**
- 70% of solo SaaS make < $1K/month
- Plan conservatively
- Don't quit day job until $5K+ sustained

### 4. **Virtual Keyboard: Chord-Based (Not Performance-Accurate)**
- Show which keys make up each chord
- NOT exact MIDI performance
- This is achievable and valuable

### 5. **The Correction Layer IS The Product**
- Key-aware prioritization
- Harmonic progression smoothing
- Voicing normalization
- Complexity simplification
- **This beats competitors, not better ML**

---

## 🚨 HARD VALIDATION GATES (Non-Negotiable)

### Week -1: Validate Assumptions

**🔥 THESE ARE HARD GATES. NOT SUGGESTIONS.**

- [ ] **Interview 5 worship pianists**
  - Ask: "Would you pay $12/month for 75% accurate chord detection with visual piano?"
  - **If 3/5 do NOT say "yes" → STOP PROJECT**
  - No exceptions.

- [ ] **Test basic-pitch accuracy** (CRITICAL)
  - Download 5 gospel piano videos from YouTube
  - Run basic-pitch locally: `basic-pitch output/ input.mp4`
  - Manually transcribe first 30 seconds of each video
  - Compare system output vs your transcription
  - Calculate accuracy percentage
  - **If < 60% accurate → STOP and rethink approach**
  - Do not build on broken foundation.

- [ ] **Budget & time check**
  - Have $5K buffer for tools/help?
  - Can dedicate 30-40 hrs/week for 5 months?
  - **If NO to either → Do not start**

### 🚨 If ANY validation fails:

**DO NOT PROCEED.**
**STOP and reassess the entire project.**

These gates exist to prevent you from wasting 3-5 months.

---

## 🛠️ Technology Stack (Confirmed)

### Frontend
- **Next.js 14+** (React framework)
- **Tailwind CSS** (Styling)
- **TypeScript** (Type safety)
- **React Player** (Video playback)
- **SVG** (Virtual keyboard rendering)

### Backend
- **NestJS** (API framework)
- **BullMQ + Redis** (Job queue)
- **FFmpeg** (Audio extraction)
- **Firebase Firestore** (Database)
- **AWS S3** (File storage)

### AI Service
- **Python 3.11+** (Runtime)
- **FastAPI** (API framework)
- **basic-pitch** (Pitch detection - use as-is)
- **librosa** (Audio features, key, tempo)
- **Custom correction layer** (The real product)

### Infrastructure
- **Vercel** (Frontend hosting)
- **AWS EC2** (Backend + AI service)
- **Firebase Auth** (Authentication)
- **Stripe** (Payments)

---

## 📅 High-Level Timeline

### Phase 1: Foundation (Weeks 1-6)
- **Sprint 0: Setup (SIMPLIFIED - pipeline first, infra later)** 🔥
  - Days 1-2: Local dev environment
  - Day 3: **VALIDATE basic-pitch (HARD GATE)**
  - Day 4: Simple pipeline test
  - Day 5: Minimal infra (only if pipeline works)
- Sprint 1: Backend API
- Sprint 2: Audio extraction
- Sprint 3: AI service setup
- Sprint 4: Core AI (aim for 60-70% accuracy)
- **Sprint 4.5: Correction layer (boost to 75-85%)** 🔥

### Phase 2: Frontend (Weeks 7-11)
- Sprint 5: Backend integration
- Sprint 6: Frontend foundation
- Sprint 7: Results page
- Sprint 8: Chord timeline
- Sprint 9-10: **Virtual keyboard (chord-based)** 🔥

### Phase 3: Business (Weeks 12-15)
- Sprint 11: Authentication
- Sprint 12: Usage limits
- Sprint 13: Pay-as-you-go
- Sprint 14: Subscriptions

### Phase 4: Launch (Weeks 16-20)
- Sprint 15: Testing & polish
- Sprint 16: Deployment
- Weeks 17-18: Beta testing
- Weeks 19-20: Fixes & optimization

---

## 🎯 MVP Scope (What to Build)

### ✅ MUST HAVE (In Scope)

**Core Features:**
- [ ] Upload video (mp4, mov)
- [ ] Extract audio (FFmpeg)
- [ ] Detect chords (70-75% accuracy acceptable)
- [ ] Show chord timeline
- [ ] Virtual keyboard (chord-based, simple)
- [ ] Video playback sync
- [ ] 3 free analyses → paywall
- [ ] Pay $2.50 per analysis
- [ ] Subscribe $12/month unlimited

**Quality Bars:**
- [ ] Processing < 5 minutes for 5-min video
- [ ] Chord accuracy ≥ 70%
- [ ] Output makes musical sense
- [ ] UI is clean (doesn't need to be beautiful)

### ❌ NOT IN MVP (Phase 2)

Cut these ruthlessly:
- ❌ Chord theory explanations
- ❌ Relative pitch training
- ❌ Slow playback mode
- ❌ Loop sections
- ❌ Shareable links
- ❌ Mobile responsive design
- ❌ Advanced chord voicings
- ❌ Multiple language support
- ❌ Chord sheet export

**Why cut:** Each feature = 1-2 weeks. Ship MVP fast, add later based on user demand.

---

## 🚨 Failure Strategy (What If It Doesn't Work?)

**THIS IS CRITICAL. Most builders don't have a plan for failure.**

### If Raw Chord Detection < 60%:
**Action:** Switch to simpler chord templates (maj/min/7 ONLY)
**Why:** Better to detect simple chords well than complex chords poorly
**DO NOT:** Add more ML models or complexity

### If Correction Layer Cannot Reach 70%:
**Action:** Reduce chord complexity (remove 9th, 11th, 13th extensions)
**Why:** Users prefer stable "Cmaj7" over unstable "Cmaj9(#11)"
**DO NOT:** Chase perfection

### If Users Say "Not Useful":
**Action:** Focus on fewer chord types but MORE stable output
**Why:** Reliability beats accuracy
**DO NOT:** Add features, add complexity

### The Rule:
**When struggling → SIMPLIFY**
**Never → Add complexity**

---

## 🚦 Go/No-Go Decision Points

### After Week 1 (Sprint 0 - CRITICAL GATE)

**Check:**
- [ ] basic-pitch accuracy ≥ 60% on 5 test videos
- [ ] Simple pipeline produces valid JSON output
- [ ] Output makes some musical sense

**If < 60% or output nonsensical:** STOP and reassess entire approach

### After Week 5 (Core AI Complete)

**Check:**
- [ ] Chord detection accuracy ≥ 60% (raw)
- [ ] Processing time < 10 minutes
- [ ] No major blockers
- [ ] Output is stable (not jittery)
- [ ] Output is musically sensible

**If accuracy < 50% or unstable:** Simplify chord vocabulary or abandon

### After Week 6.5 (Correction Layer Complete)

**Check:**
- [ ] Chord detection accuracy ≥ 70% (corrected)
- [ ] Output makes musical sense
- [ ] 3 musicians say "I'd use this"

**If accuracy < 65% or output nonsensical:** Iterate for 1-2 more weeks

### After Week 11 (Frontend Complete)

**Check:**
- [ ] End-to-end flow works
- [ ] Virtual keyboard syncs correctly
- [ ] UI is usable
- [ ] Can demo to strangers

**If major UX issues:** Consider hiring designer ($1.5K-3K)

### After Week 16 (Before Launch)

**Check:**
- [ ] All core features working
- [ ] No critical bugs
- [ ] 5-10 beta testers say "I'd pay"
- [ ] Processing success rate > 90%

**If < 5 people would pay:** Don't launch, iterate based on feedback

---

## 💰 Budget Planning

### Minimal Budget (Solo Bootstrap)
**Total: $300-500**

- Domain: $12/year
- AWS (dev): $50/month × 1 month = $50
- Testing: $50 (Stripe test mode free)
- Misc: $200 buffer

### Recommended Budget (Quality MVP)
**Total: $3,000-5,500**

- Development costs: $300-500
- **UI/UX Designer:** $1,500-3,000 (worth it!)
- QA Tester: $500-1,000
- Copywriter: $300-500
- DevOps help: $500-1,000

**Why spend:** 70% of solo SaaS fail. Investing in quality pushes you into the 30% that succeed.

### Monthly Operating Costs

**MVP (100 users):**
- Infrastructure: ~$62/month
- Stripe fees: ~$12/month (2.9% + $0.30)
- **Total: ~$75/month**

**At scale (1,000 users, $1,200 MRR):**
- Infrastructure: ~$231/month
- Stripe fees: ~$36/month
- **Total: ~$270/month**
- **Profit: ~$930/month (78% margin)**

**Economics are favorable.**

---

## 🎯 Success Metrics to Track

### Week 1-4 (Development)
- [ ] Sprint tasks completed on time
- [ ] No major blockers

### Week 5-6 (AI Core)
- [ ] Chord accuracy ≥ 70%
- [ ] Processing time < 5 min

### Week 7-11 (Frontend)
- [ ] 5 people can use app without help
- [ ] Virtual keyboard "wow" feedback

### Week 12-15 (Business)
- [ ] Payment flow works
- [ ] 10 beta signups

### Week 16-20 (Launch)
- [ ] 5-10 paying customers
- [ ] $100-300 MRR
- [ ] 90%+ uptime

### Month 1-6 (Growth)
- [ ] $1K MRR by Month 6
- [ ] 100-200 users
- [ ] < 20% monthly churn

---

## 🚨 Common Failure Modes (Avoid These)

### 1. **Over-Engineering the AI**
**Symptom:** Spending weeks tweaking ML models
**Fix:** Accept 70% accuracy, focus on correction layer

### 2. **Building in Isolation**
**Symptom:** No user feedback for 3+ months
**Fix:** Get 5 beta users by Week 8

### 3. **Scope Creep**
**Symptom:** Adding "nice to have" features mid-development
**Fix:** Reference MVP scope ruthlessly

### 4. **Perfectionism**
**Symptom:** Can't ship because "it's not ready"
**Fix:** Ship at 70% quality, iterate

### 5. **Optimistic Revenue**
**Symptom:** Planning to quit job after Month 3
**Fix:** Don't quit until $5K+ sustained

---

## 🎯 Week 1 Action Items

If you decide to build, do these immediately:

### Validation (Critical)
- [ ] Interview 5 worship pianists (this week!)
- [ ] Test basic-pitch accuracy (2 hours)
- [ ] Check budget ($5K buffer + 5 months time)

### Setup (If validation passes)
- [ ] Read all docs in order
- [ ] Set up dev environment (Sprint 0, Day 1)
- [ ] Create waitlist landing page (Carrd/Webflow)
- [ ] Join 5 worship musician Facebook groups
- [ ] Buy domain (soonic.ai)

### Planning
- [ ] Print out IMPLEMENTATION_PLAN.md
- [ ] Set up project board (Linear/Trello)
- [ ] Block calendar for 30-40 hrs/week
- [ ] Tell someone your goal (accountability)

---

## 📖 Resources & Links

### Documentation
- [STRATEGIC_REALITY_CHECK.md](./STRATEGIC_REALITY_CHECK.md) - Read first
- [FEASIBILITY_ASSESSMENT.md](./FEASIBILITY_ASSESSMENT.md) - Research
- [TECHNICAL_DECISIONS.md](./TECHNICAL_DECISIONS.md) - Tech choices
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) - Sprint plan
- [DAILY_TASKS.md](./DAILY_TASKS.md) - Day-by-day guide

### External Resources
- [Basic Pitch (Spotify)](https://github.com/spotify/basic-pitch)
- [Librosa Docs](https://librosa.org/doc)
- [NestJS Docs](https://docs.nestjs.com)
- [Next.js Docs](https://nextjs.org/docs)
- [Stripe Docs](https://stripe.com/docs)

---

## 💬 Final Words

### You Can Do This

**You have:**
- ✅ Validated market (worship pianists exist, pay for tools)
- ✅ Proven technology (basic-pitch works, FFmpeg works)
- ✅ Realistic scope (70% accuracy is enough)
- ✅ Good economics (80%+ margins)
- ✅ Differentiation (correction layer + virtual keyboard)

### But Remember

**70% of solo SaaS fail.**

**Not because the tech doesn't work.**
**Because they:**
- Build the wrong thing
- Take too long
- Never ship
- Run out of money
- Burn out

### Your Advantages

**You know:**
- What to build (learning accelerator, not perfect AI)
- How to build it (correction layer, not better ML)
- What's realistic ($1K-3K MRR Year 1, not $10K)
- When to validate (Week 8, not Month 6)
- What to cut (everything not in MVP scope)

### The Path Forward

1. ✅ Validate (Week -1)
2. ✅ Build fast (Weeks 1-16)
3. ✅ Ship imperfect (Week 16)
4. ✅ Get users (Weeks 17-20)
5. ✅ Iterate (Months 5-12)

**Ship it. Learn. Improve. Repeat.**

---

**Now go validate your assumptions. Then come back and start Sprint 0.**

**Good luck. You've got this.**

---

*Last Updated: 2026-04-22*
*Next Review: After validation interviews*
