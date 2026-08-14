/* Senko 線弧 — <KilnFiring>
 * Source: IMG_2050 (Kutani room signs), IMG_2060 (glazed tiles).
 * A load screen that fires a plaque instead of spinning. Line and arc
 * gestures draw themselves on the tile, glaze washes over and quenches it,
 * and the clay cools from kiln amber to porcelain. The seed picks the
 * design, so each session fires a different tile.
 *
 * The kiln stays amber in every register. Fire is a material, like the
 * kraft and glaze elsewhere in the library: it keeps its own colour.
 */
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { kiln } from "../primitives/kiln";
import { BEAT, EASE, clamp01, cn, ease, mixRgb, stepFrames } from "../lib";

export interface KilnFiringProps {
  /** 0 to 1. Omit to run an indeterminate loop. */
  progress?: number;
  /** Decides which gestures get drawn. */
  seed?: string;
  size?: number;
  /** Stage text under the tile, e.g. "loading textures". */
  label?: string;
  /** Cover the viewport on a dark ground. */
  fullscreen?: boolean;
  className?: string;
}

interface Gesture {
  d: string;
  rot: number;
  cx: number;
  cy: number;
  /** Path length, used to give longer marks more time. */
  len: number;
  /** Steps for this mark, so pixels-per-step stay even across gestures. */
  steps: number;
}

const HOT = [232, 163, 61];
const COOL = [239, 234, 224];
const DRAW_END = 0.68;
const WASH_FROM = 0.74;
/** Each mark draws for this share of its slot, then the brush lifts. */
const BRUSH_DUTY = 0.72;

// One cycle: draw, hold the finished tile, then re-heat for the next firing.
const DRAW_MS = 2400;
const HOLD_MS = 380;
const REHEAT_MS = 420;
const CYCLE_MS = DRAW_MS + HOLD_MS + REHEAT_MS;

const smooth = (u: number) => u * u * (3 - 2 * u);

function firingGestures(seed: string): Gesture[] {
  const k = kiln(seed);
  const cells = [
    { x: 0, y: 0 },
    { x: 48, y: 0 },
    { x: 0, y: 48 },
    { x: 48, y: 48 },
  ];
  return cells.map((c) => {
    const kind = k.pick(["quarter", "half", "rule"] as const);
    const rot = k.int(0, 3) * 90;
    const base = { rot, cx: c.x + 24, cy: c.y + 24 };
    if (kind === "quarter") {
      return {
        ...base,
        d: `M ${c.x + 5} ${c.y + 43} A 38 38 0 0 1 ${c.x + 43} ${c.y + 5}`,
        len: 60,
        steps: 7,
      };
    }
    if (kind === "half") {
      return {
        ...base,
        d: `M ${c.x + 7} ${c.y + 33} A 17 17 0 0 1 ${c.x + 41} ${c.y + 33}`,
        len: 53,
        steps: 6,
      };
    }
    return { ...base, d: `M ${c.x + 7} ${c.y + 24} L ${c.x + 41} ${c.y + 24}`, len: 34, steps: 4 };
  });
}

export function KilnFiring({
  progress,
  seed = "kiln",
  size = 168,
  label,
  fullscreen,
  className,
}: KilnFiringProps) {
  const reduced = useReducedMotion();
  const indeterminate = progress === undefined;
  const [auto, setAuto] = useState(0);
  const overlay = useRef<HTMLDivElement>(null);

  // The indeterminate cycle holds the finished tile, then re-heats on a
  // ramp. Never wrap a value that drives visible state with a modulo: the
  // jump back to zero reads as a cut.
  useEffect(() => {
    if (!indeterminate || reduced) return;
    let raf = 0;
    let start = 0;
    const tick = (t: number) => {
      if (!start) start = t;
      if (document.visibilityState === "visible") {
        const e = (t - start) % CYCLE_MS;
        if (e < DRAW_MS) setAuto(e / DRAW_MS);
        else if (e < DRAW_MS + HOLD_MS) setAuto(1);
        else setAuto(1 - smooth((e - DRAW_MS - HOLD_MS) / REHEAT_MS));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [indeterminate, reduced]);

  // Move focus into the blocking overlay and restore it on close.
  useEffect(() => {
    if (!fullscreen) return;
    const previous = document.activeElement as HTMLElement | null;
    overlay.current?.focus();
    return () => previous?.focus?.();
  }, [fullscreen]);

  const p = clamp01(indeterminate ? (reduced ? 0.5 : auto) : (progress as number));
  const gestures = useMemo(() => firingGestures(seed), [seed]);

  // Longer marks get proportionally more time, so the brush moves at one
  // speed across the whole tile.
  const total = gestures.reduce((sum, g) => sum + g.len, 0);
  let cursor = 0;
  const slots = gestures.map((g) => {
    const from = cursor;
    cursor += (g.len / total) * DRAW_END;
    return { from, to: cursor };
  });

  // The glaze quenches the clay, so most of the heat leaves under the wash.
  const cooled = clamp01(Math.pow(p, 1.6));
  const clay = mixRgb(HOT, COOL, cooled);
  const heat = 1 - cooled;
  const wash = clamp01((p - WASH_FROM) / (1 - WASH_FROM));
  // Matte before the glaze, glossy after.
  const gloss = 0.08 + wash * 0.47;

  const tile = (
    <motion.div
      className={cn("relative", fullscreen ? undefined : className)}
      style={{
        width: size,
        height: size,
        background: clay,
        borderRadius: "10px 8px 11px 9px",
        overflow: "hidden",
      }}
      animate={{
        // The finished plaque is set down.
        scale: p > 0.985 ? [1, 1.012, 1] : 1,
        boxShadow: `0 0 ${(46 * heat).toFixed(2)}px ${(6 * heat).toFixed(2)}px rgba(232,163,61,${(
          0.55 * heat
        ).toFixed(3)}), inset 0 1px 1px rgba(255,255,255,${gloss.toFixed(3)}), 0 ${
          p > 0.985 ? 5 : 2
        }px 8px rgba(0,0,0,0.25)`,
      }}
      transition={{ duration: BEAT.b2, ease: ease(EASE.settle) }}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={indeterminate ? undefined : Math.round(p * 100)}
      aria-label={label ?? "firing"}
    >
      <svg viewBox="0 0 96 96" width={size} height={size} aria-hidden>
        {gestures.map((g, i) => {
          const slot = slots[i];
          // Draw for part of the slot, then lift the brush. The rests are
          // where a sound cue lands.
          const local = clamp01((p - slot.from) / ((slot.to - slot.from) * BRUSH_DUTY));
          const gp = stepFrames(local, g.steps);
          return (
            <path
              key={i}
              d={g.d}
              transform={`rotate(${g.rot} ${g.cx} ${g.cy})`}
              fill="none"
              stroke="var(--color-ink-700)"
              strokeWidth={1.7}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - gp}
              opacity={gp > 0 ? 0.9 : 0}
            />
          );
        })}
      </svg>
      {/* the glaze wash: a wet gloss crossing the tile once */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          opacity: wash > 0 && wash < 1 ? 1 : 0,
          background: `linear-gradient(104deg, transparent ${Math.round(wash * 130 - 40)}%, rgba(255,255,255,0.62) ${Math.round(
            wash * 130 - 18
          )}%, transparent ${Math.round(wash * 130 + 6)}%)`,
        }}
      />
    </motion.div>
  );

  if (!fullscreen) return tile;

  return (
    <div
      ref={overlay}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={label ?? "firing"}
      aria-busy="true"
      className={cn("fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 outline-none", className)}
      style={{ background: "var(--sk-night)" }}
    >
      {tile}
      <div className="text-center">
        {/* The scrim is always dark, so this text is always paper. */}
        <p className="text-[0.82rem] italic" style={{ color: "var(--color-paper-2)" }}>
          {label ?? "firing"}
        </p>
        {!indeterminate && (
          <p className="mt-1 text-[0.72rem]" style={{ color: "var(--color-ink-300)" }}>
            {Math.round(p * 100)}%
          </p>
        )}
      </div>
    </div>
  );
}
