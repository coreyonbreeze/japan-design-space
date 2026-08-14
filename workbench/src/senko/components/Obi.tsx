/* Senko 線弧 — <Obi>
 * Source: IMG_2029 (photo-book cover in a bookstore: 90% quiet cream
 * ground, a few overlapping translucent color rectangles, and an obi band
 * strip carrying ALL the words). Composition = calm ground, one color
 * event, one dense band of information. Use for feature cards, callouts,
 * hero panels where the words stay small and the quiet stays big.
 */
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { BEAT, EASE, cn } from "../lib";

export interface ObiBand {
  title: string;
  meta?: string;
  actions?: ReactNode;
}

export interface ObiProps {
  /** the quiet content — give it breathing room; the band overlaps it */
  children: ReactNode;
  band: ObiBand;
  className?: string;
}

/* translucent print blocks, offset-overlapped like the cover; sharp corners */
const BLOCKS = [
  { left: "9%", top: "12%", width: "40%", height: "38%", color: "var(--color-teal-milk)", delay: 0 },
  { left: "30%", top: "27%", width: "36%", height: "40%", color: "var(--color-sakura)", delay: BEAT.b1 },
  { left: "58%", top: "8%", width: "17%", height: "24%", color: "var(--color-teal-milk)", delay: BEAT.b2 },
];

export function Obi({ children, band, className }: ObiProps) {
  return (
    <section
      className={cn("relative overflow-hidden", className)}
      style={{
        background: "var(--sk-surface)",
        border: "1px solid var(--sk-rule)",
        borderRadius: "var(--sk-radius)",
      }}
    >
      {/* the color event, behind everything */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {BLOCKS.map((b, i) => (
          <motion.span
            key={i}
            className="absolute block"
            style={{
              left: b.left,
              top: b.top,
              width: b.width,
              height: b.height,
              background: b.color,
              // No multiply blend. On a dark ground it drives these blocks
              // to black, which reads as damage rather than as colour.
              // Plain alpha sits correctly on both light and dark.
              borderRadius: 0,
            }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.28 }}
            viewport={{ amount: 0.3, once: true }}
            transition={{ duration: BEAT.b4, delay: b.delay, ease: [...EASE.drift] }}
          />
        ))}
      </div>

      {/* quiet ground — padded below so the band has something to overlap */}
      <div className="relative z-10" style={{ paddingBottom: "5.5rem" }}>
        {children}
      </div>

      {/* obi band: all the words, one dense strip across the lower third */}
      <motion.div
        className="absolute inset-x-0 z-20 flex items-baseline gap-3 px-5 py-2.5"
        style={{
          bottom: "16%",
          background: "var(--color-paper-0)",
          borderTop: "1px solid var(--sk-rule)",
          borderBottom: "1px solid var(--sk-rule)",
          fontFamily: "var(--sk-font)",
          /* the obi is a paper material: it keeps its own ink at night */
          color: "var(--color-ink-900)",
        }}
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ amount: 0.5, once: true }}
        transition={{ duration: BEAT.b3, delay: BEAT.b2, ease: [...EASE.settle] }}
      >
        <p className="text-[0.86rem] font-semibold" style={{ letterSpacing: "0.04em" }}>
          {band.title}
        </p>
        {band.meta && (
          <p
            className="truncate text-[0.72rem]"
            style={{ color: "var(--color-ink-500)", letterSpacing: "0.03em" }}
          >
            {band.meta}
          </p>
        )}
        {band.actions && (
          <div className="ml-auto flex shrink-0 items-center gap-2">{band.actions}</div>
        )}
      </motion.div>
    </section>
  );
}
