/* Senko 線弧 — <GlazeGrid>
 * Source: IMG_2060/2061 (handmade tiles, thick grout, ONE tile carrying the
 * etched maker's mark). An imperfect grid: every cell is kiln-varied (tilt,
 * corner radii, tint) and separated by grout-thick gaps; one cell may carry
 * the mark. Use for galleries, dashboards, feature grids.
 */
import { Children, type ReactNode } from "react";
import { kiln } from "../primitives/kiln";
import { cn } from "../lib";

interface GlazeGridProps {
  children: ReactNode;
  columns?: number;
  /** index of the cell that carries the maker's mark (like the Futa tile) */
  markIndex?: number;
  /** the mark itself — defaults to an etched dot */
  mark?: ReactNode;
  /** seed namespace so two grids on one page fire differently */
  seed?: string;
  className?: string;
}

export function GlazeGrid({
  children,
  columns = 4,
  markIndex,
  mark,
  seed = "glaze",
  className,
}: GlazeGridProps) {
  const items = Children.toArray(children);
  return (
    <div
      className={cn("grid", className)}
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: "var(--sk-grout)",
        background: "var(--color-grout)",
        padding: "var(--sk-grout)",
        borderRadius: "var(--radius-arc-2)",
      }}
    >
      {items.map((child, i) => {
        const g = kiln(`${seed}:${i}`).glaze();
        return (
          <div
            key={i}
            className="relative overflow-hidden"
            style={{
              transform: `rotate(${g.tilt * 0.6}deg)`,
              borderRadius: g.radii,
              /* glaze is a material: cell content keeps its own ink at night */
              color: "var(--color-ink-900)",
              background: `oklch(from var(--color-glaze-0) calc(l + ${(g.tint / 220).toFixed(3)}) c h)`,
              boxShadow: "inset 0 1px 1px rgba(255,255,255,0.75), 0 1px 2px rgba(0,0,0,0.14)",
            }}
          >
            {child}
            {i === markIndex && (
              <span
                className="pointer-events-none absolute bottom-1.5 right-2 italic"
                style={{ color: "var(--sk-accent)", opacity: 0.7, fontSize: "0.72rem" }}
              >
                {mark ?? "●"}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
