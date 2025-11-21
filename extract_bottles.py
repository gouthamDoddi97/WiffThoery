from PIL import Image
import os

# Process each perfume bottle image
images = ['GIT.png', 'Ganymede.png', 'Guidance.png']
input_dir = '/Users/diwineoperator/Documents/perfume/public/images'
output_dir = '/Users/diwineoperator/Documents/perfume/public/images'

for img_name in images:
    input_path = os.path.join(input_dir, img_name)
    
    # Load the image
    img = Image.open(input_path)
    
    # Convert to RGBA if not already
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # Get the bottle region (center portion)
    width, height = img.size
    
    # Extract the bottle with transparency (center region)
    # The bottles appear to be in the center of the image
    bottle_left = int(width * 0.25)
    bottle_right = int(width * 0.75)
    bottle_top = int(height * 0.1)
    bottle_bottom = int(height * 0.9)
    
    # Crop to bottle area
    bottle = img.crop((bottle_left, bottle_top, bottle_right, bottle_bottom))
    
    # Save the extracted bottle
    bottle_output = os.path.join(output_dir, img_name.replace('.png', '-bottle.png'))
    bottle.save(bottle_output, 'PNG')
    
    # Create background from the abstract art (the colorful background area)
    # Sample the background area and create a larger pattern
    bg_sample = img.copy()
    
    # Save the background
    bg_output = os.path.join(output_dir, img_name.replace('.png', '-bg.png'))
    bg_sample.save(bg_output, 'PNG')
    
    print(f"Processed {img_name}")
    print(f"  - Bottle: {bottle_output}")
    print(f"  - Background: {bg_output}")

print("\nAll images processed!")
