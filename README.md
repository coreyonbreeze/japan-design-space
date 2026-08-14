# Japan Design Space

**An isolated designer experiment.** Ask an LLM to design something "Japanese" and it reaches for its training data, which means it reaches for stereotypes: cherry blossoms, torii gates, a red circle on white. The bias is strong and it arrives fast.

So this repo removes the training data from the loop. The only input is 65 photographs taken while walking Tokyo and Kanazawa (Aug 7–12) — buildings, menus, signs, roads, whatever made me stop and look. No reference images were fetched. No articles on Japanese design were read. Every colour, radius, easing curve, icon and component traces back to a specific frame, cited by filename.

**How honest is that claim?** `pipeline/verify_provenance.py` checks it rather than asserting it, and every colour token records what it found. Of 38 colours: **15 are measured** (within 18 in RGB of a colour actually sampled from a cited frame), **17 are adjusted** — a real measurement exists and is recorded alongside the distance, but the value was pulled toward what the eye reads, because median-cut quantisation returns box means and drags saturated minorities toward grey — and **6 are extrapolated**, almost all in the night-market mode, which is a deliberate combination the photographs do not directly contain. Labelling those three cases separately is the point: it keeps the measured ones trustworthy.

The method that made it work: rather than asking the model to interpret a photograph whole, the pipeline **edits the photos first** — crops to the motif, pushes contrast to strip material away and leave line rhythm, quantises colour to what was actually measured, pulls tileable surface textures. The model then designs from what the edits reveal, not from what the subject is called.

**Try it yourself.** Next time a building, a sign or a menu makes you feel something, take the photo. Point a coding agent at the folder, tell it the outcome you want, and give it as little guidance as you can stand. The less you steer it past the photos, the more it has to look at them.

This repo ships the method as a reusable skill: **[`.claude/skills/design-from-photographs/`](.claude/skills/design-from-photographs/)**. Clone the repo and it loads automatically in Claude Code; or copy that one folder into any project and point it at your own photographs. It contains the process, the anti-bias rules, and a working pipeline (ingest → extract → browse), and it deliberately contains **none** of this project's results — no palette, no vocabulary, no component names — so it cannot push your photos toward our conclusions.

Senko: 線 *sen* (line) + 弧 *ko* (arc) — the Kutani room signs' whole vocabulary. Also 閃光 *senkō*, a flash of light.

## What came out of it

| | |
|---|---|
| 8 essence themes | read from the photos, not from priors — see `field-notes.md` |
| 145 edited extractions | motif crops, structure pulls, palettes, textures, tone studies |
| 8 colour palettes | 15 values measured directly, 17 adjusted from a measurement, 6 extrapolated — each one labelled |
| 19 components | each citing its source photo |
| 18 icons | drawn under one law: straight lines and circular arcs only |
| 12 experiences | screen-level motion with mechanism and weight |
| 6 product screens | a working app assembled only from the above |

## Licence

Two licences, because the code and the photographs are different things:

- **Code and written content** — MIT. The component library, the pipeline, the tokens, the skill, the notes. Copy them, ship them, sell them. See [`LICENSE`](LICENSE).
- **Photographs and everything derived from them** — CC BY 4.0. Use and adapt them, including commercially, with credit. See [`LICENSE-PHOTOS`](LICENSE-PHOTOS).

[`NOTICE`](NOTICE) lists exactly which directories fall under which.

One caveat worth reading if you plan to reproduce rather than reference: photographs of buildings, signage and print may depict work belonging to someone else. The CC BY licence covers the photographs, not the architecture or artwork inside them.

## A note on the photos

The committed images carry **no EXIF**. iPhone frames arrive with GPS at roughly 10cm precision, the device model and a capture timestamp, and several frames here are private homes and shopfronts. `pipeline/previews.py` bakes rotation into the pixels and copies nothing else across; `pipeline/strip_exif.py` is the belt-and-braces pass. Run both after regenerating anything. Full-resolution originals are gitignored and never leave the source folder.

## Quick start

```bash
cd workbench && npm i && npm run dev   # both views
open library/index.html                 # browse the 145 photo extractions
```

The app has two views, switched at the bottom of the screen:

- **component library** — every part in isolation, each citing its source photo. Header controls: **register** (paper ⇄ market), **mode** (day ⇄ night), **loop demos** (re-fires every animated section on a timer; each section also has ↻ replay).
- **screens demo** (`#app`) — the same parts assembled into a working product: boot, home, lobby, collection, standings, profile, settings. Nothing here is bespoke; every element is a library component.

## Map

| Path | What |
|---|---|
| `field-notes.md` | Per-photo intent readings + the 8 essence themes. The DNA. |
| `plan.md` | The phased plan and locked decisions. |
| `photos/` | `originals/` (HEIC, gitignored — canonical in Drive), `preview/` (committed) |
| `pipeline/` | `recipes.json` (per-photo crops/edits chosen by eye), `build.py`, `contact_sheet.py`, `previews.py`, `strip_exif.py`. Deterministic and reproducible. |
| `library/` | 145 derivative extractions + `palettes.json` + **`index.html`** (theme-grouped browser) |
| `tokens/` | `senko.css` (Tailwind v4 tokens + registers/modes), `tokens.json` (W3C, photo sources cited per token), `palettes.json` (curated color stories) |
| `workbench/src/senko/` | **The library itself** — copy-paste React files, shadcn-style. `components/` parts, `primitives/` motion, `experiences/` screen-level events |
| `workbench/src/screens/` | The screens demo: six product screens built only from the library |
| `registry.json` | shadcn-compatible registry index |

## The system

**Two orthogonal axes**, both derived from the photos:

- `data-register`: **paper** (cream calm, serif, sparse color — the hotel book) ⇄ **market** (dense joy, rounded, sans — the kawaii shelves)
- `data-mode`: **day** ⇄ **night** (the observed dark mode: near-black sumi ground, paper ink, and amber as the accent — at night the accent *is* light). Market × night resolves to the **matsuri** palette: lantern-lit density on grape.

Surfaces that represent physical **materials** (kraft, porcelain, glaze, the obi band, box faces) keep their own ink in every mode — at night they read as lit objects, like the photos.

**Motion primitives** — `useKiln(seed)` (deterministic per-instance variation: same seed, same design, always), `<Ignite>` (elements warm up from dark and stay lit), `<Cascade>` (stair-tower stagger), `<Sheen>` (mode-aware glint: white by day, lamplight by night), `<Settle>` (overshoot caught by the prop). Easing tokens are hand-set cubic Béziers named for observed phenomena; hover swings use real springs; `useChime` is stubbed for the future sound pass.

**14 components**, each with provenance comments citing its source photos: `KilnPlaque` (generative line+arc identity marks), `SignDisc`, `ClipboardList`, `ArchFrame`/`Arcade`, `Directory` (floor windows ignite on hover; an elevator car rides the shaft to your selection; window glyphs swappable — arch/square/circle/custom), `Obi`, `MenuCard`, `GlazeGrid`, `FinRail`, `BalconyStack`, `Lantern`, `Scaffold` (loading as visible care — props, not shimmer), `ProvenancePlaque`, `BlindBox` (hover peeks, click reveals).

**Palettes** — 8 curated color stories (Paper 紙, Sumi 墨, Craft 工, Garden 庭, Light 光, Market 市, Night 夜, Matsuri 祭) exported as `PALETTES` + rendered by `<PaletteStrip>` (kiln-tilted chips, click-to-copy hex, photo sources on hover). Canonical data: `workbench/src/senko/palettes.ts`; mirrored to `tokens/palettes.json`; raw per-photo extractions in `library/palettes.json`.

**Experiences** — screen-level events with mechanism and weight, in `workbench/src/senko/experiences/`. `KilnFiring` (a load screen that fires a plaque), `TowerIgnition` (boot as a building filling with light), `HoseUnspool` (progress as a coil paying out), `DuskSweep` (day↔night as light raking across the viewport), `NorenSplit` (route change as cloth parting), `LouverWipe` (route change as louver fins turning), `LatticeWeave` (an overlay that weaves itself), `FusumaSlide` (a sliding door with friction), `GateOpen` (ceremonial section entry), `ArchAperture` (the arch itself is the aperture), `LeafScatter` (dismissal as falling leaves), `ProvenanceRubbing` (rub the plaque to raise the record).

**Animation style: hybrid, split by what the thing is.** Continuous phenomena — light, cloth, anything with mass — stay smooth. Drawn marks step at roughly 12fps via `stepFrames()`, because a stepped mark reads as hand-made. Steps scale to path length, so a short rule flicks faster than a long arc, the way a hand actually draws. Every experience honours `prefers-reduced-motion` with a static path.

**Icon library** — `<Icon>` with 18 icons drawn under the line+arc law (only straight segments and circular arcs, no beziers), in three tones over one geometry — the glyph never changes shape, only the ink. `mono` draws every stroke in currentColor. `duo` ignites the lit element in `--sk-glow`. `multi` also re-inks the functional element (the part you act on) in `--sk-accent`: the home's door, the search grip, the arrowhead, the lantern's flame.

## The rules the system lives by

1. **Module × variation** — repeated units, each instance slightly different (`useKiln`).
2. **Line + arc only** — corners are sharp or a named arc; the arch is a first-class shape. Icons obey the same law.
3. **Light is the animator** — things ignite, they don't highlight; once lit they stay lit.
4. **Visible care** — support states shown proudly (scaffold props, not shimmer).
5. **Materials keep their ink** — physical surfaces don't re-theme; they're lit objects at night.
6. **Registers are moods, modes are light** — and matsuri is what happens when both flip.
7. **Mechanism over transition** — things open, fall, slide, and unspool. They do not simply fade.

## Regenerating from source

Everything downstream traces to the photos. Edit `pipeline/recipes.json`, then:

```bash
python3 pipeline/build.py          # rebuild the 145 extractions
python3 pipeline/contact_sheet.py  # rebuild the theme browser
python3 pipeline/previews.py       # rebuild previews, upright, no metadata
python3 pipeline/strip_exif.py     # verify nothing carries EXIF
```

Token changes cite their photo IDs; component provenance comments point back to frames. Correct `field-notes.md` first if an intent reading is wrong — it is the root document.
