#!/usr/bin/env python3
"""Ingest a folder of photographs into working copies and previews.

Two things this guarantees, both of which matter downstream:

  1. Rotation is baked into the pixels. Phone photos record orientation as
     metadata; if that metadata is later removed for privacy, every portrait
     frame silently turns on its side. Baking it in makes the two concerns
     independent.

  2. Nothing else is carried across. Phone frames hold GPS at roughly
     ten-centimetre precision, the device model and a capture timestamp.
     A folder of someone's photographs is a map of where they walked.

HEIC input needs `pillow-heif` (pip install pillow-heif). On macOS without
it, the script falls back to `sips`. JPEG and PNG need neither.

Usage:
    python3 scripts/ingest.py <photo-folder> [--out .] [--working 2400] [--preview 900]
"""
import argparse
import os
import shutil
import subprocess
import sys
import tempfile

from PIL import Image, ImageOps

try:  # optional, only needed for HEIC
    import pillow_heif  # type: ignore

    pillow_heif.register_heif_opener()
    HEIF = True
except Exception:
    HEIF = False

SUFFIXES = {".jpg", ".jpeg", ".png", ".heic", ".heif", ".tif", ".tiff", ".webp"}


def load(path: str) -> Image.Image:
    """Open any supported frame, upright, as RGB."""
    suffix = os.path.splitext(path)[1].lower()
    if suffix in {".heic", ".heif"} and not HEIF:
        if not shutil.which("sips"):
            raise RuntimeError(
                f"cannot read {suffix} — install pillow-heif (pip install pillow-heif)"
            )
        tmp = tempfile.mktemp(suffix=".jpg")
        subprocess.run(
            ["sips", "-s", "format", "jpeg", path, "--out", tmp],
            check=True,
            capture_output=True,
        )
        try:
            with Image.open(tmp) as im:
                return ImageOps.exif_transpose(im).convert("RGB")
        finally:
            os.path.exists(tmp) and os.remove(tmp)
    with Image.open(path) as im:
        return ImageOps.exif_transpose(im).convert("RGB")


def save_clean(im: Image.Image, path: str, max_edge: int, quality: int) -> None:
    """Resize and write with no metadata of any kind."""
    im = im.copy()
    im.thumbnail((max_edge, max_edge), Image.LANCZOS)
    clean = Image.new("RGB", im.size)
    clean.putdata(list(im.getdata()))
    clean.save(path, "JPEG", quality=quality)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("source", help="folder of photographs")
    ap.add_argument("--out", default=".", help="project root (default: cwd)")
    ap.add_argument("--working", type=int, default=2400, help="long edge for working copies")
    ap.add_argument("--preview", type=int, default=900, help="long edge for previews")
    args = ap.parse_args()

    working_dir = os.path.join(args.out, "photos", "working")
    preview_dir = os.path.join(args.out, "photos", "preview")
    os.makedirs(working_dir, exist_ok=True)
    os.makedirs(preview_dir, exist_ok=True)

    frames = sorted(
        f for f in os.listdir(args.source) if os.path.splitext(f)[1].lower() in SUFFIXES
    )
    if not frames:
        print(f"no images found in {args.source}")
        return 1

    for name in frames:
        stem = os.path.splitext(name)[0]
        try:
            im = load(os.path.join(args.source, name))
        except Exception as exc:  # keep going; report at the end
            print(f"  skipped {name}: {exc}")
            continue
        save_clean(im, os.path.join(working_dir, f"{stem}.jpg"), args.working, 88)
        save_clean(im, os.path.join(preview_dir, f"{stem}.jpg"), args.preview, 70)

    print(f"{len(frames)} frames ingested — upright, no metadata")
    print(f"  working copies: {working_dir}")
    print(f"  previews:       {preview_dir}")
    print("\nAdd photos/originals/ and photos/working/ to .gitignore.")
    print("Look at every preview before you plan anything.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
