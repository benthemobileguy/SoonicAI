# Soonic AI - Database Schema

**Last Updated:** 2026-04-24
**Database:** Firebase Firestore
**Status:** Design Complete

---

## 🎯 Overview

Soonic AI uses Firebase Firestore as the primary database for storing:
- Video metadata and processing status
- User information and subscription data
- Analysis results (chords, key, tempo)
- Usage tracking and billing records

---

## 📊 Collections Structure

```
Firestore Database
├── videos/              # Video processing records
│   └── {videoId}
├── users/               # User accounts
│   └── {userId}
├── subscriptions/       # Stripe subscriptions
│   └── {subscriptionId}
└── payments/            # Payment records
    └── {paymentId}
```

---

## 📝 Collection: `videos`

Stores all video uploads, processing status, and analysis results.

### Document ID
Auto-generated UUID (e.g., `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

### Schema

```typescript
interface VideoDocument {
  // Identifiers
  id: string;                    // Document ID (UUID)
  userId: string | null;         // Firebase UID (null for anonymous)

  // File Information
  fileName: string;              // Original filename
  fileUrl: string;               // S3 URL for video file
  audioUrl?: string;             // S3 URL for extracted audio
  fileSize: number;              // File size in bytes
  duration?: number;             // Video duration in seconds

  // Processing Status
  status: VideoStatus;           // Current processing status
  progress: number;              // Processing progress (0-100)
  jobId?: string;                // BullMQ job ID

  // Timestamps
  uploadedAt: Timestamp;         // When uploaded
  processedAt?: Timestamp;       // When processing completed

  // Analysis Results
  analysisResult?: AnalysisResult;

  // Error Handling
  error?: string;                // Error message if failed
  retryCount?: number;           // Number of retries

  // Usage & Billing
  isFree: boolean;               // Was this a free analysis?
  stripePaymentId?: string;      // Stripe payment ID (for paid analyses)

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

type VideoStatus =
  | 'uploading'        // Video being uploaded to S3
  | 'processing'       // In job queue
  | 'audio_extracted'  // Audio extracted, waiting for AI
  | 'analyzing'        // AI service processing
  | 'completed'        // Successfully processed
  | 'failed';          // Processing failed

interface AnalysisResult {
  // Musical Analysis
  key: string;                   // e.g., "C major", "A minor"
  tempo: number;                 // BPM (beats per minute)

  // Chord Progression
  chords: Chord[];

  // Hand Separation
  leftHandNotes: number;         // Count of left hand notes
  rightHandNotes: number;        // Count of right hand notes

  // Performance Metrics
  processingTime: number;        // Time taken (seconds)
  confidence: number;            // Overall confidence (0-1)
}

interface Chord {
  timestamp: number;             // Time in seconds
  chord: string;                 // e.g., "Cmaj7", "Gmaj9"
  notes: string[];               // e.g., ["C", "E", "G", "B"]
  confidence: number;            // Confidence score (0-1)
  hand: 'left' | 'right';        // Which hand plays this
}
```

### Example Document

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "userId": "firebase-uid-123",
  "fileName": "my-piano-video.mp4",
  "fileUrl": "https://soonic-videos-prod.s3.us-east-1.amazonaws.com/videos/a1b2c3d4/my-piano-video.mp4",
  "audioUrl": "https://soonic-audio-prod.s3.us-east-1.amazonaws.com/audio/a1b2c3d4/audio.wav",
  "fileSize": 52428800,
  "duration": 180,
  "status": "completed",
  "progress": 100,
  "jobId": "job-12345",
  "uploadedAt": "2026-04-24T10:00:00Z",
  "processedAt": "2026-04-24T10:02:30Z",
  "analysisResult": {
    "key": "C major",
    "tempo": 120,
    "chords": [
      {
        "timestamp": 0.0,
        "chord": "Cmaj7",
        "notes": ["C", "E", "G", "B"],
        "confidence": 0.92,
        "hand": "left"
      },
      {
        "timestamp": 2.5,
        "chord": "Gmaj9",
        "notes": ["G", "B", "D", "F#", "A"],
        "confidence": 0.87,
        "hand": "left"
      }
    ],
    "leftHandNotes": 92,
    "rightHandNotes": 143,
    "processingTime": 125.5,
    "confidence": 0.89
  },
  "isFree": true,
  "createdAt": "2026-04-24T10:00:00Z",
  "updatedAt": "2026-04-24T10:02:30Z"
}
```

### Indexes

```javascript
// Composite indexes for queries
{
  collection: 'videos',
  fields: [
    { fieldPath: 'userId', order: 'ASCENDING' },
    { fieldPath: 'uploadedAt', order: 'DESCENDING' }
  ]
}

{
  collection: 'videos',
  fields: [
    { fieldPath: 'userId', order: 'ASCENDING' },
    { fieldPath: 'status', order: 'ASCENDING' },
    { fieldPath: 'uploadedAt', order: 'DESCENDING' }
  ]
}
```

---

## 📝 Collection: `users`

Stores user account information and subscription status.

### Document ID
Firebase Authentication UID

### Schema

```typescript
interface UserDocument {
  // Identifiers
  id: string;                    // Firebase UID
  email: string;

  // Profile (optional)
  displayName?: string;
  photoUrl?: string;

  // Account Status
  accountStatus: 'active' | 'suspended' | 'deleted';
  emailVerified: boolean;

  // Usage Limits (Free Tier)
  freeAnalysesUsed: number;      // Max 3 for new users
  freeAnalysesLimit: number;     // Default: 3

  // Subscription
  subscriptionStatus: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionTier?: 'free' | 'basic' | 'pro';
  subscriptionStartedAt?: Timestamp;
  subscriptionEndsAt?: Timestamp;

  // Billing
  billingEmail?: string;

  // Stats
  totalVideosProcessed: number;
  totalProcessingTime: number;   // Total seconds

  // Timestamps
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  updatedAt: Timestamp;
}

type SubscriptionStatus =
  | 'none'           // No active subscription
  | 'trial'          // Trial period
  | 'active'         // Active paid subscription
  | 'past_due'       // Payment failed
  | 'canceled'       // User canceled
  | 'expired';       // Subscription expired
```

### Example Document

```json
{
  "id": "firebase-uid-123",
  "email": "user@example.com",
  "displayName": "John Doe",
  "accountStatus": "active",
  "emailVerified": true,
  "freeAnalysesUsed": 2,
  "freeAnalysesLimit": 3,
  "subscriptionStatus": "active",
  "stripeCustomerId": "cus_ABC123",
  "stripeSubscriptionId": "sub_DEF456",
  "subscriptionTier": "basic",
  "subscriptionStartedAt": "2026-04-01T00:00:00Z",
  "subscriptionEndsAt": "2026-05-01T00:00:00Z",
  "totalVideosProcessed": 15,
  "totalProcessingTime": 1800,
  "createdAt": "2026-03-15T10:00:00Z",
  "lastLoginAt": "2026-04-24T09:30:00Z",
  "updatedAt": "2026-04-24T09:30:00Z"
}
```

### Indexes

```javascript
{
  collection: 'users',
  fields: [
    { fieldPath: 'email', order: 'ASCENDING' }
  ]
}

{
  collection: 'users',
  fields: [
    { fieldPath: 'subscriptionStatus', order: 'ASCENDING' },
    { fieldPath: 'createdAt', order: 'DESCENDING' }
  ]
}
```

---

## 📝 Collection: `subscriptions`

Stores Stripe subscription details (Sprint 14+).

### Document ID
Stripe Subscription ID (e.g., `sub_ABC123`)

### Schema

```typescript
interface SubscriptionDocument {
  id: string;                    // Stripe subscription ID
  userId: string;                // Firebase UID
  stripeCustomerId: string;      // Stripe customer ID

  // Subscription Details
  tier: 'basic' | 'pro';
  status: string;                // Stripe status
  priceId: string;               // Stripe price ID

  // Billing
  currentPeriodStart: Timestamp;
  currentPeriodEnd: Timestamp;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Timestamp;

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## 📝 Collection: `payments`

Stores individual payment records (Sprint 13+).

### Document ID
Stripe Payment Intent ID (e.g., `pi_ABC123`)

### Schema

```typescript
interface PaymentDocument {
  id: string;                    // Stripe payment intent ID
  userId: string;                // Firebase UID
  videoId?: string;              // If payment for single analysis

  // Payment Details
  amount: number;                // Amount in cents
  currency: string;              // e.g., "usd"
  status: string;                // Stripe status

  // Type
  type: 'single_analysis' | 'subscription';

  // Timestamps
  createdAt: Timestamp;
  paidAt?: Timestamp;
}
```

---

## 🔐 Security Rules

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Videos collection
    match /videos/{videoId} {
      // Anyone can create (for anonymous uploads)
      allow create: if true;

      // Users can read their own videos
      allow read: if isAuthenticated() &&
                     resource.data.userId == request.auth.uid;

      // Users can update/delete their own videos
      allow update, delete: if isAuthenticated() &&
                                resource.data.userId == request.auth.uid;
    }

    // Users collection
    match /users/{userId} {
      // Users can read/write their own data
      allow read, write: if isOwner(userId);
    }

    // Subscriptions collection
    match /subscriptions/{subscriptionId} {
      // Users can read their own subscriptions
      allow read: if isAuthenticated() &&
                     resource.data.userId == request.auth.uid;

      // Only backend can write (via Admin SDK)
      allow write: if false;
    }

    // Payments collection
    match /payments/{paymentId} {
      // Users can read their own payments
      allow read: if isAuthenticated() &&
                     resource.data.userId == request.auth.uid;

      // Only backend can write (via Admin SDK)
      allow write: if false;
    }
  }
}
```

---

## 📊 Common Queries

### Get User's Videos (Most Recent First)

```typescript
const videosRef = firestore.collection('videos');
const query = videosRef
  .where('userId', '==', userId)
  .orderBy('uploadedAt', 'desc')
  .limit(10);

const snapshot = await query.get();
```

### Get Completed Videos

```typescript
const query = firestore
  .collection('videos')
  .where('userId', '==', userId)
  .where('status', '==', 'completed')
  .orderBy('processedAt', 'desc');
```

### Check Free Analysis Limit

```typescript
const userDoc = await firestore.collection('users').doc(userId).get();
const user = userDoc.data();

const hasFreePlaysLeft = user.freeAnalysesUsed < user.freeAnalysesLimit;
```

### Get Active Subscription

```typescript
const userDoc = await firestore.collection('users').doc(userId).get();
const user = userDoc.data();

const hasActiveSubscription = user.subscriptionStatus === 'active';
```

---

## 🔄 Data Lifecycle

### Video Upload → Processing → Completion

```
1. Video uploaded
   └─> Create document with status: 'uploading'

2. Upload to S3 complete
   └─> Update status: 'processing'
   └─> Add jobId

3. Audio extracted
   └─> Update status: 'audio_extracted'
   └─> Add audioUrl

4. AI analysis started
   └─> Update status: 'analyzing'

5. Analysis complete
   └─> Update status: 'completed'
   └─> Add analysisResult
   └─> Set processedAt
   └─> Set progress: 100

6. (If failed at any step)
   └─> Update status: 'failed'
   └─> Add error message
```

### User Subscription Flow

```
1. User signs up
   └─> Create user document
   └─> freeAnalysesUsed: 0
   └─> subscriptionStatus: 'none'

2. User uses free analysis
   └─> Increment freeAnalysesUsed
   └─> Create video document with isFree: true

3. User subscribes
   └─> Update subscriptionStatus: 'active'
   └─> Add stripeCustomerId, stripeSubscriptionId
   └─> Create subscription document

4. Subscription expires/canceled
   └─> Update subscriptionStatus: 'expired' or 'canceled'
   └─> Set subscriptionEndsAt
```

---

## 💾 Backup Strategy

### Daily Backups
- Automatic daily backups via Firebase Console
- Retention: 30 days

### Export to BigQuery (Optional)
- Stream data to BigQuery for analytics
- Enable via Firebase Console

---

## 📈 Scaling Considerations

### Current Design Supports:
- ✅ Up to 10,000 users
- ✅ Up to 100,000 videos
- ✅ Concurrent processing of 100+ videos

### When to Scale:
- **> 10K users:** Consider Cloud Firestore optimization
- **> 100K videos:** Partition videos by date
- **> 1K concurrent jobs:** Add more Redis instances

---

## ✅ Schema Checklist

When implementing, ensure:
- [ ] All timestamps use Firestore `Timestamp` type
- [ ] Required fields have validation
- [ ] Indexes created for common queries
- [ ] Security rules properly restrict access
- [ ] Backup strategy in place
- [ ] Error handling for missing fields
- [ ] Default values set where appropriate

---

**Related Documentation:**
- [BACKEND_PLAN.md](./BACKEND_PLAN.md) - Backend implementation
- [API_SPECIFICATION.md](./API_SPECIFICATION.md) - API endpoints
