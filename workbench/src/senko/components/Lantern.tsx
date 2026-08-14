/* Senko 線弧 — <Lantern>
 * Source: IMG_2049 (oil lamps: warm points in darkness), IMG_2058 (one
 * glowing lamp in a full room). Focus mode: the page falls dark and one
 * warm point holds the eye. Use for dialogs, spotlight tours, confirmations.
 */
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { BEAT, EASE } from "../lib";

interface LanternProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function Lantern({ open, onClose, children }: LanternProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "color-mix(in oklab, var(--color-ink-950) 88%, transparent)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: BEAT.b2, ease: [...EASE.ignite] }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal
            className="max-w-md p-7"
            style={{
              background: "var(--sk-surface)",
              borderRadius: "var(--radius-arc-2)",
              boxShadow:
                "0 0 60px 8px var(--sk-glow-soft), 0 0 140px 30px color-mix(in oklab, var(--sk-glow) 10%, transparent), 0 8px 30px rgba(0,0,0,0.5)",
            }}
            initial={{ opacity: 0, scale: 0.96, filter: "brightness(0.5) saturate(0.6)" }}
            animate={{ opacity: 1, scale: 1, filter: "brightness(1) saturate(1)" }}
            exit={{ opacity: 0, scale: 0.97, filter: "brightness(0.5)" }}
            transition={{ duration: BEAT.b4, ease: [...EASE.ignite] }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
