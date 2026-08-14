/* Senko 線弧 — <Ignite>
 * Source: IMG_2052 (night arch hotel), IMG_2049 (oil lamps), IMG_2095.
 * Principle: light is the animator. Elements don't get "highlighted" —
 * they warm up from dark, slowly, like windows at dusk. Once lit they
 * STAY lit (windows don't flicker as you walk past); pass `lit` to
 * control dimming explicitly.
 *
 * The glow lives on an overlay whose OPACITY animates — box-shadow
 * strings containing var() don't interpolate, opacity always does.
 */
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { BEAT, EASE, cn } from "../lib";

interface IgniteProps {
  children: ReactNode;
  /** controlled: lit or dim. Omit to ignite once when scrolled into view. */
  lit?: boolean;
  /** also ignite on hover/focus (for interactive rows) */
  interactive?: boolean;
  className?: string;
}

const transition = {
  duration: BEAT.b4,
  ease: [...EASE.ignite] as [number, number, number, number],
};

export function Ignite({ children, lit, interactive, className }: IgniteProps) {
  const uncontrolled = lit === undefined;
  return (
    <motion.div
      className={cn("relative rounded-[var(--sk-radius)]", className)}
      initial="dim"
      {...(uncontrolled
        ? { whileInView: "lit", viewport: { amount: 0.6, once: true } }
        : { animate: lit ? "lit" : "dim" })}
      {...(interactive ? { whileHover: "lit", whileFocus: "lit" } : {})}
    >
      <motion.div
        variants={{
          dim: { opacity: 0.55, filter: "brightness(0.62) saturate(0.55)" },
          lit: { opacity: 1, filter: "brightness(1) saturate(1)" },
        }}
        transition={transition}
      >
        {children}
      </motion.div>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ borderRadius: "var(--sk-radius)", boxShadow: "0 0 28px 2px var(--sk-glow-soft)" }}
        variants={{ dim: { opacity: 0 }, lit: { opacity: 1 } }}
        transition={transition}
      />
    </motion.div>
  );
}
