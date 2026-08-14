# Japan Design Space — Plan

Goal: turn 65 photos into (1) a curated, post-processed **inspiration library** and (2) a **component library** ("shadcn equivalent") whose DNA comes from the photos themselves — not from internet notions of "Japanese design."

Ground rule carried through every phase: we extract **essence, purpose, intent** — never "make the sidebar look like a temple." A component earns its place by embodying a *principle* observed in the photos (module×variation, light-as-animator, visible care), not by resembling a building.

Source of truth: `field-notes.md` (per-photo intent readings + 8 cross-cutting essence themes). Photos in `photos/originals/` (HEIC) and `photos/preview/` (JPEG).

---

## Phase 0 — Intent calibration (you + me, ~1 session)

The whole point is *your eyes*. Before any pixels move:

- You skim `field-notes.md` and flag anything I misread ("no, I shot 2056 for the shadows, not the frames").
- You mark ~10 photos as **anchors** — the ones that most feel like "this is what I meant."
- We lock the essence themes (currently 8) and kill any that don't resonate.

Output: corrected field notes, anchor list, locked theme list.

## Phase 1 — Inspiration library (the edited-photo deliverable)

A deterministic post-processing pipeline (ImageMagick, scripted, reproducible) that mines each photo for its extractable content. Per photo, up to six derivative types:

| Derivative | Edit | What it extracts |
|---|---|---|
| `motif` | Tight crop to the design element | The thing itself (one arch, one plaque, one tile junction) |
| `structure` | High-contrast mono / edge extraction | Line rhythm, grid geometry — composition without material |
| `palette` | k-means dominant colors → swatch strip + JSON | Real observed color, not "Japan palette" clichés |
| `texture` | Tileable surface crop (stucco, grout, glaze, grain, washi) | Reusable surface assets for the component library |
| `tone` | Graded edit (lift/crush, duotone, posterize) | Mood isolation — e.g., the amber-in-darkness register |
| `field` | Recrop to the negative-space composition | The calm/density balance (90% quiet, 10% event) |

- Not every photo gets every derivative — I choose per photo based on field notes; crop coordinates chosen by eye, logged in a manifest.
- `library/manifest.json`: every derivative → source photo, edit recipe, theme tags. Fully regenerable.
- Browsable contact-sheet page (local HTML) organized by **theme**, not by photo — so you browse "module × variation" across menus, tiles, and balconies at once.
- Optional (your call, question below): AI-assisted edits (e.g., isolating a motif from a busy background) — clearly labeled as such, never mixed silently with deterministic edits.

Output: `library/` with ~150–250 curated derivatives + manifest + browser.

## Phase 2 — Design tokens (the bridge)

Everything measured from Phase 1 outputs, nothing invented:

- **Color**: named palettes from actual extraction — paper creams, sumi ink/navy, glaze celadon, patina verdigris/moss, night amber, golden-hour gradient, kawaii pastels, single vermillion accent. Each token cites its source photos.
- **Geometry**: the line+arc system (from the Kutani plaques, diagrams, directory, canopy). Radii scale = quarter/half circles at fixed steps; corner language uses *only* these.
- **Texture**: the Phase 1 tileables as CSS-ready assets (grain overlays, grout gaps, glaze speckle).
- **Motion**: a named easing/timing vocabulary derived from the observed phenomena, e.g. `ignite` (warm light-up from dark — night arches, lamps), `cascade` (staggered zigzag reveal — stair towers), `settle` (slight overshoot then propped, calm — supported pines), `sheen` (specular sweep — laminate/glaze), `reveal` (blind-box open — SMISKI). Slow, settled defaults; bounce reserved for the kawaii register.
- **Two registers** as first-class modes: **paper** (calm, cream, sparse color events) and **market** (dense, joyful, sticker energy). Not light/dark themes — density/energy modes.

Output: `tokens/` (W3C design tokens JSON + CSS variables + Tailwind preset), each token annotated with source-photo IDs.

## Phase 3 — Component library v1 (the shadcn equivalent)

Copy-paste components in a shadcn-compatible registry (own the code, no dependency). Proposed stack: React + TypeScript + Tailwind v4 + Motion (framer-motion) — confirm below. Every component's doc page cites its source photos and the principle it embodies.

**Motion primitives first** (animation is the priority):
1. `<Ignite>` — light-up entrance/focus: elements warm from dark instead of highlighting (2049, 2052, 2095)
2. `<Cascade>` — zigzag stagger for lists/grids (2062–2063, 2093)
3. `useKiln(seed)` — **per-instance variation hook**: deterministic micro-variation (radius, tilt, glaze tint) seeded by content ID, so no two rendered instances are identical (2050 plaques, 2060 tiles). This is the library's signature.
4. `<Sheen>` — hover/active specular sweep (laminated menus, glaze)
5. `<Settle>` — entrance easing that overshoots slightly and gets "caught" (propped pines)

**Components v1** (~14, each mapped to source):
| Component | Source | What it is in a product |
|---|---|---|
| `KilnPlaque` | 2050, 2043 | Generative line+arc identity mark — avatars/room-signs from an ID; every user/item unique but in-system |
| `SignDisc` | 2038 | Uniform-disc nav/tenant row — one shape, many labels |
| `ClipboardList` | 2055 | Numbered hanging-card list with states (incl. SOLD-OUT sticker state) |
| `ArchFrame` / `Arcade` | 2044, 2052, 2042 | Arch-topped container + arcade grid; gallery, modal, stepper |
| `Directory` | 2042 | Floor-directory list; hover *ignites* a row like the night windows |
| `Obi` | 2029 | Band callout wrapping a card — the strip that carries all the words |
| `MenuCard` | 2024–2026 | Pricing/product card: pastel block header, illustration slot, topping pills, sticker states |
| `GlazeGrid` | 2060–2061 | Imperfect grid (kiln-varied cells, thick "grout" gaps), one accent cell carries the mark |
| `FinRail` | 2032, 2090 | Scroll-linked louver strip — fins respond to scroll/pointer; section divider/progress |
| `BalconyStack` | 2063, 2093 | Timeline/stepper with alternating zigzag offsets and gradient light progression |
| `Lantern` | 2049 | Focus/notification mode: page dims, one warm point of light (toast/spotlight) |
| `Scaffold` | 2075–2082 | **Loading/skeleton as visible care**: props and supports drawn holding the content's place — support shown proudly, not hidden |
| `ProvenancePlaque` | 2088, 2077 | Metadata/attribution card (bronze-plaque register, QR-in-wood pattern) |
| `BlindBox` | 2110–2111, 2102 | Collection grid with reveal mechanic — market register's hero |

**Workbench**: a local docs/demo site (registry browser) — deliberately plain chrome so the components carry all character. The workbench is a *viewer*, not the product; guardrail against "let's build a website with a photo-inspired sidebar."

**Sound**: stub a `useChime` hook + event map (interaction → sound slot) so audio can land later without rework. No audio assets in v1.

Output: `packages/ui/` registry + workbench app + per-component provenance docs.

## Phase 4 — Later (parked)

Sound design pass; more components (StoneMark seal/stamp badges, StickerSheet reaction layer, HoseRing status ring from 2113); Figma export of tokens; using the library in a real Onbreeze/PBC project as the shakeout.

---

## Sequencing & effort

- Phase 0: one review pass from you (30–60 min of your time)
- Phase 1: 1–2 sessions, mostly automated once recipes are set
- Phase 2: 1 session, derived from Phase 1
- Phase 3: the big one — 3–5 sessions; motion primitives + 5 components first, rest incrementally
- Phases are strictly ordered: every component token traces back through Phase 2 → Phase 1 → a photo you took.

## Decisions (locked 2026-08-13)

1. **Stack**: React + TypeScript + Tailwind v4 + Motion (framer-motion), shadcn-compatible copy-paste registry
2. **Edit policy**: deterministic pipeline is the core; AI assists only for motif isolation, always labeled, never silently mixed
3. **Registers**: both — *paper* is the default mode, *market* is an intentional switchable mode
4. **Home**: git repo in this folder from the start (`photos/originals/` gitignored — canonical copies live in Drive)
