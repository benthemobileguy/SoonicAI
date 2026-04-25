# Supabase Database Setup Guide

## 1. Create Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in:
   - Name: `soonic-ai` (or your preference)
   - Database Password: (save this securely)
   - Region: Choose closest to your users
4. Wait for project to be created (~2 minutes)

## 2. Get API Credentials

Once project is created:

1. Go to **Settings** → **API**
2. Copy the following to your `.env` file:
   ```bash
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_KEY=your-service-role-key-here
   ```

**Important:** Use `SUPABASE_SERVICE_KEY` (service role) in backend, not anon key!

## 3. Enable Email Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates (optional for now)
4. Enable **Google OAuth** (optional, for later)

## 4. Run Database Schema

Go to **SQL Editor** and run this SQL:

```sql
-- ==========================================
-- PROFILES TABLE (Users)
-- ==========================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'credits')),
  analyses_used INTEGER NOT NULL DEFAULT 0,
  analyses_limit INTEGER NOT NULL DEFAULT 3,
  credits_remaining INTEGER DEFAULT 0,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT CHECK (subscription_status IN ('active', 'canceled', 'past_due')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- ANALYSES TABLE
-- ==========================================
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('upload', 'youtube')),
  source_url TEXT,
  file_name TEXT,
  status TEXT NOT NULL CHECK (status IN ('processing', 'completed', 'failed')),
  detected_key TEXT,
  tempo NUMERIC,
  chords JSONB,
  processing_time_seconds NUMERIC,
  confidence NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Index for faster user queries
CREATE INDEX idx_analyses_user_id ON analyses(user_id);
CREATE INDEX idx_analyses_created_at ON analyses(created_at DESC);

-- ==========================================
-- CREDIT PURCHASES TABLE
-- ==========================================
CREATE TABLE credit_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  credits_purchased INTEGER NOT NULL,
  bonus_credits INTEGER DEFAULT 0,
  stripe_payment_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for user purchases
CREATE INDEX idx_credit_purchases_user_id ON credit_purchases(user_id);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_purchases ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read their own profile
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Profiles: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Analyses: Users can read their own analyses
CREATE POLICY "Users can read own analyses"
ON analyses FOR SELECT
USING (auth.uid() = user_id);

-- Analyses: Users can insert their own analyses
CREATE POLICY "Users can insert own analyses"
ON analyses FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Credit Purchases: Users can read their own purchases
CREATE POLICY "Users can read own purchases"
ON credit_purchases FOR SELECT
USING (auth.uid() = user_id);

-- ==========================================
-- SERVICE ROLE POLICIES (Backend Access)
-- ==========================================

-- Note: Service role bypasses RLS by default
-- These policies are for documentation purposes

COMMENT ON TABLE profiles IS 'User profiles with plan and usage tracking';
COMMENT ON TABLE analyses IS 'Chord analysis results from uploaded videos';
COMMENT ON TABLE credit_purchases IS 'Record of credit pack purchases';

-- ==========================================
-- HELPER FUNCTIONS
-- ==========================================

-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, plan, analyses_used, analyses_limit)
  VALUES (NEW.id, NEW.email, 'free', 0, 3);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- SAMPLE DATA (Development Only)
-- ==========================================

-- Uncomment to create test user
/*
INSERT INTO profiles (id, email, plan, analyses_used, analyses_limit, credits_remaining)
VALUES (
  'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  'test@soonic.ai',
  'free',
  2,
  3,
  0
);
*/
```

## 5. Verify Setup

After running the SQL:

1. Go to **Table Editor**
2. You should see:
   - `profiles` table
   - `analyses` table
   - `credit_purchases` table

3. Check **Policies** tab to verify RLS is enabled

## 6. Test Authentication Flow

### Option A: Using Supabase Dashboard
1. Go to **Authentication** → **Users**
2. Click "Add user"
3. Create a test user
4. Verify profile auto-created in `profiles` table

### Option B: Using Postman/cURL
```bash
# Sign up new user
curl -X POST 'https://your-project.supabase.co/auth/v1/signup' \
  -H 'apikey: YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com",
    "password": "securepassword123"
  }'
```

## 7. Backend Configuration

Update your `/Users/apple/BNOTION/SoonicAI/backend/.env`:

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here

# Note: Use SERVICE_KEY in backend for admin operations
# Use ANON_KEY in frontend for client operations
```

## 8. Next Steps

- [ ] Test user signup flow
- [ ] Test analysis creation
- [ ] Test usage limit enforcement
- [ ] Set up Stripe integration
- [ ] Test credit purchase flow
- [ ] Test subscription flow

## Pricing Tiers Implementation

Your database now supports:

1. **Free Tier**: `plan='free'`, `analyses_limit=3`, `credits_remaining=0`
2. **Credits**: `plan='credits'`, `credits_remaining > 0`
3. **Pro Subscription**: `plan='pro'`, `analyses_limit=NULL` (unlimited)

## Troubleshooting

### Profile not auto-created?
- Check if trigger `on_auth_user_created` exists
- Check function `handle_new_user()` exists
- Check auth.users table has the user

### RLS blocking queries?
- Use service role key in backend (bypasses RLS)
- Check policy is correct in SQL Editor

### Can't connect?
- Verify SUPABASE_URL and SUPABASE_SERVICE_KEY in .env
- Check project is not paused (free tier auto-pauses after inactivity)

## Security Notes

⚠️ **NEVER** expose `SUPABASE_SERVICE_KEY` in frontend code!

- ✅ Backend: Use `SUPABASE_SERVICE_KEY` (full access)
- ✅ Frontend: Use `SUPABASE_ANON_KEY` (RLS enforced)
- ✅ Store service key in environment variables only
- ✅ Add `.env` to `.gitignore`

---

**Setup Complete!** 🎉

Your Supabase database is ready for Soonic AI backend integration.

Next: Set up Stripe integration for payments.
