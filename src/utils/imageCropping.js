/**
 * Image Cropping Guide for Perfume Products
 * 
 * Original Image: 6 perfume bottles in 2x3 grid
 * Layout: [Midnight Elegance] [Golden Dawn] [Rose Mystique]
 *         [Ocean Breeze]     [Vanilla Dreams] [Smoky Noir]
 */

// Assuming the original image is approximately 1200x800 pixels
// Each bottle area is roughly 400x400 pixels

export const cropCoordinates = {
  'midnight-elegance': {
    x: 0,
    y: 0,
    width: 400,
    height: 400,
    description: 'Top left - Black bottle with gold text'
  },
  
  'golden-dawn': {
    x: 400,
    y: 0,
    width: 400,
    height: 400,
    description: 'Top center - Gold bottle with clear glass'
  },
  
  'rose-mystique': {
    x: 800,
    y: 0,
    width: 400,
    height: 400,
    description: 'Top right - Rose gold bottle'
  },
  
  'ocean-breeze': {
    x: 0,
    y: 400,
    width: 400,
    height: 400,
    description: 'Bottom left - Aqua/mint colored bottle'
  },
  
  'vanilla-dreams': {
    x: 400,
    y: 400,
    width: 400,
    height: 400,
    description: 'Bottom center - Cream/vanilla colored bottle'
  },
  
  'smoky-noir': {
    x: 800,
    y: 400,
    width: 400,
    height: 400,
    description: 'Bottom right - Black bottle with gold text'
  }
};

// Python script to crop the images (run this separately):
/*
from PIL import Image

def crop_perfume_images(source_path):
    img = Image.open(source_path)
    
    # Crop coordinates for each product
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
        # Resize to consistent web size
        cropped = cropped.resize((300, 400), Image.Resampling.LANCZOS)
        cropped.save(f'public/images/{name}.png', 'PNG', optimize=True)
        print(f'Saved {name}.png')

# Usage:
# crop_perfume_images('path_to_your_uploaded_image.png')
*/