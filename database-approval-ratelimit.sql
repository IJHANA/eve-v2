-- ============================================================================
-- ACCOUNT APPROVAL + RATE LIMITING + RESPONSE LENGTH CONTROL
-- Run this AFTER database-create-profiles.sql
-- ============================================================================

-- NOTE: If you get "relation profiles does not exist" error,
-- run database-create-profiles.sql first!

-- 1. Add approval system to profiles (if columns don't exist)
DO $$ 
BEGIN
  -- Add approved column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='profiles' AND column_name='approved') THEN
    ALTER TABLE profiles ADD COLUMN approved BOOLEAN DEFAULT false;
  END IF;
  
  -- Add approved_at column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='profiles' AND column_name='approved_at') THEN
    ALTER TABLE profiles ADD COLUMN approved_at TIMESTAMP;
  END IF;
  
  -- Add approved_by column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='profiles' AND column_name='approved_by') THEN
    ALTER TABLE profiles ADD COLUMN approved_by UUID REFERENCES auth.users(id);
  END IF;
  
  -- Add daily_message_limit column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='profiles' AND column_name='daily_message_limit') THEN
    ALTER TABLE profiles ADD COLUMN daily_message_limit INTEGER DEFAULT 50;
  END IF;
  
  -- Add message_cooldown_seconds column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='profiles' AND column_name='message_cooldown_seconds') THEN
    ALTER TABLE profiles ADD COLUMN message_cooldown_seconds INTEGER DEFAULT 3;
  END IF;
  
  -- Add response_length column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='profiles' AND column_name='response_length') THEN
    ALTER TABLE profiles ADD COLUMN response_length TEXT DEFAULT 'standard';
  END IF;
END $$;

-- 4. Create message usage tracking table
CREATE TABLE IF NOT EXISTS message_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  agent_id UUID REFERENCES agents(id),
  message_content TEXT,
  response_content TEXT,
  tokens_used INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS message_usage_user_id_idx ON message_usage(user_id);
CREATE INDEX IF NOT EXISTS message_usage_created_at_idx ON message_usage(created_at DESC);
CREATE INDEX IF NOT EXISTS message_usage_user_date_idx ON message_usage(user_id, created_at DESC);

-- 6. Create function to check daily message count
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

-- 7. Create function to check if user can send message (rate limit check)
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
  -- Get user profile with limits
  SELECT * INTO v_profile
  FROM profiles
  WHERE id = p_user_id;
  
  -- Check if user is approved
  IF NOT v_profile.approved THEN
    RETURN QUERY SELECT false, 'Account pending approval', 0, 0;
    RETURN;
  END IF;
  
  -- Get daily message count
  v_daily_count := get_daily_message_count(p_user_id);
  
  -- Check daily limit
  IF v_daily_count >= v_profile.daily_message_limit THEN
    RETURN QUERY SELECT 
      false, 
      'Daily message limit reached', 
      0, 
      0;
    RETURN;
  END IF;
  
  -- Get last message time
  SELECT created_at INTO v_last_message_time
  FROM message_usage
  WHERE user_id = p_user_id
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Check cooldown period
  IF v_last_message_time IS NOT NULL THEN
    v_seconds_since_last := EXTRACT(EPOCH FROM (NOW() - v_last_message_time))::INTEGER;
    
    IF v_seconds_since_last < v_profile.message_cooldown_seconds THEN
      RETURN QUERY SELECT 
        false, 
        'Please wait before sending another message', 
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

-- 8. Create function to log message usage
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
    user_id,
    agent_id,
    message_content,
    response_content,
    tokens_used
  ) VALUES (
    p_user_id,
    p_agent_id,
    p_message_content,
    p_response_content,
    p_tokens_used
  )
  RETURNING id INTO v_usage_id;
  
  RETURN v_usage_id;
END;
$$ LANGUAGE plpgsql;

-- 9. Create view for admin to monitor usage
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

-- 10. Enable RLS on message_usage
ALTER TABLE message_usage ENABLE ROW LEVEL SECURITY;

-- Users can only see their own usage
CREATE POLICY "Users can view own message usage"
  ON message_usage FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert
CREATE POLICY "Service role can insert message usage"
  ON message_usage FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- OPTIONAL: Approve yourself immediately
-- ============================================================================

-- Replace 'your-email@example.com' with your email
UPDATE profiles 
SET 
  approved = true,
  approved_at = NOW()
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
);

-- ============================================================================
-- USAGE EXAMPLES FOR ADMIN
-- ============================================================================

-- View all users and their approval status
-- SELECT id, email, approved, approved_at FROM auth.users u JOIN profiles p ON u.id = p.id;

-- Approve a user
-- UPDATE profiles SET approved = true, approved_at = NOW() WHERE id = 'user-id-here';

-- Reject/disable a user
-- UPDATE profiles SET approved = false WHERE id = 'user-id-here';

-- View usage stats
-- SELECT * FROM user_usage_stats;

-- Check if specific user can send message
-- SELECT * FROM can_send_message('user-id-here');

-- Increase daily limit for specific user (VIP treatment)
-- UPDATE profiles SET daily_message_limit = 200 WHERE id = 'user-id-here';

-- Remove cooldown for specific user
-- UPDATE profiles SET message_cooldown_seconds = 0 WHERE id = 'user-id-here';

-- Change response length preference for user
-- UPDATE profiles SET response_length = 'detailed' WHERE id = 'user-id-here';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
