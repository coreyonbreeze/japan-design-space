/* Senko 線弧 — <NorenSplit>
 * Source: IMG_2058 (the dark shop curtain hung over the kitchen pass).
 * A view change reads as walking through a noren. Cloth panels drop, the
 * view swaps behind them, then the panels lift and part. Each panel keeps
 * its own lag and sway, so the cloth never moves as one rigid sheet.
 */
import { motion, useReducedMotion } from "motion/react";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { kiln } from "../primitives/kiln";
import { EASE, cn, ease } from "../lib";

export interface NorenSplitProps {
  /** A change to this value runs the transition. */
  routeKey: string;
  panels?: number;
  /** Optional mark printed on the cloth, like a shop crest. */
  mark?: ReactNode;
  /** Announced to screen readers once the new view is in place. */
  announce?: string;
  /** Fires when the view behind the cloth has been swapped. */
  onSwap?: (routeKey: string) => void;
  children: ReactNode;
  className?: string;
}

const COVER_MS = 460;
/** Long enough to read as a held beat, and it starts when the LAST panel
 *  lands, not the first. */
const HOLD_MS = 300;
const LIFT_MS = 620;
const STAGGER = 0.075;
const JITTER = 0.02;
type Phase = "idle" | "cover" | "lift";

/** Seconds the slowest panel waits before it moves. */
const maxDelay = (panels: number) => ((panels - 1) / 2) * STAGGER + JITTER;

export function NorenSplit({
  routeKey,
  panels = 5,
  mark,
  announce,
  onSwap,
  children,
  className,
}: NorenSplitProps) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");
  const [frozen, setFrozen] = useState<ReactNode>(null);

  const latest = useRef<ReactNode>(children);
  const previous = useRef<ReactNode>(children);
  const shownKey = useRef(routeKey);
  const swapped = useRef(onSwap);
  const first = useRef(true);
  latest.current = children;
  swapped.current = onSwap;

  // Hold the outgoing view. This effect runs before the transition effect
  // in the same commit, while `phase` is still "idle", so it must also
  // check the route. Without that check it saves the INCOMING view and the
  // cloth drops over content that has already swapped.
  useLayoutEffect(() => {
    if (phase === "idle" && routeKey === shownKey.current) previous.current = children;
  });

  // A layout effect, so the cover phase is committed before the browser
  // paints. A passive effect runs after paint, which shows the incoming
  // view for one frame before the cloth arrives.
  //
  // routeKey alone drives the sequence. Nothing this effect sets may appear
  // in the dependency list, or the swap would cancel its own timers.
  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      shownKey.current = routeKey;
      return;
    }
    // React may run this effect twice on mount. Claiming the route here
    // makes the second pass a no-op instead of a spurious transition.
    if (routeKey === shownKey.current) return;
    shownKey.current = routeKey;
    if (reduced) {
      swapped.current?.(routeKey);
      setPhase("idle");
      setFrozen(null);
      return;
    }
    const spread = maxDelay(panels) * 1000;
    setFrozen(previous.current);
    setPhase("cover");
    const swap = window.setTimeout(() => {
      setFrozen(latest.current);
      setPhase("lift");
      swapped.current?.(routeKey);
    }, COVER_MS + spread + HOLD_MS);
    const done = window.setTimeout(() => {
      setPhase("idle");
      setFrozen(null);
    }, COVER_MS + spread + HOLD_MS + LIFT_MS + spread);
    return () => {
      clearTimeout(swap);
      clearTimeout(done);
    };
  }, [routeKey, reduced, panels]);

  const covering = phase === "cover";
  const running = phase !== "idle";

  return (
    <div className={cn("relative", className)}>
      {/* The frozen view is inert: it is either hidden behind cloth or is a
          snapshot the user cannot act on. */}
      <div inert={running}>{running ? frozen : children}</div>

      {announce && (
        <span className="sr-only" role="status">
          {phase === "idle" ? announce : ""}
        </span>
      )}

      {running && (
        // The cloth swallows input. Clicking opaque panels must not reach
        // the view behind them.
        <div className="absolute inset-0 z-40 overflow-hidden" aria-hidden>
          {/* cloth blocks light: the view behind it dims as the panels land */}
          <motion.div
            className="absolute inset-0"
            style={{ background: "#0B0D12" }}
            initial={{ opacity: covering ? 0 : 0.35 }}
            animate={{ opacity: covering ? 0.35 : 0 }}
            transition={{ duration: (covering ? COVER_MS : LIFT_MS) / 1000, ease: ease(EASE.drift) }}
          />
          {Array.from({ length: panels }, (_, i) => {
            const k = kiln(`noren:${routeKey}:${i}`);
            const dur = (covering ? COVER_MS : LIFT_MS) / 1000;
            // The cloth parts from the centre in both directions. Cover and
            // lift differ in direction, not in order.
            const centre = Math.abs(i - (panels - 1) / 2);
            const delay = centre * STAGGER + k.range(-JITTER, JITTER);
            // Take the sign from the seed. Alternating by index makes every
            // adjacent pair swing apart and open a gap.
            const sway = k.range(0.35, 0.8) * (k.rand() < 0.5 ? -1 : 1);
            return (
              <motion.div
                key={i}
                className="absolute top-0"
                style={{
                  left: `${(i * 100) / panels}%`,
                  width: `calc(${100 / panels}% + 3%)`,
                  height: "100%",
                  transformOrigin: "50% 0%",
                  background:
                    "linear-gradient(180deg, #1B1F2A 0%, #171A24 62%, #10131A 100%)",
                  borderLeft: i === 0 ? undefined : "1px solid rgba(255,255,255,0.05)",
                  willChange: "transform",
                }}
                initial={{ y: covering ? "-102%" : "0%", rotate: 0, skewX: 0, scaleY: 1 }}
                animate={{
                  // A curtain is drawn up before it drops.
                  y: covering ? ["-102%", "-105%", "0%"] : "-102%",
                  // A damped double swing, not one metronome tick.
                  rotate: [0, sway, -sway * 0.32, 0],
                  // The hem lags the rod, so the cloth deforms.
                  skewX: [0, sway * 1.8, 0],
                  scaleY: covering ? [1, 1.045, 0.985, 1] : 1,
                }}
                transition={{
                  y: {
                    duration: dur,
                    delay,
                    times: covering ? [0, 0.14, 1] : undefined,
                    ease: ease(covering ? EASE.drop : EASE.ignite),
                  },
                  rotate: { duration: dur + 0.24, delay, times: [0, 0.5, 0.78, 1], ease: ease(EASE.drift) },
                  skewX: { duration: dur * 1.25, delay: delay + 0.08, ease: ease(EASE.drift) },
                  scaleY: { duration: dur, delay, times: [0, 0.55, 0.78, 1], ease: ease(EASE.drift) },
                }}
              >
                {/* hem: the cloth is heavier at the bottom edge */}
                <motion.span
                  className="absolute inset-x-0 bottom-0 block"
                  style={{
                    height: 10,
                    background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 100%)",
                    borderBottom: "1px solid rgba(255,255,255,0.07)",
                  }}
                  animate={{ y: [0, 4, 0] }}
                  transition={{ duration: dur, delay: delay + 0.07, ease: ease(EASE.drift) }}
                />
                {mark && i === Math.floor(panels / 2) && (
                  <motion.span
                    className="absolute inset-x-0 top-[38%] flex justify-center"
                    style={{ color: "var(--color-paper-2)", opacity: 0.9 }}
                    animate={{ y: [0, 5, 0], scaleY: covering ? [1, 0.94, 1] : 1 }}
                    transition={{ duration: dur, delay: delay + 0.06, ease: ease(EASE.drift) }}
                  >
                    {mark}
                  </motion.span>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
