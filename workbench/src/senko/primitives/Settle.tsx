/* Senko 線弧 — <Settle>
 * Source: IMG_2075–2082 (pines held by timber props).
 * Principle: visible care. Entrances overshoot slightly and are caught,
 * the way a propped branch rests into its support. Calm, never bouncy.
 */
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { BEAT, EASE, cn } from "../lib";

interface SettleProps {
  children: ReactNode;
  /** seconds to wait before entering */
  delay?: number;
  className?: string;
}

export function Settle({ children, delay = 0, className }: SettleProps) {
  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y: 20, rotate: -0.8 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ amount: 0.4, once: true }}
      transition={{ duration: BEAT.b3, delay, ease: [...EASE.settle] }}
    >
      {children}
    </motion.div>
  );
}
