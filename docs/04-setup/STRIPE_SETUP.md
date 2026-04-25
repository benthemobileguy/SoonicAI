# Stripe Integration - Setup Guide

**Date:** 2026-04-25
**Status:** Implementation Complete - Needs Product Configuration

---

## Overview

This guide walks you through setting up Stripe for Soonic AI's payment system, including:
- Credit packs (one-time purchases)
- Pro subscription (monthly recurring)
- Webhook configuration
- Testing with test mode

---

## Prerequisites

- Stripe account (sign up at https://stripe.com)
- Backend running locally
- Stripe CLI installed (optional, for webhook testing)

---

## Step 1: Get Your API Keys

### 1.1 Access Stripe Dashboard

Go to: https://dashboard.stripe.com/test/apikeys

**IMPORTANT:** Use **Test Mode** (toggle in top right) for development

### 1.2 Copy API Keys

You'll need two keys:

1. **Secret Key** (starts with `sk_test_`)
   - Click "Reveal test key"
   - Copy the full key

2. **Publishable Key** (starts with `pk_test_`)
   - This is for frontend (we'll need it later)
   - Copy it for reference

### 1.3 Add to .env

Update `backend/.env`:

```bash
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
```

---

## Step 2: Create Products & Prices

### 2.1 Create Credit Packs

Go to: https://dashboard.stripe.com/test/products

#### Starter Pack
1. Click **+ Add product**
2. Product details:
   - **Name:** Starter Pack
   - **Description:** 5 chord analyses for worship pianists
   - **Pricing model:** Standard pricing
   - **Price:** $9.90
   - **Billing period:** One time
3. Click **Save product**
4. Copy the **Price ID** (starts with `price_`)
5. Add to `.env`: `STRIPE_PRICE_STARTER=price_xxxxx`

#### Standard Pack (Most Popular)
1. Click **+ Add product**
2. Product details:
   - **Name:** Standard Pack
   - **Description:** 17 chord analyses (15 + 2 bonus) for regular church musicians
   - **Pricing model:** Standard pricing
   - **Price:** $24.90
   - **Billing period:** One time
3. Click **Save product**
4. Copy the **Price ID**
5. Add to `.env`: `STRIPE_PRICE_STANDARD=price_xxxxx`

#### Pro Pack
1. Click **+ Add product**
2. Product details:
   - **Name:** Pro Pack
   - **Description:** 40 chord analyses (35 + 5 bonus) for music directors
   - **Pricing model:** Standard pricing
   - **Price:** $49.90
   - **Billing period:** One time
3. Click **Save product**
4. Copy the **Price ID**
5. Add to `.env`: `STRIPE_PRICE_PRO_PACK=price_xxxxx`

---

### 2.2 Create Pro Subscription

1. Click **+ Add product**
2. Product details:
   - **Name:** Pro Subscription
   - **Description:** Unlimited chord analyses for professional worship musicians
   - **Pricing model:** Standard pricing
   - **Price:** $19.90
   - **Billing period:** Monthly
   - **Free trial:** None (optional: add 7-day trial)
3. Click **Save product**
4. Copy the **Price ID**
5. Add to `.env`: `STRIPE_PRICE_SUBSCRIPTION=price_xxxxx`

---

## Step 3: Configure Webhooks

Webhooks allow Stripe to notify your backend when payments succeed.

### 3.1 Create Webhook Endpoint

Go to: https://dashboard.stripe.com/test/webhooks

1. Click **+ Add endpoint**
2. **Endpoint URL:** `https://your-domain.com/stripe/webhook`
   - For local testing: Use Stripe CLI (see below)
   - For production: Your actual domain
3. **Events to listen to:**
   - Select **checkout.session.completed**
   - Select **customer.subscription.updated**
   - Select **customer.subscription.deleted**
4. Click **Add endpoint**

### 3.2 Copy Webhook Secret

1. Click on your newly created webhook
2. Find **Signing secret** (starts with `whsec_`)
3. Click **Reveal**
4. Copy the secret
5. Add to `.env`: `STRIPE_WEBHOOK_SECRET=whsec_xxxxx`

---

## Step 4: Local Webhook Testing (Optional but Recommended)

To test webhooks locally, use Stripe CLI.

### 4.1 Install Stripe CLI

**macOS:**
```bash
brew install stripe/stripe-cli/stripe
```

**Other platforms:**
https://stripe.com/docs/stripe-cli

### 4.2 Login to Stripe

```bash
stripe login
```

This will open a browser to authorize.

### 4.3 Forward Webhooks to Local Server

```bash
stripe listen --forward-to localhost:3001/stripe/webhook
```

This will output a webhook signing secret (starts with `whsec_`). Add it to your `.env`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxx_from_cli
```

**Keep this terminal running** while testing!

---

## Step 5: Verify Configuration

Your `.env` should now have:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_...

# Products
STRIPE_PRICE_STARTER=price_...      # $9.90 for 5 credits
STRIPE_PRICE_STANDARD=price_...     # $24.90 for 17 credits
STRIPE_PRICE_PRO_PACK=price_...     # $49.90 for 40 credits
STRIPE_PRICE_SUBSCRIPTION=price_... # $19.90/month Pro plan
```

---

## Step 6: Test the Integration

### 6.1 Restart Backend

```bash
# The backend should auto-reload if in watch mode
# If not, restart it:
npm run start:dev
```

Check logs for:
```
✅ Stripe client initialized
```

### 6.2 Get Available Packages

```bash
curl http://localhost:3001/stripe/packages
```

**Expected response:**
```json
{
  "packages": [
    {
      "id": "starter",
      "name": "Starter Pack",
      "credits": 5,
      "price": 990,
      "priceId": "price_..."
    },
    {
      "id": "standard",
      "name": "Standard Pack",
      "credits": 17,
      "price": 2490,
      "priceId": "price_...",
      "popular": true
    },
    {
      "id": "pro",
      "name": "Pro Pack",
      "credits": 40,
      "price": 4990,
      "priceId": "price_..."
    }
  ]
}
```

### 6.3 Create Checkout Session

First, get an auth token:
```bash
node backend/test-flow.js
# Copy the JWT token from output
```

Then create a checkout session:
```bash
curl -X POST http://localhost:3001/stripe/checkout/credits \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"packageId": "standard"}'
```

**Expected response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

### 6.4 Complete Test Payment

1. Open the `url` from the response in your browser
2. You'll see Stripe's checkout page
3. Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/34)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits (e.g., 12345)
4. Click **Pay**
5. You should be redirected to success page

### 6.5 Verify Webhook Received

Check your backend logs or Stripe CLI output:

```
[Stripe] Received webhook: checkout.session.completed
[Stripe] Processing checkout for user 2746602e..., type: credit_purchase
[Stripe] Added 17 credits to user 2746602e.... New balance: 17
```

### 6.6 Verify Credits Added

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/analysis/me/stats
```

**Expected response:**
```json
{
  "plan": "credits",
  "creditsRemaining": 17,  // ✅ Credits added!
  "maxDuration": 300,
  "canAnalyze": true
}
```

---

## Step 7: Test Subscription

### 7.1 Create Subscription Checkout

```bash
curl -X POST http://localhost:3001/stripe/checkout/subscription \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 7.2 Complete Subscription Payment

1. Open the returned URL
2. Use test card `4242 4242 4242 4242`
3. Complete checkout

### 7.3 Verify Pro Upgrade

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/analysis/me/stats
```

**Expected:**
```json
{
  "plan": "pro",  // ✅ Upgraded!
  "canAnalyze": true,
  "maxDuration": 300
}
```

---

## API Endpoints

### Public Endpoints

#### `GET /stripe/packages`
Get available credit packages.

**Response:**
```json
{
  "packages": [
    {
      "id": "starter",
      "name": "Starter Pack",
      "credits": 5,
      "price": 990,
      "priceId": "price_..."
    }
  ]
}
```

---

### Protected Endpoints (Require Auth)

#### `POST /stripe/checkout/credits`
Create checkout session for credit purchase.

**Request:**
```json
{
  "packageId": "standard"  // "starter" | "standard" | "pro"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

---

#### `POST /stripe/checkout/subscription`
Create checkout session for Pro subscription.

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

---

#### `POST /stripe/portal`
Create customer portal session (for managing subscription).

**Response:**
```json
{
  "url": "https://billing.stripe.com/session/..."
}
```

---

### Webhook Endpoint

#### `POST /stripe/webhook`
Receives Stripe webhook events.

**Headers:**
- `stripe-signature`: Webhook signature for verification

**Events handled:**
- `checkout.session.completed` - Payment succeeded
- `customer.subscription.updated` - Subscription changed
- `customer.subscription.deleted` - Subscription canceled

---

## Stripe Test Cards

### Success

| Card Number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Succeeds immediately |
| `5555 5555 5555 4444` | Mastercard |
| `3782 822463 10005` | American Express |

### Declined

| Card Number | Error |
|-------------|-------|
| `4000 0000 0000 0002` | Card declined |
| `4000 0000 0000 9995` | Insufficient funds |
| `4000 0000 0000 0069` | Expired card |

**Full list:** https://stripe.com/docs/testing

---

## Security Best Practices

### ✅ DO:
- Always use webhook signature verification (already implemented)
- Never expose `STRIPE_SECRET_KEY` to frontend
- Use HTTPS in production
- Validate webhook events before processing
- Store customer IDs and subscription IDs securely

### ❌ DON'T:
- Don't trust client-side data (always verify via webhook)
- Don't skip signature verification
- Don't commit API keys to git (use .env)
- Don't use test keys in production

---

## Troubleshooting

### "Stripe not configured" Error

**Problem:** Backend logs show "⚠️  Stripe secret key not configured"

**Solution:**
1. Check `.env` has `STRIPE_SECRET_KEY`
2. Restart backend
3. Verify logs show "✅ Stripe client initialized"

---

### Webhook Not Received

**Problem:** Payment succeeds but credits not added

**Solution:**
1. Check Stripe CLI is running (`stripe listen --forward-to...`)
2. Verify `STRIPE_WEBHOOK_SECRET` matches CLI output
3. Check backend logs for webhook errors
4. In Stripe Dashboard → Webhooks → Check "Webhook attempts"

---

### "Invalid signature" Error

**Problem:** Webhook endpoint returns 400 with "Invalid signature"

**Solution:**
1. Ensure `STRIPE_WEBHOOK_SECRET` is correct
2. For local testing: Use secret from `stripe listen` command
3. For production: Use secret from Stripe Dashboard webhook settings
4. Make sure raw body parsing is enabled (already configured in main.ts)

---

### Credits Not Added After Payment

**Problem:** Payment succeeds but `creditsRemaining` doesn't increase

**Solution:**
1. Check webhook was received (backend logs)
2. Verify webhook event type is `checkout.session.completed`
3. Check session metadata contains `userId`, `type`, `credits`
4. Look for errors in webhook handler logs

---

## Production Checklist

Before going live:

- [ ] Switch to **Live Mode** in Stripe Dashboard
- [ ] Get live API keys (starts with `sk_live_`)
- [ ] Create live products (same as test mode)
- [ ] Update webhook endpoint to production URL
- [ ] Update `FRONTEND_URL` in `.env` to production domain
- [ ] Test with real card (or use test mode in live)
- [ ] Set up proper error monitoring
- [ ] Configure subscription grace periods
- [ ] Set up billing email notifications
- [ ] Review Stripe's tax settings (if applicable)

---

## Next Steps

After Stripe is configured:

1. **Ready for production?** See [STRIPE_PRODUCTION_SETUP.md](./STRIPE_PRODUCTION_SETUP.md) for live environment setup
2. Build frontend checkout flow
3. Add customer portal for subscription management
4. Implement email notifications for purchases
5. Add usage alerts when credits run low
6. Set up revenue analytics
7. A/B test pricing tiers

---

## Resources

- [Stripe Dashboard](https://dashboard.stripe.com)
- [Stripe API Docs](https://stripe.com/docs/api)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- **[Production Setup Guide](./STRIPE_PRODUCTION_SETUP.md)** - Guide for configuring live Stripe environment

---

**Setup Guide Created:** 2026-04-25
**Status:** Ready for configuration
**Next:** Create products in Stripe Dashboard, then see [STRIPE_PRODUCTION_SETUP.md](./STRIPE_PRODUCTION_SETUP.md) for production
