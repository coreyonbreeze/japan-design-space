# Method reference

Detail behind the process in SKILL.md: the recipe format, the derivative and tone operations, the token schema, and the shape of the deliverable.

## Contents

- [Recipe format](#recipe-format)
- [Derivative types](#derivative-types)
- [Tone operations](#tone-operations)
- [Palette extraction](#palette-extraction)
- [Token schema](#token-schema)
- [Naming](#naming)
- [Suggested layout](#suggested-layout)

## Recipe format

`recipes.json` maps each source image to the derivatives worth pulling from it. Crops are fractions of the image, so they survive any resize.

```json
{
  "IMG_0412": {
    "themes": ["repetition-with-variation", "worn-surfaces"],
    "note": "why this frame was taken — the intent reading",
    "derivatives": [
      { "type": "motif",     "name": "handrail-junction", "crop": [0.31, 0.22, 0.38, 0.30] },
      { "type": "structure", "name": "rail-rhythm" },
      { "type": "texture",   "name": "paint-flake",       "crop": [0.05, 0.60, 0.25, 0.25] },
      { "type": "tone",      "name": "overcast",          "op": "lift",   "params": { "black": 18, "saturation": 0.85 } },
      { "type": "palette",   "k": 6 }
    ]
  }
}
```

`crop` is `[x, y, width, height]` as fractions. Omit it to operate on the whole frame. Choose crops by eye after looking at the image — a crop chosen from the filename is a guess.

## Derivative types

| type | what it does | reach for it when |
|---|---|---|
| `motif` | tight crop to one element | the frame is about one thing and the surroundings are noise |
| `structure` | high-contrast monochrome, S-curve | **line** is the finding — edges, grids, rhythm, joinery |
| `material` | high-pass; keeps surface, discards composition | **the surface** is the finding — cloth, produce, corrosion, stone, skin. `structure` returns mush on soft organic subjects; this does not |
| `silhouette` | threshold to figure and ground | the subject is a **discrete object** and its form or proportion is the point |
| `glyph` | crop to lettering, numerals or marks | the frame contains **type** — the raw material for a type opinion and for icons |
| `arrangement` | crop to how several units sit together | the finding is **spacing, count or rhythm between** things rather than any one thing |
| `texture` | crop intended to tile | the surface is continuous and you want a reusable asset |
| `field` | recrop to the composition | there is meaningful **negative space** to study |
| `tone` | a graded edit (see below) | isolating a lighting or color condition |
| `palette` | measured colors, with share | always — see the note below |

`structure` and `material` are opposites and the choice between them is the most consequential one in this table. A set of façades wants `structure`; a set of textiles or produce wants `material`. Guessing wrong produces derivatives that look broken and reads as the user's set failing.

`field` returns little on a densely packed frame — a full market stall or a machine hall has no negative space. That is information about the corpus, not a fault.

Not every frame deserves every crop or tone op; three deliberate derivatives beat six mechanical ones. **Palette is the exception: measure every frame.** It is free, lossless and carries no aesthetic choice, and a frame you did not measure is a frame you cannot cite later. `extract.py` also accepts a `crop` on a palette, which matters more than it sounds — see below.

## Tone operations

Parameterised so they carry no aesthetic preset. Pick values from what the frame shows.

| op | params | effect |
|---|---|---|
| `lift` | `black` (0-60), `saturation` (0-2), `tint` `[r,g,b]` multipliers | raises blacks, softens color, optional cast |
| `crush` | `floor` (0-60), `gamma` `[r,g,b]` | deepens shadows, bends channels |
| `duotone` | `dark` `#hex`, `light` `#hex` | maps luminance between two measured colors |
| `posterize` | `bits` (1-4) | flattens to a few tones; composition without detail |
| `grade` | `mul` `[r,g,b]`, `add` `[r,g,b]` | linear per-channel push |

For `duotone`, take both colors from the palette extraction of a real frame rather than choosing them.

## Palette extraction

Median-cut quantisation over a downsampled copy, returning colors with their share of the frame. Share matters: a color covering 2% of a frame is an accent, one covering 40% is a ground, and the difference should survive into the token layer.

**Two traps here, and both have bitten a real run of this method.**

First, median-cut returns each box's **mean**, so a small saturated region measures duller than it looks. Tomatoes against grey crates come back brownish; a red door comes back mauve. That is an artefact of the algorithm, not a finding about the subject, and reading it as a finding will systematically desaturate the corpus.

Second, a palette over the whole frame averages the accent away before you can see it. So **measure accents from a crop that contains them**: add a second palette entry with a `crop` around the region and a `name` describing it. The measurement then has the saturated colour in it, and the token that follows is genuinely cited.

`extract.py` also emits `chroma_peaks` alongside the quantised colors — the saturated colors actually present as pixels, bucketed by hue and averaged only within a bucket. For accents, that is the honest measurement; for grounds, the quantised list is.

Curate afterwards. The raw per-frame output is evidence; a palette is a reading of that evidence with near-duplicates merged and each group named for what it is in the corpus, not what it evokes. When a value ends up pulled away from every measurement, keep it and label it — `verify_provenance.py` will classify it as `adjusted` and record the distance, which is honest. Silently presenting it as measured is not.

## Token schema

Any format works. What matters is that every value carries its provenance:

```json
{
  "color": {
    "ground-1": {
      "$value": "#E8E3D8",
      "$extensions": { "source": ["IMG_0412", "IMG_0455"] }
    }
  },
  "easing": {
    "settle": {
      "$value": [0.22, 1.12, 0.32, 1],
      "$extensions": {
        "source": ["IMG_0503"],
        "derivation": "interpreted — a static frame of a mechanism, not a measurement"
      }
    }
  }
}
```

Marking interpreted values as interpreted keeps the measured ones trustworthy.

## Naming

Name components for the **mechanism they perform**, not the object in the photo and not a generic UI label.

- Naming after the object produces costume: a nav bar named after a roof invites someone to make it roof-shaped.
- Naming generically (`Card`, `Panel`) throws away the finding.
- Naming the mechanism keeps the principle portable: it still means something once the source photo is forgotten, and it tells the next developer what the component is *for*.

The same applies to themes. A theme name should state a relationship you can point at across several frames.

## Suggested layout

```
field-notes.md          per-photo intent readings and themes — the root document
recipes.json            per-photo edit decisions
photos/
  originals/            untouched, gitignored, never leave the source folder
  working/              full-size derivable copies, gitignored
  preview/              small, upright, no metadata — safe to commit
library/
  derivatives/          the edits
  palettes.json         measured color per frame
  index.html            theme-grouped browser
tokens/                 measured values with provenance
components/             the system, each part citing its frames
```

Keep originals out of version control. Previews are enough for review and carry no metadata once ingested.
