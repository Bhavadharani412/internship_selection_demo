# Free Hosting Setup - Visual Guide

## 🎯 What You'll Get (All Free)

```
Your Project
    ↓
GitHub (Code Hosting)
    ├─ Frontend Code
    ├─ Backend Code
    └─ Documentation
    
    Triggers Auto-Deploy ↓

Vercel (Frontend Hosting)           Railway (Backend Hosting)
- React + Vite app                  - Node.js + Express API
- Static files served globally      - Real-time data processing
- Free SSL/HTTPS                    - Free SSL/HTTPS
- CDN included                      - $5 credit = ~free forever
- Custom domain ready               - Custom domain ready

Both connect to ↓

MongoDB Atlas (Database)
- 512MB free storage
- Cloud-hosted
- Automatic backups
- SSL encrypted
```

---

## Step-by-Step: 40 Minutes to Live

### Step 1: Push to GitHub (5 min)

```bash
# Go to your project folder
cd D:\caratlane-fsd-intern

# Setup git
git init
git add .
git commit -m "Initial: User profile feature + real-time sync"
git remote add origin https://github.com/Bhavadharani412/internship_selection_demo.git
git branch -M main
git push -u origin main
```

✅ Your code is now on GitHub!

---

### Step 2: Create MongoDB Database (5 min)

```
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up FREE (Google/GitHub login works)
3. Create FREE tier cluster (M0)
4. Click "Connect" → Get connection string
5. Copy: mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/...
6. Save it - you'll need it soon!
```

**Connection String Example**:
```
mongodb+srv://admin:password123@aurelia.xxxxx.mongodb.net/aurelia?retryWrites=true&w=majority
```

✅ Your database is ready!

---

### Step 3: Deploy Backend on Railway (10 min)

```
1. Go to https://railway.app
2. Click "Start New Project"
3. Select "Deploy from GitHub Repo"
4. Sign in with GitHub
5. Choose: internship_selection_demo
6. Click "Deploy"

Wait for build to complete...

7. Go to Settings (gear icon)
8. Add these environment variables:
   - PORT = 4000
   - NODE_ENV = production
   - MONGODB_URI = <paste your MongoDB connection string>

9. Click "Deploy" again

10. Go to the "Deployments" tab
11. Click on your app name
12. Copy the URL (looks like: https://xxx.railway.app)
```

✅ Your backend is LIVE!

**Test it**:
```
Visit: https://xxx.railway.app/api/v1/health
Should show: {"data": {"status": "ok", "database": "connected"}}
```

---

### Step 4: Deploy Frontend on Vercel (10 min)

```
1. Go to https://vercel.com
2. Click "Add New" → Project
3. Import GitHub Repository
4. Select: internship_selection_demo
5. Choose framework: Other
6. Root directory: apps/web
7. Build command: pnpm build
8. Output directory: dist
9. Click "Deploy"

Wait for build to complete...

10. Add Environment Variable:
    - VITE_API_BASE_URL = <your Railway URL>
      (e.g., https://xxx.railway.app)

11. Click "Redeploy"

Wait...

12. You'll see "Congratulations! Your site is live"
13. Copy the URL (looks like: https://xxx.vercel.app)
```

✅ Your frontend is LIVE!

**Test it**:
```
Visit: https://xxx.vercel.app
Should load your Aurelia site!
```

---

### Step 5: Verify Everything Works (10 min)

```
1. Open profile page:
   https://xxx.vercel.app/account/profile

2. Edit profile:
   - Click "Edit Profile"
   - Change name
   - Save
   - ✅ Should update

3. Test cart sync:
   - Open http://xxx.vercel.app/account/profile (Tab 1)
   - Open http://xxx.vercel.app/shop (Tab 2)
   - Add to wishlist in Tab 2
   - Watch Tab 1 count update ✅

4. Check API:
   https://xxx.railway.app/api/v1/health
   Should return JSON ✅

5. Browser console:
   Open DevTools (F12)
   Check for any errors
   Should be clean ✅
```

---

## The Architecture (After Deployment)

```
┌──────────────────────────────────────────────────────────┐
│                    Your Laptop                           │
│                  (Development)                           │
│                                                          │
│  $ git push origin main                                │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────────┐
│                 GitHub.com                               │
│      internship_selection_demo (Your Code)              │
│  - triggers auto-deploy on push                         │
└────────────┬──────────────────────────────┬──────────────┘
             │                              │
             ↓                              ↓
   ┌──────────────────────┐      ┌──────────────────────┐
   │    Vercel.com        │      │    Railway.app       │
   │  (Frontend Hosting)  │      │  (Backend Hosting)   │
   │                      │      │                      │
   │ https://xxx          │      │ https://yyy          │
   │  .vercel.app         │      │  .railway.app        │
   │                      │      │                      │
   │ React + Vite         │      │ Node.js + Express    │
   │ Static Files         │      │ Real-time API        │
   │ CDN (Fast!)          │      │ $5 credit/month      │
   └──────────┬───────────┘      └────────┬─────────────┘
              │                           │
              │        Talks to each other│
              └───────────────┬───────────┘
                              ↓
                   ┌─────────────────────┐
                   │  MongoDB Atlas      │
                   │  (Database)         │
                   │                     │
                   │ 512MB Free          │
                   │ Cloud-hosted        │
                   │ Encrypted           │
                   └─────────────────────┘

Users visit: https://xxx.vercel.app
                    ↓
         Browser requests load
                    ↓
         Gets React app from Vercel
                    ↓
         React app makes API calls
                    ↓
         API calls go to Railway
                    ↓
         Railway reads/writes to MongoDB
                    ↓
         Response sent back to browser
                    ↓
         Users see their profile! ✨
```

---

## URLs You'll Have (After Deployment)

| What | URL | Cost |
|------|-----|------|
| **Your Site** | https://xxx.vercel.app | FREE |
| **API** | https://xxx.railway.app | FREE |
| **Database** | MongoDB Atlas | FREE |
| **Code** | GitHub | FREE |
| **Total** | | **$0/month** ✨ |

---

## How It Works (Simple Version)

```
1. You write code locally
   ↓
2. Push to GitHub
   $ git push origin main
   ↓
3. GitHub tells Vercel & Railway
   "Hey, there's new code!"
   ↓
4. Vercel builds your React app
   npm run build
   ↓
5. Vercel uploads to their servers
   ↓
6. Railway pulls your code
   ↓
7. Railway starts Node.js server
   ↓
8. Users visit https://xxx.vercel.app
   ↓
9. Their browser connects to Vercel
   ↓
10. React app loads
    ↓
11. App makes API calls to Railway
    ↓
12. Railway sends back data
    ↓
13. Browser shows the result
    ↓
14. User sees profile, cart, wishlist, etc!
```

---

## Common Questions

### "Will my data be lost if I restart?"
```
No! Data is in MongoDB (persistent)
Even if servers restart, data stays
```

### "How many users can it support?"
```
Free tier supports:
- ~100 concurrent users (Vercel)
- ~100 concurrent users (Railway)
- 512MB database (MongoDB) = ~50k documents

Great for internship project!
```

### "What if traffic spikes?"
```
Vercel: Auto-scales (may use paid tier)
Railway: Auto-scales (may use paid tier)
MongoDB: You'd need upgrade

But unlikely for a project
```

### "Can I use my own domain?"
```
Yes! Both Vercel and Railway support:
- yourcompany.com → https://xxx.vercel.app
- api.yourcompany.com → https://xxx.railway.app

Costs $0-$5/year for domain
```

### "Is it secure?"
```
Yes! 
- HTTPS enabled (automatic)
- Data encrypted in transit
- MongoDB encrypted at rest
- No one can see your code (unless public repo)
- API validates all inputs
```

### "How do I update the code?"
```
1. Make changes locally
2. $ git add .
3. $ git commit -m "description"
4. $ git push origin main
5. Automatic deploy happens!
6. New code live in ~2 minutes
```

---

## Before You Deploy

### Create a `.env` File (apps/web/.env.local)

```env
VITE_API_BASE_URL=https://your-railway-api.railway.app
```

**In Vercel Dashboard:**
- Project Settings → Environment Variables
- Add: `VITE_API_BASE_URL` = your Railway URL

### MongoDB Connection String Format

```
mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/DATABASE_NAME?retryWrites=true&w=majority
```

### Railway Environment Variables

```
PORT=4000
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster...
```

---

## Quick Troubleshooting

### Frontend not connecting to API?
```
1. Check VITE_API_BASE_URL in Vercel env vars
2. Make sure it's the Railway URL
3. Wait 5 minutes for re-deploy
4. Hard refresh browser (Ctrl+Shift+R)
```

### API returning errors?
```
1. Check Railway logs
   → Select your deployment
   → View Logs tab
2. Look for MongoDB connection errors
3. Verify MongoDB URI format
4. Add IP to MongoDB whitelist (0.0.0.0/0)
```

### Build failing?
```
1. Test build locally first
   cd apps/web && pnpm build
2. Fix any errors
3. Push to GitHub
4. Check deployment logs
```

---

## After Everything is Live

### Share Your Project

```
"Check out my internship project!"

🔗 Live Demo: https://xxx.vercel.app
🔗 Code: https://github.com/Bhavadharani412/internship_selection_demo
🔗 API: https://xxx.railway.app/api/v1/health

Features:
✨ User profiles with real-time updates
✨ Wishlist & cart management
✨ Appointment booking
✨ Search & filtering
✨ Responsive design
```

### Setup Monitoring (Optional)

```bash
# Optional: Add error tracking (free tier)
npm install @sentry/react

# Then initialize in main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
});
```

---

## Cost Breakdown

| Service | Free Tier | Used | Cost |
|---------|-----------|------|------|
| Vercel | 100GB/month | ~5GB | **$0** |
| Railway | $5 credit | $5 | **$0** |
| MongoDB | 512MB | ~100MB | **$0** |
| GitHub | Unlimited | Unlimited | **$0** |
| Domain | N/A | Optional | $0-5 |
| **Total** | | | **$0-5/month** |

**You can host for FREE!** 🎉

---

## Timeline

```
Day 1:
  9:00 - Push to GitHub (5 min)
  9:05 - Create MongoDB (5 min)
  9:10 - Deploy to Railway (10 min)
  9:20 - Deploy to Vercel (10 min)
  9:30 - Test everything (10 min)
  9:40 - LIVE! 🚀

Share with:
  - Your internship manager
  - Your friends
  - On LinkedIn
  - In your portfolio
```

---

## Success Indicators

✅ You know you're successful when:

1. GitHub shows your code
2. Vercel shows "Congratulations"
3. Railway shows "Running" (green)
4. Profile page loads without errors
5. You can edit profile and see changes
6. Wishlist/cart counts update instantly
7. No browser console errors
8. HTTPS URL works (green lock)

---

## Next Steps After Deployment

1. **Share it**
   - LinkedIn post
   - GitHub profile
   - Portfolio site

2. **Track metrics** (optional)
   - Vercel Analytics
   - Railway Logs

3. **Add features** (optional)
   - Password reset
   - Order history
   - Admin dashboard

4. **Optimize** (optional)
   - Lighthouse score
   - Web vitals

---

## One-Line Cheat Sheet

```bash
# Do this once:
git push && deploy Vercel && deploy Railway && smile 😊
```

---

**You're about 40 minutes away from having a live website!**

No credit card required. No complicated setup. Just code that works.

Go deploy! 🚀
