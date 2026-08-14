/* Senko 線弧 — <KilnPlaque>
 * Source: IMG_2050 (Kutani room signs: "expressed with only straight lines
 * and arcs, each room's expression slightly different"), IMG_2043 (porcelain
 * 901 plaque). A generative identity mark: give it any id and it composes a
 * unique porcelain plaque from quarter-circles, half-circles and rules —
 * unique per seed, unmistakably in-system. Use for avatars, room signs,
 * empty-state marks.
 */
import { useKiln } from "../primitives/kiln";
import { cn } from "../lib";

interface KilnPlaqueProps {
  /** the identity to fire: user id, room number, slug */
  seed: string;
  /** optional inked label, like the glazed "901" */
  label?: string;
  size?: number;
  className?: string;
}

const INK = "var(--color-ink-700)";

/** Split a long multi-word label into two balanced lines. */
function wrapLabel(label: string): string[] {
  if (label.length <= 8 || !label.includes(" ")) return [label];
  const words = label.split(/\s+/);
  let line1 = "";
  while (words.length && (line1 ? line1.length + 1 + words[0].length : words[0].length) <= label.length / 2 + 1) {
    line1 = line1 ? `${line1} ${words.shift()}` : (words.shift() as string);
  }
  if (!line1) line1 = words.shift() as string;
  return words.length ? [line1, words.join(" ")] : [line1];
}

export function KilnPlaque({ seed, label, size = 96, className }: KilnPlaqueProps) {
  const k = useKiln(seed);
  const g = k.glaze();

  // 2×2 cells on a 96 grid; each cell holds one line-or-arc gesture
  const cells = [
    { x: 0, y: 0 },
    { x: 48, y: 0 },
    { x: 0, y: 48 },
    { x: 48, y: 48 },
  ];
  // the label owns its cell(s): no gesture may collide with the glazed number
  const lines = label ? wrapLabel(label) : [];
  const longest = lines.reduce((m, l) => Math.max(m, l.length), 1);
  const reservedCells = label ? (label.length > 4 ? [0, 1] : [0]) : [];
  const gestures = cells.map((c, idx) => ({
    ...c,
    kind: reservedCells.includes(idx)
      ? ("blank" as const)
      : k.pick(["quarter", "half", "rule", "blank"] as const),
    rot: k.int(0, 3) * 90,
    filled: k.rand() < 0.45,
  }));
  // porcelain tint varies per firing
  const tint = `oklch(from var(--color-glaze-0) calc(l + ${k.range(-0.03, 0.03).toFixed(3)}) c h)`;

  return (
    <div
      className={cn("relative inline-block select-none", className)}
      style={{
        width: size,
        height: size,
        transform: `rotate(${g.tilt}deg)`,
        borderRadius: g.radii,
        background: tint,
        boxShadow:
          "0 1px 2px rgba(0,0,0,0.18), 0 4px 14px rgba(0,0,0,0.08), inset 0 1px 1px rgba(255,255,255,0.7)",
      }}
    >
      <svg viewBox="0 0 96 96" width={size} height={size} aria-hidden>
        {gestures.map((gst, i) =>
          gst.kind === "blank" ? null : (
            <g key={i} transform={`rotate(${gst.rot} ${gst.x + 24} ${gst.y + 24})`}>
              {gst.kind === "quarter" && (
                <>
                  {gst.filled && (
                    /* relief shade stays inside the arc, and the arc itself
                       is always drawn — a smudge without its line reads as
                       a glitch, not a gesture */
                    <path
                      d={`M ${gst.x + 4} ${gst.y + 44} A 40 40 0 0 1 ${gst.x + 44} ${gst.y + 4} L ${gst.x + 4} ${gst.y + 4} Z`}
                      fill="rgba(0,0,0,0.05)"
                    />
                  )}
                  <path
                    d={`M ${gst.x + 4} ${gst.y + 44} A 40 40 0 0 1 ${gst.x + 44} ${gst.y + 4}`}
                    fill="none"
                    stroke={INK}
                    strokeWidth={1.4}
                  />
                </>
              )}
              {gst.kind === "half" && (
                <path
                  d={`M ${gst.x + 6} ${gst.y + 34} A 18 18 0 0 1 ${gst.x + 42} ${gst.y + 34}`}
                  fill={gst.filled ? "rgba(0,0,0,0.07)" : "none"}
                  stroke={INK}
                  strokeWidth={1.4}
                />
              )}
              {gst.kind === "rule" && (
                <line
                  x1={gst.x + 6}
                  y1={gst.y + 24}
                  x2={gst.x + 42}
                  y2={gst.y + 24}
                  stroke={INK}
                  strokeWidth={1.4}
                />
              )}
            </g>
          )
        )}
      </svg>
      {label && (
        <span
          className="absolute left-[9%] top-[6%] italic"
          style={{
            fontFamily: "var(--sk-font)",
            /* multi-word labels wrap; size fits the longest LINE, so long
               names stay at plaque scale instead of shrinking away */
            fontSize: size * Math.min(0.16, 1.35 / longest),
            color: INK,
            letterSpacing: "0.08em",
            lineHeight: 1.18,
            whiteSpace: "nowrap",
          }}
        >
          {lines.map((l) => (
            <span key={l} className="block">
              {l}
            </span>
          ))}
        </span>
      )}
    </div>
  );
}
