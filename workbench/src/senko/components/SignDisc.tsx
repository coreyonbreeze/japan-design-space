/* Senko 線弧 — <SignDisc>
 * Source: IMG_2038 (eight different businesses, one wall: each announced by
 * an identical white circular disc mounted on a dark slat rail with ivy).
 * Principle: signage as unified system — one shape, many tenants. Every disc
 * is the same size on purpose; uniformity IS the design, and only light says
 * where you are. Use for primary nav, tab strips, mode switchers.
 */
import { motion } from "motion/react";
import { BEAT, EASE, cn } from "../lib";

export interface SignDiscItem {
  id: string;
  label: string;
  sublabel?: string;
}

export interface SignDiscProps {
  items: SignDiscItem[];
  activeId: string;
  onSelect: (id: string) => void;
  className?: string;
}

/* shadow lists keep the same shape so the glow can warm up, not pop in */
const DISC_REST =
  "0 0 0 1px rgba(0,0,0,0.07), 0 2px 5px rgba(0,0,0,0.35), 0 0 0px 0px transparent";
const DISC_LIT =
  "0 0 0 1px rgba(0,0,0,0.07), 0 2px 5px rgba(0,0,0,0.35), 0 0 24px 6px var(--sk-glow-soft)";

export function SignDisc({ items, activeId, onSelect, className }: SignDiscProps) {
  return (
    <nav aria-label="Sign rail" className={cn("relative", className)}>
      {/* dark slat rail — discs overhang its edges like the photo */}
      <ul
        className="flex items-center justify-center gap-5 px-8 py-2"
        style={{
          backgroundColor: "var(--color-ink-900)",
          backgroundImage:
            "repeating-linear-gradient(180deg, rgba(255,255,255,0.06) 0px 1px, transparent 1px 9px)",
          borderRadius: "var(--sk-radius)",
          boxShadow: "inset 0 1px 6px rgba(0,0,0,0.45)",
        }}
      >
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <li key={item.id} className="flex">
              <motion.button
                type="button"
                onClick={() => onSelect(item.id)}
                aria-current={active ? "true" : undefined}
                className="-my-3 flex aspect-square w-20 select-none flex-col items-center justify-center overflow-hidden px-1 text-center"
                style={{
                  borderRadius: 999,
                  background: "var(--sk-surface-raised)",
                  color: "var(--sk-ink)",
                  fontFamily: "var(--sk-font)",
                }}
                initial={false}
                animate={
                  active
                    ? { scale: 1.06, boxShadow: DISC_LIT }
                    : { scale: 1, boxShadow: DISC_REST }
                }
                whileHover={{ y: -3 }}
                whileFocus={{ y: -3 }}
                transition={{ duration: BEAT.b3, ease: [...EASE.ignite] }}
              >
                <span
                  className="block leading-tight"
                  style={{
                    fontVariantCaps: "all-small-caps",
                    letterSpacing: "0.14em",
                    fontSize: "0.82rem",
                  }}
                >
                  {item.label}
                </span>
                {item.sublabel && (
                  <span
                    className="mt-0.5 block leading-none"
                    style={{
                      fontSize: "0.58rem",
                      letterSpacing: "0.1em",
                      color: "var(--sk-ink-soft)",
                    }}
                  >
                    {item.sublabel}
                  </span>
                )}
              </motion.button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
