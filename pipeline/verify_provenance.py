#!/usr/bin/env python3
"""Check that every color token can actually be traced to a measurement.

The system claims each color came from a photograph. That claim is only
worth anything if something checks it, so this does. For each token it
finds the nearest measured color among the frames it cites and classifies
the result:

  measured     — within 18 of a color measured in a cited frame
  adjusted     — a measured color exists in a cited frame but the token was
                 moved from it (median-cut returns box means, so saturated
                 minorities read greyer than they are; a designer pulling
                 the value back toward the pixel is legitimate, but it is
                 an adjustment and must say so)
  extrapolated — no measurement behind it at all

Writes the classification back into tokens/palettes.json so the record is
in the artifact rather than in someone's memory, and exits non-zero if any
token cites a frame that was never measured, which is the one case that is
simply an error.
"""
import json
import math
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NEAR = 18.0


def rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


def main() -> int:
    with open(os.path.join(ROOT, "library", "palettes.json")) as f:
        measured = json.load(f)
    path = os.path.join(ROOT, "tokens", "palettes.json")
    with open(path) as f:
        doc = json.load(f)

    counts = {"measured": 0, "adjusted": 0, "extrapolated": 0}
    unmeasured_frames = []

    for pal in doc["palettes"]:
        for c in pal["colors"]:
            sources = c.get("source") or []
            best = None
            for s in sources:
                entries = measured.get(s)
                if entries is None:
                    unmeasured_frames.append((pal["id"], c["name"], s))
                    continue
                for entry in entries:
                    # Quantised colors carry the grounds; chroma peaks carry
                    # the accents that median-cut averages away. Both are
                    # measurements, so search both.
                    for hexc, share in entry["colors"] + entry.get("chroma_peaks", []):
                        d = math.dist(rgb(c["value"]), rgb(hexc))
                        if best is None or d < best[0]:
                            best = (d, hexc, s, entry["name"], share)

            if best is None:
                c["derivation"] = "extrapolated"
                c.pop("measured", None)
            elif best[0] <= NEAR:
                c["derivation"] = "measured"
                c["measured"] = {"value": best[1], "frame": best[2], "region": best[3]}
            else:
                c["derivation"] = "adjusted"
                c["measured"] = {
                    "value": best[1],
                    "frame": best[2],
                    "region": best[3],
                    "distance": round(best[0]),
                }
            counts[c["derivation"]] += 1

    with open(path, "w") as f:
        json.dump(doc, f, indent=1)

    total = sum(counts.values())
    print(f"{total} color tokens")
    for k in ("measured", "adjusted", "extrapolated"):
        print(f"  {k:12} {counts[k]}")
    if unmeasured_frames:
        print("\nERROR — tokens cite frames that were never palette-extracted:")
        for pal_id, name, frame in unmeasured_frames:
            print(f"  {pal_id}/{name} cites {frame}")
        print("Add a palette derivative for those frames and re-run build.py.")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
