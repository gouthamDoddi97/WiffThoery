# 🚀 Deployment Guide - Perfume E-Commerce Site

## Prerequisites Checklist

✅ Supabase project fully configured
✅ All database tables created
✅ RLS policies enabled
✅ Storage buckets configured
✅ Admin users created
✅ Environment variables configured

---

## Option 1: Deploy to Vercel (Recommended - Easiest)

### Step 1: Prepare for Deployment

1. **Create a `.env.production` file** (optional, for local testing):
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

2. **Add build script** (already in package.json):
```json
"scripts": {
  "build": "vite build",
  "preview": "vite preview"
}
```

### Step 2: Push to GitHub

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Ready for deployment"

# Create repository on GitHub, then:
git remote add origin https://github.com/gouthamDoddi97/WiffThoery.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Vercel

**Option A: Using Vercel CLI**
```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name? perfume-ecommerce (or your choice)
# - Directory? ./ (press enter)
# - Build command? npm run build
# - Output directory? dist
```

**Option B: Using Vercel Dashboard**
1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Add Environment Variables:
   - `VITE_SUPABASE_URL` = your_supabase_url
   - `VITE_SUPABASE_ANON_KEY` = your_supabase_anon_key

6. Click "Deploy"

### Step 4: Configure Custom Domain (Optional)

1. In Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

---

## Option 2: Deploy to Netlify

### Step 1: Create `netlify.toml` configuration

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

### Step 2: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize
netlify init

# Follow prompts and deploy
netlify deploy --prod
```

### Step 3: Or Deploy via Netlify Dashboard

1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub and select your repository
4. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Environment variables**:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

---

## Option 3: Deploy to GitHub Pages

### Step 1: Update `vite.config.js`

```javascript
export default defineConfig({
  plugins: [react()],
  base: '/WiffThoery/', // Your repo name
})
```

### Step 2: Add deployment script to `package.json`

```json
"scripts": {
  "deploy": "vite build && gh-pages -d dist"
}
```

### Step 3: Install gh-pages

```bash
npm install --save-dev gh-pages
```

### Step 4: Deploy

```bash
npm run deploy
```

### Step 5: Configure GitHub Pages

1. Go to GitHub repository → Settings → Pages
2. Source: Deploy from branch `gh-pages`
3. Your site will be at: `https://gouthamDoddi97.github.io/WiffThoery/`

---

## Option 4: Deploy to Railway

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Add environment variables
5. Railway will auto-detect Vite and deploy

---

## Post-Deployment Checklist

### 1. Update Supabase Settings

In Supabase Dashboard → Authentication → URL Configuration:
- Add your deployment URL to **Site URL**
- Add to **Redirect URLs**:
  - `https://your-domain.com/admin`
  - `https://your-domain.com/admin/dashboard`

### 2. Test Critical Features

- ✅ Homepage loads
- ✅ Products display correctly
- ✅ Images load from Supabase Storage
- ✅ Admin login works
- ✅ Admin dashboard accessible
- ✅ Expense tracking works
- ✅ Notes and Todos work
- ✅ Status voting, comments, reactions work
- ✅ Image uploads work
- ✅ Contact form works
- ✅ Newsletter signup works

### 3. Configure CORS (if needed)

If you get CORS errors, update Supabase Storage bucket policies:

```sql
-- Allow public access to images
UPDATE storage.buckets
SET public = true
WHERE id IN ('expense-images', 'expense_products');
```

### 4. Set up Custom Domain (Optional)

**For Vercel:**
- Dashboard → Settings → Domains → Add Domain

**For Netlify:**
- Site settings → Domain management → Add custom domain

### 5. Enable HTTPS

Both Vercel and Netlify provide automatic HTTPS certificates.

---

## Environment Variables Reference

**Required for all deployments:**

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**How to find these:**
1. Go to Supabase Dashboard
2. Click on your project
3. Settings → API
4. Copy "Project URL" and "anon public" key

---

## Build Optimization Tips

### 1. Optimize Images
```bash
# Install image optimization plugin
npm install --save-dev vite-plugin-imagemin
```

### 2. Enable Compression
Already handled by Vercel/Netlify automatically.

### 3. Analyze Bundle Size
```bash
npm run build -- --mode analyze
```

---

## Troubleshooting Common Issues

### Issue: "404 Not Found" on refresh
**Solution**: Add redirect rules (already in netlify.toml)

For Vercel, create `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Issue: Environment variables not working
**Solution**: 
- Ensure variables start with `VITE_`
- Rebuild after adding variables
- Check they're added to deployment platform

### Issue: Images not loading
**Solution**:
- Verify Supabase Storage buckets are public
- Check image URLs in database
- Verify CORS settings in Supabase

### Issue: Supabase connection fails
**Solution**:
- Verify environment variables
- Check Supabase project is not paused
- Verify API keys are correct

---

## Quick Deploy Commands

**Vercel (Recommended):**
```bash
npm install -g vercel
vercel login
vercel
```

**Netlify:**
```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

**GitHub Pages:**
```bash
npm install --save-dev gh-pages
npm run deploy
```

---

## Monitoring & Analytics

### Add Analytics (Optional)

**Google Analytics:**
Add to `index.html` in `<head>`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Vercel Analytics:**
Already built-in, just enable in Vercel Dashboard.

---

## Support & Maintenance

### Regular Tasks:
- Monitor Supabase usage
- Backup database regularly
- Update dependencies: `npm update`
- Check error logs in deployment platform
- Monitor storage usage

### Useful Commands:
```bash
# Check build locally
npm run build && npm run preview

# Test production build locally
npm run preview

# Clear cache and rebuild
rm -rf node_modules dist && npm install && npm run build
```

---

## 🎉 You're Done!

Your site is now live and ready for users!

**Recommended:** Start with Vercel - it's the easiest and most reliable for React/Vite projects.
