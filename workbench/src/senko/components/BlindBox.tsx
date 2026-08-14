/* Senko 線弧 — <BlindBox>
 * Source: IMG_2110/2111 (SMISKI blind boxes: two-tone yellow/blue boxes
 * stacked in grids, the character peeking over the box edge — the REVEAL
 * is the product), IMG_2102 (yokai hanafuda sets displayed as a collection
 * grid). A market-register collection grid of sealed boxes: hover and the
 * prize peeks over the rim; commit and the lid tilts open, the prize pops
 * out overshooting, and the box quiets into a frame around it. Use for
 * unlockables, achievement grids, surprise picks, onboarding treats.
 */
import { motion, type Variants } from "motion/react";
import { useState, type ReactNode } from "react";
import { BEAT, EASE, cn } from "../lib";

export interface BlindBoxItem {
  id: string;
  /** shown on the sealed box; defaults to the id in bold */
  front?: ReactNode;
  /** the prize inside */
  reveal: ReactNode;
  /** controlled reveal state; omit to let the grid track it internally */
  revealed?: boolean;
}

export interface BlindBoxProps {
  items: BlindBoxItem[];
  columns?: number;
  onReveal?: (id: string) => void;
  className?: string;
}

const prize: Variants = {
  boxed: { y: 8, scale: 0.92, rotate: 0, opacity: 1 },
  /* eager: the prize climbs well over the rim with a springy wiggle —
     the tease should make NOT clicking feel like a loss */
  peek: {
    y: -30,
    scale: 1.06,
    rotate: -6,
    transition: { type: "spring", stiffness: 300, damping: 15 },
  },
  out: {
    y: [26, 0],
    scale: [0.72, 1],
    opacity: [0, 1],
    transition: { duration: BEAT.b3, ease: [...EASE.pop] },
  },
};
const lid: Variants = {
  boxed: { rotateX: 0, opacity: 1 },
  peek: { rotateX: -34, transition: { duration: BEAT.b2, ease: [...EASE.pop] } },
  out: { rotateX: -76, opacity: 0, transition: { duration: BEAT.b3, ease: [...EASE.pop] } },
};
const face: Variants = {
  boxed: { opacity: 1 },
  peek: { opacity: 1 },
  out: { opacity: 0, transition: { delay: BEAT.b1, duration: BEAT.b3, ease: [...EASE.drift] } },
};

interface BoxCellProps {
  item: BlindBoxItem;
  revealed: boolean;
  onOpen: () => void;
}

function BoxCell({ item, revealed, onOpen }: BoxCellProps) {
  return (
    <motion.button
      type="button"
      aria-pressed={revealed}
      onClick={onOpen}
      className="relative block aspect-[4/5] w-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{
        background: "var(--sk-surface)",
        border: "1px solid var(--sk-rule)",
        borderRadius: "var(--radius-arc-2)",
        boxShadow: "0 1px 2px rgba(0,0,0,0.10), 0 3px 8px rgba(0,0,0,0.05)",
        outlineColor: "var(--sk-accent)",
      }}
      initial={false}
      animate={revealed ? "out" : "boxed"}
      variants={{
        boxed: { y: 0 },
        peek: { y: -4, transition: { type: "spring", stiffness: 300, damping: 20 } },
        out: { y: 0 },
      }}
      {...(revealed ? {} : { whileHover: "peek", whileFocus: "peek" })}
    >
      {/* the prize — waits inside, peeks over the rim, pops out on reveal */}
      <span
        aria-hidden={!revealed}
        className={cn(
          "pointer-events-none absolute inset-0 flex justify-center",
          revealed ? "items-center" : "items-start"
        )}
      >
        <motion.span className="inline-block" variants={prize}>
          {item.reveal}
        </motion.span>
      </span>
      {/* box face: sky body + bold front label; fades to a quiet frame */}
      <motion.span
        aria-hidden={revealed}
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        style={{
          background: "var(--color-sky)",
          borderRadius: "calc(var(--radius-arc-2) - 1px)",
        }}
        variants={face}
      >
        {/* sun/sky is a material: the face keeps its own ink in every mode */}
        <span className="px-2 font-bold" style={{ color: "#3A3430", fontSize: "0.95rem" }}>
          {item.front ?? item.id}
        </span>
      </motion.span>
      {/* the sun lid — cracks on hover, tilts open on reveal */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 block"
        style={{
          height: "34%",
          background: "var(--color-sun)",
          borderRadius:
            "calc(var(--radius-arc-2) - 1px) calc(var(--radius-arc-2) - 1px) 0 0",
          transformPerspective: 340,
          originY: 0,
        }}
        variants={lid}
      />
    </motion.button>
  );
}

export function BlindBox({ items, columns = 4, onReveal, className }: BlindBoxProps) {
  const [opened, setOpened] = useState<ReadonlySet<string>>(new Set());
  const isRevealed = (item: BlindBoxItem) => item.revealed ?? opened.has(item.id);
  const open = (item: BlindBoxItem) => {
    if (isRevealed(item)) return;
    if (item.revealed === undefined) setOpened((prev) => new Set(prev).add(item.id));
    onReveal?.(item.id);
  };
  return (
    <ul
      data-register="market"
      className={cn("grid list-none", className)}
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: "var(--sk-grout)",
        padding: "calc(var(--sk-grout) * 2)",
        background: "var(--sk-ground)",
        borderRadius: "var(--sk-radius)",
        fontFamily: "var(--sk-font)",
      }}
    >
      {items.map((item) => (
        <li key={item.id}>
          <BoxCell item={item} revealed={isRevealed(item)} onOpen={() => open(item)} />
        </li>
      ))}
    </ul>
  );
}
