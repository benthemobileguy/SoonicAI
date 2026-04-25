# Stripe Production Setup Guide

**Date:** 2026-04-25
**Status:** Ready for Production Deployment
**Prerequisites:** Test mode setup complete (see STRIPE_SETUP.md)

---

## Overview

This guide walks you through configuring Stripe for **production/live environment** where you'll accept real payments from real customers.

**⚠️ CRITICAL:** Unlike test mode, production mistakes affect real money and real customers. Follow this guide carefully.

---

## Key Differences: Test vs Production

| Aspect | Test Mode | Live Mode |
|--------|-----------|-----------|
| **API Keys** | `sk_test_...` / `pk_test_...` | `sk_live_...` / `pk_live_...` |
| **Payments** | Fake card numbers | Real credit cards |
| **Money** | No real money moves | Real payments processed |
| **Products** | Separate test products | Separate live products |
| **Webhooks** | Can use localhost with CLI | Must use public HTTPS URL |
| **Dashboard URL** | dashboard.stripe.com/test/... | dashboard.stripe.com/... |

**Important:** Test and Live modes are completely separate. Products, customers, and payments created in test mode DO NOT transfer to live mode.

---

## Step 1: Switch to Live Mode

### 1.1 Access Stripe Dashboard

Go to: https://dashboard.stripe.com

### 1.2 Toggle to Live Mode

- Look for the **"Test mode"** toggle in the top-right corner
- Click to switch to **"Live mode"**
- You'll see the interface change (usually a different color scheme)

**Verify:** The URL should no longer contain `/test/`

---

## Step 2: Get Live API Keys

### 2.1 Navigate to API Keys

Go to: https://dashboard.stripe.com/apikeys

**Verify:** URL should NOT have `/test/` - this confirms you're in Live mode

### 2.2 Reveal and Copy Keys

**⚠️ SECURITY WARNING:** Live keys give access to real money. Treat them like passwords.

1. **Secret Key** (starts with `sk_live_`)
   - Click **"Reveal live key"**
   - Copy the entire key
   - ⚠️ This will only be shown once

2. **Publishable Key** (starts with `pk_live_`)
   - This is visible by default
   - Copy for frontend use

### 2.3 Store Keys Securely

**For Local Development:**
Create a separate `.env.production` file:

```bash
# .env.production - NEVER commit this file!
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY_HERE
```

**For Production Server:**
Use environment variables or a secrets manager:
- AWS: AWS Secrets Manager or Parameter Store
- Heroku: Config Vars
- Vercel: Environment Variables
- Railway: Environment Variables

**⚠️ NEVER:**
- Commit live keys to git
- Share live keys in Slack/email
- Use live keys in test environments
- Expose secret key to frontend

---

## Step 3: Create Live Products

You need to recreate all products in Live mode. They don't transfer from Test mode.

### Option A: Manual Creation (Recommended First Time)

#### 3.1 Create Starter Pack

Go to: https://dashboard.stripe.com/products

1. Click **"+ Add product"**
2. Fill in:
   - **Name:** Starter Pack
   - **Description:** 5 chord analyses for worship pianists
   - **Pricing model:** Standard pricing
   - **Price:** $9.90 USD
   - **Billing period:** One time
3. Click **"Save product"**
4. **Copy the Price ID** (starts with `price_`)
5. Save to `.env.production`: `STRIPE_PRICE_STARTER=price_xxxxx`

#### 3.2 Create Standard Pack

1. Click **"+ Add product"**
2. Fill in:
   - **Name:** Standard Pack
   - **Description:** 17 chord analyses (15 + 2 bonus) for regular church musicians
   - **Pricing model:** Standard pricing
   - **Price:** $24.90 USD
   - **Billing period:** One time
3. Click **"Save product"**
4. **Copy the Price ID**
5. Save to `.env.production`: `STRIPE_PRICE_STANDARD=price_xxxxx`

#### 3.3 Create Pro Pack

1. Click **"+ Add product"**
2. Fill in:
   - **Name:** Pro Pack
   - **Description:** 40 chord analyses (35 + 5 bonus) for music directors
   - **Pricing model:** Standard pricing
   - **Price:** $49.90 USD
   - **Billing period:** One time
3. Click **"Save product"**
4. **Copy the Price ID**
5. Save to `.env.production`: `STRIPE_PRICE_PRO_PACK=price_xxxxx`

#### 3.4 Create Pro Subscription

1. Click **"+ Add product"**
2. Fill in:
   - **Name:** Pro Subscription
   - **Description:** Unlimited chord analyses for professional worship musicians
   - **Pricing model:** Standard pricing
   - **Price:** $19.90 USD
   - **Billing period:** Monthly (recurring)
   - **Free trial:** Optional - recommend 7 days for new product launch
3. Click **"Save product"**
4. **Copy the Price ID**
5. Save to `.env.production`: `STRIPE_PRICE_SUBSCRIPTION=price_xxxxx`

---

### Option B: Automated Creation (After First Time)

If you want to automate live product creation (useful for multiple environments):

#### 3.5 Create Production Setup Script

Create `setup-stripe-products-live.js`:

```javascript
// setup-stripe-products-live.js
// ⚠️ WARNING: This creates REAL products that will charge REAL money

require('dotenv').config({ path: '.env.production' });
const Stripe = require('stripe');
const fs = require('fs');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function setupLiveProducts() {
  console.log('🚨 WARNING: Creating LIVE Stripe products');
  console.log('=' .repeat(60));
  console.log('');
  console.log('⚠️  This will create products that charge REAL money!');
  console.log('⚠️  Only proceed if you are ready for production.');
  console.log('');
  console.log('Press Ctrl+C within 5 seconds to cancel...');
  console.log('');

  await new Promise(resolve => setTimeout(resolve, 5000));

  console.log('Proceeding with live product creation...');
  console.log('');

  // Create Starter Pack
  console.log('1️⃣  Creating Starter Pack...');
  const starter = await stripe.products.create({
    name: 'Starter Pack',
    description: '5 chord analyses for worship pianists',
  });
  const starterPrice = await stripe.prices.create({
    product: starter.id,
    unit_amount: 990, // $9.90 in cents
    currency: 'usd',
  });
  console.log(`   ✅ Created: ${starterPrice.id}`);

  // Create Standard Pack
  console.log('2️⃣  Creating Standard Pack...');
  const standard = await stripe.products.create({
    name: 'Standard Pack',
    description: '17 chord analyses (15 + 2 bonus) for regular church musicians',
  });
  const standardPrice = await stripe.prices.create({
    product: standard.id,
    unit_amount: 2490, // $24.90 in cents
    currency: 'usd',
  });
  console.log(`   ✅ Created: ${standardPrice.id}`);

  // Create Pro Pack
  console.log('3️⃣  Creating Pro Pack...');
  const pro = await stripe.products.create({
    name: 'Pro Pack',
    description: '40 chord analyses (35 + 5 bonus) for music directors',
  });
  const proPrice = await stripe.prices.create({
    product: pro.id,
    unit_amount: 4990, // $49.90 in cents
    currency: 'usd',
  });
  console.log(`   ✅ Created: ${proPrice.id}`);

  // Create Pro Subscription
  console.log('4️⃣  Creating Pro Subscription...');
  const subscription = await stripe.products.create({
    name: 'Pro Subscription',
    description: 'Unlimited chord analyses for professional worship musicians',
  });
  const subscriptionPrice = await stripe.prices.create({
    product: subscription.id,
    unit_amount: 1990, // $19.90 in cents
    currency: 'usd',
    recurring: { interval: 'month' },
  });
  console.log(`   ✅ Created: ${subscriptionPrice.id}`);

  // Update .env.production
  console.log('');
  console.log('5️⃣  Updating .env.production with price IDs...');

  const envContent = fs.readFileSync('.env.production', 'utf8');
  let newEnvContent = envContent;

  newEnvContent = newEnvContent.replace(
    /STRIPE_PRICE_STARTER=.*/,
    `STRIPE_PRICE_STARTER=${starterPrice.id}`
  );
  newEnvContent = newEnvContent.replace(
    /STRIPE_PRICE_STANDARD=.*/,
    `STRIPE_PRICE_STANDARD=${standardPrice.id}`
  );
  newEnvContent = newEnvContent.replace(
    /STRIPE_PRICE_PRO_PACK=.*/,
    `STRIPE_PRICE_PRO_PACK=${proPrice.id}`
  );
  newEnvContent = newEnvContent.replace(
    /STRIPE_PRICE_SUBSCRIPTION=.*/,
    `STRIPE_PRICE_SUBSCRIPTION=${subscriptionPrice.id}`
  );

  fs.writeFileSync('.env.production', newEnvContent);

  console.log('');
  console.log('=' .repeat(60));
  console.log('✅ LIVE PRODUCTS CREATED SUCCESSFULLY');
  console.log('');
  console.log('📋 Price IDs (also saved to .env.production):');
  console.log(`   Starter Pack: ${starterPrice.id}`);
  console.log(`   Standard Pack: ${standardPrice.id}`);
  console.log(`   Pro Pack: ${proPrice.id}`);
  console.log(`   Pro Subscription: ${subscriptionPrice.id}`);
  console.log('');
  console.log('⚠️  REMINDER: These are LIVE products that will charge real money!');
  console.log('');
}

setupLiveProducts().catch(console.error);
```

#### 3.6 Run the Script

```bash
# ⚠️ DOUBLE CHECK you're using .env.production with LIVE keys!
node setup-stripe-products-live.js
```

**Safety Features:**
- 5-second delay to allow cancellation
- Clear warnings about live mode
- Auto-updates .env.production

---

## Step 4: Configure Production Webhook

Unlike test mode, production webhooks require a **public HTTPS URL** (not localhost).

### 4.1 Determine Your Production URL

Your webhook endpoint will be:
```
https://your-production-domain.com/stripe/webhook
```

Examples:
- `https://api.soonic.ai/stripe/webhook`
- `https://soonic-backend.railway.app/stripe/webhook`
- `https://api.yourapp.com/stripe/webhook`

**Requirements:**
- ✅ Must be HTTPS (not HTTP)
- ✅ Must be publicly accessible
- ✅ Must be deployed before configuring webhook

### 4.2 Create Webhook in Stripe

Go to: https://dashboard.stripe.com/webhooks

**Verify:** You're in Live mode (no `/test/` in URL)

1. Click **"+ Add endpoint"**
2. **Endpoint URL:** Enter your production URL
   ```
   https://your-production-domain.com/stripe/webhook
   ```
3. **Description:** "Production webhook for payment events"
4. **Events to send:** Select these specific events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

   Or select **"Select all events"** (not recommended, creates noise)

5. Click **"Add endpoint"**

### 4.3 Get Webhook Signing Secret

1. Click on your newly created webhook
2. Scroll to **"Signing secret"**
3. Click **"Reveal"**
4. Copy the secret (starts with `whsec_`)
5. Add to `.env.production`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_WEBHOOK_SECRET
   ```

### 4.4 Update Production Environment

Update your production server's environment variables:

```bash
# Add to production server environment
STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_WEBHOOK_SECRET
```

---

## Step 5: Production Environment Configuration

### 5.1 Complete .env.production File

Your `.env.production` should contain:

```bash
# ====================================
# STRIPE PRODUCTION CONFIGURATION
# ====================================
# ⚠️ NEVER commit this file to git!

# API Keys (LIVE mode)
STRIPE_SECRET_KEY=sk_live_51...
STRIPE_PUBLISHABLE_KEY=pk_live_51...

# Webhook Secret (LIVE mode)
STRIPE_WEBHOOK_SECRET=whsec_...

# Product Price IDs (LIVE mode)
STRIPE_PRICE_STARTER=price_...      # $9.90 for 5 credits
STRIPE_PRICE_STANDARD=price_...     # $24.90 for 17 credits
STRIPE_PRICE_PRO_PACK=price_...     # $49.90 for 40 credits
STRIPE_PRICE_SUBSCRIPTION=price_... # $19.90/month Pro plan

# Frontend URL (Production)
FRONTEND_URL=https://soonic.ai

# Other production configs...
NODE_ENV=production
```

### 5.2 Update .gitignore

Ensure these files are NOT committed:

```gitignore
# Environment files
.env
.env.local
.env.production
.env.production.local

# Stripe
setup-stripe-products-live.js  # Optional - if you don't want to commit
```

---

## Step 6: Deploy to Production

### 6.1 Set Environment Variables on Server

**Railway:**
```bash
railway variables set STRIPE_SECRET_KEY=sk_live_...
railway variables set STRIPE_WEBHOOK_SECRET=whsec_...
railway variables set STRIPE_PRICE_STARTER=price_...
railway variables set STRIPE_PRICE_STANDARD=price_...
railway variables set STRIPE_PRICE_PRO_PACK=price_...
railway variables set STRIPE_PRICE_SUBSCRIPTION=price_...
```

**Heroku:**
```bash
heroku config:set STRIPE_SECRET_KEY=sk_live_...
heroku config:set STRIPE_WEBHOOK_SECRET=whsec_...
# ... etc
```

**Vercel (for serverless):**
```bash
vercel env add STRIPE_SECRET_KEY production
# Paste sk_live_... when prompted
```

**AWS/VPS:**
Add to your deployment script or use AWS Secrets Manager

### 6.2 Deploy Backend

```bash
# Example: Railway
railway up

# Example: Manual deploy
npm run build
pm2 restart backend
```

### 6.3 Verify Deployment

Check logs for:
```
✅ Stripe client initialized
```

**NOT:**
```
⚠️ Stripe secret key not configured
```

---

## Step 7: Testing in Production (Carefully!)

### 7.1 Use Stripe Test Mode for Live Environment

**Best Practice:** Even in production, initially test with Stripe test mode before switching to live keys.

1. Deploy with test keys first
2. Verify everything works
3. Only then switch to live keys

### 7.2 Create a Real Test Payment

**⚠️ WARNING:** This will charge your real card a small amount!

1. **Use your own credit card** (so you can refund it)
2. Buy the **Starter Pack** ($9.90 - smallest amount)
3. Verify:
   - ✅ Checkout page loads
   - ✅ Payment processes
   - ✅ Webhook received (check logs)
   - ✅ Credits added to user account
   - ✅ User redirected to success page

### 7.3 Refund the Test Payment

Go to: https://dashboard.stripe.com/payments

1. Find your test payment
2. Click **"Refund payment"**
3. Refund full amount
4. Verify refund completes

**Why do this:**
- Confirms the entire flow works
- Tests webhook in production
- Costs you nothing (immediate refund)

### 7.4 Monitor First Real Payments

For the first 5-10 real customer payments:
- Monitor Stripe Dashboard in real-time
- Check backend logs immediately after purchase
- Verify credits are added correctly
- Check for any webhook errors

---

## Step 8: Production-Only Configurations

### 8.1 Enable Stripe Radar (Fraud Prevention)

Go to: https://dashboard.stripe.com/radar/rules

- Enable **"Block payments with high risk"**
- Review rules and adjust as needed
- Stripe's default rules are good for most cases

### 8.2 Set Up Tax Collection (If Applicable)

Go to: https://dashboard.stripe.com/tax/registrations

- Check if you need to collect sales tax
- Enable automatic tax calculation if needed
- Consult with accountant for your jurisdiction

### 8.3 Configure Email Receipts

Go to: https://dashboard.stripe.com/settings/emails

- ✅ Enable **"Successful payments"** emails
- ✅ Enable **"Refund processed"** emails
- Customize email branding (logo, colors)

### 8.4 Set Up Billing Portal

Go to: https://dashboard.stripe.com/settings/billing/portal

Configure customer portal settings:
- ✅ Allow customers to update payment method
- ✅ Allow customers to cancel subscription
- ✅ Allow customers to view invoice history
- Set cancellation policy

This is used by the `/stripe/portal` endpoint.

---

## Security Checklist

### ✅ Before Going Live

- [ ] Live API keys stored securely (not in code)
- [ ] `.env.production` in `.gitignore`
- [ ] Webhook signature verification enabled (already in code)
- [ ] HTTPS enabled on production domain
- [ ] CORS configured correctly
- [ ] Rate limiting configured
- [ ] No test keys in production environment
- [ ] No live keys in test environment
- [ ] Stripe Radar enabled
- [ ] Team members have limited Stripe dashboard access
- [ ] Webhook endpoint is POST-only
- [ ] Backend validates all webhook events

---

## Monitoring & Maintenance

### 9.1 Set Up Alerts

**Stripe Dashboard → Developers → Webhooks:**
- Enable email alerts for failed webhooks
- Set up Slack notifications (optional)

**Backend Monitoring:**
- Log all Stripe API errors
- Alert on webhook signature failures
- Monitor successful payment rate

### 9.2 Regular Checks

**Daily (First Week):**
- Check Stripe Dashboard for payments
- Review webhook delivery status
- Monitor backend logs for errors

**Weekly:**
- Review failed payments
- Check for unusual patterns
- Verify credit additions are correct

**Monthly:**
- Review revenue reports
- Check for fraudulent activity
- Update products/pricing if needed

---

## Troubleshooting Production Issues

### Issue: Webhook Not Received

**Check:**
1. Webhook URL is correct and publicly accessible
2. Backend is running and responding to POST /stripe/webhook
3. STRIPE_WEBHOOK_SECRET matches dashboard
4. Check Stripe Dashboard → Webhooks → [Your webhook] → Attempts

**Fix:**
- Verify URL in browser (should return 405 Method Not Allowed for GET)
- Check firewall/security groups allow Stripe IPs
- Review webhook event logs in Stripe Dashboard

---

### Issue: Payment Succeeds but Credits Not Added

**Check:**
1. Backend logs for webhook processing
2. Stripe Dashboard → Webhooks → Event attempts
3. Verify webhook signature is valid
4. Check session metadata contains userId

**Fix:**
- Look for errors in `handleCheckoutCompleted` method
- Verify Supabase update succeeded
- Check user ID format matches database

---

### Issue: "Invalid API Key" in Production

**Check:**
1. You're using `sk_live_` key (not `sk_test_`)
2. Key is set in production environment variables
3. Backend is loading production .env
4. No typos in key

**Fix:**
- Reveal live key again in dashboard
- Copy entire key carefully
- Restart backend after updating environment

---

## Production vs Test Mode Comparison

### When to Use Each

**Test Mode:**
- ✅ Development
- ✅ Staging environment
- ✅ QA testing
- ✅ Demos
- ✅ Integration testing

**Live Mode:**
- ✅ Production environment
- ✅ Real customer payments
- ✅ Beta testing with real payments
- ❌ Never use for development/testing

---

## Migration Checklist

Complete checklist for switching from test to live:

### Development Phase
- [x] Test mode configured
- [x] Test products created
- [x] Test webhook working
- [x] Payment flow tested with test cards

### Pre-Production
- [ ] Live API keys obtained
- [ ] Live products created (identical to test)
- [ ] Production webhook configured
- [ ] .env.production file created
- [ ] Environment variables set on production server

### Production Deployment
- [ ] Backend deployed with live keys
- [ ] Webhook receiving events (verify in dashboard)
- [ ] Test payment made with real card
- [ ] Test payment refunded successfully
- [ ] Stripe Radar enabled
- [ ] Email receipts configured

### Post-Launch
- [ ] Monitor first 10 payments closely
- [ ] Verify all credits added correctly
- [ ] No webhook errors in logs
- [ ] Customer support ready
- [ ] Refund process tested

---

## Cost Considerations

### Stripe Fees (Live Mode)

**Credit Packs (One-time payments):**
- 2.9% + $0.30 per transaction
- Example: $24.90 charge = $0.72 + $0.30 = **$1.02 fee**
- You receive: $23.88

**Subscriptions:**
- 2.9% + $0.30 per month
- Example: $19.90/month = $0.58 + $0.30 = **$0.88 fee per month**
- You receive: $19.02/month

**Failed Payments:**
- No charge for failed payments
- Radar (fraud prevention) is free

### Pricing Recommendations

Current pricing is competitive:
- ✅ Starter: $9.90 (covers fees + provides margin)
- ✅ Standard: $24.90 (best value, most popular)
- ✅ Pro Pack: $49.90 (premium option)
- ✅ Subscription: $19.90/month (recurring revenue)

**After fees:**
- Starter: ~$9.28 net
- Standard: ~$23.88 net
- Pro Pack: ~$48.45 net
- Subscription: ~$19.02/month net

---

## Next Steps After Production Setup

1. **Build Frontend Pricing Page**
   - Display packages from `/stripe/packages` API
   - Integrate checkout flow
   - Handle success/failure redirects

2. **Add Customer Dashboard**
   - Show current plan
   - Show credits remaining
   - Link to Stripe billing portal

3. **Email Notifications**
   - Welcome email after purchase
   - Credits running low alert
   - Subscription renewal reminder

4. **Analytics**
   - Track conversion rates
   - Monitor popular packages
   - A/B test pricing

---

## Support Resources

- [Stripe Dashboard](https://dashboard.stripe.com)
- [Stripe API Documentation](https://stripe.com/docs/api)
- [Webhook Testing](https://stripe.com/docs/webhooks/test)
- [Production Checklist](https://stripe.com/docs/keys#checklist)
- [Stripe Support](https://support.stripe.com)

---

## Appendix: Quick Reference

### Environment Variables (Production)

```bash
# Required for production
STRIPE_SECRET_KEY=sk_live_51...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_STANDARD=price_...
STRIPE_PRICE_PRO_PACK=price_...
STRIPE_PRICE_SUBSCRIPTION=price_...
FRONTEND_URL=https://soonic.ai
```

### Important URLs

```
Stripe Live Dashboard:    https://dashboard.stripe.com
Live API Keys:            https://dashboard.stripe.com/apikeys
Live Products:            https://dashboard.stripe.com/products
Live Webhooks:            https://dashboard.stripe.com/webhooks
Live Payments:            https://dashboard.stripe.com/payments

Your Production Webhook:  https://your-domain.com/stripe/webhook
```

### API Endpoints (Same as Test)

```
GET  /stripe/packages              - Public: List credit packages
POST /stripe/checkout/credits      - Auth: Create credit checkout
POST /stripe/checkout/subscription - Auth: Create subscription checkout
POST /stripe/portal                - Auth: Customer portal
POST /stripe/webhook               - Public: Stripe webhook events
```

---

**Last Updated:** 2026-04-25
**Status:** Production Ready
**Next:** Deploy backend and configure live Stripe keys

---

**Questions or Issues?**
- Review test setup first: `STRIPE_SETUP.md`
- Check webhook events in Stripe Dashboard
- Monitor backend logs for errors
- Contact Stripe support for payment issues
