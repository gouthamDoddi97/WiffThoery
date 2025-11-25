# Required Product Images

## Image Files Needed

Your perfume collection requires the following image files. Place them in the `public/images/` folder:

### Product Bottle Images
Place these in `public/images/`:

1. **golden-dawn.png** - Golden Dawn bottle
2. **midnight-elegance.png** - Midnight Elegance bottle
3. **rose-mystique.png** - Rose Mystique bottle
4. **git.png** - GIT bottle
5. **ganamyde.png** - Ganamyde bottle
6. **guidance.png** - Guidance bottle

### Background Art Images
Place these in `public/images/`:

1. **golden-dawn-bg.jpg** - Abstract art background for Golden Dawn
2. **midnight-elegance-bg.jpg** - Abstract art background for Midnight Elegance
3. **rose-mystique-bg.jpg** - Abstract art background for Rose Mystique
4. **git-bg.jpg** - Abstract art background for GIT
5. **ganamyde-bg.jpg** - Abstract art background for Ganamyde
6. **guidance-bg.jpg** - Abstract art background for Guidance

---

## Image Specifications

### Bottle Images (.png)
- **Format:** PNG with transparency
- **Dimensions:** 800x1200px (recommended)
- **Aspect Ratio:** 2:3 (portrait)
- **File Size:** < 500KB
- **Background:** Transparent
- **Quality:** High resolution for zoom

### Background Art (.jpg)
- **Format:** JPG
- **Dimensions:** 1920x1080px (recommended)
- **Aspect Ratio:** 16:9 (landscape)
- **File Size:** < 1MB
- **Style:** Abstract art complementing the fragrance theme
- **Colors:** Match the bottle/brand aesthetic

---

## Folder Structure

```
public/
└── images/
    ├── golden-dawn.png
    ├── golden-dawn-bg.jpg
    ├── midnight-elegance.png
    ├── midnight-elegance-bg.jpg
    ├── rose-mystique.png
    ├── rose-mystique-bg.jpg
    ├── git.png
    ├── git-bg.jpg
    ├── ganamyde.png
    ├── ganamyde-bg.jpg
    ├── guidance.png
    └── guidance-bg.jpg
```

---

## After Adding Images Locally

### Upload to Supabase Storage

1. **Go to Supabase Storage** → `product-images` bucket
2. **Upload bottle images:**
   - golden-dawn.png
   - midnight-elegance.png
   - rose-mystique.png
   - git.png
   - ganamyde.png
   - guidance.png

3. **Go to** `product-backgrounds` bucket
4. **Upload background images:**
   - golden-dawn-bg.jpg
   - midnight-elegance-bg.jpg
   - rose-mystique-bg.jpg
   - git-bg.jpg
   - ganamyde-bg.jpg
   - guidance-bg.jpg

5. **Copy URLs:**
   - Click each uploaded image
   - Click "Copy URL"
   - Save these URLs

6. **Update Database:**
   - Go to Table Editor → products
   - For each product:
     - Edit `product_images` field → Paste bottle image URL
     - Edit `background_image` field → Paste background art URL
   - Save

---

## Product-Image Mapping

| Product | Bottle Image | Background Art | Classification |
|---------|--------------|----------------|----------------|
| Golden Dawn | golden-dawn.png | golden-dawn-bg.jpg | EDP |
| Midnight Elegance | midnight-elegance.png | midnight-elegance-bg.jpg | EDP |
| Rose Mystique | rose-mystique.png | rose-mystique-bg.jpg | EDT |
| GIT | git.png | git-bg.jpg | EDP |
| Ganamyde | ganamyde.png | ganamyde-bg.jpg | Extrait |
| Guidance | guidance.png | guidance-bg.jpg | Extrait |

---

## Temporary Placeholder

Until you add real images, the site will show:
- Fallback: `/images/placeholder.png` for missing bottle images
- No background art displayed if missing

**To add a placeholder:**
```bash
# Create a simple placeholder
mkdir -p public/images
# Add your placeholder.png file
```

---

## Design Tips

### Bottle Images
- Clean, professional product photography
- Consistent lighting across all bottles
- Show full bottle with label visible
- Transparent background (no shadows)
- Centered composition

### Background Art
- Abstract, luxury aesthetic
- Complementary colors to bottle
- Not too busy (text needs to be readable over it)
- Subtle gradients work well
- Consider the fragrance notes for inspiration:
  - **Golden Dawn**: Warm golds, sunrise colors
  - **Midnight Elegance**: Deep blues, purples, blacks
  - **Rose Mystique**: Soft pinks, florals
  - **GIT**: Bold, earthy tones (leather/oud)
  - **Ganamyde**: Sophisticated greens, grays (iris/vetiver)
  - **Guidance**: Rich burgundy, amber (saffron/musk)

---

## Quick Start (Without Real Images)

The site will work without images by using fallback data. When images are ready:

1. Add to `public/images/` folder
2. Upload to Supabase Storage
3. Update product URLs in database
4. Refresh website - images appear automatically!

---

## Current Status

✅ **Database schema ready** - Includes `product_images` and `background_image` fields  
✅ **Frontend ready** - ProductCollection component fetches and displays images  
✅ **Fallback data** - All 6 products display even without Supabase  
⏳ **Images needed** - Add your actual product photos and art  
⏳ **Upload to Supabase** - After importing schema, upload to Storage  

---

**The site is functional now with placeholder paths. Add images when ready!** 📸✨
