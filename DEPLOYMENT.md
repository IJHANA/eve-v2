# DEPLOYMENT GUIDE - EVE V2

## 🚀 Step-by-Step Deployment (15 minutes)

### STEP 1: Database Migration (5 min)

1. Open Supabase: https://supabase.com/dashboard/project/xesdnhwiqkviompqkeal
2. Click "SQL Editor" in left sidebar
3. Click "New Query"
4. Open `database-migration.sql` from this repo
5. Copy the ENTIRE file
6. Paste into Supabase SQL Editor
7. Click "Run" (bottom right)
8. Wait for "Success" message
9. Verify by running:
```sql
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('agents', 'conversations', 'memories', 'knowledge_domains');
```
You should see all 4 tables listed.

### STEP 2: Push to GitHub (2 min)

```bash
# Navigate to the eve-v2 folder
cd eve-v2

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial Eve v2 commit"

# Add your remote (replace with your actual repo URL)
git remote add origin https://github.com/IJHANA/eve-v2.git

# Push
git push -u origin main
```

### STEP 3: Deploy to Vercel (5 min)

1. Go to https://vercel.com
2. Click "Add New..." → "Project"
3. Import your GitHub repo: "eve-v2"
4. Configure:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `next build`
   - Output Directory: (leave default)

5. Add Environment Variables (click "Environment Variables"):
   Copy ALL variables from your `.env.local` file:
   
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   OPENAI_API_KEY
   NEXT_PUBLIC_ELEVENLABS_API_KEY
   NEXT_PUBLIC_ELEVENLABS_VOICE_ID
   NEXT_PUBLIC_ELEVENLABS_TOUCHE_VOICE_ID
   XAI_API_KEY
   GROK_KEY
   GOOGLE_CLIENT_ID
   GOOGLE_CLIENT_SECRET
   NEXTAUTH_URL
   NEXTAUTH_SECRET
   ```

6. Click "Deploy"
7. Wait 2-3 minutes for build to complete

### STEP 4: Test Deployment (3 min)

1. Once deployed, Vercel will give you a URL: `https://eve-v2-xxx.vercel.app`
2. Open that URL
3. Test:
   - Age gate appears
   - Can sign in with Google
   - Can create new agent or import
   - Mood sliders work
   - Chat responds

### STEP 5: Point ijhana.com to New Deployment (Monday)

**Option A: Update Existing Vercel Project**
1. Go to your existing ijhana.com Vercel project
2. Settings → Git
3. Change Connected Git Repository to "eve-v2"
4. Redeploy
5. Domain automatically switches

**Option B: Create New Project + Transfer Domain**
1. In your new eve-v2 Vercel project
2. Settings → Domains
3. Add domain: "ijhana.com"
4. Vercel will provide DNS instructions
5. Update your DNS provider
6. Wait 5-10 min for propagation

## 🔥 Troubleshooting

### Build fails with "Can't find module X"
```bash
# In your local eve-v2 folder:
npm install
# Commit the updated package-lock.json
git add package-lock.json
git commit -m "Fix dependencies"
git push
```

### Database errors
- Check Supabase is running: https://status.supabase.com
- Verify migration ran successfully (see Step 1)
- Check RLS policies are enabled:
```sql
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('agents', 'conversations', 'memories');
```

### Environment variable errors
- Verify ALL env vars are in Vercel project settings
- NO quotes around values in Vercel (just paste the key value)
- Redeploy after adding env vars

### "Not found" errors
- Check `next.config.ts` is present
- Verify app directory structure is correct
- Try: Vercel Dashboard → Deployments → ... → Redeploy

## 📊 Monitoring After Launch

### Check These After Deployment:

1. **Analytics**
   - Vercel Dashboard → Analytics
   - Monitor page load times
   - Check error rates

2. **Database**
   - Supabase Dashboard → Database → Logs
   - Watch for slow queries
   - Monitor storage usage

3. **API Costs**
   - OpenAI Dashboard: Check token usage
   - ElevenLabs Dashboard: Check character usage
   - Supabase: Check bandwidth

## 🎉 Launch Checklist

Before announcing publicly:

- [ ] Age gate works
- [ ] Cookie banner works  
- [ ] Google login works
- [ ] Can create new agent
- [ ] Can import from Grok
- [ ] Mood sliders work
- [ ] Voice adapts to mood
- [ ] Chat saves to database
- [ ] Privacy settings work
- [ ] INFJ domain works (if enabled)
- [ ] Touché domain works
- [ ] Mobile responsive
- [ ] Privacy policy updated
- [ ] Terms of service updated

## 🆘 Emergency Rollback

If something breaks after launch:

1. Go to Vercel Dashboard
2. Deployments tab
3. Find previous working deployment
4. Click "..." → "Promote to Production"
5. Takes 30 seconds to switch back

Your old site is still at the old Vercel URL if needed.

## 📞 Support

Issues during deployment?
- Check Vercel build logs
- Check Supabase logs
- Check browser console for errors

Everything in this guide should work. If stuck, the most common issue is missing environment variables in Vercel.

Good luck! 🚀
