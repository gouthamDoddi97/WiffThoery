# 🖼️ Image Extraction Guide

## Your Uploaded Image Analysis

Your image contains **6 beautiful perfume bottles** in a **2×3 grid**:

```
[Midnight Elegance] [Golden Dawn]    [Rose Mystique]
[Ocean Breeze]      [Vanilla Dreams] [Smoky Noir]
```

## 📏 Quick Crop Instructions

### Method 1: Using Image Editing Software (Photoshop, GIMP, etc.)

1. **Open your uploaded image**
2. **Use the Rectangle Select Tool**
3. **Crop each section** using these approximate coordinates:

| Product           | Left | Top | Right | Bottom |
|-------------------|------|-----|-------|--------|
| Midnight Elegance | 0    | 0   | 400   | 400    |
| Golden Dawn       | 400  | 0   | 800   | 400    |
| Rose Mystique     | 800  | 0   | 1200  | 400    |
| Ocean Breeze      | 0    | 400 | 400   | 800    |
| Vanilla Dreams    | 400  | 400 | 800   | 800    |
| Smoky Noir        | 800  | 400 | 1200  | 800    |

4. **Save each crop** as:
   - `midnight-elegance.png`
   - `golden-dawn.png`
   - `rose-mystique.png`
   - `ocean-breeze.png`
   - `vanilla-dreams.png`
   - `smoky-noir.png`

5. **Place files** in the `public/images/` folder

### Method 2: Python Script (Automatic)

```python
from PIL import Image

def crop_perfume_images():
    # Load your uploaded image
    img = Image.open("your_perfume_grid_image.png")  # Replace with your file path
    
    crops = {
        'midnight-elegance': (0, 0, 400, 400),
        'golden-dawn': (400, 0, 800, 400),
        'rose-mystique': (800, 0, 1200, 400),
        'ocean-breeze': (0, 400, 400, 800),
        'vanilla-dreams': (400, 400, 800, 800),
        'smoky-noir': (800, 400, 1200, 800)
    }
    
    for name, (left, top, right, bottom) in crops.items():
        cropped = img.crop((left, top, right, bottom))
        # Resize to web-optimized size
        cropped = cropped.resize((300, 400), Image.Resampling.LANCZOS)
        cropped.save(f'public/images/{name}.png', 'PNG', optimize=True)
        print(f'✅ Saved {name}.png')

# Run the function
crop_perfume_images()
```

## 🎯 Final File Structure

After cropping, your `public/images/` folder should contain:

```
public/images/
├── midnight-elegance.png
├── golden-dawn.png
├── rose-mystique.png
├── ocean-breeze.png
├── vanilla-dreams.png
└── smoky-noir.png
```

## ✨ Automatic Integration

The website is **already configured** to use these images! Once you place the cropped images in the `public/images/` folder, they will automatically appear on your product collection page.

## 🔄 Fallback System

If images aren't found, the website will gracefully fall back to CSS-generated placeholder bottles, so your site will always look professional.

---

**Need help?** The images you provided are absolutely stunning! They'll make your website look incredibly professional and high-end. 🌟