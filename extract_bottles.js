import sharp from 'sharp';

async function extractBottlesAndBackgrounds() {
    const perfumes = [
        { name: 'GIT', file: 'GIT.png' },
        { name: 'Ganymede', file: 'Ganymede.png' },
        { name: 'Guidance', file: 'Guidance.png' }
    ];

    for (const perfume of perfumes) {
        console.log(`Processing ${perfume.name}...`);

        const inputPath = `public/images/${perfume.file}`;

        // Get image metadata
        const metadata = await sharp(inputPath).metadata();
        console.log(`  Original size: ${metadata.width}x${metadata.height}`);

        // Extract just the bottle - keep more of the image this time
        // The bottles are in the center, we'll crop less aggressively
        const bottleWidth = Math.floor(metadata.width * 0.7);  // Increased from 0.5
        const bottleHeight = Math.floor(metadata.height * 0.9); // Increased from 0.8
        const bottleLeft = Math.floor((metadata.width - bottleWidth) / 2);
        const bottleTop = Math.floor(metadata.height * 0.05); // Start higher

        await sharp(inputPath)
            .extract({
                left: bottleLeft,
                top: bottleTop,
                width: bottleWidth,
                height: bottleHeight
            })
            .resize(600, 800, {  // Larger output size
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .toFile(`public/images/${perfume.name}-bottle.png`);

        console.log(`  ✓ Created bottle: ${perfume.name}-bottle.png`);

        // Create background from the full image (we'll use it as background)
        await sharp(inputPath)
            .blur(15) // Blur for background effect
            .modulate({
                brightness: 0.8,  // Darken slightly
                saturation: 1.2   // Increase saturation
            })
            .toFile(`public/images/${perfume.name}-bg.png`);

        console.log(`  ✓ Created background: ${perfume.name}-bg.png`);
    }

    console.log('\n✅ All bottles and backgrounds extracted!');
}

extractBottlesAndBackgrounds().catch(console.error);
