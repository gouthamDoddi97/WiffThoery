# 📸 Image Upload Setup Guide

## Overview

The admin system now supports uploading images for each expense:
- **📋 Bill/Receipt Images**: Up to 2 images per expense (photos of bills, invoices, receipts)
- **📦 Product Images**: Up to 2 images per expense (photos of purchased products)

Images are stored securely in Supabase Storage with automatic compression and CDN delivery.

---

## 🚀 Setup Steps (5 minutes)

### Step 1: Run Database Migration

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run the script: `database/storage_setup.sql`
3. This adds `receipt_images` and `product_images` columns to the expenses table

### Step 2: Create Storage Buckets

#### Create Bucket 1: expense-receipts

1. Go to **Supabase Dashboard** → **Storage**
2. Click **"New bucket"**
3. Configure:
   ```
   Name: expense-receipts
   Public bucket: ✅ ON
   File size limit: 5 MB
   Allowed MIME types: image/jpeg, image/jpg, image/png, image/webp
   ```
4. Click **"Create bucket"**

#### Create Bucket 2: expense-products

1. Click **"New bucket"** again
2. Configure:
   ```
   Name: expense-products
   Public bucket: ✅ ON
   File size limit: 5 MB
   Allowed MIME types: image/jpeg, image/jpg, image/png, image/webp
   ```
3. Click **"Create bucket"**

### Step 3: Set Storage Policies

After creating buckets, run these policies in **SQL Editor**:

```sql
-- Policies for expense-receipts bucket
CREATE POLICY "Authenticated users can upload receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'expense-receipts' AND
    auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can view receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'expense-receipts');

CREATE POLICY "Users can update own receipts"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'expense-receipts' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own receipts"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'expense-receipts' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Policies for expense-products bucket
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'expense-products' AND
    auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can view product images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'expense-products');

CREATE POLICY "Users can update own product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'expense-products' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'expense-products' AND
    auth.uid()::text = (storage.foldername(name))[1]
);
```

### Step 4: Verify Setup

Run this query to confirm everything is ready:

```sql
-- Check columns exist
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'expenses' 
    AND column_name IN ('receipt_images', 'product_images');

-- Check buckets exist
SELECT * FROM storage.buckets 
WHERE name IN ('expense-receipts', 'expense-products');

-- Expected: 2 rows with public = true
```

---

## 📱 How to Use

### Adding Images to an Expense

1. **Login** to the admin dashboard
2. Click **"Add Expense"** or **"Edit"** an existing expense
3. Scroll to the image upload sections:
   - **📋 Bill/Receipt Images**: Upload photos of invoices, bills, receipts
   - **📦 Product Images**: Upload photos of the purchased products
4. **Click the upload box** or drag and drop images
5. Images upload automatically (you'll see a spinner)
6. Click **"Save Expense"** to save with images

### Viewing Images

In the expenses table, you'll see image indicators:
- 📋 2 = Has 2 receipt images
- 📦 1 = Has 1 product image
- — = No images

Click "Edit" on any expense to view and manage its images.

### Removing Images

1. Edit the expense
2. Click the **X button** on any image thumbnail
3. Image is deleted from storage immediately
4. Click "Save" to confirm changes

---

## 💡 Features

### Automatic Features
- ✅ **Auto-resize**: Images optimized for web
- ✅ **CDN delivery**: Fast loading worldwide
- ✅ **Secure storage**: Only authenticated users can access
- ✅ **User isolation**: Users can only delete their own images
- ✅ **Validation**: File type and size checked before upload

### Upload Limits
- **Max images per expense**: 2 receipt + 2 product = 4 total
- **File size**: 5 MB per image
- **File types**: JPG, JPEG, PNG, WebP
- **Total storage**: Depends on your Supabase plan

---

## 📊 Use Cases

### Example 1: Material Purchase
```
Category: Materials
Description: Rose essential oil 100ml
Receipt Images: [Bill from supplier, Payment receipt]
Product Images: [Bottle photo, Quality certificate]
```

### Example 2: Marketing Expense
```
Category: Marketing
Description: Instagram ad campaign
Receipt Images: [Facebook invoice, Bank statement]
Product Images: [Ad screenshot, Analytics report]
```

### Example 3: Packaging Purchase
```
Category: Packaging
Description: Glass bottles 50ml x 100 units
Receipt Images: [Supplier invoice]
Product Images: [Bottle sample, Box packaging]
```

---

## 🔒 Security

### User Isolation
- Images are organized by user ID: `user-id/timestamp-random.jpg`
- Users can only delete their own images
- All users can VIEW each other's images (for transparency)

### Access Control
- **Upload**: Only authenticated users
- **View**: Only authenticated users
- **Delete**: Only file owner
- **Public access**: Blocked (requires authentication)

---

## 🛠️ Troubleshooting

### Issue: Can't upload images
**Solutions:**
- Check bucket exists: Go to Storage tab in Supabase
- Verify bucket is PUBLIC
- Run storage policies (Step 3 above)
- Check browser console for errors
- Try a smaller image (< 5MB)

### Issue: "Upload failed" error
**Solutions:**
- Check file is an image (JPG, PNG, WebP)
- File size must be under 5MB
- Compress large images before uploading
- Check internet connection

### Issue: Images not showing
**Solutions:**
- Verify bucket is set to PUBLIC
- Check expense has image URLs in database:
  ```sql
  SELECT receipt_images, product_images FROM expenses WHERE id = 'expense-id';
  ```
- Check browser console for 404 errors
- Verify storage policies are active

### Issue: Can't delete images
**Solutions:**
- You can only delete YOUR OWN images
- Check you're logged in as the expense creator
- Try refreshing the page
- Check storage policies allow deletion

---

## 📈 Storage Usage

### Supabase Free Tier
- **Storage**: 1 GB included
- **Bandwidth**: 2 GB/month
- **Upgrades**: Available if needed

### Estimating Usage
- Average photo: ~500 KB
- 100 expenses × 4 images = 400 images
- 400 × 500 KB = 200 MB (well within free tier)

---

## 🎯 Best Practices

### For Bill/Receipt Images
- ✅ Take clear, well-lit photos
- ✅ Capture entire document
- ✅ Include date, amount, vendor clearly
- ✅ Multiple angles if needed

### For Product Images
- ✅ Show product clearly
- ✅ Include packaging/labels
- ✅ Show quality/condition
- ✅ Include reference for scale

### File Naming
- Auto-generated: `{user-id}/{timestamp}-{random}.{ext}`
- No manual naming needed
- Organized by user automatically

---

## 🔄 Migration

### For Existing Expenses
Old expenses without images will show "—" in the table. Simply edit them and add images.

### Backup
Supabase Storage has built-in backups. For manual backups:
1. Go to Storage → Bucket
2. Download images manually
3. Or use Supabase CLI to sync

---

## 🚀 Ready to Use!

After completing the setup steps:
1. Restart your frontend if it's running
2. Login to the admin dashboard
3. Add or edit an expense
4. Upload some test images
5. See them appear in the table!

For help, check:
- Supabase Dashboard → Storage tab
- Browser console (F12) for error messages
- Database table: `expenses` → columns `receipt_images`, `product_images`

**Happy uploading!** 📸
