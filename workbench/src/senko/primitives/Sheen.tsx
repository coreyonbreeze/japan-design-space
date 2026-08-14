/* Senko 線弧 — <Sheen>
 * Source: IMG_2024–2026 (laminated menus), IMG_2060 (glaze gloss).
 * Principle: tactility — surfaces are finished, and the finish catches
 * light. A specular sweep crosses the element on hover.
 */
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { BEAT, EASE, cn } from "../lib";

interface SheenProps {
  children: ReactNode;
  className?: string;
}

export function Sheen({ children, className }: SheenProps) {
  return (
    <motion.div
      className={cn("relative overflow-hidden", className)}
      initial="rest"
      whileHover="swept"
    >
      {children}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 w-1/3"
        style={{
          /* --sk-sheen is mode-aware: white glint by day, warm amber by night */
          background:
            "linear-gradient(105deg, transparent 0%, var(--sk-sheen) 50%, transparent 100%)",
        }}
        variants={{
          rest: { left: "-40%", opacity: 0 },
          swept: { left: "110%", opacity: 1, transition: { duration: BEAT.b3, ease: [...EASE.drift] } },
        }}
      />
    </motion.div>
  );
}
