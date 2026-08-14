/* Senko 線弧 — <DuskSweepOverlay> and useDuskSweep
 * Source: IMG_2093 (golden hour crossing the balcony stack), IMG_2052.
 * The day and night switch is a light event, not a repaint. A warm band
 * crosses the viewport at an angle and the mode flips while the band
 * covers the middle of the screen, so the change arrives with the light.
 * A warm spill trails behind: light leaves heat where it has been.
 */
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { EASE, ease } from "../lib";

export type SkyMode = "day" | "night";

export const SWEEP_MS = 1050;

/* EASE.drift is an ease-out, so the band covers half the distance at
 * t=0.324, not t=0.5. Flip there or the page repaints on bare ground. */
const FLIP_AT = 0.324;

export interface DuskSweepControls {
  mode: SkyMode;
  /** Target mode while the band is crossing, else null. */
  sweeping: SkyMode | null;
  toggle: () => void;
  set: (next: SkyMode) => void;
}

export function useDuskSweep(initial: SkyMode = "day"): DuskSweepControls {
  const reduced = useReducedMotion();
  const [mode, setMode] = useState<SkyMode>(initial);
  const [sweeping, setSweeping] = useState<SkyMode | null>(null);
  const modeRef = useRef(mode);
  const sweepingRef = useRef<SkyMode | null>(null);
  const timers = useRef<number[]>([]);
  modeRef.current = mode;

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // All scheduling happens here, never inside a state updater. React may
  // invoke updaters twice, which would double every timer.
  const set = useCallback(
    (next: SkyMode) => {
      if (sweepingRef.current || modeRef.current === next) return;
      if (reduced) {
        modeRef.current = next;
        setMode(next);
        return;
      }
      sweepingRef.current = next;
      setSweeping(next);
      timers.current.forEach(clearTimeout);
      timers.current = [
        window.setTimeout(() => {
          modeRef.current = next;
          setMode(next);
        }, SWEEP_MS * FLIP_AT),
        window.setTimeout(() => {
          sweepingRef.current = null;
          setSweeping(null);
        }, SWEEP_MS),
      ];
    },
    [reduced]
  );

  const toggle = useCallback(() => {
    set(modeRef.current === "day" ? "night" : "day");
  }, [set]);

  return { mode, sweeping, toggle, set };
}

export interface DuskSweepOverlayProps {
  sweeping: SkyMode | null;
}

/** Mount once near the root, above page content. */
export function DuskSweepOverlay({ sweeping }: DuskSweepOverlayProps) {
  const toNight = sweeping === "night";
  const travel = { duration: SWEEP_MS / 1000, ease: ease(EASE.drift) };
  return (
    <AnimatePresence>
      {sweeping && (
        <motion.div
          key={sweeping}
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[60] overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.34 } }}
        >
          {/* the warm spill left behind the light */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: toNight
                ? "radial-gradient(120% 80% at 30% 50%, rgba(201,123,45,0.20), transparent 70%)"
                : "radial-gradient(120% 80% at 30% 50%, rgba(245,193,104,0.16), transparent 70%)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: SWEEP_MS / 1000, times: [0, 0.45, 1], ease: "linear" }}
          />
          {/* the light itself: a wide raking band, moved on transform */}
          <motion.div
            className="absolute"
            style={{
              top: "-30%",
              bottom: "-30%",
              left: 0,
              width: "58%",
              rotate: -9,
              willChange: "transform",
              background: toNight
                ? "linear-gradient(90deg, transparent 0%, rgba(201,123,45,0.30) 34%, rgba(245,193,104,0.62) 52%, rgba(36,31,53,0.42) 76%, transparent 100%)"
                : "linear-gradient(90deg, transparent 0%, rgba(20,22,26,0.34) 26%, rgba(245,193,104,0.58) 50%, rgba(250,247,239,0.42) 74%, transparent 100%)",
              filter: "blur(6px)",
            }}
            initial={{ x: "-120%" }}
            animate={{ x: "166%" }}
            transition={travel}
          />
          {/* the hot edge runs ahead of the band and stays ahead of it */}
          <motion.div
            className="absolute"
            style={{
              top: "-30%",
              bottom: "-30%",
              left: 0,
              width: 2,
              rotate: -9,
              willChange: "transform",
              background: "rgba(245,193,104,0.85)",
              filter: "blur(1.5px)",
            }}
            initial={{ x: "-6vw" }}
            animate={{ x: "106vw" }}
            transition={{ duration: (SWEEP_MS / 1000) * 0.88, ease: ease(EASE.drift) }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
