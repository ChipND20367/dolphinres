
#!/usr/bin/env python3
"""
Dolphin Res — Image Compression Script
========================================

Run this locally, on your own computer, against your REAL photos before
uploading them to the images/ folder. It does three things:

1. Resizes any image wider than a sensible max width (photos straight off
   a phone are often 3000-4000px wide — way bigger than any screen needs).
2. Compresses JPEGs to a quality level that's visually near-lossless but
   much smaller in file size.
3. Optionally creates a .webp copy alongside the original (WebP is
   typically 25-35% smaller than JPEG at the same visual quality, and
   every modern browser supports it).

SETUP (one-time):
    pip install Pillow

USAGE:
    python3 compress-images.py <input-folder> <output-folder>

EXAMPLE:
    python3 compress-images.py ./raw-photos ./images

WHAT IT DOES NOT DO:
    - It does not touch your HTML/CSS. If you also generate .webp files,
      you'd reference them with a <picture> tag (see the comment at the
      bottom of this file for the pattern).
    - It does not rename files. Keep your filenames matching what's
      already referenced in the HTML (hero.jpeg, room1.jpeg, etc.) or
      you'll need to update the HTML too.
"""

import sys
import os
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Pillow isn't installed. Run: pip install Pillow")
    sys.exit(1)

# ---- Settings you might want to tweak ----
MAX_WIDTH = 1920          # no image on this site needs to be wider than this
JPEG_QUALITY = 82         # 80-85 is the sweet spot: small file, no visible loss
CREATE_WEBP = True        # also output a .webp version of each image
# -------------------------------------------

VALID_EXTENSIONS = {'.jpg', '.jpeg', '.png'}


def compress_image(input_path: Path, output_path: Path):

    with Image.open(input_path) as img:

        # convert to RGB (handles PNGs with transparency, CMYK JPEGs, etc.)
        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGB')

        # resize down if wider than MAX_WIDTH, preserving aspect ratio
        if img.width > MAX_WIDTH:
            ratio = MAX_WIDTH / img.width
            new_size = (MAX_WIDTH, int(img.height * ratio))
            img = img.resize(new_size, Image.LANCZOS)

        # save compressed JPEG
        img.save(output_path, 'JPEG', quality=JPEG_QUALITY, optimize=True)

        original_size = input_path.stat().st_size
        new_size = output_path.stat().st_size
        saved_pct = (1 - new_size / original_size) * 100 if original_size else 0

        print(f"  {input_path.name}: {original_size // 1024}KB -> {new_size // 1024}KB "
              f"({saved_pct:.0f}% smaller)")

        # optional WebP version
        if CREATE_WEBP:
            webp_path = output_path.with_suffix('.webp')
            img.save(webp_path, 'WEBP', quality=JPEG_QUALITY)
            webp_size = webp_path.stat().st_size
            print(f"    + {webp_path.name}: {webp_size // 1024}KB")


def main():

    if len(sys.argv) != 3:
        print("Usage: python3 compress-images.py <input-folder> <output-folder>")
        sys.exit(1)

    input_dir = Path(sys.argv[1])
    output_dir = Path(sys.argv[2])

    if not input_dir.is_dir():
        print(f"Input folder not found: {input_dir}")
        sys.exit(1)

    output_dir.mkdir(parents=True, exist_ok=True)

    images = [
        p for p in input_dir.rglob('*')
        if p.suffix.lower() in VALID_EXTENSIONS
    ]

    if not images:
        print(f"No images found in {input_dir}")
        sys.exit(0)

    print(f"Found {len(images)} image(s). Compressing...\n")

    for img_path in images:
        relative = img_path.relative_to(input_dir)
        out_path = output_dir / relative
        out_path.parent.mkdir(parents=True, exist_ok=True)
        # always save as .jpeg extension to match this project's file naming
        out_path = out_path.with_suffix('.jpeg')
        compress_image(img_path, out_path)

    print(f"\nDone. Compressed images are in: {output_dir}")


if __name__ == '__main__':
    main()


# ---------------------------------------------------------------------
# If you generate .webp files and want browsers to use them automatically
# (falling back to .jpeg for older browsers), swap a plain <img> tag for
# this pattern in the HTML:
#
#   <picture>
#     <source srcset="images/residences/room1.webp" type="image/webp">
#     <img src="images/residences/room1.jpeg" alt="Single Room" loading="lazy">
#   </picture>
#
# This is optional — the site works fine with plain .jpeg files too, just
# slightly larger downloads. If you want, tell me and I'll convert the
# gallery's <img> tags to this <picture> pattern for you.
# ---------------------------------------------------------------------
