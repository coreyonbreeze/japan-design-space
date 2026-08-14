/* Senko 線弧 — <GateOpen>
 * Source: IMG_2089 (samurai-district gate: two heavy plank leaves under a
 * tile-capped roof, plaster band and timber lintel above, stone sill below,
 * moss creeping up the boards).
 * A ceremonial entry to a section. The leaves are heavy. They press inward
 * before they move, break their own friction, accelerate, then take the
 * stop with a rebound. A held beat follows, and only then does the ground
 * behind come up. Closing carries the same weight and lands with a bump
 * that shakes the roof. Both beats are where a sound cue lands.
 *
 * Doors are mass, so nothing here steps. The leaves are not clipped by the
 * frame: a gate opens into the street.
 */
import { motion, useReducedMotion, type Variants } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { kiln } from "../primitives/kiln";
import { BEAT, EASE, cn, ease } from "../lib";

export interface GateOpenProps {
  /** True swings the leaves out and reveals the children. */
  open: boolean;
  /** Revealed behind the gate. */
  children: ReactNode;
  /** Fires once the ground behind is fully up. */
  onOpened?: () => void;
  className?: string;
}

/** Anticipation: the leaves press in against the jamb before they move. */
const PUSH_MS = 180;
const SWING_MS = 900;
/** The gate stands open and nothing moves. Sound lands here. */
const HELD_MS = 240;
const FADE_MS = 520;
const CLOSE_MS = 880;
const OPEN_MS = PUSH_MS + SWING_MS;

const PLANKS = 7;

type Phase = "shut" | "opening" | "open" | "closing";

/** One leaf. sign -1 hangs on the left jamb, +1 on the right. The two are
 *  not the same weight, so they never arrive together. */
function leafVariants(sign: number, swing: number, lag: number, reduced: boolean): Variants {
  const open = sign * swing;
  if (reduced) {
    return {
      shut: { rotateY: 0, transition: { duration: 0 } },
      opening: { rotateY: open, transition: { duration: 0 } },
      open: { rotateY: open, transition: { duration: 0 } },
      closing: { rotateY: 0, transition: { duration: 0 } },
    };
  }
  return {
    shut: { rotateY: 0, transition: { duration: BEAT.b2, ease: ease(EASE.drift) } },
    opening: {
      // press in, break free, run, decelerate into the stop, rebound
      rotateY: [0, -sign * 2.6, sign * 4, sign * 58, open + sign * 2.5, open - sign * 3, open],
      transition: {
        duration: OPEN_MS / 1000 + lag,
        times: [0, 0.1, 0.19, 0.55, 0.86, 0.94, 1],
        ease: [
          ease(EASE.drift),
          ease(EASE.ignite),
          ease(EASE.drift),
          ease(EASE.drift),
          ease(EASE.drop),
          ease(EASE.settle),
        ],
      },
    },
    open: { rotateY: open, transition: { duration: BEAT.b2, ease: ease(EASE.drift) } },
    closing: {
      // wind back, swing shut under gravity, then the jamb takes it
      rotateY: [open, open + sign * 5, sign * 38, 0, sign * 3.4, sign * 0.9, 0],
      transition: {
        duration: CLOSE_MS / 1000 + lag,
        times: [0, 0.1, 0.44, 0.76, 0.85, 0.93, 1],
        ease: [
          ease(EASE.drift),
          ease(EASE.ignite),
          ease(EASE.drop),
          ease(EASE.drop),
          ease(EASE.settle),
          ease(EASE.settle),
        ],
      },
    },
  };
}

/** The face turns away from the light as the leaf swings out. */
const shade: Variants = {
  shut: { opacity: 0.06 },
  opening: {
    opacity: [0.06, 0.1, 0.44],
    transition: { duration: OPEN_MS / 1000, times: [0, 0.2, 1], ease: ease(EASE.drift) },
  },
  open: { opacity: 0.44 },
  closing: {
    opacity: [0.44, 0.12, 0.06],
    transition: { duration: CLOSE_MS / 1000, times: [0, 0.8, 1], ease: ease(EASE.drift) },
  },
};

interface LeafProps {
  side: "left" | "right";
  phase: Phase;
  reduced: boolean;
}

function Leaf({ side, phase, reduced }: LeafProps) {
  const sign = side === "left" ? -1 : 1;
  const k = kiln(`gate:${side}`);
  // module and variation: no two boards weathered the same
  const swing = 74 + k.range(0, 5);
  const lag = side === "left" ? 0 : k.range(0.04, 0.09);
  const variants = leafVariants(sign, swing, lag, reduced);

  return (
    <motion.div
      aria-hidden
      className="absolute top-0 bottom-0"
      style={{
        left: side === "left" ? 0 : undefined,
        right: side === "right" ? 0 : undefined,
        width: "50.4%",
        transformOrigin: side === "left" ? "0% 50%" : "100% 50%",
        transformStyle: "preserve-3d",
        backfaceVisibility: "visible",
        borderLeft: side === "right" ? "1px solid rgba(0,0,0,0.45)" : undefined,
        borderRight: side === "left" ? "1px solid rgba(0,0,0,0.45)" : undefined,
        boxShadow: "0 2px 10px rgba(0,0,0,0.35)",
        willChange: "transform",
      }}
      variants={variants}
      initial={false}
      animate={phase}
    >
      {/* the boards */}
      <div className="flex h-full w-full">
        {Array.from({ length: PLANKS }, (_, i) => {
          const g = kiln(`gate:${side}:${i}`);
          const tone = g.range(58, 80);
          return (
            <span
              key={i}
              className="block h-full flex-1"
              style={{
                background: `linear-gradient(92deg, color-mix(in oklab, var(--color-walnut) ${tone.toFixed(
                  1
                )}%, var(--color-ink-950)) 0%, color-mix(in oklab, var(--color-walnut) ${(
                  tone - 9
                ).toFixed(1)}%, var(--color-ink-950)) 100%)`,
                borderRight: i === PLANKS - 1 ? undefined : "1px solid rgba(0,0,0,0.42)",
                borderLeft: i === 0 ? undefined : "1px solid rgba(255,255,255,0.045)",
              }}
            />
          );
        })}
      </div>
      {/* season on the surface: moss climbing the foot of the boards */}
      <span
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(0deg, color-mix(in oklab, var(--color-moss-600) 42%, transparent) 0%, transparent 15%)",
        }}
      />
      <motion.span
        className="pointer-events-none absolute inset-0"
        style={{ background: "var(--sk-night)" }}
        variants={shade}
        initial={false}
        animate={phase}
      />
    </motion.div>
  );
}

export function GateOpen({ open, children, onOpened, className }: GateOpenProps) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>(() => (open ? "open" : "shut"));
  const opened = useRef(onOpened);
  const first = useRef(true);
  opened.current = onOpened;

  // `open` alone drives the sequence. Nothing this effect sets may appear in
  // its dependency list, or the swing would cancel its own timers.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (reduced) {
      setPhase(open ? "open" : "shut");
      if (open) opened.current?.();
      return;
    }
    if (open) {
      setPhase("opening");
      const landed = window.setTimeout(() => setPhase("open"), OPEN_MS);
      const up = window.setTimeout(() => opened.current?.(), OPEN_MS + HELD_MS + FADE_MS);
      return () => {
        clearTimeout(landed);
        clearTimeout(up);
      };
    }
    setPhase("closing");
    const shut = window.setTimeout(() => setPhase("shut"), CLOSE_MS);
    return () => clearTimeout(shut);
  }, [open, reduced]);

  const swinging = phase === "opening" || phase === "closing";

  return (
    <div className={cn("relative", className)} style={{ fontFamily: "var(--sk-font)" }}>
      {/* tile-capped roof, plaster band, lintel */}
      <motion.div
        aria-hidden
        initial={false}
        // the slam runs up into the roof
        animate={{ y: phase === "closing" && !reduced ? [0, 0, 1.8, 0] : 0 }}
        transition={{
          duration: CLOSE_MS / 1000,
          times: [0, 0.76, 0.84, 1],
          ease: ease(EASE.settle),
        }}
      >
        <svg viewBox="0 0 200 22" preserveAspectRatio="none" className="block w-full" height={22}>
          <rect x={0} y={0} width={200} height={15} fill="var(--color-ink-900)" />
          {Array.from({ length: 25 }, (_, i) => (
            <path
              key={i}
              d={`M ${i * 8} 15 A 4 4 0 0 0 ${i * 8 + 8} 15 Z`}
              fill="var(--color-ink-700)"
              stroke="var(--color-ink-950)"
              strokeWidth={0.5}
            />
          ))}
        </svg>
        <div
          style={{
            height: 18,
            background: "color-mix(in oklab, var(--color-paper-2) 84%, var(--color-walnut))",
            borderBottom: "1px solid color-mix(in oklab, var(--color-walnut) 60%, transparent)",
          }}
        />
        <div
          style={{
            height: 12,
            background:
              "linear-gradient(180deg, color-mix(in oklab, var(--color-walnut) 78%, var(--color-ink-950)) 0%, color-mix(in oklab, var(--color-walnut) 55%, var(--color-ink-950)) 100%)",
          }}
        />
      </motion.div>

      {/* the opening. The leaves are drawn over it and are not clipped. */}
      <div
        className="relative"
        style={{ perspective: 1500, perspectiveOrigin: "50% 44%", background: "var(--sk-night)" }}
      >
        <motion.div
          inert={phase !== "open"}
          initial={false}
          animate={{ opacity: open ? 1 : 0, y: open ? 0 : 10 }}
          transition={{
            duration: open ? FADE_MS / 1000 : BEAT.b2,
            delay: open && !reduced ? (OPEN_MS + HELD_MS) / 1000 : 0,
            ease: ease(open ? EASE.ignite : EASE.drift),
          }}
        >
          {children}
        </motion.div>

        {/* the leaves throw their shadow across the ground as they move */}
        {!reduced && (
          <>
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 w-1/2"
              style={{
                background: "linear-gradient(90deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0) 100%)",
              }}
              initial={false}
              animate={{ opacity: swinging ? [0.9, 0.35, 0] : 0, x: open ? "-38%" : "0%" }}
              transition={{
                duration: (open ? OPEN_MS : CLOSE_MS) / 1000,
                ease: ease(EASE.drift),
              }}
            />
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 w-1/2"
              style={{
                background: "linear-gradient(270deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0) 100%)",
              }}
              initial={false}
              animate={{ opacity: swinging ? [0.9, 0.3, 0] : 0, x: open ? "38%" : "0%" }}
              transition={{
                duration: (open ? OPEN_MS : CLOSE_MS) / 1000,
                delay: 0.06,
                ease: ease(EASE.drift),
              }}
            />
            {/* daylight crossing the ground once as the gap opens */}
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 w-1/3"
              style={{
                background:
                  "linear-gradient(100deg, transparent 0%, var(--sk-sheen) 50%, transparent 100%)",
                filter: "blur(2px)",
              }}
              initial={false}
              animate={{
                x: open && phase === "opening" ? ["-40%", "320%"] : "-40%",
                opacity: open && phase === "opening" ? [0, 0.55, 0] : 0,
              }}
              transition={{
                duration: SWING_MS / 1000,
                delay: PUSH_MS / 1000,
                ease: ease(EASE.drift),
              }}
            />
          </>
        )}

        <Leaf side="left" phase={phase} reduced={Boolean(reduced)} />
        <Leaf side="right" phase={phase} reduced={Boolean(reduced)} />
      </div>

      {/* stone sill */}
      <div
        aria-hidden
        style={{
          height: 14,
          background:
            "linear-gradient(180deg, color-mix(in oklab, var(--color-ink-500) 70%, var(--color-paper-3)) 0%, color-mix(in oklab, var(--color-ink-700) 80%, var(--color-paper-3)) 100%)",
          borderTop: "1px solid rgba(0,0,0,0.35)",
        }}
      />
    </div>
  );
}
