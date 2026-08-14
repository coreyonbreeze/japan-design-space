/* Senko 線弧 — <FusumaSlide>
 * Source: IMG_2086 (machiya lattice windows and sliding screens), IMG_2083
 * (dark slat grids at several densities on one facade).
 * A drawer with the mass of a real door. It sticks for a moment before it
 * moves, glides, then bumps the jamb and settles. The face carries a shoji
 * grid and a timber pull rail on the leading edge. The ground behind darkens
 * as the door opens.
 *
 * The travel is keyframed because a door does not obey one ease: the stick,
 * the glide and the bump have different characters. What the door CARRIES is
 * sprung, so the contents overshoot when the frame stops and settle after
 * it. Closing runs longer than opening. A heavy door is easier to start than
 * to stop, and it has to be pushed the whole way home.
 *
 * The stick at the head of the motion is a silent beat. A rail rumble
 * belongs there, and a jamb knock belongs on the bump.
 */
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { BEAT, EASE, cn, ease } from "../lib";

export interface FusumaSlideProps {
  open: boolean;
  side?: "left" | "right";
  /** Panel width. Any CSS length. */
  width?: string;
  /** Names the dialog for screen readers. */
  label?: string;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
}

const OPEN_MS = 700;
/** A heavy door takes longer to put back than to pull open. */
const CLOSE_MS = 880;
/** Shoji cell, in px. Grid density is the composition, per IMG_2083. */
const CELL = 44;
const GRID = [
  `repeating-linear-gradient(90deg, transparent 0 ${CELL - 1}px, var(--sk-rule) ${CELL - 1}px ${CELL}px)`,
  `repeating-linear-gradient(0deg, transparent 0 ${CELL - 1}px, var(--sk-rule) ${CELL - 1}px ${CELL}px)`,
].join(", ");

export function FusumaSlide({
  open,
  side = "right",
  width = "min(24rem, 88vw)",
  label = "panel",
  onClose,
  children,
  className,
}: FusumaSlideProps) {
  const reduced = useReducedMotion();
  const panel = useRef<HTMLDivElement>(null);
  const closed = useRef(onClose);
  closed.current = onClose;

  // Move focus into the blocking overlay and give it back on close.
  useEffect(() => {
    if (!open) return;
    const before = document.activeElement as HTMLElement | null;
    const id = window.setTimeout(() => panel.current?.focus(), 0);
    return () => {
      clearTimeout(id);
      before?.focus?.();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") closed.current?.();
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [open]);

  // +1 runs off the right edge, -1 off the left.
  const dir = side === "left" ? -1 : 1;

  // Reduced motion gets the door already home: no travel, no dim ramp.
  const instant = { duration: 0 };

  const scrim: Variants = reduced
    ? {
        shut: { opacity: 0, transition: instant },
        ajar: { opacity: 1, transition: instant },
        going: { opacity: 0, transition: instant },
      }
    : {
        shut: { opacity: 0 },
        ajar: {
          opacity: 1,
          // The light goes only once the door is actually moving.
          transition: { duration: OPEN_MS / 1000, delay: 0.12, ease: ease(EASE.drift) },
        },
        going: {
          opacity: 0,
          transition: { duration: CLOSE_MS / 1000, ease: ease(EASE.drift) },
        },
      };

  const door: Variants = reduced
    ? {
        shut: { opacity: 0, transition: instant },
        ajar: { opacity: 1, transition: instant },
        going: { opacity: 0, transition: instant },
      }
    : {
        shut: { x: `${dir * 104}%` },
        ajar: {
          // stick, glide, past the jamb, settle back onto it
          x: [`${dir * 104}%`, `${dir * 99}%`, `${dir * -1.4}%`, "0%"],
          transition: {
            duration: OPEN_MS / 1000,
            times: [0, 0.24, 0.86, 1],
            ease: [ease(EASE.ignite), ease(EASE.drift), ease(EASE.settle)],
          },
        },
        going: {
          // pressed into the jamb first, then heaved the whole way out
          x: ["0%", `${dir * -1.8}%`, `${dir * 104}%`],
          transition: {
            duration: CLOSE_MS / 1000,
            times: [0, 0.18, 1],
            ease: [ease(EASE.settle), ease(EASE.drop)],
          },
        },
      };

  // The load the door carries. It lags the frame, then springs level once
  // the frame has stopped.
  const load: Variants = reduced
    ? {
        shut: { opacity: 0, transition: instant },
        ajar: { opacity: 1, transition: instant },
        going: { opacity: 0, transition: instant },
      }
    : {
        shut: { x: dir * 26, opacity: 0 },
        ajar: {
          x: 0,
          opacity: 1,
          transition: {
            type: "spring",
            stiffness: 210,
            damping: 17,
            mass: 1.15,
            delay: 0.24,
            opacity: { duration: BEAT.b3, delay: 0.3, ease: ease(EASE.drift) },
          },
        },
        going: {
          x: dir * 18,
          opacity: 0,
          transition: { duration: BEAT.b2, ease: ease(EASE.drift) },
        },
      };

  // The rail takes the impact. Its spring is timed to land on the bump, not
  // on the release: the jamb is what makes it ring.
  const rail: Variants = reduced
    ? { shut: {}, ajar: {}, going: {} }
    : {
        shut: { scaleY: 0.94, opacity: 0.6 },
        ajar: {
          scaleY: 1,
          opacity: 1,
          transition: { type: "spring", stiffness: 260, damping: 13, mass: 1.3, delay: 0.58 },
        },
        going: { scaleY: 0.94, opacity: 0.6, transition: { duration: BEAT.b2 } },
      };

  return (
    <AnimatePresence>
      {open && (
        // A full cover takes its own clicks. Nothing behind it is reachable.
        <motion.div
          key="fusuma"
          className={cn("fixed inset-0 z-50", className)}
          style={{ background: "color-mix(in oklab, var(--sk-night) 52%, transparent)" }}
          variants={scrim}
          initial="shut"
          animate="ajar"
          exit="going"
          onClick={() => closed.current?.()}
          role="dialog"
          aria-modal="true"
          aria-label={label}
        >
          <motion.div
            ref={panel}
            tabIndex={-1}
            className={cn(
              "absolute inset-y-0 flex flex-col overflow-hidden outline-none",
              side === "left" ? "left-0" : "right-0"
            )}
            style={{
              width,
              background: "var(--sk-surface)",
              color: "var(--sk-ink)",
              fontFamily: "var(--sk-font)",
              boxShadow: `${dir * -14}px 0 40px rgba(0,0,0,0.30)`,
              willChange: "transform",
            }}
            variants={door}
            onClick={(e) => e.stopPropagation()}
          >
            {/* the shoji face: thin rule lines on the door itself */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ backgroundImage: GRID, opacity: 0.55 }}
            />
            {/* two heavier stiles, the way a machiya screen is framed */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0"
              style={{ left: "33.33%", width: 1, background: "var(--sk-rule)", opacity: 0.9 }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0"
              style={{ left: "66.66%", width: 1, background: "var(--sk-rule)", opacity: 0.9 }}
            />
            {/* the pull rail on the leading edge, in timber */}
            <motion.span
              aria-hidden
              className={cn("absolute inset-y-0 block", side === "left" ? "right-0" : "left-0")}
              style={{
                width: 10,
                transformOrigin: "50% 50%",
                background:
                  "linear-gradient(90deg, var(--color-walnut), var(--color-hinoki) 45%, var(--color-walnut))",
                boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.28)",
              }}
              variants={rail}
            />
            {/* what the door carries */}
            <motion.div
              className="relative flex-1 overflow-auto"
              style={{
                padding: "calc(var(--sk-grout) * 5)",
                paddingInlineStart: side === "left" ? undefined : "calc(var(--sk-grout) * 5 + 10px)",
                paddingInlineEnd: side === "left" ? "calc(var(--sk-grout) * 5 + 10px)" : undefined,
              }}
              variants={load}
            >
              {children}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
