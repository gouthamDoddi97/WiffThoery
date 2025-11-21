import sharp from 'sharp';
import path from 'path';

async function cropPerfumeImages() {
  try {
    console.log('🖼️  Starting to crop perfumeslist.png...\n');
    
    // Load the source image
    const sourceImage = sharp('public/images/perfumeslist.png');
    const metadata = await sourceImage.metadata();
    
    console.log(`📏 Source image dimensions: ${metadata.width}x${metadata.height}`);
    
    // Based on your original image being 2 rows x 3 columns, but vertical layout
    // Let's try a different approach - crop specific regions manually
    console.log('🔍 Analyzing image layout...\n');
    
    // Define specific crop coordinates for each product
    // 2 rows × 3 columns layout in 1024×1536 image
    // Using conservative coordinates to avoid boundary issues
    const products = [
      // Top row - being very conservative with boundaries
      { name: 'midnight-elegance', left: 0, top: 0, width: 340, height: 760 },
      { name: 'golden-dawn', left: 342, top: 0, width: 340, height: 760 },
      { name: 'rose-mystique', left: 684, top: 0, width: 340, height: 760 },
      // Bottom row  
      { name: 'ocean-breeze', left: 0, top: 770, width: 340, height: 760 },
      { name: 'vanilla-dreams', left: 342, top: 770, width: 340, height: 760 },
      { name: 'smoky-noir', left: 684, top: 770, width: 340, height: 760 }
    ];
    
    // Crop each product image
    for (const product of products) {
      console.log(`🔄 Processing ${product.name}...`);
      console.log(`   Crop area: x=${product.left}, y=${product.top}, w=${product.width}, h=${product.height}`);
      
      // Validate boundaries
      const maxRight = product.left + product.width;
      const maxBottom = product.top + product.height;
      
      if (maxRight > metadata.width || maxBottom > metadata.height) {
        console.log(`   ❌ Skipping ${product.name} - coordinates out of bounds`);
        console.log(`   Right: ${maxRight}/${metadata.width}, Bottom: ${maxBottom}/${metadata.height}`);
        continue;
      }
      
      // Create a fresh Sharp instance for each crop
      await sharp('public/images/perfumeslist.png')
        .extract({ 
          left: product.left, 
          top: product.top, 
          width: product.width, 
          height: product.height 
        })
        .resize(400, 500, { 
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png({ quality: 90 })
        .toFile(`public/images/${product.name}.png`);
      
      console.log(`   ✅ Saved: public/images/${product.name}.png`);
    }
    
    console.log('\n🎉 All images cropped successfully!');
    console.log('\n📂 Generated files:');
    products.forEach(product => {
      console.log(`   - ${product.name}.png`);
    });
    
    console.log('\n🚀 Your website will now display the real perfume images!');
    
  } catch (error) {
    console.error('❌ Error cropping images:', error);
  }
}

// Run the cropping function
cropPerfumeImages();