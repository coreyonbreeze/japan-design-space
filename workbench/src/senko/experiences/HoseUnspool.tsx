/* Senko 線弧 — <HoseUnspool>
 * Source: IMG_2113 (Haneda fire hydrant: the hose coiled into a black donut
 * ring behind glass, the coupling sitting in the middle of the hole, 消火栓
 * set across the ring). Function exposed and made graphic.
 * A progress indicator that pays out a coil. The drum turns, the coil is
 * consumed from the inside, so the hole opens and the donut thins. The
 * nozzle rides the free end outward to the mouth of the case.
 *
 * The spiral is a polyline: many short straight segments approximating an
 * Archimedean spiral, so the drawing still obeys the line and arc law. It
 * is moving mass, not a drawn mark, so nothing here steps.
 */
import { animate, motion, useMotionValue, useReducedMotion, useSpring, useTransform, type Variants } from "motion/react";
import { useEffect, useMemo, useRef } from "react";
import { BEAT, EASE, clamp01, cn, ease } from "../lib";

export interface HoseUnspoolProps {
  /** 0 to 1. */
  progress: number;
  size?: number;
  label?: string;
  /** Hose diameter in the 100-unit drawing, if you want a fatter line. */
  thickness?: number;
  className?: string;
}

/** A whole number of turns, so the fixed outer end lands beside the mouth. */
const TURNS = 5;
const R_OUT = 43;
/** The hole when the coil is full — the drum is never packed to the centre. */
const R_HUB = 14;
const R_CASE = R_OUT + 7;
const PITCH = (R_OUT - R_HUB) / TURNS;

interface Payout {
  x: number;
  y: number;
  /** Radians, measured from the drum centre. */
  out: number;
  /** 0 to 1 along the coil, which is also turns paid out over TURNS. */
  t: number;
}

interface Spiral {
  d: string;
  at: (p: number) => Payout;
}

/** Segments every 6 degrees. Fine enough that the joints do not read. */
function buildSpiral(): Spiral {
  const steps = Math.round(TURNS * 60);
  const pts: Array<{ x: number; y: number }> = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const th = t * TURNS * Math.PI * 2;
    const r = R_HUB + (R_OUT - R_HUB) * t;
    pts.push({ x: 50 + r * Math.cos(th), y: 50 + r * Math.sin(th) });
  }
  // Arc length, so the payout end sits exactly where the dash gap ends.
  const cum = [0];
  for (let i = 1; i < pts.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  }
  const total = cum[cum.length - 1];
  const d = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");

  const at = (p: number): Payout => {
    const target = clamp01(p) * total;
    let i = 1;
    while (i < cum.length - 1 && cum[i] < target) i++;
    const span = cum[i] - cum[i - 1] || 1;
    const f = (target - cum[i - 1]) / span;
    const x = pts[i - 1].x + (pts[i].x - pts[i - 1].x) * f;
    const y = pts[i - 1].y + (pts[i].y - pts[i - 1].y) * f;
    return { x, y, out: Math.atan2(y - 50, x - 50), t: (i - 1 + f) / steps };
  };
  return { d, at };
}

/** The drum is heavy and it is on a brake: it lags the pull and rocks to a
 *  stop rather than parking on the number. */
const DRUM = { stiffness: 52, damping: 15, mass: 1.4, restDelta: 0.02 } as const;

const rim: Variants = {
  running: { opacity: 0 },
  home: {
    opacity: [0, 0.85, 0],
    transition: { duration: BEAT.b4, times: [0, 0.16, 1], ease: ease(EASE.drift) },
  },
};

export function HoseUnspool({ progress, size = 180, label, thickness, className }: HoseUnspoolProps) {
  const reduced = useReducedMotion();
  const spiral = useMemo(buildSpiral, []);
  const p = clamp01(progress);
  const end = spiral.at(p);
  const done = p > 0.999;
  const hose = thickness ?? PITCH * 0.88;

  // Turns paid out, cancelled out of the drawing, so the free end travels
  // straight out to the mouth while the coil spins under it.
  const turned = useMotionValue(0);
  const kick = useMotionValue(0);
  const drum = useSpring(turned, DRUM);
  const spin = useTransform<number, number>([drum, kick], ([a, b]) => a + b);
  const pulled = useRef(false);

  useEffect(() => {
    turned.set(-end.t * TURNS * 360);
  }, [end.t, turned]);

  // Anticipation: the first pull takes up the slack and rocks the drum
  // backwards before anything pays out.
  useEffect(() => {
    if (reduced) return;
    if (p <= 0) {
      pulled.current = false;
      return;
    }
    if (pulled.current || p >= 1) return;
    pulled.current = true;
    const run = animate(kick, [0, 6.5, 0], {
      duration: 0.44,
      times: [0, 0.3, 1],
      ease: [ease(EASE.settle), ease(EASE.drift)],
    });
    return () => run.stop();
  }, [p, reduced, kick]);

  const lead = {
    x: 50 + Math.cos(end.out) * R_CASE,
    y: 50 + Math.sin(end.out) * R_CASE,
  };
  const nozzleDeg = (end.out * 180) / Math.PI;

  return (
    <div
      className={cn("inline-flex flex-col items-center gap-2", className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(p * 100)}
      aria-label={label ?? "paying out"}
    >
      <div className="relative" style={{ width: size, height: size }}>
        {/* the case: safety equipment displayed like a product */}
        <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden className="absolute inset-0">
          <rect
            x={2}
            y={2}
            width={96}
            height={96}
            rx={4}
            fill="none"
            stroke="var(--sk-rule)"
            strokeWidth={0.8}
          />
          <circle cx={50} cy={50} r={R_CASE} fill="none" stroke="var(--sk-rule)" strokeWidth={1} />
          {/* the spindle */}
          <circle cx={50} cy={50} r={4} fill="none" stroke="var(--color-ink-500)" strokeWidth={0.8} />
          {/* the mouth, where the hose leaves the case */}
          <path
            d={`M ${50 + R_CASE - 3} ${44} L ${50 + R_CASE + 4} ${44} M ${50 + R_CASE - 3} ${56} L ${50 + R_CASE + 4} ${56}`}
            stroke="var(--color-ink-500)"
            strokeWidth={1.2}
            strokeLinecap="round"
          />
          <motion.circle
            cx={50}
            cy={50}
            r={R_CASE}
            fill="none"
            stroke="var(--sk-glow)"
            strokeWidth={1.6}
            style={{ filter: "drop-shadow(0 0 4px var(--sk-glow-soft))" }}
            variants={rim}
            initial={false}
            animate={done && !reduced ? "home" : "running"}
          />
        </svg>

        {/* the drum: everything on it turns together */}
        <motion.div
          className="absolute inset-0"
          style={{ rotate: reduced ? 0 : spin, willChange: "transform" }}
        >
          <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden>
            {/* the black donut. Rubber keeps its own colour, like the kiln
                keeps its amber, so the ring reads as the same object in
                every register. */}
            <path
              d={spiral.d}
              fill="none"
              stroke="var(--color-ink-950)"
              strokeWidth={hose}
              strokeLinecap="butt"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={2 - p}
            />
            {/* the seam between turns catches the light in the case */}
            <path
              d={spiral.d}
              fill="none"
              stroke="var(--sk-sheen)"
              strokeWidth={hose * 0.16}
              strokeLinecap="butt"
              opacity={0.5}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={2 - p}
            />
            {/* the free end lifts over the pack and runs to the mouth. Out of
                the coil the jacket reads pale, as it does in the case. */}
            <path
              d={`M ${end.x.toFixed(2)} ${end.y.toFixed(2)} L ${lead.x.toFixed(2)} ${lead.y.toFixed(2)}`}
              fill="none"
              stroke="var(--color-paper-3)"
              strokeWidth={hose * 0.7}
              strokeLinecap="round"
              opacity={p > 0 ? 0.9 : 0}
            />
            {/* the nozzle, pulled outward */}
            <g transform={`translate(${end.x.toFixed(2)} ${end.y.toFixed(2)}) rotate(${nozzleDeg.toFixed(2)})`}>
              <path
                d="M -2.4 0 L 4 0"
                stroke="var(--sk-accent)"
                strokeWidth={hose * 0.62}
                strokeLinecap="round"
              />
              <path
                d="M 5 -1.7 A 1.7 1.7 0 1 1 5 1.7"
                fill="none"
                stroke="var(--sk-accent)"
                strokeWidth={1.1}
              />
            </g>
          </svg>
        </motion.div>
      </div>

      {(label || p > 0) && (
        <p className="m-0 text-center text-[0.78rem] italic" style={{ color: "var(--sk-ink-soft)", fontFamily: "var(--sk-font)" }}>
          {label ?? "paying out"}
          <span className="not-italic" style={{ color: "var(--sk-ink)" }}>
            {" "}
            {Math.round(p * 100)}%
          </span>
        </p>
      )}
    </div>
  );
}
