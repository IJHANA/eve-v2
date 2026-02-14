# Troubleshooting Agent Update Issues

## Problem
Settings → Agent tab doesn't save name, core_prompt, or default_voice_id to the database.

## Step-by-Step Fix

### 1. Add Missing Column (CRITICAL)
The `default_voice_id` column doesn't exist in your database yet!

**Run this in Supabase SQL Editor:**
```sql
-- From add-voice-column.sql
ALTER TABLE agents ADD COLUMN default_voice_id TEXT;
ALTER TABLE agents ALTER COLUMN core_prompt DROP NOT NULL;
```

### 2. Verify Column Exists
**Run this:**
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'agents'
AND column_name IN ('name', 'core_prompt', 'default_voice_id')
ORDER BY column_name;
```

**You should see:**
```
column_name      | data_type | is_nullable
-----------------+-----------+-------------
core_prompt      | text      | YES
default_voice_id | text      | YES
name             | text      | NO
```

### 3. Test Manual Update
**Find your agent:**
```sql
SELECT id, name, core_prompt, default_voice_id 
FROM agents 
WHERE user_id = auth.uid();
```

**Try updating it (replace YOUR_AGENT_ID):**
```sql
UPDATE agents 
SET 
  name = 'Test Name',
  core_prompt = 'Test prompt',
  default_voice_id = '21m00Tcm4TlvDq8ikWAM'
WHERE id = 'YOUR_AGENT_ID'::uuid
AND user_id = auth.uid()
RETURNING *;
```

**Expected result:** Should return 1 row with updated values.

### 4. Check RLS Policies
**Run this:**
```sql
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'agents';
```

**Expected policy:**
- Name: `agents_user_policy`
- Command: `ALL`
- USING: `auth.uid() = user_id`
- WITH CHECK: `auth.uid() = user_id`

### 5. If Manual Update Works But API Doesn't

Check Vercel logs after clicking Save:

**Look for:**
```
Update agent request: { agentId: "...", name: "Ara", ... }
Error updating agent: { message: "...", code: "..." }
```

### 6. Common Issues & Fixes

**Issue: Column doesn't exist**
```
ERROR: column "default_voice_id" does not exist
```
**Fix:** Run step 1 again.

**Issue: Permission denied**
```
ERROR: permission denied for table agents
```
**Fix:** Update RLS policy:
```sql
DROP POLICY IF EXISTS agents_user_policy ON agents;
CREATE POLICY agents_user_policy ON agents
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

**Issue: NULL constraint violation**
```
ERROR: null value in column "core_prompt" violates not-null constraint
```
**Fix:** Run step 1 to make it nullable.

### 7. Verify Fix Works

1. Go to Settings → ✨ Agent
2. Change name to "Ara"
3. Add a prompt
4. Select voice
5. Click [Save Changes]
6. Should see: "Agent settings saved successfully!"
7. Check database:
```sql
SELECT name, core_prompt, default_voice_id 
FROM agents 
WHERE user_id = auth.uid();
```

## Quick Fix (All-in-One)

Run this entire script in Supabase SQL Editor:

```sql
-- Add missing column
ALTER TABLE agents ADD COLUMN IF NOT EXISTS default_voice_id TEXT;

-- Make core_prompt nullable
ALTER TABLE agents ALTER COLUMN core_prompt DROP NOT NULL;

-- Fix RLS policy
DROP POLICY IF EXISTS agents_user_policy ON agents;
CREATE POLICY agents_user_policy ON agents
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Verify
SELECT 
  'Columns' as check_type,
  column_name, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'agents'
AND column_name IN ('name', 'core_prompt', 'default_voice_id')

UNION ALL

SELECT 
  'Policy' as check_type,
  policyname as column_name,
  'true' as is_nullable
FROM pg_policies
WHERE tablename = 'agents';
```

## Need More Help?

Check the Vercel Function Logs:
1. Go to Vercel Dashboard
2. Click on your deployment
3. Go to "Functions" tab
4. Find `/api/update-agent`
5. Look for error messages

The logs will show exactly what's failing!
