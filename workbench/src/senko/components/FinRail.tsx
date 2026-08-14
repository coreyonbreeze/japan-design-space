/* Senko 線弧 — <FinRail>
 * Source: IMG_2032 (roofline crowned with vertical timber fins of irregular
 * heights), IMG_2090 (radial fins under the round canopy). Slat rhythm
 * against sky: fins of kiln-varied heights rise from the baseline; give it
 * a progress and they ignite up to that fraction, like a facade catching
 * evening light. Use for section dividers, quiet progress, loading strips.
 */
import { motion } from "motion/react";
import { useMemo } from "react";
import { kiln } from "../primitives/kiln";
import { BEAT, EASE, cn } from "../lib";

export interface FinRailProps {
  /** number of fins in the rail */
  count?: number;
  /** 0..1 — fins up to this fraction glow; omit for a plain divider */
  progress?: number;
  /** vary the fin heights; same seed → same roofline */
  seed?: string;
  /** small italic label above the rail */
  label?: string;
  className?: string;
}

export function FinRail({ count = 28, progress, seed = "fin-rail", label, className }: FinRailProps) {
  const heights = useMemo(() => {
    const k = kiln(seed);
    return Array.from({ length: count }, () => k.range(40, 100));
  }, [seed, count]);

  const clamped = progress === undefined ? undefined : Math.min(Math.max(progress, 0), 1);
  const litCount = clamped === undefined ? 0 : Math.round(clamped * count);

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <span
          className="mb-1 block text-[0.78rem] italic"
          style={{ color: "var(--sk-ink-soft)", fontFamily: "var(--sk-font)" }}
        >
          {label}
        </span>
      )}
      <motion.div
        {...(clamped === undefined
          ? { "aria-hidden": true }
          : {
              role: "progressbar",
              "aria-valuemin": 0,
              "aria-valuemax": 100,
              "aria-valuenow": Math.round(clamped * 100),
              "aria-label": label,
            })}
        className="flex w-full items-end justify-between"
        style={{ height: 48, gap: 5, borderBottom: "1px solid var(--sk-rule)" }}
        initial="hidden"
        whileInView="up"
        viewport={{ amount: 0.4, once: true }}
        transition={{ staggerChildren: 0.02 }}
      >
        {heights.map((h, i) => {
          const lit = clamped !== undefined && i < litCount;
          const color = lit ? "var(--sk-glow)" : "var(--color-ink-300)";
          return (
            <motion.div
              key={i}
              className="shrink-0"
              style={{ width: 3, height: `${h}%`, transformOrigin: "bottom" }}
              variants={{
                hidden: {
                  scaleY: 0,
                  backgroundColor: color,
                  boxShadow: "0 0 0px 0px transparent",
                },
                up: {
                  scaleY: 1,
                  backgroundColor: color,
                  boxShadow: lit
                    ? "0 0 10px 1px var(--sk-glow-soft)"
                    : "0 0 0px 0px transparent",
                  transition: {
                    duration: BEAT.b3,
                    ease: [...EASE.settle],
                    backgroundColor: { duration: BEAT.b3, ease: [...EASE.ignite] },
                    boxShadow: { duration: BEAT.b4, ease: [...EASE.ignite] },
                  },
                },
              }}
            />
          );
        })}
      </motion.div>
    </div>
  );
}
