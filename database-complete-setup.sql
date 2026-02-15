-- ============================================================================
-- ALL-IN-ONE MIGRATION: Profiles + Approval + Rate Limiting
-- Run this complete file in Supabase SQL Editor
-- ============================================================================

-- STEP 1: Create profiles table
-- ============================================================================

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
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- STEP 2: Create auto-profile trigger
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- STEP 3: Enable RLS
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- STEP 4: Create profiles for existing users
-- ============================================================================

INSERT INTO profiles (id, email)
SELECT id, email FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- STEP 5: Create message usage table
-- ============================================================================

CREATE TABLE IF NOT EXISTS message_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  agent_id UUID REFERENCES agents(id),
  message_content TEXT,
  response_content TEXT,
  tokens_used INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS message_usage_user_id_idx ON message_usage(user_id);
CREATE INDEX IF NOT EXISTS message_usage_created_at_idx ON message_usage(created_at DESC);
CREATE INDEX IF NOT EXISTS message_usage_user_date_idx ON message_usage(user_id, created_at DESC);

-- STEP 6: Create rate limiting functions
-- ============================================================================

CREATE OR REPLACE FUNCTION get_daily_message_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM message_usage
    WHERE user_id = p_user_id
    AND created_at > NOW() - INTERVAL '24 hours'
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION can_send_message(p_user_id UUID)
RETURNS TABLE(
  allowed BOOLEAN,
  reason TEXT,
  wait_seconds INTEGER,
  messages_remaining INTEGER
) AS $$
DECLARE
  v_profile RECORD;
  v_daily_count INTEGER;
  v_last_message_time TIMESTAMP;
  v_seconds_since_last INTEGER;
BEGIN
  -- Get user profile
  SELECT * INTO v_profile FROM profiles WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Profile not found'::TEXT, 0, 0;
    RETURN;
  END IF;
  
  -- Check approval
  IF NOT v_profile.approved THEN
    RETURN QUERY SELECT false, 'Account pending approval'::TEXT, 0, 0;
    RETURN;
  END IF;
  
  -- Check daily limit
  v_daily_count := get_daily_message_count(p_user_id);
  IF v_daily_count >= v_profile.daily_message_limit THEN
    RETURN QUERY SELECT false, 'Daily message limit reached'::TEXT, 0, 0;
    RETURN;
  END IF;
  
  -- Check cooldown
  SELECT created_at INTO v_last_message_time
  FROM message_usage
  WHERE user_id = p_user_id
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF v_last_message_time IS NOT NULL THEN
    v_seconds_since_last := EXTRACT(EPOCH FROM (NOW() - v_last_message_time))::INTEGER;
    IF v_seconds_since_last < v_profile.message_cooldown_seconds THEN
      RETURN QUERY SELECT 
        false, 
        'Please wait before sending another message'::TEXT,
        v_profile.message_cooldown_seconds - v_seconds_since_last,
        v_profile.daily_message_limit - v_daily_count;
      RETURN;
    END IF;
  END IF;
  
  -- All checks passed
  RETURN QUERY SELECT 
    true, 
    'OK'::TEXT, 
    0, 
    v_profile.daily_message_limit - v_daily_count - 1;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION log_message_usage(
  p_user_id UUID,
  p_agent_id UUID,
  p_message_content TEXT,
  p_response_content TEXT,
  p_tokens_used INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_usage_id UUID;
BEGIN
  INSERT INTO message_usage (
    user_id, agent_id, message_content, response_content, tokens_used
  ) VALUES (
    p_user_id, p_agent_id, p_message_content, p_response_content, p_tokens_used
  )
  RETURNING id INTO v_usage_id;
  RETURN v_usage_id;
END;
$$ LANGUAGE plpgsql;

-- STEP 7: Enable RLS on message_usage
-- ============================================================================

ALTER TABLE message_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own message usage" ON message_usage;
CREATE POLICY "Users can view own message usage"
  ON message_usage FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can insert message usage" ON message_usage;
CREATE POLICY "Service role can insert message usage"
  ON message_usage FOR INSERT
  WITH CHECK (true);

-- STEP 8: Create usage stats view
-- ============================================================================

CREATE OR REPLACE VIEW user_usage_stats AS
SELECT 
  u.id as user_id,
  u.email,
  p.approved,
  p.daily_message_limit,
  COUNT(m.id) FILTER (WHERE m.created_at > NOW() - INTERVAL '24 hours') as messages_today,
  COUNT(m.id) FILTER (WHERE m.created_at > NOW() - INTERVAL '7 days') as messages_this_week,
  COUNT(m.id) as total_messages,
  MAX(m.created_at) as last_message_at,
  SUM(m.tokens_used) as total_tokens_used
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
LEFT JOIN message_usage m ON m.user_id = u.id
GROUP BY u.id, u.email, p.approved, p.daily_message_limit
ORDER BY messages_today DESC;

-- ============================================================================
-- APPROVE YOURSELF
-- ============================================================================

-- Replace 'your-email@example.com' with your actual email
UPDATE profiles 
SET approved = true, approved_at = NOW()
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check profiles exist
SELECT 'Profiles created:' as status, COUNT(*) as count FROM profiles;

-- View all profiles
SELECT id, email, approved, daily_message_limit, response_length 
FROM profiles 
ORDER BY created_at DESC 
LIMIT 10;

-- Test rate limit function
SELECT * FROM can_send_message(
  (SELECT id FROM auth.users LIMIT 1)
);

-- ============================================================================
-- MIGRATION COMPLETE!
-- ============================================================================

-- Next steps:
-- 1. Verify your email is approved above
-- 2. Deploy the updated code
-- 3. Test the approval flow with a new account
