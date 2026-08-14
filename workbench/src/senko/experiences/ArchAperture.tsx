/* Senko 線弧 — <ArchAperture>
 * Source: IMG_2044 (hotel guest book: four arch vignettes carrying a
 * sequence), IMG_2052 (the arcade of lit arch windows).
 * A reveal where the arch is the aperture. Shut, it is a narrow vertical
 * slit. Opening, the slit widens and the arch top grows with it, until the
 * frame is a full arch on a square base. Only the aperture moves. The
 * content behind never scales and never distorts.
 *
 * The clip is an inset rectangle with a very large top radius. CSS clamps
 * that radius to half the aperture width, so the top stays a true
 * half-circle at every width: the arc comes out of the geometry, not out of
 * a keyframe. Light on the rim is light, so it stays smooth.
 */
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { EASE, cn, ease } from "../lib";

export interface ArchApertureProps {
  /** True widens the slit into a full arch. */
  open: boolean;
  /** Revealed through the aperture. */
  children: ReactNode;
  /** CSS aspect ratio for the frame, e.g. "3/4". */
  aspect?: string;
  className?: string;
}

/** Inset per side, in percent of the frame width. */
const SHUT = 47;
/** The aperture stops just inside the frame, so the rim always has a seat. */
const OPEN = 0.9;
const OPEN_MS = 920;
const SHUT_MS = 780;

export function ArchAperture({ open, children, aspect = "3/4", className }: ArchApertureProps) {
  const reduced = useReducedMotion();
  const side = useMotionValue(open ? OPEN : SHUT);
  const first = useRef(true);

  const clip = useTransform(side, (v) => `inset(0% ${v}% 0% ${v}% round 999px 999px 0px 0px)`);
  const edge = useTransform(side, (v) => `${v}%`);
  const rimLight = useTransform(side, [OPEN, SHUT], [1, 0.22]);

  // `open` alone drives the aperture. The motion value carries the state, so
  // nothing here re-renders and nothing here cancels its own animation.
  useEffect(() => {
    if (reduced) {
      side.set(open ? OPEN : SHUT);
      return;
    }
    if (first.current) {
      first.current = false;
      side.set(open ? OPEN : SHUT);
      return;
    }
    const run = open
      ? // draw in, then run out fast, then rebound and settle
        animate(side, [null, SHUT + 1.6, 0, OPEN + 1.4, OPEN], {
          duration: OPEN_MS / 1000,
          times: [0, 0.11, 0.72, 0.85, 1],
          ease: [ease(EASE.drift), ease(EASE.ignite), ease(EASE.settle), ease(EASE.drift)],
        })
      : // open a hair, then close under weight and settle back off the stop
        animate(side, [null, 0, SHUT + 1.4, SHUT - 0.5, SHUT], {
          duration: SHUT_MS / 1000,
          times: [0, 0.12, 0.8, 0.9, 1],
          ease: [ease(EASE.drift), ease(EASE.ignite), ease(EASE.settle), ease(EASE.drift)],
        });
    return () => run.stop();
  }, [open, reduced, side]);

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{
        aspectRatio: aspect,
        background: "var(--sk-ground)",
        borderRadius: "var(--sk-radius)",
      }}
    >
      {/* The content sits still at full size. Only the clip changes. */}
      <motion.div className="absolute inset-0" inert={!open} style={{ clipPath: clip }}>
        {children}
      </motion.div>
      {/* the rim: an arch of light that brightens as the aperture opens */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute top-0 bottom-0"
        style={{
          left: edge,
          right: edge,
          opacity: rimLight,
          borderRadius: "999px 999px 0 0",
          border: "1px solid color-mix(in oklab, var(--sk-glow) 55%, transparent)",
          borderBottom: "none",
          boxShadow: "0 0 14px var(--sk-glow-soft), inset 0 0 16px var(--sk-glow-soft)",
        }}
      />
    </div>
  );
}
