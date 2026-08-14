/* Senko 線弧 — <BalconyStack>
 * Source: IMG_2062/2063 (night stair towers: stacked zigzag staircases
 * glowing white in the dark — repetition + internal light), IMG_2093 (the
 * same zigzag module at golden hour, warm color moving across repeated
 * units). A vertical stepper as a stair tower: each step is a landing
 * offset left/right down a zigzag line, and progress is told with light —
 * done softly lit, active fully ignited, todo waiting in the dark.
 * Use for onboarding flows, order tracking, multi-step forms.
 */
import { motion } from "motion/react";
import type { CSSProperties } from "react";
import { BEAT, EASE, cn } from "../lib";

export type BalconyStatus = "done" | "active" | "todo";

export interface BalconyStep {
  id: string;
  title: string;
  detail?: string;
  status: BalconyStatus;
}

export interface BalconyStackProps {
  steps: BalconyStep[];
  /** IMG_2093 mode: the lit color warms down the stack, amber to dusk gold */
  golden?: boolean;
  className?: string;
}

/** lit color for step i of n — golden mode interpolates down the tower */
function litColor(i: number, n: number, golden: boolean): string {
  if (!golden) return "var(--sk-glow)";
  const pct = n > 1 ? Math.round(100 - (i / (n - 1)) * 100) : 100;
  return `color-mix(in oklab, var(--color-amber-300) ${pct}%, var(--color-gold-dusk))`;
}

function landingStyle(status: BalconyStatus, lit: string): CSSProperties {
  const soft = `color-mix(in oklab, ${lit} 26%, transparent)`;
  if (status === "active")
    return {
      background: `color-mix(in oklab, ${lit} 13%, var(--sk-surface-raised))`,
      borderLeft: `3px solid ${lit}`,
      boxShadow: `0 0 24px 3px ${soft}, 0 2px 6px rgba(0,0,0,0.08)`,
    };
  if (status === "done")
    return {
      background: `color-mix(in oklab, ${lit} 7%, var(--sk-surface))`,
      borderLeft: `3px solid ${lit}`,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    };
  return {
    background: "var(--sk-surface)",
    borderLeft: "3px solid var(--sk-rule)",
    opacity: 0.55,
    filter: "saturate(0.45)",
  };
}

export function BalconyStack({ steps, golden = false, className }: BalconyStackProps) {
  const n = steps.length;
  // card is 82% wide, shifted ∓11% of itself → landing centers sit at 41 / 59
  const points = steps
    .map((_, i) => `${i % 2 === 0 ? 41 : 59},${(((i + 0.5) / n) * 100).toFixed(2)}`)
    .join(" ");
  return (
    <motion.ol
      className={cn("relative flex list-none flex-col gap-3", className)}
      style={{ fontFamily: "var(--sk-font)" }}
      initial="hidden"
      whileInView="lit"
      viewport={{ amount: 0.2, once: true }}
      transition={{ staggerChildren: 0.09, staggerDirection: -1 }}
    >
      {/* the stair stringer — a thin zigzag behind the landings.
          reverse stagger means it fades in last, once the tower is lit */}
      {n > 1 && (
        <motion.svg
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          variants={{
            hidden: { opacity: 0 },
            lit: { opacity: 1, transition: { duration: BEAT.b4, ease: [...EASE.ignite] } },
          }}
        >
          <polyline
            points={points}
            fill="none"
            stroke="var(--sk-rule)"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        </motion.svg>
      )}
      {steps.map((step, i) => (
        <motion.li
          key={step.id}
          aria-current={step.status === "active" ? "step" : undefined}
          variants={{
            hidden: { opacity: 0, y: 18 },
            lit: {
              opacity: 1,
              y: 0,
              transition: { duration: BEAT.b3, ease: [...EASE.settle] },
            },
          }}
        >
          <div
            className="relative px-4 py-3"
            style={{
              width: "82%",
              margin: "0 auto",
              transform: `translateX(${i % 2 === 0 ? "-11%" : "11%"})`,
              borderRadius: "var(--sk-radius)",
              color: "var(--sk-ink)",
              ...landingStyle(step.status, litColor(i, n, golden)),
            }}
          >
            <span className="block text-[0.98rem]" style={{ letterSpacing: "0.02em" }}>
              {step.title}
            </span>
            {step.detail && (
              <span className="mt-0.5 block text-[0.8rem]" style={{ color: "var(--sk-ink-soft)" }}>
                {step.detail}
              </span>
            )}
          </div>
        </motion.li>
      ))}
    </motion.ol>
  );
}
