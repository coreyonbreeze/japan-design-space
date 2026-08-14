/* Senko 線弧 — <Directory>
 * Source: IMG_2042 (hotel floor directory etched in metal: a thin-line
 * building section of arch modules beside italic serif floor labels),
 * IMG_2052 (the same arches glowing amber at night). Wayfinding as an
 * architectural drawing: hover a floor and its windows ignite; select one
 * and the elevator car rides the shaft to it. The window glyph is
 * swappable (arch by default — square, circle, or your own path fn).
 * Use for floor pickers, section navs, table-of-contents with a map.
 */
import { motion } from "motion/react";
import { useId, useState } from "react";
import { kiln } from "../primitives/kiln";
import { BEAT, EASE, cn } from "../lib";

export interface DirectoryFloor {
  id: string;
  /** e.g. "10", "3", "B1" */
  level: string;
  label: string;
  detail?: string;
}

export interface GlyphOpts {
  x: number;
  w: number;
  yTop: number;
  yBase: number;
}

/** built-in window glyphs, or bring your own SVG path */
export type DirectoryGlyph =
  | "arch"
  | "square"
  | "circle"
  | ((opts: GlyphOpts, floor: DirectoryFloor) => string);

export interface DirectoryProps {
  floors: DirectoryFloor[];
  activeId?: string;
  onSelect?: (id: string) => void;
  glyph?: DirectoryGlyph;
  className?: string;
}

const ROW_H = 44;
const W = 88;
const PAD_X = 8;
const SHAFT_W = 16;

/** two verticals + half-circle top — the arch module of IMG_2042 */
function archPath({ x, w, yTop, yBase }: GlyphOpts): string {
  const r = w / 2;
  return `M ${x} ${yBase} L ${x} ${yTop + r} A ${r} ${r} 0 0 1 ${x + w} ${yTop + r} L ${x + w} ${yBase}`;
}
function squarePath({ x, w, yTop, yBase }: GlyphOpts): string {
  return `M ${x} ${yBase} L ${x} ${yTop} L ${x + w} ${yTop} L ${x + w} ${yBase}`;
}
function circlePath({ x, w, yTop, yBase }: GlyphOpts): string {
  const r = Math.min(w, yBase - yTop) / 2;
  const cx = x + w / 2;
  const cy = (yTop + yBase) / 2;
  return `M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy}`;
}
const GLYPHS = { arch: archPath, square: squarePath, circle: circlePath };

function floorGlyphs(floor: DirectoryFloor, y: number, glyph: DirectoryGlyph): string[] {
  const k = kiln(floor.id);
  const n = k.int(3, 4); // each floor's fenestration varies slightly
  const gap = 5;
  const w = (W - PAD_X * 2 - gap * (n - 1)) / n;
  const fn = typeof glyph === "function" ? glyph : GLYPHS[glyph];
  return Array.from({ length: n }, (_, i) =>
    fn({ x: PAD_X + i * (w + gap), w, yTop: y + 9, yBase: y + ROW_H - 7 }, floor)
  );
}

/** elevator ride: mechanical spring — accelerates, then eases into the floor */
const ride = { type: "spring", stiffness: 110, damping: 17 } as const;

export function Directory({ floors, activeId, onSelect, glyph = "arch", className }: DirectoryProps) {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const carId = useId();
  const H = floors.length * ROW_H;
  const isLit = (id: string) => hoverId === id || activeId === id;
  const activeIndex = floors.findIndex((f) => f.id === activeId);

  return (
    <div className={cn("flex items-start gap-5", className)}>
      {/* section drawing — one row of window glyphs per floor + elevator shaft */}
      <svg
        viewBox={`0 0 ${W + SHAFT_W} ${H}`}
        width={W + SHAFT_W}
        height={H}
        aria-hidden
        className="shrink-0"
      >
        <rect
          x={0.5}
          y={0.5}
          width={W - 1}
          height={H - 1}
          fill="none"
          stroke="var(--color-ink-500)"
          strokeWidth={1}
        />
        {floors.map((f, i) => {
          const paths = floorGlyphs(f, i * ROW_H, glyph);
          return (
            <g key={f.id}>
              {i > 0 && (
                <line
                  x1={0}
                  y1={i * ROW_H}
                  x2={W}
                  y2={i * ROW_H}
                  stroke="var(--color-ink-500)"
                  strokeWidth={0.75}
                  opacity={0.6}
                />
              )}
              <g fill="none" stroke="var(--color-ink-500)" strokeWidth={1}>
                {paths.map((d) => (
                  <path key={d} d={d} />
                ))}
              </g>
              {/* night layer: same windows, warmed up like IMG_2052 */}
              <motion.g
                fill="none"
                stroke="var(--sk-glow)"
                strokeWidth={1.2}
                style={{ filter: "drop-shadow(0 0 4px var(--sk-glow-soft))" }}
                initial={false}
                animate={{ opacity: isLit(f.id) ? 1 : 0 }}
                transition={{ duration: BEAT.b3, ease: [...EASE.ignite] }}
              >
                {paths.map((d) => (
                  <path key={d} d={d} />
                ))}
              </motion.g>
            </g>
          );
        })}
        {/* the shaft */}
        <line
          x1={W + SHAFT_W / 2}
          y1={2}
          x2={W + SHAFT_W / 2}
          y2={H - 2}
          stroke="var(--color-ink-500)"
          strokeWidth={0.75}
          opacity={0.45}
          strokeDasharray="2 3"
        />
        {/* the car rides to the selected floor */}
        {activeIndex >= 0 && (
          <motion.rect
            x={W + SHAFT_W / 2 - 4}
            width={8}
            height={ROW_H - 18}
            rx={2}
            fill="var(--sk-glow)"
            style={{ filter: "drop-shadow(0 0 4px var(--sk-glow-soft))" }}
            initial={false}
            animate={{ y: activeIndex * ROW_H + 9 }}
            transition={ride}
          />
        )}
      </svg>

      {/* floor list — italic serif levels; the highlight rides with the car */}
      <ul className="min-w-0 flex-1">
        {floors.map((f, i) => (
          <li
            key={f.id}
            className="relative"
            style={{ borderTop: i > 0 ? "1px solid var(--sk-rule)" : undefined }}
          >
            {activeId === f.id && (
              <motion.span
                layoutId={carId}
                aria-hidden
                className="absolute inset-0"
                style={{ background: "color-mix(in oklab, var(--sk-glow) 11%, transparent)" }}
                transition={ride}
              />
            )}
            <motion.button
              type="button"
              onClick={() => onSelect?.(f.id)}
              onMouseEnter={() => setHoverId(f.id)}
              onMouseLeave={() => setHoverId(null)}
              onFocus={() => setHoverId(f.id)}
              onBlur={() => setHoverId(null)}
              aria-current={activeId === f.id ? "true" : undefined}
              className="relative z-10 flex w-full items-baseline gap-4 px-3 text-left"
              style={{ height: ROW_H, color: "var(--sk-ink)", borderRadius: 0 }}
              initial={false}
              animate={{
                backgroundColor:
                  hoverId === f.id && activeId !== f.id
                    ? "rgba(232,163,61,0.08)"
                    : "rgba(232,163,61,0)",
              }}
              transition={{ duration: BEAT.b3, ease: [...EASE.ignite] }}
            >
              <span
                className="shrink-0 italic"
                style={{ fontFamily: "var(--sk-font)", fontSize: "1.05rem", minWidth: "2.1rem" }}
              >
                {f.level}
              </span>
              <span className="truncate text-[0.88rem]" style={{ letterSpacing: "0.02em" }}>
                {f.label}
              </span>
              {f.detail && (
                <span className="ml-auto shrink-0 text-[0.72rem]" style={{ color: "var(--sk-ink-soft)" }}>
                  {f.detail}
                </span>
              )}
            </motion.button>
          </li>
        ))}
      </ul>
    </div>
  );
}
