/* Senko 線弧 — <ArchFrame> + <Arcade>
 * Source: IMG_2044 (hotel guest book: story vignettes each framed in an
 * arch), IMG_2052 (night hotel: every floor an arcade of glowing amber arch
 * windows), IMG_2042 (etched directory drawn as arch modules).
 * Principle: the arch is a frame for narrative — one module, repeated and
 * lit, becomes the identity. Use for image frames, feature vignettes,
 * gallery grids, night showcases.
 */
import { motion } from "motion/react";
import { Children, type ReactNode } from "react";
import { BEAT, EASE, cn } from "../lib";

export interface ArchFrameProps {
  children: ReactNode;
  /** small italic caption beneath the frame, like the guest-book vignettes */
  caption?: ReactNode;
  /** false renders the window dimmed; it warms up on hover (dusk, IMG_2052) */
  lit?: boolean;
  className?: string;
}

const DIM = { filter: "brightness(0.55) saturate(0.6)" };
const LIT = { filter: "brightness(1) saturate(1)" };

export function ArchFrame({ children, caption, lit = true, className }: ArchFrameProps) {
  return (
    <figure className="m-0 flex min-w-0 flex-col gap-2">
      <div
        className={cn(!/\baspect-/.test(className ?? "") && "aspect-[3/4]", "overflow-hidden", className)}
        style={{
          borderRadius: "var(--radius-arch) var(--radius-arch) var(--sk-radius) var(--sk-radius)",
          border: "1px solid var(--sk-rule)",
          background: "var(--sk-surface)",
        }}
      >
        <motion.div
          className="h-full w-full"
          initial={false}
          animate={lit ? LIT : DIM}
          whileHover={LIT}
          transition={{ duration: BEAT.b4, ease: [...EASE.ignite] }}
        >
          {children}
        </motion.div>
      </div>
      {caption && (
        <figcaption
          className="text-center text-[0.8rem] italic"
          style={{ color: "var(--sk-ink-soft)", fontFamily: "var(--sk-font)" }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export interface ArcadeProps {
  children: ReactNode;
  /** arch windows per row */
  columns?: number;
  /** night masonry: dark panel, every window starts dim and warms on hover */
  night?: boolean;
  className?: string;
}

export function Arcade({ children, columns = 3, night, className }: ArcadeProps) {
  const items = Children.toArray(children);
  return (
    <div
      className={cn("grid", night && "p-4", className)}
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: "var(--sk-grout)",
        ...(night
          ? { background: "var(--color-ink-950)", borderRadius: "var(--sk-radius)" }
          : {}),
      }}
    >
      {items.map((child, i) => (
        <ArchFrame key={i} lit={!night}>
          {child}
        </ArchFrame>
      ))}
    </div>
  );
}
