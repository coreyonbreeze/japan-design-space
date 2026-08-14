/* Senko 線弧 — <ClipboardList>
 * Source: IMG_2055 (beer bar: six kraft sheets on hanging clipboards,
 * numbered brass tags, a physical SOLD OUT sticker). A list where every
 * item hangs from its clip, numbered, with honest stock states. Use for
 * menus, task lists, option pickers.
 */
import { motion } from "motion/react";
import { Cascade } from "../primitives/Cascade";
import { kiln } from "../primitives/kiln";
import { cn } from "../lib";

export interface ClipboardItem {
  id: string;
  title: string;
  detail?: string;
  price?: string;
  soldOut?: boolean;
}

interface ClipboardListProps {
  items: ClipboardItem[];
  onSelect?: (item: ClipboardItem) => void;
  className?: string;
}

export function ClipboardList({ items, onSelect, className }: ClipboardListProps) {
  return (
    <Cascade className={cn("gap-3", className)} stagger={0.08}>
      {items.map((item, i) => {
        const tilt = kiln(item.id).range(-0.8, 0.8);
        return (
          <motion.button
            key={item.id}
            type="button"
            disabled={item.soldOut}
            onClick={() => onSelect?.(item)}
            className="relative block w-full pt-3 text-left"
            style={{ transformOrigin: "50% 0%" }}
            initial={false}
            whileHover={item.soldOut ? undefined : { rotate: tilt, y: 1 }}
            transition={{ type: "spring", stiffness: 140, damping: 11 }}
          >
            {/* clip + numbered brass tag */}
            <span
              aria-hidden
              className="absolute left-1/2 top-0 z-10 flex h-6 w-9 -translate-x-1/2 items-center justify-center"
              style={{
                background: "linear-gradient(180deg, #C9A85C, #A88734)",
                borderRadius: "3px 3px 5px 5px",
                boxShadow: "0 1px 2px rgba(0,0,0,0.35)",
                color: "#3A3020",
                fontSize: "0.72rem",
                fontStyle: "italic",
              }}
            >
              {i + 1}
            </span>
            {/* kraft sheet */}
            <span
              className="relative block border px-5 pb-4 pt-5"
              style={{
                /* kraft is a material: it keeps its own ink even at night */
                color: "var(--color-ink-900)",
                background: "var(--color-paper-2)",
                borderColor: "var(--sk-rule)",
                borderRadius: "var(--sk-radius)",
                transform: `rotate(${tilt * 0.4}deg)`,
                boxShadow: "0 2px 6px rgba(0,0,0,0.10)",
                opacity: item.soldOut ? 0.65 : 1,
              }}
            >
              <span className="flex items-baseline justify-between gap-4">
                <span className="text-[1.02rem]" style={{ letterSpacing: "0.02em" }}>
                  {item.title}
                </span>
                {item.price && (
                  <span className="shrink-0 text-[0.92rem]" style={{ color: "var(--color-ink-500)" }}>
                    {item.price}
                  </span>
                )}
              </span>
              {item.detail && (
                <span className="mt-1 block text-[0.82rem]" style={{ color: "var(--color-ink-500)" }}>
                  {item.detail}
                </span>
              )}
              {item.soldOut && (
                <span
                  className="absolute right-3 top-1/2 border-2 px-2 py-0.5 text-[0.7rem] font-bold tracking-widest"
                  style={{
                    color: "var(--sk-accent)",
                    borderColor: "var(--sk-accent)",
                    borderRadius: "3px",
                    transform: `rotate(${kiln(item.id + "sticker").range(-9, -4)}deg)`,
                    background: "var(--color-paper-0)",
                  }}
                >
                  SOLD OUT
                </span>
              )}
            </span>
          </motion.button>
        );
      })}
    </Cascade>
  );
}
