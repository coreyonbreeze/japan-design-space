/* Senko 線弧 — <ProvenancePlaque>
 * Source: IMG_2088 (bronze preservation plaque, verdigris patina, set in a
 * wood frame on a weathered wall), IMG_2077 (QR codes embedded in a carved
 * wood sign — old and new sharing one surface). Provenance displayed with
 * ceremony: metadata is not fine print, it is engraved. Use for attribution
 * cards, build/version info, "about this data" panels.
 */
import { Settle } from "../primitives/Settle";
import { cn } from "../lib";

export interface ProvenanceRow {
  term: string;
  description: string;
}

export interface ProvenancePlaqueProps {
  title: string;
  rows: ProvenanceRow[];
  /** shows a small registered-seal dot, IMG_2088's official stamp */
  registered?: boolean;
  footnote?: string;
  className?: string;
}

const ENGRAVE = "#EAF0E8";

export function ProvenancePlaque({
  title,
  rows,
  registered,
  footnote,
  className,
}: ProvenancePlaqueProps) {
  return (
    <Settle className={cn("inline-block w-full max-w-sm", className)}>
      <article
        style={{
          border: "6px solid var(--color-walnut)",
          borderRadius: "var(--radius-arc-1)",
          background: "var(--color-walnut)",
          boxShadow:
            "0 3px 12px rgba(0,0,0,0.28), inset 0 1px 2px rgba(0,0,0,0.45), inset 0 -1px 1px rgba(255,255,255,0.16)",
        }}
      >
        <div
          className="px-6 pb-5 pt-5"
          style={{
            background: "var(--color-verdigris)",
            backgroundImage:
              "radial-gradient(ellipse 120% 90% at 50% 30%, rgba(255,255,255,0.10), transparent 55%), radial-gradient(ellipse 130% 110% at 50% 58%, transparent 44%, rgba(18,30,24,0.36) 100%)",
            boxShadow: "inset 0 2px 6px rgba(0,0,0,0.35)",
            color: ENGRAVE,
            textShadow: "0 1px 0 rgba(0,0,0,0.35)",
            fontFamily: "var(--sk-font)",
          }}
        >
          <header className="relative">
            <h3
              className="text-center text-[0.95rem]"
              style={{ fontVariantCaps: "all-small-caps", letterSpacing: "0.2em" }}
            >
              {title}
            </h3>
            {registered && (
              <span className="absolute right-0 top-1">
                <span
                  aria-hidden
                  className="block h-2.5 w-2.5"
                  style={{
                    borderRadius: 999,
                    background: "var(--sk-accent)",
                    boxShadow: "inset 0 1px 1px rgba(0,0,0,0.4), 0 0 0 2px rgba(0,0,0,0.14)",
                  }}
                />
                <span className="sr-only">registered</span>
              </span>
            )}
          </header>

          {/* engraved rule: dark cut, light lower lip */}
          <div
            aria-hidden
            className="mt-3 h-px"
            style={{
              background: "rgba(0,0,0,0.32)",
              boxShadow: "0 1px 0 rgba(255,255,255,0.16)",
            }}
          />

          <dl className="mt-3">
            {rows.map((r, i) => (
              <div
                key={r.term}
                className="flex items-baseline justify-between gap-6 py-1.5"
                style={{ borderTop: i > 0 ? "1px solid rgba(0,0,0,0.16)" : undefined }}
              >
                <dt
                  className="shrink-0 text-[0.68rem]"
                  style={{
                    fontVariantCaps: "all-small-caps",
                    letterSpacing: "0.16em",
                    opacity: 0.78,
                  }}
                >
                  {r.term}
                </dt>
                <dd className="text-right text-[0.82rem] italic">{r.description}</dd>
              </div>
            ))}
          </dl>

          {footnote && (
            <p
              className="mt-4 text-center text-[0.66rem] italic"
              style={{ opacity: 0.66, letterSpacing: "0.06em" }}
            >
              {footnote}
            </p>
          )}
        </div>
      </article>
    </Settle>
  );
}
