/* Senko 線弧 — <LeafScatter>
 * Source: IMG_2089 (the samurai-district gate: yellow ginkgo leaves lying
 * scattered on dark stone — weathering and season read as surface design).
 * A dismissal that scatters. The content breaks up and leaf outlines take
 * its place. Each leaf lifts before it falls, then drifts down and sideways
 * with its own spin, lands at the bottom edge, rocks once and goes out.
 *
 * The leaves are kiln-seeded, so a given seed always drops the same way.
 * No two leaves share a speed, a size or an angle: a uniform fall reads as
 * a particle system, not as a season.
 *
 * The outlines are drawn marks, so they step on while the content breaks.
 * The fall is moving mass, so it stays smooth. The beat between the last
 * landing and the fade is silent. A dry rustle belongs there.
 */
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { kiln } from "../primitives/kiln";
import { EASE, clamp01, cn, ease, stepFrames } from "../lib";

export interface LeafScatterProps {
  /** Flip to true to scatter what is inside. */
  dismissed: boolean;
  leaves?: number;
  /** Same seed, same fall. */
  seed?: string;
  /** Fires once the last leaf has gone. */
  onDone?: () => void;
  children: ReactNode;
  className?: string;
}

type Phase = "held" | "scattering" | "gone";

/** The content breaks up and the outlines draw on. */
const FORM_MS = 420;
/** The slowest leaf's fall. */
const FALL_MS = 1500;
const TOTAL_MS = FORM_MS + FALL_MS + 260;
/** Steps per outline. A stepped stroke reads as drawn, not printed. */
const STEPS = 5;

interface Box {
  w: number;
  h: number;
}

export function LeafScatter({
  dismissed,
  leaves = 12,
  seed = "ginkgo",
  onDone,
  children,
  className,
}: LeafScatterProps) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>(dismissed ? "gone" : "held");
  const [form, setForm] = useState(0);
  const [box, setBox] = useState<Box | null>(null);
  const frame = useRef<HTMLDivElement>(null);
  const done = useRef(onDone);
  // Mounting already dismissed means there was never anything to scatter.
  const armed = useRef(!dismissed);
  done.current = onDone;

  // `dismissed` alone drives the fall. Nothing this effect sets may appear
  // in the dependency list, or the rAF would cancel its own next frame.
  useEffect(() => {
    if (!dismissed) {
      armed.current = true;
      setPhase("held");
      setForm(0);
      return;
    }
    if (!armed.current) return;
    // Measure once, at the moment of dismissal. The leaves need a floor to
    // land on and the frame needs to keep its height while they fall.
    const rect = frame.current?.getBoundingClientRect();
    if (rect) setBox({ w: rect.width, h: rect.height });
    if (reduced) {
      setPhase("gone");
      done.current?.();
      return;
    }
    setPhase("scattering");
    let raf = 0;
    let start = 0;
    const tick = (t: number) => {
      if (!start) start = t;
      const u = clamp01((t - start) / FORM_MS);
      setForm(u);
      if (u < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const end = window.setTimeout(() => {
      setPhase("gone");
      done.current?.();
    }, TOTAL_MS);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(end);
    };
  }, [dismissed, reduced]);

  if (phase === "gone") return null;

  const falling = phase === "scattering";

  return (
    <div
      ref={frame}
      className={cn("relative", className)}
      style={falling && box ? { height: box.h, overflow: "hidden" } : undefined}
    >
      {/* The content is inert the moment it starts to come apart. */}
      <motion.div
        inert={falling}
        animate={
          falling
            ? {
                // a small draw-up before it lets go, then it drops away
                y: [0, -4, 3],
                scale: [1, 1.006, 0.988],
                opacity: [1, 1, 0],
                filter: ["blur(0px)", "blur(0px)", "blur(1.6px)"],
              }
            : { y: 0, scale: 1, opacity: 1, filter: "blur(0px)" }
        }
        transition={
          falling
            ? {
                duration: (FORM_MS / 1000) * 1.2,
                times: [0, 0.28, 1],
                ease: [ease(EASE.settle), ease(EASE.drift)],
              }
            : { duration: 0 }
        }
      >
        {children}
      </motion.div>

      {falling && box && (
        // Outlines only. Nothing here is opaque, so it must not eat clicks.
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {Array.from({ length: leaves }, (_, i) => {
            const k = kiln(`${seed}:leaf:${i}`);
            const size = k.range(0.62, 1.28);
            const w = 20 * size;
            const h = 26 * size;
            const left = k.range(0.05, 0.92) * box.w;
            const top = k.range(0.04, 0.7) * box.h;
            const tilt = k.range(-42, 42);
            const lift = k.range(6, 22);
            const spin = k.range(-190, 210);
            const sway = k.range(-0.24, 0.28) * box.w;
            const fall = Math.max(box.h - top - h, 0);
            // Different masses fall at different speeds. This is the whole
            // difference between a season and a particle system.
            const dur = (FALL_MS / 1000) * k.range(0.66, 1);
            const wait = k.range(0, 0.32) * (FORM_MS / 1000);
            // The outline is a drawn mark: it steps on as the content goes.
            const drawn = stepFrames(clamp01((form - k.range(0, 0.4)) / 0.55), STEPS);
            return (
              <motion.div
                key={i}
                className="absolute"
                style={{ left, top, width: w, height: h, willChange: "transform, opacity" }}
                initial={{ y: 0, x: 0, rotate: tilt, opacity: 0 }}
                animate={{
                  // lift, fall, land, rock, rest
                  y: [0, -lift, fall, fall - 3, fall],
                  x: [0, sway * 0.22, sway * 0.86, sway, sway * 1.02],
                  rotate: [tilt, tilt - spin * 0.12, tilt + spin * 0.7, tilt + spin, tilt + spin - 5],
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  y: {
                    duration: dur,
                    delay: wait,
                    times: [0, 0.16, 0.82, 0.9, 1],
                    ease: [ease(EASE.settle), ease(EASE.drop), ease(EASE.drift), ease(EASE.settle)],
                  },
                  x: {
                    duration: dur * 1.06,
                    delay: wait,
                    times: [0, 0.2, 0.7, 0.9, 1],
                    ease: ease(EASE.drift),
                  },
                  rotate: {
                    duration: dur * 1.1,
                    delay: wait,
                    times: [0, 0.14, 0.6, 0.9, 1],
                    ease: ease(EASE.drift),
                  },
                  opacity: {
                    duration: dur + 0.24,
                    delay: wait,
                    times: [0, 0.06, 0.84, 1],
                    ease: ease(EASE.drift),
                  },
                }}
              >
                <svg width={w} height={h} viewBox="0 0 20 26">
                  {/* two arcs make the blade, one line makes the rib —
                      the line + arc vocabulary, at leaf scale */}
                  <path
                    d="M 10 2 A 8 10 0 0 0 10 22 A 8 10 0 0 0 10 2"
                    fill="var(--color-sun)"
                    fillOpacity={drawn > 0.6 ? 0.62 : 0}
                    stroke="var(--color-gold-dusk)"
                    strokeWidth={1.2}
                    pathLength={1}
                    strokeDasharray={1}
                    strokeDashoffset={1 - drawn}
                  />
                  <path
                    d="M 10 2 L 10 25"
                    fill="none"
                    stroke="var(--color-gold-dusk)"
                    strokeWidth={1}
                    strokeLinecap="round"
                    opacity={0.8}
                    pathLength={1}
                    strokeDasharray={1}
                    strokeDashoffset={1 - drawn}
                  />
                </svg>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
