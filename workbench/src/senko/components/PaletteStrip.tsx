/* Senko 線弧 — <PaletteStrip>
 * Source: IMG_2050/2060 (glazed tiles), library/palettes.json (the raw
 * per-photo extractions these palettes were curated from). A palette
 * rendered as a strip of kiln-varied glaze chips — click any chip to copy
 * its hex. Use for design-system docs, brand pages, theme pickers.
 */
import { useState } from "react";
import { kiln } from "../primitives/kiln";
import type { Palette } from "../palettes";
import { cn } from "../lib";

interface PaletteStripProps {
  palette: Palette;
  className?: string;
}

export function PaletteStrip({ palette, className }: PaletteStripProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (value: string) => {
    void navigator.clipboard?.writeText(value);
    setCopied(value);
    window.setTimeout(() => setCopied((c) => (c === value ? null : c)), 1400);
  };

  return (
    <div className={cn(className)}>
      <div className="flex items-baseline gap-3">
        <h3 className="text-[1.05rem]">{palette.title}</h3>
        <p className="text-[0.78rem] italic" style={{ color: "var(--sk-ink-soft)" }}>
          {palette.description}
        </p>
      </div>
      <ul className="mt-3 flex flex-wrap gap-3">
        {palette.colors.map((c) => {
          const g = kiln(palette.id + c.name).glaze();
          return (
            <li key={c.name}>
              <button
                type="button"
                onClick={() => copy(c.value)}
                title={c.source ? `from ${c.source.join(", ")}` : undefined}
                className="block text-left"
              >
                <span
                  className="block h-14 w-20"
                  style={{
                    background: c.value,
                    transform: `rotate(${g.tilt * 0.5}deg)`,
                    borderRadius: g.radii,
                    border: "1px solid var(--sk-rule)",
                    boxShadow: "inset 0 1px 1px rgba(255,255,255,0.35), 0 1px 2px rgba(0,0,0,0.12)",
                  }}
                />
                <span className="mt-1 block text-[0.68rem]" style={{ color: "var(--sk-ink)" }}>
                  {c.name}
                </span>
                <span
                  className="block text-[0.64rem] tracking-wide"
                  style={{ color: copied === c.value ? "var(--sk-accent)" : "var(--sk-ink-soft)" }}
                >
                  {copied === c.value ? "copied ✓" : c.value}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
