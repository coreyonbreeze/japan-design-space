/* Senko 線弧 — <Scaffold>
 * Source: IMG_2075–2082 (the ancient Kenrokuen pines, held up by forests
 * of timber props — the support structure visible and beautiful, care
 * shown proudly, never hidden). A loading state that shows its support:
 * the placeholder bars are honestly HELD UP by leaning hinoki props with
 * rope lashings, resting on a ground line. The anti-shimmer — scaffolding,
 * not a shimmering ghost. Use for slow queries, section loads, anything
 * worth propping while it arrives.
 */
import { motion } from "motion/react";
import type { CSSProperties } from "react";
import { useKiln } from "../primitives/kiln";
import { BEAT, EASE, cn } from "../lib";

export interface ScaffoldProps {
  /** placeholder bars to prop up */
  lines?: number;
  width?: number | string;
  /** honest caption, bottom-right */
  label?: string;
  /** kiln seed — same seed, same timber angles */
  seed?: string;
  className?: string;
}

/** px between the lowest bar and the ground line — where the timber works */
const GROUND = 40;
/** prop footing zones: outer two first, middle only when a third is fired */
const ZONES = [
  [10, 20],
  [76, 88],
  [44, 56],
] as const;

const LASH: CSSProperties = {
  position: "absolute",
  left: -3,
  width: 9,
  height: 2,
  background: "var(--color-walnut)",
  borderRadius: 1,
};

export function Scaffold({
  lines = 3,
  width,
  label = "supported while it loads",
  seed = "scaffold",
  className,
}: ScaffoldProps) {
  const k = useKiln(seed);
  const bars = Array.from({ length: lines }, (_, i) => ({
    w: i === lines - 1 ? k.range(42, 62) : k.range(78, 98),
    delay: i * 0.16,
  }));
  const timbers = ZONES.slice(0, k.int(2, 3)).map(([a, b]) => ({
    left: k.range(a, b),
    lean: k.pick([-1, 1] as const) * k.range(12, 24),
    h: GROUND + k.range(2, 14),
  }));

  return (
    <div
      role="status"
      className={cn("relative", className)}
      style={{ width: width ?? "100%", fontFamily: "var(--sk-font)" }}
    >
      <div className="relative">
        {/* the held-up content: a gentle breath, never a shimmer */}
        <div aria-hidden className="flex flex-col gap-2.5" style={{ marginBottom: GROUND }}>
          {bars.map((bar, i) => (
            <motion.div
              key={i}
              className="h-3.5"
              style={{
                width: `${bar.w.toFixed(1)}%`,
                background: "var(--color-paper-2)",
                borderRadius: "var(--radius-arc-1)",
              }}
              initial={{ opacity: 1 }}
              animate={{ opacity: 0.55 }}
              transition={{
                duration: BEAT.b4,
                ease: [...EASE.drift],
                delay: bar.delay,
                repeat: Infinity,
                repeatType: "mirror",
              }}
            />
          ))}
        </div>
        {/* the timber props doing the holding, lashed where they meet the load */}
        {timbers.map((t, i) => (
          <div
            key={i}
            aria-hidden
            className="absolute"
            style={{
              left: `${t.left.toFixed(1)}%`,
              bottom: 1,
              width: 3,
              height: t.h,
              background: "var(--color-hinoki)",
              borderRadius: 1,
              transform: `rotate(${t.lean.toFixed(1)}deg)`,
              transformOrigin: "50% 100%",
            }}
          >
            <span style={{ ...LASH, top: 3 }} />
            <span style={{ ...LASH, top: 7 }} />
          </div>
        ))}
        {/* the ground everything rests on */}
        <div aria-hidden style={{ height: 1, background: "var(--sk-rule)" }} />
      </div>
      <p className="mt-1.5 text-right text-[0.72rem] italic" style={{ color: "var(--sk-ink-soft)" }}>
        {label}
      </p>
    </div>
  );
}
