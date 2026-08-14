/* Senko 線弧 — <LatticeWeave>
 * Source: IMG_2037 (the diagonal timber lattice wrapping a whole building
 * volume — structure as facade, depth instead of a wall).
 * An overlay that weaves itself instead of fading. Members running one way
 * draw in first. The crossing members follow a beat later, so the screen
 * builds as a weave and not as two grids switched on together. The panel
 * settles in once the last member has landed. Closing runs the weave
 * backwards: the member laid last is the member pulled first.
 *
 * Lattice members are drawn marks, so they step. The dimmed ground behind
 * them is light, so it stays smooth. The gap between the last member and
 * the panel is silent on purpose. A timber knock belongs there.
 */
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { kiln } from "../primitives/kiln";
import { BEAT, EASE, clamp01, cn, ease, stepFrames } from "../lib";

export interface LatticeWeaveProps {
  open: boolean;
  /** Members per direction. The lattice carries twice this many. */
  members?: number;
  /** Names the dialog for screen readers. */
  label?: string;
  /** Fires on the scrim and on Escape. */
  onClose?: () => void;
  children: ReactNode;
  className?: string;
}

type Phase = "closed" | "weaving" | "open" | "unweaving";

const WEAVE_MS = 940;
const UNWEAVE_MS = 720;
/** How long one member takes, in timeline units. */
const SPAN = 0.42;
/** The crossing direction starts a beat behind the leading one. */
const FOLLOW = BEAT.b1;
/** A member draws for this share of its slot, then the hand lifts. */
const DUTY = 0.78;
/** Steps per member. A stepped stroke reads as laid, not printed. */
const STEPS = 7;

export function LatticeWeave({
  open,
  members = 13,
  label = "panel",
  onClose,
  children,
  className,
}: LatticeWeaveProps) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>(open ? "open" : "closed");
  const [p, setP] = useState(open ? 1 : 0);
  const progress = useRef(p);
  const panel = useRef<HTMLDivElement>(null);
  const closed = useRef(onClose);
  closed.current = onClose;

  // `open` alone drives the weave. Neither `phase` nor `p` may appear in the
  // dependency list, or each frame would cancel the frame that set it.
  useEffect(() => {
    if (reduced) {
      progress.current = open ? 1 : 0;
      setP(progress.current);
      setPhase(open ? "open" : "closed");
      return;
    }
    const from = progress.current;
    const to = open ? 1 : 0;
    if (from === to) {
      setPhase(open ? "open" : "closed");
      return;
    }
    setPhase(open ? "weaving" : "unweaving");
    const ms = (open ? WEAVE_MS : UNWEAVE_MS) * Math.abs(to - from);
    let raf = 0;
    let start = 0;
    const tick = (t: number) => {
      if (!start) start = t;
      const u = ms <= 0 ? 1 : clamp01((t - start) / ms);
      progress.current = from + (to - from) * u;
      setP(progress.current);
      if (u < 1) raf = requestAnimationFrame(tick);
      else setPhase(open ? "open" : "closed");
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [open, reduced]);

  // Move focus into the blocking overlay and give it back on close.
  useEffect(() => {
    if (phase !== "open") return;
    const before = document.activeElement as HTMLElement | null;
    panel.current?.focus();
    return () => before?.focus?.();
  }, [phase]);

  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") closed.current?.();
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [open]);

  if (phase === "closed") return null;

  // Every member gets its own slot. The leading direction fills the first
  // stretch of the timeline; the crossing direction is pushed a beat later
  // and finishes on the last frame.
  const spread = 1 - FOLLOW - SPAN;
  const slot = (i: number, follow: boolean) =>
    (follow ? FOLLOW : 0) + (members < 2 ? 0 : (i / (members - 1)) * spread);

  const member = (i: number, follow: boolean) => {
    const k = kiln(`lattice:${follow ? "cross" : "lead"}:${i}`);
    // Draw both jitters up front. A kiln is a sequence, so a conditional
    // draw would shift every value after it.
    const weight = k.range(0.09, 0.16);
    const tone = k.range(0.5, 0.86);
    // Offsets sweep the whole square. A sliced viewBox never shows a
    // diagonal whose offset falls outside this range.
    const o = -100 + (i / Math.max(members - 1, 1)) * 200;
    const drawn = stepFrames(clamp01((p - slot(i, follow)) / (SPAN * DUTY)), STEPS);
    // Leading members run top-left to bottom-right and draw from their
    // start. Crossing members run top-right to bottom-left, so the two
    // families arrive from opposite corners.
    const d = follow
      ? `M ${o + 120} -20 L ${o - 20} 120`
      : `M ${o - 20} -20 L ${o + 120} 120`;
    return (
      <path
        key={`${follow ? "c" : "l"}${i}`}
        d={d}
        fill="none"
        stroke="var(--color-hinoki)"
        strokeWidth={weight}
        strokeLinecap="square"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - drawn}
        opacity={drawn > 0 ? tone : 0}
      />
    );
  };

  const seated = phase === "open";

  return (
    <div
      className={cn("fixed inset-0 z-50 flex items-center justify-center", className)}
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      {/* The dimmed ground. It is opaque enough to block, so it takes the
          clicks rather than letting them through to the page. */}
      <div
        className="absolute inset-0"
        style={{
          background: "color-mix(in oklab, var(--sk-night) 62%, transparent)",
          opacity: p,
        }}
        onClick={() => closed.current?.()}
      />
      {/* the weave itself */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
      >
        {Array.from({ length: members }, (_, i) => member(i, false))}
        {Array.from({ length: members }, (_, i) => member(i, true))}
      </svg>
      {/* the panel: it arrives after the last member, never with it */}
      <motion.div
        ref={panel}
        tabIndex={-1}
        inert={!seated}
        className="relative z-10 max-h-[86vh] w-[min(38rem,90vw)] overflow-auto outline-none"
        style={{
          background: "var(--sk-surface)",
          color: "var(--sk-ink)",
          border: "1px solid var(--sk-rule)",
          borderRadius: "var(--sk-radius)",
          fontFamily: "var(--sk-font)",
          padding: "calc(var(--sk-grout) * 6)",
          boxShadow: "0 18px 48px rgba(0,0,0,0.34)",
        }}
        initial={{ opacity: 0, y: 16, scale: 0.985, rotate: -0.5 }}
        animate={
          seated
            ? { opacity: 1, y: 0, scale: 1, rotate: 0 }
            : { opacity: 0, y: 10, scale: 0.99, rotate: -0.3 }
        }
        transition={
          reduced
            ? { duration: 0 }
            : {
                duration: seated ? BEAT.b3 : BEAT.b2,
                delay: seated ? BEAT.b1 : 0,
                ease: ease(seated ? EASE.settle : EASE.drift),
              }
        }
      >
        {children}
      </motion.div>
    </div>
  );
}
