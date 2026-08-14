/* Senko 線弧 — <Icon>
 * Source: IMG_2050 (Kutani room signs: "expressed with only straight lines
 * and arcs, each room's expression slightly different") — the law of this
 * library; IMG_2049 (oil lamps in darkness) — the lantern glyph, and the
 * duo tone's habit: elements don't get highlighted, they ignite.
 * Every glyph is straight segments and circular arcs ONLY — no beziers,
 * no free curves.
 *
 * Three tones, one geometry. The glyph never changes shape between tones;
 * only the ink changes. mono draws every stroke in currentColor. duo
 * ignites the glyph's lit element in --sk-glow. multi also re-inks the
 * glyph's functional element — the part you act on — in --sk-accent.
 * Every icon defines an accent, so multi always differs from duo.
 */

interface IconDef {
  /** the ink: every stroke of the glyph — lines and circular arcs only */
  paths: string[];
  /** the lit element — re-drawn beneath in --sk-glow for duo/multi */
  glow?: string[];
  /** the functional element — re-inked in --sk-accent for multi.
   *  Must be a member of `paths`, so the geometry never changes. */
  accent: string[];
}

/** full circle as two half-arcs — A commands keep the law auditable */
const O = (cx: number, cy: number, r: number): string =>
  `M${cx - r} ${cy} A${r} ${r} 0 1 0 ${cx + r} ${cy} A${r} ${r} 0 1 0 ${cx - r} ${cy}`;

// shared gestures
const HOME_ARCH = "M5.5 10 A6.5 6.5 0 0 1 18.5 10"; // the arch IS the roof — 2052
const LENS = O(10.5, 10.5, 5.5);
const HEAD = O(12, 7.5, 3.5);
const RING = O(12, 12, 5); // the lamp disc — 2049; also the settings hub — 2090
const DOC_RULE = "M9 9.5 L15 9.5";
const DOC_RULE_2 = "M9 13.5 L15 13.5";
const DOME = "M5.5 14 A6.5 6.5 0 0 1 18.5 14";
const SUN = "M7 16 A5 5 0 0 1 17 16"; // hinode — half-circle over the horizon, 2080

// elements that carry each glyph's function, re-inked by tone="multi"
const HOME_DOOR = "M10 20 L10 14.5 L14 14.5 L14 20";
const SEARCH_GRIP = "M14.6 14.6 L19.5 19.5";
const SHOULDERS = "M5 20 A7 7 0 0 1 19 20";
const FINS = ["M12 3 L12 5.5", "M18.5 12 L21 12", "M12 18.5 L12 21", "M3 12 L5.5 12"];
const BARB_R = "M15 7.5 A4.5 4.5 0 0 0 19.5 12 A4.5 4.5 0 0 0 15 16.5";
const BARB_L = "M9 7.5 A4.5 4.5 0 0 1 4.5 12 A4.5 4.5 0 0 1 9 16.5";
const BARB_U = "M7.5 9 A4.5 4.5 0 0 0 12 4.5 A4.5 4.5 0 0 0 16.5 9";
const BARB_D = "M7.5 15 A4.5 4.5 0 0 1 12 19.5 A4.5 4.5 0 0 1 16.5 15";
const CHECK_PROP = "M5 12.5 L10 17.5"; // the short leg — the prop that catches
const CHECK_RISE = "M10 17.5 L19 6.5";
const CLOSE_A = "M6 6 L18 18";
const PLUS_STEM = "M12 5 L12 19";
const FLAME = O(12, 12, 1.1);
const FOLDER_TAB = "M6.5 8 A2.5 2.5 0 0 1 11.5 8";
const CLAPPER = O(12, 17.5, 1.5);
const DAY_MARK = O(15, 15, 1.7);
const RAYS = ["M12 9.5 L12 6.5", "M7.4 11.4 L5.3 9.3", "M16.6 11.4 L18.7 9.3"];
const GATE_NUKI = "M6.5 9 L17.5 9"; // the lower tie beam

const ICONS = {
  // square base, half-circle arch on the top edge (2044 vignettes, 2052 windows)
  home: {
    paths: ["M5.5 20 L5.5 10 L18.5 10 L18.5 20 Z", HOME_ARCH, HOME_DOOR],
    glow: [HOME_ARCH],
    accent: [HOME_DOOR],
  },
  search: { paths: [LENS, SEARCH_GRIP], glow: [LENS], accent: [SEARCH_GRIP] },
  // half-circle shoulders, full-circle head
  user: { paths: [HEAD, SHOULDERS], glow: [HEAD], accent: [SHOULDERS] },
  // hub + 4 radial fins at N/E/S/W — the radial soffit of 2090
  settings: { paths: [RING, ...FINS], glow: [RING], accent: FINS },
  // shaft + two quarter-arc barbs flaring back from the tip
  "arrow-right": { paths: ["M4 12 L19.5 12", BARB_R], accent: [BARB_R] },
  "arrow-left": { paths: ["M20 12 L4.5 12", BARB_L], accent: [BARB_L] },
  "arrow-up": { paths: ["M12 20 L12 4.5", BARB_U], accent: [BARB_U] },
  "arrow-down": { paths: ["M12 4 L12 19.5", BARB_D], accent: [BARB_D] },
  // the prop angle from the supported pines — 2075–2082
  check: { paths: [CHECK_PROP, CHECK_RISE], accent: [CHECK_PROP] },
  close: { paths: [CLOSE_A, "M18 6 L6 18"], accent: [CLOSE_A] },
  plus: { paths: [PLUS_STEM, "M5 12 L19 12"], accent: [PLUS_STEM] },
  // the signature glyph: the oil lamp of 2049 — multi inks the flame
  lantern: {
    paths: ["M12 3.5 L12 5.5", RING, FLAME, "M12 18.5 L12 20.5"],
    glow: [RING],
    accent: [FLAME],
  },
  doc: {
    paths: ["M6 4 L18 4 L18 20 L6 20 Z", DOC_RULE, DOC_RULE_2],
    glow: [DOC_RULE],
    accent: [DOC_RULE_2],
  },
  // half-circle tab on the top-left edge
  folder: { paths: ["M4 8 L20 8 L20 19 L4 19 Z", FOLDER_TAB], accent: [FOLDER_TAB] },
  bell: { paths: [DOME, "M4.5 14 L19.5 14", CLAPPER], glow: [DOME], accent: [CLAPPER] },
  // one day circled — the single color event of 2029
  calendar: {
    paths: [
      "M4.5 6.5 L19.5 6.5 L19.5 20 L4.5 20 Z",
      "M4.5 10.5 L19.5 10.5",
      "M8.5 3.5 L8.5 6.5",
      "M15.5 3.5 L15.5 6.5",
      DAY_MARK,
    ],
    accent: [DAY_MARK],
  },
  // no jaggy 5-point star: hinode — sun over horizon, 3 radial rays
  star: { paths: ["M4 16 L20 16", SUN, ...RAYS], glow: [SUN], accent: RAYS },
  // abstract portal from the machiya gates — 2089
  gate: {
    paths: ["M7 5 L7 20", "M17 5 L17 20", "M4 5 L20 5", GATE_NUKI],
    accent: [GATE_NUKI],
  },
} satisfies Record<string, IconDef>;

export type IconName = keyof typeof ICONS;
export const ICON_NAMES = Object.keys(ICONS) as IconName[];

export interface IconProps {
  name: IconName;
  size?: number;
  tone?: "mono" | "duo" | "multi";
  className?: string;
  "aria-label"?: string;
}

export function Icon({ name, size = 20, tone = "mono", className, "aria-label": ariaLabel }: IconProps) {
  const def: IconDef = ICONS[name];
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role="img"
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    >
      {/* duo/multi: the glow element ignites beneath the ink — fill + wide
          under-stroke composited together, like a window warming at night */}
      {tone !== "mono" &&
        def.glow?.map((d) => (
          <path key={d} d={d} stroke="var(--sk-glow)" fill="var(--sk-glow)" strokeWidth={3.4} opacity={0.35} />
        ))}
      {def.paths.map((d) => (
        <path key={d} d={d} />
      ))}
      {/* multi: the functional element re-inked on top of its own stroke */}
      {tone === "multi" && def.accent.map((d) => <path key={d} d={d} stroke="var(--sk-accent)" />)}
    </svg>
  );
}
