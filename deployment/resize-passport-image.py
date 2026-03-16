#!/usr/bin/env python3
"""
Resize passport image for vision model testing
Uses PIL/Pillow to resize image to optimal dimensions
"""

import sys
from PIL import Image
import os

def resize_image(input_path, output_path, max_width=800, max_height=600):
    """
    Resize image while maintaining aspect ratio
    """
    try:
        # Open image
        img = Image.open(input_path)
        print(f"Original size: {img.size[0]}x{img.size[1]}")
        
        # Calculate new size maintaining aspect ratio
        img.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
        print(f"Resized to: {img.size[0]}x{img.size[1]}")
        
        # Save resized image
        img.save(output_path, quality=85, optimize=True)
        print(f"✓ Saved to: {output_path}")
        
        # Show file sizes
        original_size = os.path.getsize(input_path)
        new_size = os.path.getsize(output_path)
        reduction = ((original_size - new_size) / original_size) * 100
        
        print(f"\nFile size:")
        print(f"  Original: {original_size:,} bytes")
        print(f"  Resized:  {new_size:,} bytes")
        print(f"  Reduction: {reduction:.1f}%")
        
        return True
        
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

if __name__ == "__main__":
    input_file = "carbon-ui/public/images/mr-bean-passport.jpg"
    output_file = "carbon-ui/public/images/mr-bean-passport-small.jpg"
    
    print("================================")
    print("Resizing Passport Image")
    print("================================\n")
    
    if not os.path.exists(input_file):
        print(f"✗ Input file not found: {input_file}")
        sys.exit(1)
    
    success = resize_image(input_file, output_file, max_width=800, max_height=600)
    
    if success:
        print("\n================================")
        print("Resize Complete!")
        print("================================")
        print(f"\nUse this file for testing:")
        print(f"  {output_file}")
    else:
        sys.exit(1)

# Made with Bob
