#!/usr/bin/env python3
"""Japan Design Space — Phase 1 derivative pipeline.

Deterministic edits only (crops, tone curves, quantization). Reads
pipeline/recipes.json, sources photos/full/*.jpg, writes
library/derivatives/*.jpg, library/palettes.json, library/manifest.json.
Re-running is idempotent: outputs are overwritten from recipes.
"""
import colorsys
import json
import os
import sys
from PIL import Image, ImageEnhance, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "photos", "full")
OUT = os.path.join(ROOT, "library", "derivatives")
LIB = os.path.join(ROOT, "library")
MAX_EDGE = 1400
SWATCH_H = 96

os.makedirs(OUT, exist_ok=True)


def load(img_id):
    im = Image.open(os.path.join(SRC, img_id + ".jpg"))
    im = ImageOps.exif_transpose(im)  # crops are chosen from upright views
    return im.convert("RGB")


def frac_crop(im, box):
    w, h = im.size
    x, y, cw, ch = box
    px = (int(x * w), int(y * h), int(min(1.0, x + cw) * w), int(min(1.0, y + ch) * h))
    return im.crop(px)


def shrink(im, max_edge=MAX_EDGE):
    im = im.copy()
    im.thumbnail((max_edge, max_edge), Image.LANCZOS)
    return im


def lut(fn):
    return [max(0, min(255, int(fn(i)))) for i in range(256)]


def apply_rgb_luts(im, r, g, b):
    return Image.merge("RGB", [ch.point(l) for ch, l in zip(im.split(), (r, g, b))])


def tone_paper(im):
    """Warm cream lift: lifted blacks, softened color, warm cast (menus, hotel book)."""
    im = ImageEnhance.Color(im).enhance(0.82)
    im = ImageEnhance.Brightness(im).enhance(1.05)
    lift = lut(lambda v: 20 + v * (238 - 20) / 255)
    im = im.point(lift * 3)
    return apply_rgb_luts(im, lut(lambda v: v * 1.03), lut(lambda v: v), lut(lambda v: v * 0.94))


def tone_amber(im):
    """Night warmth: crushed shadows, amber highlights (lamps, arch hotel, stair towers)."""
    im = ImageEnhance.Contrast(im).enhance(1.18)
    crush = lut(lambda v: 0 if v < 26 else (v - 26) * 255 / 229)
    im = im.point(crush * 3)
    return apply_rgb_luts(
        im,
        lut(lambda v: 255 * (v / 255) ** 0.88),
        lut(lambda v: 255 * (v / 255) ** 1.02 * 0.96),
        lut(lambda v: 255 * (v / 255) ** 1.28 * 0.82),
    )


def tone_ink(im):
    """Sumi duotone: navy shadows onto cream paper."""
    g = ImageOps.autocontrast(im.convert("L"), cutoff=1)
    lo, hi = (30, 42, 56), (247, 243, 232)  # navy -> cream
    bands = [g.point(lut(lambda v, i=i: lo[i] + (hi[i] - lo[i]) * v / 255)) for i in range(3)]
    return Image.merge("RGB", bands)


def tone_poster(im):
    """Posterize to ~4 tones: composition without detail."""
    im = ImageOps.autocontrast(im, cutoff=1)
    return ImageOps.posterize(im, 2)


def tone_golden(im):
    """Golden-hour grade (2093 balconies)."""
    im = ImageEnhance.Color(im).enhance(1.12)
    im = ImageEnhance.Contrast(im).enhance(1.06)
    return apply_rgb_luts(
        im,
        lut(lambda v: v * 1.1 + 6),
        lut(lambda v: v * 0.98),
        lut(lambda v: v * 0.78),
    )


TONES = {"paper": tone_paper, "amber": tone_amber, "ink": tone_ink, "poster": tone_poster, "golden": tone_golden}


def structure(im):
    """High-contrast mono: line rhythm and grid geometry without material."""
    g = ImageOps.autocontrast(im.convert("L"), cutoff=2)
    scurve = lut(lambda v: v * 0.55 if v < 128 else 255 - (255 - v) * 0.55)
    return g.point(scurve).convert("RGB")


def palette_of(im, k):
    """k-means-ish dominant colors via median-cut quantization -> [(hex, share)]."""
    small = im.resize((150, 150), Image.LANCZOS)
    q = small.quantize(colors=k, method=Image.MEDIANCUT)
    pal = q.getpalette()
    counts = sorted(q.getcolors(150 * 150), reverse=True)
    total = sum(c for c, _ in counts)
    out = []
    for count, idx in counts:
        r, g, b = pal[idx * 3 : idx * 3 + 3]
        out.append(("#%02X%02X%02X" % (r, g, b), round(count / total, 4)))
    return out


def chroma_peaks(im, k=5, min_sat=0.28, min_val=0.18):
    """Saturated colors that are actually present as pixels.

    Median-cut returns each box's mean, so a small saturated region reads
    greyer than it looks. For an accent that is the difference between a
    red door and a brown smudge, so accents are measured this way instead."""
    small = im.copy()
    small.thumbnail((220, 220), Image.LANCZOS)
    buckets = {}
    for r, g, b in small.getdata():
        h, sat, val = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
        if sat < min_sat or val < min_val:
            continue
        key = (round(h * 18), round(sat * 4), round(val * 4))
        acc = buckets.setdefault(key, [0, 0, 0, 0])
        acc[0] += r; acc[1] += g; acc[2] += b; acc[3] += 1
    total = max(1, sum(v[3] for v in buckets.values()))
    out = []
    for acc in sorted(buckets.values(), key=lambda a: -a[3])[:k]:
        n = acc[3]
        out.append(("#%02X%02X%02X" % (acc[0] // n, acc[1] // n, acc[2] // n), round(n / total, 4)))
    return out


def swatch_strip(colors, path):
    total_w = 960
    im = Image.new("RGB", (total_w, SWATCH_H), "#FFFFFF")
    x = 0
    for hexc, share in colors:
        w = max(8, int(total_w * share))
        im.paste(Image.new("RGB", (w, SWATCH_H), hexc), (x, 0))
        x += w
        if x >= total_w:
            break
    im.crop((0, 0, min(x, total_w), SWATCH_H)).save(path, quality=92)


def main():
    with open(os.path.join(ROOT, "pipeline", "recipes.json")) as f:
        recipes = json.load(f)
    recipes.pop("_format", None)

    manifest, palettes = [], {}
    n = 0
    for img_id in sorted(recipes):
        spec = recipes[img_id]
        im = load(img_id)
        for d in spec["derivatives"]:
            dtype = d["type"]
            if dtype == "palette":
                # Honour the crop. Sampling the whole frame averages a small
                # accent away — a 2% vermillion becomes brown — so an accent
                # must be measured from the region that contains it.
                region = frac_crop(im, d["crop"]) if "crop" in d else im
                colors = palette_of(region, d.get("k", 6))
                peaks = chroma_peaks(region)
                palettes.setdefault(img_id, []).append({"name": d.get("name","all"), "crop": d.get("crop"), "colors": colors, "chroma_peaks": peaks, "themes": spec["themes"], "note": spec.get("note", "")})
                fname = f"{img_id}-palette-{d.get('name','all')}.jpg"
                swatch_strip(colors, os.path.join(OUT, fname))
                entry_name = d.get("name", "palette")
                recipe_desc = f"median-cut k={d.get('k', 6)}"
            else:
                work = frac_crop(im, d["crop"]) if "crop" in d else im
                if dtype == "structure":
                    work = structure(work)
                    recipe_desc = "mono autocontrast + s-curve"
                elif dtype == "tone":
                    work = TONES[d["recipe"]](work)
                    recipe_desc = f"tone:{d['recipe']}"
                elif dtype in ("motif", "field", "texture"):
                    recipe_desc = "crop " + json.dumps(d.get("crop"))
                else:
                    raise ValueError(f"unknown type {dtype} in {img_id}")
                work = shrink(work)
                entry_name = d.get("name", dtype)
                fname = f"{img_id}-{dtype}-{entry_name}.jpg"
                work.save(os.path.join(OUT, fname), quality=88)
            manifest.append(
                {
                    "file": f"derivatives/{fname}",
                    "source": img_id,
                    "type": dtype,
                    "name": entry_name,
                    "recipe": recipe_desc,
                    "themes": spec["themes"],
                    "note": spec.get("note", ""),
                }
            )
            n += 1

    with open(os.path.join(LIB, "manifest.json"), "w") as f:
        json.dump(manifest, f, indent=1)
    with open(os.path.join(LIB, "palettes.json"), "w") as f:
        json.dump(palettes, f, indent=1)
    print(f"{n} derivatives from {len(recipes)} photos")


if __name__ == "__main__":
    sys.exit(main())
