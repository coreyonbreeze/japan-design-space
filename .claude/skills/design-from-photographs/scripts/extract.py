#!/usr/bin/env python3
"""Turn recipes.json into a library of derivatives plus measured palettes.

Deterministic: the same recipes always produce the same output, so the whole
library regenerates from one command after any edit.

Every operation's defaults are IDENTITIES. An unparameterised edit is a
visible no-op, not a quiet house style — a script that shipped, say, a
gentle desaturation by default would be imposing a look on every corpus
that ran through it. `duotone` has no defaults at all and raises unless
both colors are supplied, because those two colors are the whole operation
and they belong to the photographs, not to this file.

Usage:
    python3 scripts/extract.py [--recipes recipes.json] [--src photos/working]
                               [--out library] [--max-edge 1400]
"""
import argparse
import json
import os
import sys

from PIL import Image, ImageEnhance, ImageFilter, ImageOps

SWATCH_H = 96


def frac_crop(im: Image.Image, box) -> Image.Image:
    w, h = im.size
    x, y, cw, ch = box
    return im.crop(
        (int(x * w), int(y * h), int(min(1.0, x + cw) * w), int(min(1.0, y + ch) * h))
    )


def lut(fn):
    return [max(0, min(255, int(fn(i)))) for i in range(256)]


def apply_rgb(im: Image.Image, r, g, b) -> Image.Image:
    return Image.merge("RGB", [c.point(l) for c, l in zip(im.split(), (r, g, b))])


# ---------------------------------------------------------------- tone ops
# Defaults are identities. Choose values by looking at the frame.

def op_lift(im, black=0, saturation=1.0, tint=(1.0, 1.0, 1.0)):
    """Raise the black point, scale saturation, optional per-channel cast."""
    if saturation != 1.0:
        im = ImageEnhance.Color(im).enhance(saturation)
    if black:
        im = im.point(lut(lambda v: black + v * (255 - black) / 255) * 3)
    if tuple(tint) != (1.0, 1.0, 1.0):
        im = apply_rgb(im, *[lut(lambda v, m=m: v * m) for m in tint])
    return im


def op_crush(im, floor=0, gamma=(1.0, 1.0, 1.0)):
    """Deepen shadows to a floor, then bend each channel by its own gamma."""
    if floor:
        im = im.point(lut(lambda v: 0 if v < floor else (v - floor) * 255 / (255 - floor)) * 3)
    if tuple(gamma) != (1.0, 1.0, 1.0):
        im = apply_rgb(im, *[lut(lambda v, g=g: 255 * (v / 255) ** g) for g in gamma])
    return im


def op_duotone(im, dark, light):
    """Map luminance between two colors. Both are required: take them from
    palettes.json so the mapping comes from the corpus, not from a default."""
    lo = tuple(int(dark.lstrip("#")[i : i + 2], 16) for i in (0, 2, 4))
    hi = tuple(int(light.lstrip("#")[i : i + 2], 16) for i in (0, 2, 4))
    g = ImageOps.autocontrast(im.convert("L"), cutoff=1)
    return Image.merge(
        "RGB",
        [g.point(lut(lambda v, i=i: lo[i] + (hi[i] - lo[i]) * v / 255)) for i in range(3)],
    )


def op_posterize(im, bits=8):
    """Flatten to 2**bits levels per channel. bits=8 is a no-op."""
    return ImageOps.posterize(im, bits)


def op_grade(im, mul=(1.0, 1.0, 1.0), add=(0, 0, 0)):
    """Linear per-channel push."""
    return apply_rgb(im, *[lut(lambda v, m=m, a=a: v * m + a) for m, a in zip(mul, add)])


OPS = {
    "lift": op_lift,
    "crush": op_crush,
    "duotone": op_duotone,
    "posterize": op_posterize,
    "grade": op_grade,
}


# -------------------------------------------------------- reading operations

def op_structure(im, cutoff=2, contrast=0.55):
    """Remove material so line rhythm can be read. Use where line is the
    finding; where the surface is the finding, use `material` instead."""
    g = ImageOps.autocontrast(im.convert("L"), cutoff=cutoff)
    return g.point(
        lut(lambda v: v * contrast if v < 128 else 255 - (255 - v) * contrast)
    ).convert("RGB")


def op_material(im, radius=12, boost=1.6):
    """The inverse of `structure`: discard large-scale composition and keep
    surface. For corpora where the material IS the subject — cloth, produce,
    corrosion, skin, stone — line extraction returns mush and this does not."""
    grey = im.convert("L")
    low = grey.filter(ImageFilter.GaussianBlur(radius))
    high = Image.merge(
        "RGB",
        [
            Image.eval(
                Image.merge("L", [grey]).point(lambda v: v),
                lambda v: v,
            )
        ]
        * 3,
    )
    # high-pass: original minus its own blur, recentred, then stretched
    diff = Image.new("L", grey.size)
    diff.putdata(
        [max(0, min(255, 128 + int((a - b) * boost))) for a, b in zip(grey.getdata(), low.getdata())]
    )
    del high
    return ImageOps.autocontrast(diff, cutoff=1).convert("RGB")


def op_silhouette(im, threshold=None):
    """Threshold to figure and ground. Yields form and proportion where there
    is no line rhythm to read — discrete objects, produce, tools, letters."""
    g = ImageOps.autocontrast(im.convert("L"), cutoff=2)
    if threshold is None:
        hist = g.histogram()
        total = sum(hist)
        acc = 0
        threshold = 128
        for i, count in enumerate(hist):  # median split
            acc += count
            if acc >= total / 2:
                threshold = i
                break
    return g.point(lambda v: 255 if v > threshold else 0).convert("RGB")


def palette_of(im: Image.Image, k: int):
    """Dominant colors with their share of the frame. Share separates a ground
    from an accent, and that difference should survive downstream.

    Median-cut returns each box's mean, so an extracted palette is always a
    little less chromatic than the frame. On a saturated corpus, read that as
    an artefact of the method, not as a finding about the subject."""
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


def swatch(colors, path):
    width = 960
    im = Image.new("RGB", (width, SWATCH_H), "#FFFFFF")
    x = 0
    for hexc, share in colors:
        w = max(8, int(width * share))
        im.paste(Image.new("RGB", (w, SWATCH_H), hexc), (x, 0))
        x += w
        if x >= width:
            break
    im.crop((0, 0, min(x, width), SWATCH_H)).save(path, quality=92)


# Crop-only types: the edit is the framing itself.
CROP_TYPES = {"motif", "field", "texture", "glyph", "arrangement"}
# Types with a reading operation attached.
READ_OPS = {"structure": op_structure, "material": op_material, "silhouette": op_silhouette}


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--recipes", default="recipes.json")
    ap.add_argument("--src", default="photos/working")
    ap.add_argument("--out", default="library")
    ap.add_argument("--max-edge", type=int, default=1400)
    args = ap.parse_args()

    try:
        with open(args.recipes) as f:
            recipes = json.load(f)
    except FileNotFoundError:
        print(f"no {args.recipes} — write one first (see references/method.md)")
        return 1
    except json.JSONDecodeError as exc:
        print(f"{args.recipes} is not valid JSON: {exc}")
        return 1
    recipes.pop("_format", None)

    deriv_dir = os.path.join(args.out, "derivatives")
    os.makedirs(deriv_dir, exist_ok=True)

    manifest, palettes, made, problems = [], {}, 0, []
    for frame in sorted(recipes):
        spec = recipes[frame]
        path = os.path.join(args.src, f"{frame}.jpg")
        if not os.path.exists(path):
            problems.append(f"{frame}: no source at {path}")
            continue
        with Image.open(path) as opened:
            im = opened.convert("RGB")

        for d in spec.get("derivatives", []):
            kind = d.get("type")
            region = frac_crop(im, d["crop"]) if "crop" in d else im
            try:
                if kind == "palette":
                    colors = palette_of(region, d.get("k", 6))
                    palettes.setdefault(frame, []).append(
                        {
                            "name": d.get("name", "palette"),
                            "crop": d.get("crop"),
                            "colors": colors,
                            "themes": spec.get("themes", []),
                            "note": spec.get("note", ""),
                        }
                    )
                    fname = f"{frame}-palette-{d.get('name', 'all')}.jpg"
                    swatch(colors, os.path.join(deriv_dir, fname))
                    name, recipe = d.get("name", "palette"), f"median-cut k={d.get('k', 6)}"
                else:
                    params = d.get("params", {})
                    if kind in READ_OPS:
                        work = READ_OPS[kind](region, **params)
                        recipe = f"{kind} {json.dumps(params, sort_keys=True)}"
                    elif kind == "tone":
                        op = d.get("op")
                        if op not in OPS:
                            raise ValueError(f"unknown tone op {op!r} (have: {', '.join(OPS)})")
                        work = OPS[op](region, **params)
                        recipe = f"{op} {json.dumps(params, sort_keys=True)}"
                    elif kind in CROP_TYPES:
                        work, recipe = region, "crop " + json.dumps(d.get("crop"))
                    else:
                        raise ValueError(
                            f"unknown derivative type {kind!r} "
                            f"(have: {', '.join(sorted(CROP_TYPES | READ_OPS.keys() | {'tone', 'palette'}))})"
                        )
                    work = work.copy()
                    work.thumbnail((args.max_edge, args.max_edge), Image.LANCZOS)
                    name = d.get("name", kind)
                    fname = f"{frame}-{kind}-{name}.jpg"
                    work.save(os.path.join(deriv_dir, fname), quality=88)
            except (TypeError, ValueError) as exc:
                problems.append(f"{frame} / {kind} / {d.get('name', '?')}: {exc}")
                continue

            manifest.append(
                {
                    "file": f"derivatives/{fname}",
                    "source": frame,
                    "type": kind,
                    "name": name,
                    "recipe": recipe,
                    "crop": d.get("crop"),
                    "themes": spec.get("themes", []),
                    "note": spec.get("note", ""),
                }
            )
            made += 1

    with open(os.path.join(args.out, "manifest.json"), "w") as f:
        json.dump(manifest, f, indent=1)
    with open(os.path.join(args.out, "palettes.json"), "w") as f:
        json.dump(palettes, f, indent=1)

    print(f"{made} derivatives from {len(recipes)} frames")
    for p in problems:
        print(f"  problem — {p}")
    print("Browse them grouped by theme, not by frame — run scripts/contact_sheet.py")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
