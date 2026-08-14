/* Senko 線弧 — <ProvenanceRubbing>
 * Source: IMG_2088 (the bronze preservation plaque with verdigris patina,
 * mounted in a wood frame on a weathered wall).
 * The record does not simply appear. The reader rubs it up, the way a brass
 * rubbing lifts an engraving onto paper. Drag or move across the plate and
 * the text comes up under the hand. It stays up once it has been raised.
 */
import { motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { BEAT, EASE, clamp01, cn, ease } from "../lib";

export interface ProvenanceRubbingProps {
  children: ReactNode;
  /** Share of the plate that must be rubbed before it locks in. */
  threshold?: number;
  /** Radius of the rubbing hand, in pixels. */
  radius?: number;
  label?: string;
  className?: string;
}

export function ProvenanceRubbing({
  children,
  threshold = 0.55,
  radius = 110,
  label = "rub to raise the record",
  className,
}: ProvenanceRubbingProps) {
  const reduced = useReducedMotion();
  const plate = useRef<HTMLDivElement>(null);
  const x = useMotionValue(-9999);
  const y = useMotionValue(-9999);
  const [raised, setRaised] = useState(false);
  const [rubbed, setRubbed] = useState(0);
  const visited = useRef(new Set<number>());

  // The reveal mask follows the hand until the record locks in.
  const mask = useTransform([x, y], ([cx, cy]: number[]) =>
    `radial-gradient(circle ${radius}px at ${cx}px ${cy}px, #000 40%, rgba(0,0,0,0.35) 70%, transparent 100%)`
  );

  const track = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (raised || reduced) return;
    const box = plate.current?.getBoundingClientRect();
    if (!box) return;
    const px = e.clientX - box.left;
    const py = e.clientY - box.top;
    x.set(px);
    y.set(py);
    // Coverage is measured on a coarse grid, so a few passes finish it.
    const col = Math.floor(clamp01(px / box.width) * 6);
    const row = Math.floor(clamp01(py / box.height) * 3);
    visited.current.add(row * 6 + col);
    const share = visited.current.size / 18;
    setRubbed(share);
    if (share >= threshold) setRaised(true);
  };

  const done = raised || Boolean(reduced);

  return (
    <div className={cn("relative", className)}>
      <div
        ref={plate}
        onPointerMove={track}
        onPointerLeave={() => {
          if (!raised) {
            x.set(-9999);
            y.set(-9999);
          }
        }}
        className={cn("relative overflow-hidden", done ? undefined : "cursor-crosshair")}
        style={{ borderRadius: "var(--sk-radius)" }}
      >
        {/* the engraving, raised only where the hand has passed */}
        <motion.div
          style={done ? undefined : { WebkitMaskImage: mask, maskImage: mask }}
          initial={false}
          animate={{ opacity: 1 }}
        >
          {children}
        </motion.div>

        {/* the unrubbed plate: patina with nothing legible on it */}
        {!done && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(160deg, var(--color-verdigris) 0%, var(--color-walnut) 140%)",
              mixBlendMode: "multiply",
            }}
            animate={{ opacity: 1 - rubbed * 0.55 }}
            transition={{ duration: BEAT.b2, ease: ease(EASE.drift) }}
          />
        )}
      </div>

      <p className="mt-2 text-[0.72rem] italic" style={{ color: "var(--sk-ink-soft)" }}>
        {done ? "record raised" : label}
      </p>
    </div>
  );
}
