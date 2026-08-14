/* Senko 線弧 — <LouverWipe>
 * Source: IMG_2032 (a roofline crowned with vertical timber fins of
 * irregular height), IMG_2090 (radial fins under the round canopy).
 * A view change reads as a louver turning. Fins swing shut left to right,
 * the view swaps behind the closed blind, then the fins keep turning the
 * same way and open on the far side. Each fin carries its own lag, so the
 * strip turns as a rhythm. No fin waits for its neighbour.
 *
 * Each fin travels 180 degrees across the two stages. The swap lands at the
 * halfway mark. Halfway is the flat face, not the edge: a fin standing
 * edge-on has no width and hides nothing, so the flat face is the only
 * moment that can carry a swap. The held beat between the stages is silent
 * on purpose. A latch sound belongs there.
 *
 * Timber keeps its own colour in every register, like the cloth in
 * <NorenSplit> and the fire in <KilnFiring>.
 */
import { motion, useReducedMotion } from "motion/react";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { kiln } from "../primitives/kiln";
import { EASE, cn, ease } from "../lib";

export interface LouverWipeProps {
  /** A change to this value runs the transition. */
  routeKey: string;
  /** Fins in the blind. More fins means a finer, slower rhythm. */
  fins?: number;
  /** Announced to screen readers once the new view is in place. */
  announce?: string;
  /** Fires when the view behind the blind has been swapped. */
  onSwap?: (routeKey: string) => void;
  children: ReactNode;
  className?: string;
}

const CLOSE_MS = 420;
/** The held beat starts when the LAST fin lands, not the first. */
const HOLD_MS = 240;
const OPEN_MS = 520;
const STAGGER = 0.03;
const JITTER = 0.012;

/* Wind slightly past edge-on before the swing, overshoot past flat, settle.
 * Opening picks the journey up at flat and carries it the other 90 degrees. */
const CLOSE_ANGLES = [90, 97, -8, 0];
const CLOSE_TIMES = [0, 0.14, 0.82, 1];
const OPEN_ANGLES = [0, 9, -90];
const OPEN_TIMES = [0, 0.18, 1];

type Phase = "idle" | "close" | "open";

/** Seconds the slowest fin waits before it moves. */
const maxDelay = (fins: number) => (fins - 1) * STAGGER + JITTER;

/** Face brightness for a fin turned to `deg`. Face-on takes the full light,
 *  edge-on falls back to the dark side of the timber. */
function faceShade(deg: number): number {
  return 0.42 + 0.58 * Math.abs(Math.cos((deg * Math.PI) / 180));
}

/** A specular sliver rakes across the fin as it turns, and dies when the
 *  fin comes flat. This is what makes the strip read as solid. */
function edgeLight(deg: number): number {
  return Math.pow(Math.abs(Math.sin((deg * Math.PI) / 180)), 2.2);
}

export function LouverWipe({
  routeKey,
  fins = 14,
  announce,
  onSwap,
  children,
  className,
}: LouverWipeProps) {
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

  // Hold the outgoing view. This effect runs before the transition effect in
  // the same commit, while `phase` is still "idle", so it must check the
  // route too. Without that check it saves the INCOMING view and the fins
  // turn over content that has already swapped.
  useLayoutEffect(() => {
    if (phase === "idle" && routeKey === shownKey.current) previous.current = children;
  });

  // A layout effect, so the closing phase is committed before the browser
  // paints. A passive effect runs after paint, which shows the incoming view
  // for one frame before the fins arrive.
  //
  // routeKey alone drives the sequence. Nothing this effect sets may appear
  // in the dependency list, or the swap would cancel its own timers.
  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      shownKey.current = routeKey;
      return;
    }
    // React may run this effect twice on mount. Claiming the route here makes
    // the second pass a no-op instead of a spurious transition.
    if (routeKey === shownKey.current) return;
    shownKey.current = routeKey;
    if (reduced) {
      swapped.current?.(routeKey);
      setPhase("idle");
      setFrozen(null);
      return;
    }
    const spread = maxDelay(fins) * 1000;
    setFrozen(previous.current);
    setPhase("close");
    const swap = window.setTimeout(() => {
      setFrozen(latest.current);
      setPhase("open");
      swapped.current?.(routeKey);
    }, CLOSE_MS + spread + HOLD_MS);
    const done = window.setTimeout(
      () => {
        setPhase("idle");
        setFrozen(null);
      },
      CLOSE_MS + spread + HOLD_MS + OPEN_MS + spread
    );
    return () => {
      clearTimeout(swap);
      clearTimeout(done);
    };
  }, [routeKey, reduced, fins]);

  const closing = phase === "close";
  const running = phase !== "idle";
  const angles = closing ? CLOSE_ANGLES : OPEN_ANGLES;
  const times = closing ? CLOSE_TIMES : OPEN_TIMES;
  const dur = (closing ? CLOSE_MS : OPEN_MS) / 1000;
  // Each segment gets its own ease: the wind-up, the swing, the catch.
  const turn = closing
    ? [ease(EASE.ignite), ease(EASE.drift), ease(EASE.settle)]
    : [ease(EASE.ignite), ease(EASE.drift)];

  return (
    <div className={cn("relative", className)}>
      {/* The frozen view is inert: it is either behind timber or is a
          snapshot the user cannot act on. */}
      <div inert={running}>{running ? frozen : children}</div>

      {announce && (
        <span className="sr-only" role="status">
          {phase === "idle" ? announce : ""}
        </span>
      )}

      {running && (
        // The blind swallows input. Clicking a closed louver must not reach
        // the view behind it.
        <div
          className="absolute inset-0 z-40 overflow-hidden"
          style={{ perspective: 1400 }}
          aria-hidden
        >
          {/* timber blocks light: the view behind it darkens as the fins land */}
          <motion.div
            className="absolute inset-0"
            style={{ background: "var(--sk-night)" }}
            initial={{ opacity: closing ? 0 : 0.32 }}
            animate={{ opacity: closing ? 0.32 : 0 }}
            transition={{ duration: dur, ease: ease(EASE.drift) }}
          />
          {Array.from({ length: fins }, (_, i) => {
            const k = kiln(`louver:${routeKey}:${i}`);
            // Left to right. The stagger is the whole effect.
            const delay = i * STAGGER + k.range(0, JITTER);
            // Sawn timber is never one tone. Same seed, same board.
            const grain = k.range(-0.07, 0.07);
            const shade = angles.map((a) => `brightness(${(faceShade(a) + grain).toFixed(3)})`);
            return (
              <motion.div
                key={i}
                className="absolute top-0 h-full"
                style={{
                  left: `calc(${(i * 100) / fins}% - 0.5px)`,
                  width: `calc(${100 / fins}% + 1px)`,
                  transformOrigin: "50% 50%",
                  background:
                    "linear-gradient(96deg, var(--color-walnut) 0%, var(--color-hinoki) 46%, var(--color-walnut) 100%)",
                  boxShadow:
                    "inset -1px 0 0 rgba(0,0,0,0.30), inset 1px 0 0 rgba(255,255,255,0.07)",
                  willChange: "transform, filter",
                }}
                initial={{ rotateY: angles[0], filter: shade[0] }}
                animate={{ rotateY: angles, filter: shade }}
                transition={{
                  rotateY: { duration: dur, delay, times, ease: turn },
                  // Light lands a hair after the move, never with it.
                  filter: { duration: dur * 1.08, delay: delay + 0.02, times, ease: ease(EASE.drift) },
                }}
              >
                {/* the raking highlight on the turning face */}
                <motion.span
                  className="absolute inset-y-0 left-0 block"
                  style={{
                    width: "22%",
                    background: "linear-gradient(90deg, var(--sk-sheen), transparent)",
                  }}
                  initial={{ opacity: edgeLight(angles[0]) }}
                  animate={{ opacity: angles.map(edgeLight) }}
                  transition={{ duration: dur, delay: delay + 0.02, times, ease: ease(EASE.drift) }}
                />
                {/* the shadow the fin throws on its own neighbour */}
                <motion.span
                  className="absolute inset-y-0 right-0 block"
                  style={{ width: "34%", background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.42))" }}
                  initial={{ opacity: 1 - edgeLight(angles[0]) }}
                  animate={{ opacity: angles.map((a) => 0.18 + 0.5 * edgeLight(a)) }}
                  transition={{ duration: dur * 1.12, delay: delay + 0.04, times, ease: ease(EASE.drift) }}
                />
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
