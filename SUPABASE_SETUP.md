# Supabase Setup Instructions

## 1. Run the Database Schema

1. Go to your Supabase project: https://znjwdpvawljoadftdxaw.supabase.co
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `database/schema.sql`
5. Paste it into the SQL Editor
6. Click **Run** (or press Cmd/Ctrl + Enter)

This will create:
- ✅ All database tables (products, categories, contact_inquiries, etc.)
- ✅ Sample data (3 perfumes, 3 testimonials)
- ✅ Proper indexes for performance
- ✅ Row Level Security policies
- ✅ Triggers for auto-updating timestamps

## 2. Setup Storage Buckets

### Create Storage Buckets for Images:

1. Go to **Storage** in the left sidebar
2. Click **New bucket**

**Create these buckets:**

#### Bucket 1: product-images
- Name: `product-images`
- Public: ✅ Yes
- File size limit: 5MB
- Allowed MIME types: `image/png, image/jpeg, image/jpg, image/webp`

#### Bucket 2: product-backgrounds
- Name: `product-backgrounds`
- Public: ✅ Yes
- File size limit: 10MB
- Allowed MIME types: `image/png, image/jpeg, image/jpg, image/webp`

#### Bucket 3: receipts (for expenses)
- Name: `receipts`
- Public: ❌ No (private)
- File size limit: 5MB
- Allowed MIME types: `image/png, image/jpeg, image/jpg, image/pdf`

## 3. Configure Storage Policies

For each **public** bucket (`product-images`, `product-backgrounds`):

1. Click on the bucket
2. Go to **Policies** tab
3. Add these policies:

**Read Policy (Allow public read):**
```sql
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');
```

**Upload Policy (Allow authenticated uploads - or public for testing):**
```sql
CREATE POLICY "Allow uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');
```

Repeat for `product-backgrounds` bucket.

## 4. Verify Installation

Go to **Table Editor** in Supabase and check:
- ✅ `categories` table has 1 row (Perfumes)
- ✅ `products` table has 3 rows (Golden Dawn, Midnight Elegance, Rose Mystique)
- ✅ `testimonials` table has 3 rows

## 5. Access Admin Panel

**To manage products:**
1. Go to **Table Editor** → **products**
2. Click **Insert row** to add new products
3. Fill in the fields:
   - name, description, price
   - notes (click array icon, add strings)
   - classification (select edp/edt/extrait)
   - Upload images first to Storage, then paste URLs

**To upload images:**
1. Go to **Storage** → `product-images`
2. Click **Upload file**
3. Upload image
4. Click the image → Copy URL
5. Use this URL in products table `product_images` array

## 6. Test the API

After deploying, test endpoints:

```bash
# Get all products
curl https://your-domain.com/api/products

# Get single product
curl https://your-domain.com/api/products/{id}

# Subscribe to newsletter
curl -X POST https://your-domain.com/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## 7. Environment Variables

For production deployment, add these to Vercel:
```
VITE_SUPABASE_URL=https://znjwdpvawljoadftdxaw.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## Common Tasks

### Add a New Product
1. Upload product images to `product-images` bucket
2. Upload background image to `product-backgrounds` bucket
3. Go to Table Editor → products → Insert row
4. Fill in all fields
5. Save

### Approve a Testimonial
1. Go to Table Editor → testimonials
2. Find the testimonial
3. Click to edit
4. Change `is_approved` to `true`
5. Optionally set `is_featured` to `true`
6. Save

### View Contact Inquiries
1. Go to Table Editor → contact_inquiries
2. View all submissions
3. Update status to "replied" when done

### Track Expenses
1. Go to Table Editor → expenses
2. Click Insert row
3. Fill in: amount, category, description, expense_date
4. Optional: Upload receipt to `receipts` bucket and paste URL
5. Save

### View Newsletter Subscribers
1. Go to Table Editor → newsletter_subscriptions
2. View all active subscribers
3. Export as CSV for email campaigns (top right button)

---

## Next Steps
- Deploy backend API to Vercel
- Update frontend to fetch from Supabase
- Add authentication for admin features
- Setup email notifications for contact forms
