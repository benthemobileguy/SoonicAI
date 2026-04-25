# Soonic AI - API Specification

**Last Updated:** 2026-04-24
**Base URL:** `http://localhost:3001/api` (development)
**Production URL:** `https://api.soonic.ai/api`
**Version:** 1.0.0

---

## 🎯 Overview

This document defines all REST API endpoints for the Soonic AI backend.

**Authentication:** Firebase ID Token (Bearer token)
**Content-Type:** `application/json` (except file uploads)
**Response Format:** JSON

---

## 📋 Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/videos/upload` | Upload video for analysis | No* |
| GET | `/videos/:videoId` | Get video status and results | Yes** |
| GET | `/jobs/:jobId` | Get job processing status | No |
| GET | `/users/me` | Get current user info | Yes |
| GET | `/users/me/videos` | List user's videos | Yes |
| POST | `/payments/create-payment-intent` | Create payment for analysis | Yes |
| POST | `/subscriptions/create` | Create subscription | Yes |
| GET | `/subscriptions/me` | Get user's subscription | Yes |

\* Anonymous uploads allowed, but tracked
\** Video owner can view without auth if they have the videoId

---

## 📹 Videos API

### POST /videos/upload

Upload a video file for chord detection analysis.

**Request:**

```http
POST /api/videos/upload HTTP/1.1
Content-Type: multipart/form-data
Authorization: Bearer <firebase-id-token>  (optional for anonymous)

--boundary
Content-Disposition: form-data; name="video"; filename="my-video.mp4"
Content-Type: video/mp4

[binary video data]
--boundary
Content-Disposition: form-data; name="fileName"

my-video.mp4
--boundary--
```

**cURL Example:**

```bash
curl -X POST http://localhost:3001/api/videos/upload \
  -H "Authorization: Bearer $FIREBASE_TOKEN" \
  -F "video=@/path/to/video.mp4" \
  -F "fileName=my-video.mp4"
```

**Request Body (multipart/form-data):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| video | File | Yes | Video file (mp4, mov, avi) |
| fileName | string | Yes | Original filename |
| userId | string | No | Firebase UID (auto-detected from token) |

**Validation:**
- Max file size: 500MB
- Allowed formats: video/mp4, video/quicktime, video/x-msvideo
- Max duration: 15 minutes (enforced after upload)

**Response (200 OK):**

```json
{
  "videoId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "jobId": "job-12345",
  "fileName": "my-video.mp4",
  "fileUrl": "https://soonic-videos-prod.s3.amazonaws.com/...",
  "status": "processing",
  "uploadedAt": "2026-04-24T10:00:00Z",
  "estimatedCompletionTime": "2026-04-24T10:02:00Z"
}
```

**Error Responses:**

```json
// 400 Bad Request - File too large
{
  "statusCode": 400,
  "message": "File too large (max 500MB)",
  "timestamp": "2026-04-24T10:00:00Z",
  "path": "/api/videos/upload"
}

// 400 Bad Request - Invalid file type
{
  "statusCode": 400,
  "message": "Invalid file type. Only mp4, mov, avi allowed",
  "timestamp": "2026-04-24T10:00:00Z",
  "path": "/api/videos/upload"
}

// 402 Payment Required - Free limit exceeded
{
  "statusCode": 402,
  "message": "Free analysis limit reached. Subscribe or pay per analysis.",
  "freeAnalysesUsed": 3,
  "freeAnalysesLimit": 3,
  "timestamp": "2026-04-24T10:00:00Z"
}

// 500 Internal Server Error - Upload failed
{
  "statusCode": 500,
  "message": "Failed to upload video to storage",
  "timestamp": "2026-04-24T10:00:00Z"
}
```

---

### GET /videos/:videoId

Get video processing status and analysis results.

**Request:**

```http
GET /api/videos/a1b2c3d4-e5f6-7890-abcd-ef1234567890 HTTP/1.1
Authorization: Bearer <firebase-id-token>
```

**cURL Example:**

```bash
curl http://localhost:3001/api/videos/a1b2c3d4-e5f6-7890-abcd-ef1234567890 \
  -H "Authorization: Bearer $FIREBASE_TOKEN"
```

**Response (200 OK) - Processing:**

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "userId": "firebase-uid-123",
  "fileName": "my-video.mp4",
  "fileUrl": "https://soonic-videos-prod.s3.amazonaws.com/...",
  "status": "processing",
  "progress": 45,
  "uploadedAt": "2026-04-24T10:00:00Z",
  "processingStage": "extracting_audio"
}
```

**Response (200 OK) - Completed:**

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "userId": "firebase-uid-123",
  "fileName": "my-video.mp4",
  "fileUrl": "https://soonic-videos-prod.s3.amazonaws.com/...",
  "audioUrl": "https://soonic-audio-prod.s3.amazonaws.com/...",
  "status": "completed",
  "progress": 100,
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
      },
      {
        "timestamp": 5.0,
        "chord": "Em7",
        "notes": ["E", "G", "B", "D"],
        "confidence": 0.95,
        "hand": "left"
      }
    ],
    "leftHandNotes": 92,
    "rightHandNotes": 143,
    "processingTime": 125.5,
    "confidence": 0.89
  }
}
```

**Response (200 OK) - Failed:**

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "failed",
  "progress": 60,
  "error": "AI service timeout - video may be too complex",
  "uploadedAt": "2026-04-24T10:00:00Z",
  "failedAt": "2026-04-24T10:05:00Z"
}
```

**Error Responses:**

```json
// 404 Not Found - Video doesn't exist
{
  "statusCode": 404,
  "message": "Video a1b2c3d4-e5f6-7890-abcd-ef1234567890 not found",
  "timestamp": "2026-04-24T10:00:00Z"
}

// 403 Forbidden - Not video owner
{
  "statusCode": 403,
  "message": "You don't have permission to access this video",
  "timestamp": "2026-04-24T10:00:00Z"
}
```

---

## ⚙️ Jobs API

### GET /jobs/:jobId

Get job processing status and progress.

**Request:**

```http
GET /api/jobs/job-12345 HTTP/1.1
```

**cURL Example:**

```bash
curl http://localhost:3001/api/jobs/job-12345
```

**Response (200 OK) - Active:**

```json
{
  "id": "job-12345",
  "status": "active",
  "progress": 60,
  "data": {
    "videoId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "fileName": "my-video.mp4"
  },
  "createdAt": "2026-04-24T10:00:00Z",
  "currentStage": "analyzing",
  "estimatedCompletion": "2026-04-24T10:02:00Z"
}
```

**Response (200 OK) - Completed:**

```json
{
  "id": "job-12345",
  "status": "completed",
  "progress": 100,
  "data": {
    "videoId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  },
  "returnvalue": {
    "success": true,
    "audioUrl": "https://soonic-audio-prod.s3.amazonaws.com/..."
  },
  "completedAt": "2026-04-24T10:02:30Z"
}
```

**Response (200 OK) - Failed:**

```json
{
  "id": "job-12345",
  "status": "failed",
  "progress": 45,
  "failedReason": "FFmpeg audio extraction failed",
  "failedAt": "2026-04-24T10:01:30Z"
}
```

**Error Responses:**

```json
// 404 Not Found - Job doesn't exist
{
  "statusCode": 404,
  "message": "Job job-12345 not found",
  "timestamp": "2026-04-24T10:00:00Z"
}
```

---

## 👤 Users API (Sprint 11+)

### GET /users/me

Get current user information and subscription status.

**Request:**

```http
GET /api/users/me HTTP/1.1
Authorization: Bearer <firebase-id-token>
```

**Response (200 OK):**

```json
{
  "id": "firebase-uid-123",
  "email": "user@example.com",
  "displayName": "John Doe",
  "accountStatus": "active",
  "freeAnalysesUsed": 2,
  "freeAnalysesLimit": 3,
  "subscriptionStatus": "active",
  "subscriptionTier": "basic",
  "subscriptionEndsAt": "2026-05-24T00:00:00Z",
  "totalVideosProcessed": 15,
  "createdAt": "2026-03-15T10:00:00Z"
}
```

---

### GET /users/me/videos

List current user's videos.

**Request:**

```http
GET /api/users/me/videos?limit=10&offset=0&status=completed HTTP/1.1
Authorization: Bearer <firebase-id-token>
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | number | 10 | Number of results (max 100) |
| offset | number | 0 | Pagination offset |
| status | string | all | Filter by status (all, completed, processing, failed) |

**Response (200 OK):**

```json
{
  "videos": [
    {
      "id": "video-1",
      "fileName": "video1.mp4",
      "status": "completed",
      "uploadedAt": "2026-04-24T10:00:00Z",
      "processedAt": "2026-04-24T10:02:30Z"
    },
    {
      "id": "video-2",
      "fileName": "video2.mp4",
      "status": "processing",
      "progress": 45,
      "uploadedAt": "2026-04-24T09:00:00Z"
    }
  ],
  "total": 15,
  "limit": 10,
  "offset": 0,
  "hasMore": true
}
```

---

## 💳 Payments API (Sprint 13+)

### POST /payments/create-payment-intent

Create a Stripe payment intent for single video analysis ($2.50).

**Request:**

```http
POST /api/payments/create-payment-intent HTTP/1.1
Authorization: Bearer <firebase-id-token>
Content-Type: application/json

{
  "videoId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

**Response (200 OK):**

```json
{
  "clientSecret": "pi_ABC123_secret_DEF456",
  "paymentIntentId": "pi_ABC123",
  "amount": 250,
  "currency": "usd"
}
```

---

## 📅 Subscriptions API (Sprint 14+)

### POST /subscriptions/create

Create a monthly subscription ($12/month).

**Request:**

```http
POST /api/subscriptions/create HTTP/1.1
Authorization: Bearer <firebase-id-token>
Content-Type: application/json

{
  "priceId": "price_ABC123",
  "paymentMethodId": "pm_DEF456"
}
```

**Response (200 OK):**

```json
{
  "subscriptionId": "sub_ABC123",
  "customerId": "cus_DEF456",
  "status": "active",
  "currentPeriodEnd": "2026-05-24T00:00:00Z"
}
```

---

### GET /subscriptions/me

Get current user's subscription details.

**Request:**

```http
GET /api/subscriptions/me HTTP/1.1
Authorization: Bearer <firebase-id-token>
```

**Response (200 OK):**

```json
{
  "subscriptionId": "sub_ABC123",
  "status": "active",
  "tier": "basic",
  "currentPeriodStart": "2026-04-24T00:00:00Z",
  "currentPeriodEnd": "2026-05-24T00:00:00Z",
  "cancelAtPeriodEnd": false,
  "price": 12.00,
  "currency": "usd"
}
```

---

## 🔐 Authentication

### Firebase ID Token

All authenticated endpoints require a Firebase ID token in the Authorization header:

```http
Authorization: Bearer <firebase-id-token>
```

### Getting a Token (Client-Side)

```javascript
import { getAuth } from 'firebase/auth';

const auth = getAuth();
const user = auth.currentUser;

if (user) {
  const token = await user.getIdToken();
  // Use token in API requests
}
```

### Backend Token Verification

```typescript
import { auth } from 'firebase-admin';

const token = req.headers.authorization?.split('Bearer ')[1];
const decodedToken = await auth().verifyIdToken(token);
const userId = decodedToken.uid;
```

---

## 📊 Response Status Codes

| Code | Description | When Used |
|------|-------------|-----------|
| 200 | OK | Successful GET request |
| 201 | Created | Successful POST request |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid auth token |
| 402 | Payment Required | Free limit exceeded, payment needed |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists |
| 413 | Payload Too Large | File exceeds size limit |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | AI service unavailable |

---

## 🚨 Error Response Format

All errors follow this format:

```json
{
  "statusCode": 400,
  "message": "Detailed error message",
  "error": "Bad Request",
  "timestamp": "2026-04-24T10:00:00Z",
  "path": "/api/videos/upload"
}
```

---

## 📈 Rate Limiting

### Limits (Per User)

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/videos/upload` | 10 requests | 1 hour |
| `/videos/:id` | 100 requests | 1 minute |
| `/jobs/:id` | 100 requests | 1 minute |
| All other endpoints | 60 requests | 1 minute |

### Rate Limit Headers

```http
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1714838400
```

### Rate Limit Exceeded Response

```json
{
  "statusCode": 429,
  "message": "Too many requests. Please try again in 45 minutes.",
  "retryAfter": 2700,
  "timestamp": "2026-04-24T10:00:00Z"
}
```

---

## 🔄 Webhooks (Sprint 14+)

### Stripe Webhook Endpoint

```http
POST /api/webhooks/stripe
```

**Events Handled:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

---

## 🧪 Testing

### Postman Collection

Import the Postman collection for easy API testing:

```bash
https://api.soonic.ai/postman/collection.json
```

### cURL Examples

```bash
# Upload video
curl -X POST http://localhost:3001/api/videos/upload \
  -F "video=@test-video.mp4" \
  -F "fileName=test-video.mp4"

# Get video status
curl http://localhost:3001/api/videos/VIDEO_ID

# Get job status
curl http://localhost:3001/api/jobs/JOB_ID
```

---

## 📝 Notes

1. **CORS:** Configured to allow requests from `http://localhost:3000` (dev) and `https://soonic.ai` (prod)
2. **HTTPS:** Production API only accepts HTTPS requests
3. **Timeouts:** Long-running operations (video processing) use async job queue
4. **Idempotency:** POST requests include idempotency keys for safety

---

**Related Documentation:**
- [BACKEND_PLAN.md](./BACKEND_PLAN.md) - Backend implementation
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Database design
