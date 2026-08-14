---
name: design-from-photographs
description: Extract a design system — themes, palettes, tokens, type, icons, components, motion — from a folder of the user's own photographs, using nothing but those photographs as source material. Use this whenever someone points at a folder of photos and wants a design language, component library, color palette, icon set, or "vibe" pulled out of them; whenever they mention photos from a trip, a walk, a market, a building, a workshop, a landscape, or anywhere that made them stop and look; and whenever they ask for a design system that reflects a place, an era, or a movement. Especially use it when the ask sounds like "make it look like [somewhere or some decade]" — that phrasing is exactly where a model substitutes recall for observation, and this skill exists to prevent that.
---

# Design from photographs

## The problem this solves

Asked to design in the manner of a place or a period, a model reaches into training data and returns the most photographed version of that idea: the motif from the tourism poster, the material every magazine shot that decade, the object that stands in for a whole culture in stock photography. It is confident, fast, and it tells the user nothing they did not already know.

A folder of someone's own photographs is different. They stopped and raised a camera dozens of times. Each frame is a data point about what actually held their attention — usually more specific, and stranger, than the cliché.

This skill treats the photographs as the **only** admissible evidence. The value is in that constraint. Supplement with what you already know about the subject and you have quietly restored the bias the user was trying to escape, and the result stops being theirs.

## The rules that make it work

Read `references/anti-bias.md` before you plan. It is short and it is the substance of this skill. In summary:

- **Do not research the place, culture, era, or style.** No web search, no reference images, no "principles of X" article. The photographs are the corpus.
- **Never let a place name act as a design instruction.** Being told where the photos were taken is metadata, not a brief. It must not change a value you would otherwise have measured.
- **The vocabulary comes only from what is visible.** If nothing in the frames is curved, the system has no curves. Absences are findings.
- **A finding is disqualified by being uncited, never by being unsurprising.** If the measurement and the expectation agree, keep the measurement and note the coincidence.

## What this needs from the user

The method depends on its input more than most, so establish these before doing work. `references/inputs.md` goes deeper, including how to help someone whose set is not there yet.

- **Images chosen by a human eye, not assembled by search.** Photographs the user took are the normal case. A client's own archive, or a set shot alongside them on the same walk, carries the same property. Search results, mood boards and saved feeds do not — those are the training data arriving through a side door, already filtered by what the internet rewards. Extract from them and you get the generic answer with extra steps.
- **Enough range to hold a system.** Roughly thirty frames with variety in distance, subject and light is comfortable. Ten varied frames can carry a small system; a hundred frames of one thing cannot carry anything, because they are one observation repeated.
- **A stated outcome.** "A palette and an icon set" and "a component library I can ship" are very different amounts of work. Ask.
- **Ten minutes of their attention at step 2.** You will misread why some photographs were taken, and misreadings compound into themes and tokens. That correction pass is what makes the result theirs.

### Step 0: read the set for viability, and say what you find

Before planning, look at the folder and give an honest read: how many frames, what range, what it can and cannot support. This costs minutes and prevents the worst outcome — a full system built on evidence too thin to carry it, discovered only at the end.

If the set is thin, say so and offer real options: narrow the scope to what the frames support, or go shoot more with specific suggestions about what is missing. Proceed anyway if the user wants to; just make sure they chose it.

## Process

### 1. Look at every photograph, one at a time

Before any planning, view each image. Not a sample — all of them. You cannot cluster what you have not seen, and sampling is how the most obvious subject wins by default.

For each frame, write what is in it and, more importantly, **why you think the person stopped here**. A photograph of a stairwell is rarely about stairs; it is about repetition, or the light, or a junction. Getting at that intent is the job.

Collect these in `field-notes.md`. This is the root document — every later artifact traces back to it.

**Then hand it to the user for correction before going further.** You are guessing at their intent and will get some wrong. Ask them to flag misreadings and to name their anchor frames — the handful that most feel like what they meant.

### 2. Cluster into themes the photographs actually support

Group frames by what recurs. A theme can take any of these shapes:

- **relational** — a repeated arrangement, junction or mechanism
- **chromatic** — a repeated color relationship, stated as a relationship ("high chroma confined to under a tenth of the frame") rather than as a mood
- **material** — a repeated surface condition, stated as what it does to light

The bar is the same for all three: **you can point at it in three or more frames and say which.** Adjectives like "minimal" or "organic" fail not because they are sensory but because they cannot be pointed at.

Let the number of themes be whatever the set supports. Two strong themes beat eight padded ones. If the set has one energy, do not manufacture a second for symmetry.

### 3. Edit the photographs before interpreting them

This is the step that makes the method work, and the one most likely to be skipped.

A photograph of a building is, to a model, "a building"; a photograph of fruit is "fruit". Editing strips the label away and leaves evidence. Choose the derivative types that suit each frame — `references/method.md` has the full list, including which to reach for when the subject is a surface, an object, or lettering rather than a structure.

Record every choice in `recipes.json` so the library regenerates from one command. Then browse the output **grouped by theme rather than by photograph** — that is where you see a relationship holding across three unrelated subjects at once.

### 4. Derive tokens by measurement

Every color comes from the extraction data, not from taste. Every token records the frames it came from. If you cannot cite a frame for a value, you invented it, and it does not belong. `scripts/verify_provenance.py` enforces exactly this; run it before you hand anything back.

Derive only what the frames support:

- **Color** — measured, with each value's role read from how much of the frame it covers.
- **Geometry, type, spacing** — the shape, lettering and proportion vocabulary actually present. Any of these may be absent; say so rather than inventing an opinion.
- **Motion** — only if the set contains evidence of it: something mid-movement, a mechanism, a material whose behaviour is visible. If it does not, say the photographs are silent on motion and ship plain defaults. A curve named after a photographed object, with no phenomenon behind it, is costume.
- **Modes** — discover whether the set supports light and dark, or two registers, or neither. Do not impose a structure the photographs do not carry.

### 5. Build components that embody principles, not resemblances

The failure mode is skeuomorphism: seeing a beautiful roofline and building a navigation bar shaped like a roof. That is costume, and it ages badly.

A component earns its place by implementing a **principle** from the themes. Name it for the mechanism it performs, so the name survives once the source photograph is forgotten and tells the next developer what it is for. Keep a provenance comment citing source frames.

Icons, where the brief calls for them, come from reduction: take `glyph` and `silhouette` derivatives and reduce each to the smallest mark that still reads, using only the shape vocabulary the set supports.

Where a real interaction question has no answer in the photographs, use ordinary good judgment and mark it. Honest gaps beat invented heritage.

**Deliver less than was asked for when the evidence supports less, and show the working.** The strongest thing you can hand back is a smaller system plus the demonstration of why it is smaller: run the deliverable you are declining, publish what came out, and let the user see it fail. Then give them the specific shot list that would unlock it. A padded system that discloses its padding in a footnote still spends the user's trust — they asked for something derived from their photographs, and most of it will not be.

### 6. Verify by looking, and by adversarial review

You cannot judge visual work from source. Render it and look at it, at full size. Check every mode and register you built; theming bugs hide in the combination nobody opened.

Run `scripts/verify_provenance.py` and fix what it reports. Then run critics — one on craft, one on correctness — briefed to find what is wrong rather than to praise. `references/review.md` has prompts that produce findings instead of flattery.

## Privacy: strip metadata before anything is shared

Phone photographs carry GPS at roughly ten-centimetre precision, the device model, and a timestamp. Someone's holiday photographs are a map of where they walked, often including private homes.

`scripts/ingest.py` bakes rotation into the pixels and copies no metadata across. Run `scripts/strip_exif.py` afterwards to verify, before any commit. If images were already committed with metadata, say so plainly — the data stays recoverable from history even after the working copy is cleaned.

## Scripts

Copy `scripts/` from this skill into the project root, then run from there.

```bash
python3 scripts/ingest.py <photo-folder>   # working copies + previews, upright, no metadata
python3 scripts/extract.py                 # recipes.json → derivatives + palettes.json
python3 scripts/contact_sheet.py           # theme-grouped browser over the derivatives
python3 scripts/verify_provenance.py        # every token cites real frames, or it fails
python3 scripts/strip_exif.py              # verify nothing carries metadata
```

The scripts choose nothing for you: every operation's defaults are identities, so an unparameterised edit is a visible no-op rather than a quiet house style. `references/method.md` documents the recipe format, every derivative and operation, and the token schema.

## What to hand back

A design system whose every value traces to a frame the user shot, plus the pipeline that regenerates it. They should be able to change one line in `recipes.json`, rerun, and watch the system update — and to challenge any color, curve or component with "where did that come from?" and get a filename.
