#!/usr/bin/env python3
"""Remove every EXIF record from the committed images.

iPhone photos carry GPS at roughly 10cm precision, the device model, and a
capture timestamp. Several frames in this set are private homes. None of
that belongs in a public repository, and none of it is needed: the design
work reads the pixels, not the metadata.

Run this after regenerating previews or derivatives. It is idempotent.
"""
import glob
import os
import sys
from PIL import Image

TARGETS = ["photos/preview/*.jpg", "library/derivatives/*.jpg"]
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def strip(path: str) -> bool:
    with Image.open(path) as im:
        had = bool(im.getexif())
        clean = Image.new(im.mode, im.size)
        clean.putdata(list(im.getdata()))
        quality = 70 if "preview" in path else 88
        clean.save(path, "JPEG", quality=quality)
    return had


def main() -> int:
    stripped = total = 0
    for pattern in TARGETS:
        for path in sorted(glob.glob(os.path.join(ROOT, pattern))):
            total += 1
            if strip(path):
                stripped += 1
    print(f"{total} images checked, {stripped} carried EXIF and were cleaned")
    return 0


if __name__ == "__main__":
    sys.exit(main())
