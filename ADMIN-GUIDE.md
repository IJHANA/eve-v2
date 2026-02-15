# ADMIN QUICK REFERENCE GUIDE
## Managing Users, Approvals, and Rate Limits

---

## 🚀 DEPLOYMENT STEPS

### 1. Run Database Migration
```sql
-- In Supabase SQL Editor, run:
database-approval-ratelimit.sql
```

### 2. Approve Yourself First
```sql
-- Replace with your email
UPDATE profiles 
SET approved = true, approved_at = NOW()
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
);
```

### 3. Deploy Code
```bash
git add .
git commit -m "Add approval system, rate limiting, and response length control"
git push
```

---

## 👤 USER MANAGEMENT

### View All Users
```sql
SELECT 
  u.email,
  p.approved,
  p.approved_at,
  p.daily_message_limit,
  p.response_length,
  u.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;
```

### Approve a User
```sql
UPDATE profiles 
SET approved = true, approved_at = NOW()
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'user@example.com'
);
```

### Reject/Disable a User
```sql
UPDATE profiles 
SET approved = false
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'user@example.com'
);
```

---

## 📊 USAGE MONITORING

### View Usage Stats (Dashboard)
```sql
SELECT * FROM user_usage_stats
ORDER BY messages_today DESC;
```

### Check Specific User's Usage
```sql
SELECT * FROM can_send_message('user-id-here');
```

### View Message History for User
```sql
SELECT 
  created_at,
  message_content,
  tokens_used
FROM message_usage
WHERE user_id = 'user-id-here'
ORDER BY created_at DESC
LIMIT 50;
```

---

## ⚙️ CUSTOMIZE LIMITS PER USER

### Increase Daily Limit (VIP User)
```sql
UPDATE profiles 
SET daily_message_limit = 200
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'vip@example.com'
);
```

### Remove Cooldown (Power User)
```sql
UPDATE profiles 
SET message_cooldown_seconds = 0
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'power@example.com'
);
```

### Set to Unlimited
```sql
UPDATE profiles 
SET 
  daily_message_limit = 999999,
  message_cooldown_seconds = 0
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'unlimited@example.com'
);
```

---

## 📝 RESPONSE LENGTH CONTROL

### Change User's Response Length
```sql
-- Options: 'brief', 'standard', 'detailed', 'comprehensive'

UPDATE profiles 
SET response_length = 'detailed'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'user@example.com'
);
```

### Set All Users to Brief (Cost Savings)
```sql
UPDATE profiles 
SET response_length = 'brief';
```

---

## 🔍 COMMON QUERIES

### Find Users Hitting Limits
```sql
SELECT 
  u.email,
  p.daily_message_limit,
  COUNT(m.id) as messages_today
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN message_usage m ON m.user_id = u.id 
  AND m.created_at > NOW() - INTERVAL '24 hours'
GROUP BY u.email, p.daily_message_limit
HAVING COUNT(m.id) >= p.daily_message_limit
ORDER BY messages_today DESC;
```

### Find Most Active Users (Last 7 Days)
```sql
SELECT 
  u.email,
  COUNT(m.id) as message_count,
  SUM(m.tokens_used) as total_tokens
FROM auth.users u
LEFT JOIN message_usage m ON m.user_id = u.id
WHERE m.created_at > NOW() - INTERVAL '7 days'
GROUP BY u.email
ORDER BY message_count DESC
LIMIT 20;
```

### Find Pending Approvals
```sql
SELECT 
  u.email,
  u.created_at as signed_up_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.approved = false
OR p.approved IS NULL
ORDER BY u.created_at DESC;
```

---

## 🎛️ DEFAULT SETTINGS

Current defaults for new users:
- **Approval:** `false` (manual approval required)
- **Daily Limit:** `50` messages
- **Cooldown:** `3` seconds between messages
- **Response Length:** `standard` (200 words)

### Change Defaults for New Users
```sql
-- Example: More restrictive for beta
ALTER TABLE profiles 
ALTER COLUMN daily_message_limit SET DEFAULT 25;

-- Example: More generous
ALTER TABLE profiles 
ALTER COLUMN daily_message_limit SET DEFAULT 100;
```

---

## 💰 COST MONITORING

### Estimate Daily OpenAI Costs
```sql
-- Assuming ~$0.03 per 1K tokens (GPT-4)
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_messages,
  SUM(tokens_used) as total_tokens,
  ROUND(SUM(tokens_used) * 0.03 / 1000, 2) as estimated_cost_usd
FROM message_usage
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

## 🚨 EMERGENCY CONTROLS

### Disable All New Users (Beta Full)
```sql
UPDATE profiles 
SET approved = false
WHERE approved IS NULL;
```

### Rate Limit Everyone (Cost Spike)
```sql
UPDATE profiles 
SET daily_message_limit = 10;
```

### Reset Daily Counters (New Day)
```sql
-- Not needed - automatically resets after 24 hours
-- But if you want to manually reset:
DELETE FROM message_usage 
WHERE created_at < NOW() - INTERVAL '24 hours';
```

---

## 📧 NOTIFICATION QUERIES

### Get Emails of Pending Users (For Approval Emails)
```sql
SELECT email 
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.approved = false
AND u.created_at > NOW() - INTERVAL '7 days';
```

---

## ✅ TESTING

### Test Approval Flow
1. Create test account
2. Verify shows "Approval Pending" screen
3. Approve in database
4. Refresh - should show chat interface

### Test Rate Limiting
1. Send messages rapidly
2. Should see cooldown message
3. Send 50+ messages
4. Should see daily limit message

### Test Response Length
1. Set user to 'brief'
2. Send message
3. Response should be ~100 words
4. Change to 'comprehensive'
5. Response should be longer

---

**Questions? Check the database migration file for all available functions!**
