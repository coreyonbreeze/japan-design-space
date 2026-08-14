/* Senko 線弧 — Standings screen.
 * The season board: a lit arcade for the podium, the ranked directory with
 * the elevator car parked on your floor, and the results that got you there.
 * Uses: Arcade, KilnPlaque, Ignite, Directory, FinRail, Sheen, Cascade, Icon,
 * Settle.
 */
import { useState } from "react";
import { Arcade, Cascade, Directory, FinRail, Icon, Ignite, KilnPlaque, Settle, Sheen } from "../senko";
import { ME, STANDINGS } from "./data";
import type { ScreenProps } from "./types";

const SEASON = { name: "Season 4 · Kanazawa", day: 34, length: 60 };

type Outcome = "won" | "lost" | "running";

/* outcomes only — no gameplay lives in these screens */
const RESULTS: { id: string; title: string; when: string; outcome: Outcome; swing: string }[] = [
  { id: "g4", title: "Evening Circuit", when: "today", outcome: "running", swing: "—" },
  { id: "g3", title: "Quiet Hours", when: "Aug 12", outcome: "won", swing: "+610" },
  { id: "g2", title: "Kanazawa Open", when: "Aug 9", outcome: "lost", swing: "−30" },
  { id: "g1", title: "First Light", when: "Aug 7", outcome: "won", swing: "+95" },
];

const OUTCOME: Record<Outcome, { ink: string; label: string }> = {
  won: { ink: "var(--sk-accent)", label: "won" },
  lost: { ink: "var(--sk-ink-soft)", label: "lost" },
  running: { ink: "var(--sk-glow)", label: "under way" },
};

/* deltas arrive as "+610" or "−30" (U+2212), so test the leading glyph */
const isGain = (delta: string) => delta.trim().startsWith("+");

/* the podium reads 2 · 1 · 3, the way a real one is stood on */
const PODIUM_ORDER = [1, 0, 2];

/* Arcade owns its own frames, so the step cannot be an offset on the window.
 * It becomes the plinth inside it: taller stone, higher rank. */
const PLINTH: Record<number, string> = { 1: "40%", 2: "28%", 3: "18%" };

export function Standings({ go }: ScreenProps) {
  const mine = STANDINGS.find((s) => s.handle === ME.handle) ?? STANDINGS[0];
  const [floorId, setFloorId] = useState(mine.id);
  const seasonFraction = SEASON.day / SEASON.length;

  return (
    <div className="flex flex-col gap-10">
      <Settle>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl">Standings</h1>
            <p className="mt-1 text-sm italic" style={{ color: "var(--sk-ink-soft)" }}>
              {SEASON.name} · {STANDINGS.length} keepers ranked
            </p>
          </div>
          <button
            type="button"
            onClick={() => go("lobby")}
            className="flex shrink-0 items-center gap-1.5 text-sm"
            style={{ color: "var(--sk-accent)" }}
          >
            find a circuit <Icon name="arrow-right" size={15} />
          </button>
        </div>
      </Settle>

      <section>
        <h2 className="mb-3 text-sm uppercase tracking-widest" style={{ color: "var(--sk-ink-soft)" }}>
          Podium
        </h2>
        {/* three windows of one arcade, every one lit. A dimmed window would
            read as dirty, not as second place. */}
        <Arcade columns={3}>
          {PODIUM_ORDER.map((i) => {
            const s = STANDINGS[i];
            return (
              <div key={s.id} className="flex h-full flex-col items-center justify-end gap-2 pt-3">
                <KilnPlaque seed={s.id} label={String(s.rank)} size={s.rank === 1 ? 72 : 58} />
                <p className="px-2 text-center text-[0.78rem] italic" style={{ color: "var(--sk-ink-soft)" }}>
                  {s.handle} · {s.score}
                </p>
                <div
                  className="mt-1 flex w-full shrink-0 justify-center pt-2"
                  style={{
                    height: PLINTH[s.rank],
                    background: "var(--sk-surface-raised)",
                    borderTop: "1px solid var(--sk-rule)",
                  }}
                >
                  <span
                    className="text-[0.68rem] uppercase tracking-widest"
                    style={{ color: s.rank === 1 ? "var(--sk-accent)" : "var(--sk-ink-soft)" }}
                  >
                    rank {s.rank}
                  </span>
                </div>
              </div>
            );
          })}
        </Arcade>
      </section>

      <section>
        <h2 className="mb-3 text-sm uppercase tracking-widest" style={{ color: "var(--sk-ink-soft)" }}>
          Your rank
        </h2>
        {/* your own card warms up as it comes into view — Ignite carries the
            glow, so the card keeps its own border and ground */}
        <Ignite>
          <div
            className="flex items-center gap-4 border px-5 py-4"
            style={{
              borderColor: "var(--sk-rule)",
              borderRadius: "var(--sk-radius)",
              background: "var(--sk-surface)",
            }}
          >
            <KilnPlaque seed={mine.id} label={String(mine.rank)} size={64} />
            <div className="min-w-0">
              <p className="text-lg">
                {mine.handle} <span style={{ color: "var(--sk-ink-soft)" }}>· {ME.title}</span>
              </p>
              <p className="mt-0.5 text-sm italic" style={{ color: "var(--sk-ink-soft)" }}>
                {mine.score} points · rank {mine.rank} of {STANDINGS.length}
              </p>
            </div>
            <div className="ml-auto flex shrink-0 items-center gap-1.5">
              <Icon name={isGain(mine.delta) ? "arrow-up" : "arrow-down"} size={16} />
              <span
                className="text-lg italic"
                style={{ color: isGain(mine.delta) ? "var(--sk-accent)" : "var(--sk-ink-soft)" }}
              >
                {mine.delta}
              </span>
            </div>
          </div>
        </Ignite>
      </section>

      <section>
        <h2 className="mb-3 text-sm uppercase tracking-widest" style={{ color: "var(--sk-ink-soft)" }}>
          The board
        </h2>
        <Directory
          floors={STANDINGS.map((s) => ({
            id: s.id,
            level: String(s.rank),
            label: s.handle,
            detail: s.score,
          }))}
          activeId={floorId}
          onSelect={setFloorId}
          glyph="circle"
        />
      </section>

      <section>
        <h2 className="mb-1 text-sm uppercase tracking-widest" style={{ color: "var(--sk-ink-soft)" }}>
          Season progress
        </h2>
        <FinRail
          progress={seasonFraction}
          label={`day ${SEASON.day} of ${SEASON.length}`}
          seed="standings-season"
        />
      </section>

      <section>
        <h2 className="mb-3 text-sm uppercase tracking-widest" style={{ color: "var(--sk-ink-soft)" }}>
          Recent results
        </h2>
        <Cascade className="gap-2">
          {RESULTS.map((r) => {
            const o = OUTCOME[r.outcome];
            return (
              /* each result is a glazed row: the finish catches light on hover */
              <Sheen key={r.id} className="rounded-[var(--sk-radius)]">
                <div
                  className="flex items-center gap-3 border px-4 py-3"
                  style={{
                    borderColor: "var(--sk-rule)",
                    borderRadius: "var(--sk-radius)",
                    background: "var(--sk-surface)",
                  }}
                >
                  <span
                    aria-hidden
                    className="block h-2 w-2 shrink-0"
                    style={{
                      borderRadius: 999,
                      background: o.ink,
                      boxShadow: r.outcome === "running" ? "0 0 8px 1px var(--sk-glow-soft)" : undefined,
                    }}
                  />
                  <div className="min-w-0">
                    <p className="text-[0.98rem]">{r.title}</p>
                    <p className="mt-0.5 text-[0.78rem] italic" style={{ color: "var(--sk-ink-soft)" }}>
                      {r.when} · <span style={{ color: o.ink }}>{o.label}</span>
                    </p>
                  </div>
                  <span className="ml-auto shrink-0 text-[0.95rem] italic" style={{ color: o.ink }}>
                    {r.swing}
                  </span>
                </div>
              </Sheen>
            );
          })}
        </Cascade>
      </section>
    </div>
  );
}
