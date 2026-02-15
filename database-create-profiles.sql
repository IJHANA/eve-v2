-- ============================================================================
-- COMPLETE PROFILES TABLE SETUP
-- Run this FIRST before the approval/rate-limit migration
-- ============================================================================

-- 1. Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  
  -- Approval system
  approved BOOLEAN DEFAULT false,
  approved_at TIMESTAMP,
  approved_by UUID REFERENCES auth.users(id),
  
  -- Rate limiting
  daily_message_limit INTEGER DEFAULT 50,
  message_cooldown_seconds INTEGER DEFAULT 3,
  
  -- Response preferences
  response_length TEXT DEFAULT 'standard',
  -- Options: 'brief' (100 words), 'standard' (200 words), 'detailed' (400 words), 'comprehensive' (no limit)
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 4. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Service role can do everything
CREATE POLICY "Service role has full access to profiles"
  ON profiles FOR ALL
  USING (true)
  WITH CHECK (true);

-- 6. Create profiles for existing users (if any)
INSERT INTO profiles (id, email)
SELECT id, email FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- 7. Create indexes
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_approved_idx ON profiles(approved);
CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON profiles(created_at DESC);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check profiles table exists
SELECT COUNT(*) as profile_count FROM profiles;

-- View all profiles
SELECT 
  id,
  email,
  approved,
  daily_message_limit,
  response_length,
  created_at
FROM profiles
ORDER BY created_at DESC;

-- ============================================================================
-- PROFILES TABLE SETUP COMPLETE
-- Now you can run: database-approval-ratelimit.sql
-- ============================================================================
