#!/usr/bin/env python3
"""Verify — and if needed enforce — that no image carries metadata.

Phone photographs hold GPS at roughly ten-centimetre precision, the device
model and a capture timestamp. A folder of someone's photographs is a map of
where they walked, often including private homes. None of it is needed: the
design work reads pixels.

`ingest.py` already writes clean files. This is the check that nothing crept
back in through a later tool, and the fixer if something did. Idempotent.

Note: if metadata-bearing images were already committed, cleaning the working
copy is not enough — the data stays recoverable from history. Say so plainly
rather than assuming a clean working tree means a clean repository.

Usage:
    python3 scripts/strip_exif.py [paths ...]      # default: photos/ library/
"""
import glob
import os
import sys

from PIL import Image


def clean(path: str) -> bool:
    with Image.open(path) as im:
        if not im.getexif():
            return False
        rgb = im.convert("RGB")
        out = Image.new("RGB", rgb.size)
        out.putdata(list(rgb.getdata()))
        out.save(path, "JPEG", quality=88)
    return True


def main() -> int:
    roots = sys.argv[1:] or ["photos", "library"]
    files = []
    for root in roots:
        for ext in ("jpg", "jpeg", "png", "tif", "tiff", "webp"):
            files += glob.glob(os.path.join(root, "**", f"*.{ext}"), recursive=True)
    if not files:
        print(f"no images found under {', '.join(roots)}")
        return 0

    cleaned = sum(1 for f in sorted(set(files)) if clean(f))
    print(f"{len(set(files))} images checked, {cleaned} carried metadata and were cleaned")
    if cleaned:
        print("If any of these were already committed, the metadata is still in git history.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
