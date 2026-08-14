#!/usr/bin/env python3
"""Build photos/preview/ from photos/full/.

Two things matter here:
  1. Rotation is baked into the pixels. The EXIF Orientation tag is then
     unnecessary, so removing metadata cannot turn a photo on its side.
  2. Nothing is carried over from the source file. iPhone frames hold GPS
     at roughly 10cm precision, the device model, and a timestamp. Several
     frames in this set are private homes.

Run this, then pipeline/strip_exif.py.
"""
import glob
import os
import sys
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "photos", "full")
OUT = os.path.join(ROOT, "photos", "preview")
MAX_EDGE = 900


def main() -> int:
    os.makedirs(OUT, exist_ok=True)
    sources = sorted(glob.glob(os.path.join(SRC, "*.jpg")))
    if not sources:
        print("no sources in photos/full — regenerate them from the HEIC originals first")
        return 1
    for path in sources:
        with Image.open(path) as im:
            im = ImageOps.exif_transpose(im).convert("RGB")
            im.thumbnail((MAX_EDGE, MAX_EDGE), Image.LANCZOS)
            clean = Image.new("RGB", im.size)
            clean.putdata(list(im.getdata()))
            clean.save(os.path.join(OUT, os.path.basename(path)), "JPEG", quality=70)
    print(f"{len(sources)} previews written, upright and without metadata")
    return 0


if __name__ == "__main__":
    sys.exit(main())
