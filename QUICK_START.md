# Quick Start Guide - Supabase + Node.js Integration

## ✅ What's Done

### Backend Setup
- ✅ Express.js API created (`/api` folder)
- ✅ Supabase client library installed
- ✅ Environment variables configured (`.env`)
- ✅ API routes created:
  - `/api/products` - CRUD operations
  - `/api/contact` - Contact form submissions
  - `/api/newsletter` - Newsletter subscriptions
  - `/api/testimonials` - Customer reviews
  - `/api/expenses` - Admin expense tracking

### Frontend Integration
- ✅ Supabase client configured (`src/lib/supabase.js`)
- ✅ ProductCollection component updated to fetch from Supabase
- ✅ Fallback to static data if Supabase fails
- ✅ Loading states implemented

### Documentation
- ✅ Database schema SQL file (`database/schema.sql`)
- ✅ Supabase setup instructions (`SUPABASE_SETUP.md`)
- ✅ Project roadmap (`PROJECT_ROADMAP.md`)
- ✅ Vercel deployment config (`vercel.json`)

---

## 🚀 Next Steps (Do These Now)

### Step 1: Setup Supabase Database

1. Go to your Supabase project: https://znjwdpvawljoadftdxaw.supabase.co
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open `database/schema.sql` file
5. Copy the entire contents
6. Paste into Supabase SQL Editor
7. Click **Run** (or Cmd/Ctrl + Enter)

**This creates:**
- All tables (products, categories, contact_inquiries, etc.)
- 3 sample products (Golden Dawn, Midnight Elegance, Rose Mystique)
- 3 sample testimonials
- Proper indexes and security policies

### Step 2: Create Storage Buckets

1. Go to **Storage** in Supabase sidebar
2. Create these buckets:

**Bucket 1: product-images**
- Name: `product-images`
- Public: ✅ Yes
- Click **Create bucket**

**Bucket 2: product-backgrounds**
- Name: `product-backgrounds`
- Public: ✅ Yes
- Click **Create bucket**

**Bucket 3: receipts** (for expenses)
- Name: `receipts`
- Public: ❌ No (private)
- Click **Create bucket**

### Step 3: Upload Sample Images

1. Go to **Storage** → `product-images`
2. Upload your perfume bottle images
3. After upload, click the image → Copy URL
4. Go to **Table Editor** → `products`
5. Edit the `product_images` column (array) and paste URLs

---

## 🧪 Test the Setup

### Test Frontend (Local)

```bash
# Start the development server
npm run dev
```

Open http://localhost:5173

**What to check:**
- Products section should show "Loading..." then display products
- If Supabase has data, it shows that
- If not, fallback products appear
- Check browser console for any errors

### Test API (Optional - for later)

```bash
# Start the backend API server
npm run dev:api
```

Test endpoints:
```bash
# Get all products
curl http://localhost:3001/api/products

# Subscribe to newsletter
curl -X POST http://localhost:3001/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

---

## 📊 Managing Products via Supabase

### Add a New Product

1. Go to **Table Editor** → `products`
2. Click **Insert row** (+ button)
3. Fill in:
   - `name`: Product name
   - `description`: Full description
   - `price`: Decimal number (e.g., 149.99)
   - `notes`: Click array icon, add strings like "Rose", "Vanilla"
   - `classification`: Select `edp`, `edt`, or `extrait`
   - `product_images`: Add image URLs (array)
   - `is_active`: true
   - `stock_quantity`: Number

4. Click **Save**

**The product will automatically appear on your website!**

### Upload Product Images

1. Go to **Storage** → `product-images`
2. Click **Upload file**
3. Select image (PNG, JPG, WebP)
4. After upload, click the image
5. Click **Copy URL**
6. Use this URL in the `product_images` array

---

## 🎯 What Works Now

### Frontend (React)
- ✅ Fetches products from Supabase database
- ✅ Falls back to hardcoded products if fetch fails
- ✅ Displays products with classification labels (EDP, EDT, Extrait)
- ✅ Price formatting from database values
- ✅ Loading states

### Backend API (Express.js)
- ✅ Products CRUD endpoints ready
- ✅ Contact form submission endpoint
- ✅ Newsletter subscription endpoint
- ✅ Testimonials with approval system
- ✅ Expenses tracker for admin

### Supabase
- ✅ Database schema designed
- ✅ Row Level Security configured
- ✅ Sample data ready to insert

---

## 📝 Common Tasks

### View All Products
**Supabase Dashboard:**
1. Table Editor → `products`
2. See all products in spreadsheet view
3. Edit any field inline
4. Changes reflect immediately on website

### Approve a Testimonial
1. Table Editor → `testimonials`
2. Find the testimonial
3. Change `is_approved` to `true`
4. Save

### Check Contact Form Submissions
1. Table Editor → `contact_inquiries`
2. View all submissions
3. Update `status` to "replied" when done

### Track an Expense
1. Table Editor → `expenses`
2. Insert row
3. Fill: amount, category, description, expense_date
4. Optional: Upload receipt to Storage
5. Save

---

## 🚢 Deployment (Later)

### Deploy Frontend to Vercel
```bash
# Connect your GitHub repo to Vercel
# Or deploy manually:
npm run build
vercel --prod
```

Add environment variables in Vercel dashboard:
```
VITE_SUPABASE_URL=https://znjwdpvawljoadftdxaw.supabase.co
VITE_SUPABASE_ANON_KEY=your_key_here
```

### Deploy Backend API
The `vercel.json` is already configured.
Backend will deploy automatically with frontend when you push to Vercel.

---

## 📞 Need Help?

### Common Issues

**Problem: "Products not loading"**
- Check browser console for errors
- Verify Supabase URL and key in `.env`
- Make sure database schema is imported
- Check if products exist in `products` table

**Problem: "Missing environment variables"**
- Restart dev server after changing `.env`
- Make sure `.env` file exists in project root
- Check that variables start with `VITE_` prefix

**Problem: "Images not showing"**
- Upload images to Supabase Storage first
- Use full URLs in `product_images` array
- Make sure storage bucket is public

---

## 🎉 You're Ready!

Your perfume e-commerce platform now has:
- ✅ Database-driven products
- ✅ Admin-friendly management (no coding required)
- ✅ Backend API for future features
- ✅ Expense tracking for business
- ✅ Contact forms and newsletter

**Next:** Run the database schema, upload some images, and see your products come alive! 🚀
