# 🚀 Deployment Guide - Free Hosting

## Step 1: Push to GitHub

### Prerequisites
- Git installed on your machine
- GitHub account
- Your repo: https://github.com/Bhavadharani412/internship_selection_demo

### Push to GitHub

```bash
# Navigate to project
cd D:\caratlane-fsd-intern

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "feat: Add user profile feature with real-time cache sync

- Implement complete user profile page (/account/profile)
- Add profile view and edit modes with validation
- Fix cache synchronization for wishlist/cart counts
- Add auto-refresh fallback (5s interval)
- Include comprehensive security review & production checklist
- Add 5 new documentation guides
- Update existing docs with profile API endpoints

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"

# Add remote (replace YOUR_USERNAME if needed)
git remote add origin https://github.com/Bhavadharani412/internship_selection_demo.git

# Push to main branch
git branch -M main
git push -u origin main
```

### If Remote Already Exists
```bash
git remote set-url origin https://github.com/Bhavadharani412/internship_selection_demo.git
git push -u origin main
```

---

## Step 2: Free Hosting Setup

### Option A: Vercel (Recommended - Easiest)

#### Frontend Deployment (Vercel)

```bash
# 1. Install Vercel CLI
npm install -g vercel
# or
pnpm add -g vercel

# 2. Deploy (from project root)
vercel

# 3. Follow prompts:
#    - Link to GitHub account
#    - Select project
#    - Set build command: pnpm build
#    - Set install command: pnpm install
#    - Output directory: apps/web/dist
```

**Configuration for Vercel** (`vercel.json` - create at root):
```json
{
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install",
  "outputDirectory": "apps/web/dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/v1/:path*",
      "destination": "https://your-api-host.example.com/api/v1/:path*"
    }
  ]
}
```

#### Backend Deployment Options (Free)

**Option B1: Railway.app** (Recommended)
```bash
# 1. Sign up at https://railway.app
# 2. Connect GitHub repo
# 3. Create new project
# 4. Select "Deploy from GitHub"
# 5. Environment variables:
#    - PORT=4000 (already in code)
#    - NODE_ENV=production
#    - MONGODB_URI=<your_mongodb_connection> (optional)
```

**Option B2: Render.com** (Also Free)
```bash
# 1. Sign up at https://render.com
# 2. Create new Web Service
# 3. Connect GitHub
# 4. Build command: pnpm build
# 5. Start command: pnpm start
```

**Option B3: Heroku** (Free tier removed, ~$5/month minimum)

**Option B4: Self-host on Docker** (Free, complex)

---

## Step 3: Environment Configuration

### Frontend (.env.local in apps/web)

For Vercel, create environment variables in project settings:

```env
# development
VITE_API_BASE_URL=http://localhost:4000

# production (after backend deployed)
VITE_API_BASE_URL=https://your-api-url.railway.app
```

### Backend (apps/api/.env)

For Railway/Render:

```env
PORT=4000
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/aurelia
```

---

## Step 4: MongoDB Setup (Optional but Recommended)

### Free MongoDB Atlas

```bash
# 1. Go to https://www.mongodb.com/cloud/atlas
# 2. Create free account
# 3. Create M0 cluster (free tier)
# 4. Get connection string
# 5. Use in .env: MONGODB_URI=mongodb+srv://user:pass@cluster...
```

Connection string format:
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
```

---

## Complete Deployment Walkthrough

### Phase 1: GitHub Setup (5 min)

```bash
cd D:\caratlane-fsd-intern

# 1. Initialize repo
git init
git add .
git commit -m "Initial commit with user profile feature"

# 2. Add remote
git remote add origin https://github.com/Bhavadharani412/internship_selection_demo.git
git branch -M main
git push -u origin main

# ✅ Check: https://github.com/Bhavadharani412/internship_selection_demo
```

### Phase 2: MongoDB Setup (5 min)

```bash
# 1. Visit https://www.mongodb.com/cloud/atlas
# 2. Sign up free
# 3. Create M0 cluster
# 4. Get connection string
# 5. Save: mongodb+srv://user:pass@cluster...
```

### Phase 3: Backend Deployment (10 min)

**Using Railway.app**:

```bash
# 1. Visit https://railway.app
# 2. Sign in with GitHub
# 3. New Project → GitHub Repo
# 4. Select internship_selection_demo
# 5. Select apps/api as root directory
# 6. Add variables:
#    - PORT: 4000
#    - MONGODB_URI: <your_mongodb_url>
#    - NODE_ENV: production
# 7. Deploy
# 8. Copy API URL: https://xxx.railway.app
```

### Phase 4: Frontend Deployment (10 min)

**Using Vercel**:

```bash
# 1. Visit https://vercel.com
# 2. Sign in with GitHub
# 3. Import internship_selection_demo
# 4. Framework: Other
# 5. Root Directory: apps/web
# 6. Build Command: pnpm build
# 7. Output Directory: dist
# 8. Environment: VITE_API_BASE_URL=https://xxx.railway.app
# 9. Deploy
# 10. Get URL: https://xxx.vercel.app
```

---

## Architecture After Deployment

```
┌─────────────────────────────────────────────────────┐
│              Your Domain                            │
│           https://xxx.vercel.app                    │
│         (Frontend + Static Files)                   │
└────────────────┬────────────────────────────────────┘
                 │
                 │ Proxy /api/v1/* calls
                 ↓
┌─────────────────────────────────────────────────────┐
│         Railway.app API Server                      │
│        https://xxx.railway.app                      │
│     (Node.js + Express + TypeScript)                │
└────────────────┬────────────────────────────────────┘
                 │
                 │ Read/Write data
                 ↓
┌─────────────────────────────────────────────────────┐
│         MongoDB Atlas (Cloud)                       │
│      mongodb+srv://user:pass@cluster.mongodb.net    │
└─────────────────────────────────────────────────────┘
```

---

## Estimated Costs (Monthly)

| Component | Provider | Free Tier | Cost |
|-----------|----------|-----------|------|
| Frontend | Vercel | ✅ Unlimited | **$0** |
| Backend | Railway.app | ✅ $5 credit/month | **$0** |
| Database | MongoDB Atlas | ✅ M0 512MB | **$0** |
| **Total** | | | **$0/month** |

---

## Environment Variables Summary

### Frontend (Vercel Project Settings)

```
VITE_API_BASE_URL=https://api-production.railway.app
```

### Backend (Railway Environment)

```
PORT=4000
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/aurelia?retryWrites=true&w=majority
```

---

## DNS Setup (Optional Custom Domain)

### Add Custom Domain to Vercel

1. In Vercel project → Settings → Domains
2. Enter your domain
3. Update DNS records (CNAME or A record)
4. Wait for verification

### Add Custom Domain to Railway

1. In Railway → Settings → Domains
2. Add custom domain
3. Update DNS records
4. SSL certificate auto-generated

---

## Testing After Deployment

### Test Frontend
```bash
# Visit your Vercel URL
https://xxx.vercel.app

# Check pages work:
- http://xxx.vercel.app/
- http://xxx.vercel.app/shop
- http://xxx.vercel.app/account/profile
- http://xxx.vercel.app/wishlist
- http://xxx.vercel.app/cart
```

### Test API Connection

```bash
# Open browser console and test:
fetch('https://xxx.vercel.app/api/v1/health')
  .then(r => r.json())
  .then(d => console.log(d))

# Should return:
{
  "data": { "status": "ok", "database": "connected" },
  "meta": { "requestId": "..." }
}
```

### Test Profile Feature

1. Go to `https://xxx.vercel.app/account/profile`
2. Should load user profile
3. Edit profile and save
4. Check data persists
5. Add to wishlist/cart
6. Profile stats should update

---

## Troubleshooting

### Issue: API Not Responding

**Solution 1: Check CORS**
```javascript
// In your API requests, ensure header is sent
headers: {
  "x-client-id": clientId,
  "Content-Type": "application/json"
}
```

**Solution 2: Verify API URL**
```bash
# Test directly:
curl https://your-railway-api.app/api/v1/health

# Should return JSON response
```

**Solution 3: Check Environment Variables**
- Vercel: Project Settings → Environment Variables
- Railway: Deploy → Settings → Variables

### Issue: Build Failing on Vercel

**Solution**:
```bash
# Check build locally first
cd apps/web
pnpm build

# If error, fix it, then push
git add .
git commit -m "fix: build error"
git push
```

### Issue: Database Connection Failing

**Solution**:
```bash
# 1. Verify MongoDB URI format
mongodb+srv://user:password@cluster.mongodb.net/dbname?...

# 2. Add IP to MongoDB Atlas whitelist:
#    - Go to MongoDB Atlas
#    - Security → Network Access
#    - Add IP Address: 0.0.0.0/0 (or specific IP)

# 3. Restart Railway app
```

### Issue: CORS Errors in Browser

**Solution: Already Fixed in Code**
```typescript
// In api/src/server.ts
app.use(cors()); // Allows all origins
app.use(helmet({ crossOriginResourcePolicy: false }));
```

---

## Monitoring & Debugging

### Vercel Logs
- Visit: https://vercel.com/dashboard
- Select your project
- Go to Deployments → Select latest
- View logs in real-time

### Railway Logs
- Visit: https://railway.app
- Select your project
- View Logs tab
- Filter by service (api)

### MongoDB Atlas Monitoring
- Visit: https://cloud.mongodb.com
- Select your cluster
- Monitoring tab shows activity
- Alerts section for notifications

---

## Security Checklist (Production)

- [ ] GitHub repo set to private (if using private data)
- [ ] Environment variables NOT in code
- [ ] MongoDB IP whitelist configured
- [ ] HTTPS enabled (automatic on Vercel/Railway)
- [ ] API CORS configured properly
- [ ] Rate limiting added (future)
- [ ] Environment-specific secrets
- [ ] Backup strategy for MongoDB
- [ ] Error tracking setup (Sentry optional)
- [ ] Monitoring alerts set up

---

## Next Steps After Deployment

### 1. Share Your Links
- Frontend: `https://xxx.vercel.app`
- GitHub: `https://github.com/Bhavadharani412/internship_selection_demo`
- Backend: `https://xxx.railway.app/api/v1/health`

### 2. Set Up Monitoring (Optional)
```bash
# Add error tracking (free tier available)
npm install @sentry/react @sentry/tracing

# Or use Railway's built-in monitoring
```

### 3. Set Up CI/CD (Already Free)
- GitHub Actions automatically runs tests
- Vercel auto-deploys on push
- Railway auto-deploys on push

### 4. Performance Optimization
```bash
# Run Lighthouse
vercel inspect https://xxx.vercel.app

# Results show Core Web Vitals
```

---

## Useful Commands Reference

```bash
# Push updates to GitHub
git add .
git commit -m "your message"
git push origin main

# View logs locally before deployment
cd apps/api && npm run dev

# Build locally to test
cd apps/web && pnpm build

# Check environment variables
echo $VITE_API_BASE_URL

# Test API locally
curl http://localhost:4000/api/v1/health

# Force redeploy on Vercel/Railway
# Just push to main branch (auto-deploys)
```

---

## Free Tier Limits

| Service | Limit | Details |
|---------|-------|---------|
| **Vercel** | 100GB/month bandwidth | Plenty for portfolio |
| **Railway** | $5 credit/month | Covers small API |
| **MongoDB Atlas** | 512MB storage | ~50k documents |
| **GitHub** | Unlimited public repos | Free CI/CD included |

**Total**: Everything free! ✨

---

## Estimated Time

| Task | Time |
|------|------|
| GitHub push | 5 min |
| MongoDB setup | 5 min |
| Railway deployment | 10 min |
| Vercel deployment | 10 min |
| Testing | 10 min |
| **Total** | **40 min** |

---

## Final Checklist

- [ ] Code pushed to GitHub
- [ ] MongoDB cluster created
- [ ] Backend deployed on Railway
- [ ] Frontend deployed on Vercel
- [ ] Environment variables set
- [ ] Frontend connects to backend
- [ ] Profile page working
- [ ] Cart/wishlist sync working
- [ ] API health check passing
- [ ] HTTPS working
- [ ] Links shared with team

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **MongoDB Atlas Guide**: https://docs.atlas.mongodb.com
- **GitHub Help**: https://docs.github.com

---

**After following this guide, your app will be:**
- ✅ Hosted on Vercel (free)
- ✅ Backend on Railway (free)
- ✅ Database on MongoDB Atlas (free)
- ✅ Code on GitHub (free)
- ✅ HTTPS enabled (automatic)
- ✅ CI/CD configured (automatic)
- ✅ Production ready (free tier)
- ✅ $0/month cost

**Deployment time: ~40 minutes** ⏱️

Good luck! 🚀
