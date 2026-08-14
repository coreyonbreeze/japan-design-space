/* Senko 線弧 — <Cascade>
 * Source: IMG_2062/2063 (lit stair towers), IMG_2093 (golden zigzag).
 * Principle: repetition + sequenced light. Children reveal one after
 * another; optional zigzag offset mirrors the stacked staircases.
 */
import { motion } from "motion/react";
import { Children, type ReactNode } from "react";
import { BEAT, EASE, cn } from "../lib";

interface CascadeProps {
  children: ReactNode;
  /** seconds between children; defaults to the register's tempo */
  stagger?: number;
  /** alternate horizontal offsets like the stair stacks */
  zigzag?: boolean;
  className?: string;
}

export function Cascade({ children, stagger = 0.07, zigzag, className }: CascadeProps) {
  const items = Children.toArray(children);
  return (
    <motion.div
      className={cn("flex flex-col", className)}
      initial="hidden"
      whileInView="lit"
      viewport={{ amount: 0.25, once: true }}
      transition={{ staggerChildren: stagger }}
    >
      {items.map((child, i) => (
        <motion.div
          key={i}
          variants={{
            hidden: { opacity: 0, y: 16, x: zigzag ? (i % 2 === 0 ? -14 : 14) : 0 },
            lit: {
              opacity: 1,
              y: 0,
              x: 0,
              transition: { duration: BEAT.b3, ease: [...EASE.settle] },
            },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
