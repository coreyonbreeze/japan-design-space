/* Senko 線弧 — Profile screen.
 * Who you are here: the fired plaque, the progress, the record, the people.
 * Uses: KilnPlaque, Settle, FinRail, GlazeGrid, Sheen, ProvenanceRubbing,
 * ProvenancePlaque, BlindBox, ArchAperture, Cascade, Icon.
 */
import { useState } from "react";
import {
  ArchAperture,
  BlindBox,
  Cascade,
  FinRail,
  GlazeGrid,
  Icon,
  KilnPlaque,
  ProvenancePlaque,
  ProvenanceRubbing,
  Settle,
  Sheen,
} from "../senko";
import { ME, FRIENDS, COLLECTION, SESSIONS, STANDINGS } from "./data";
import type { ScreenProps } from "./types";

/** the rarest tier doubles as the achievement set — fired, not bought */
const ACHIEVEMENTS = COLLECTION.filter((c) => c.rarity === "kiln");

/** the display case: the finest pieces actually in hand, three to a wall */
const TROPHIES = COLLECTION.filter((c) => c.acquired && c.rarity !== "common").slice(0, 3);

const STATUS_INK: Record<string, string> = {
  online: "var(--sk-glow)",
  away: "var(--sk-ink-soft)",
  offline: "transparent",
};

export function Profile({ go }: ScreenProps) {
  /* one shutter at a time, like a vitrine: the first case starts open */
  const [openCase, setOpenCase] = useState(0);
  const xpFraction = ME.xp / ME.xpToNext;
  const fired = COLLECTION.filter((c) => c.acquired).length;
  const bestRank = STANDINGS.find((s) => s.handle === ME.handle)?.rank ?? "—";
  const stats = [
    { value: "148", label: "sessions" },
    { value: `#${bestRank}`, label: "best rank" },
    { value: String(fired), label: "plaques fired" },
    { value: "212h", label: "at the kiln" },
  ];

  return (
    <div className="flex flex-col gap-10">
      <Settle>
        <section
          className="flex flex-wrap items-center gap-7 border p-6"
          style={{
            borderColor: "var(--sk-rule)",
            borderRadius: "var(--sk-radius)",
            background: "var(--sk-surface)",
          }}
        >
          <KilnPlaque seed={ME.id} size={140} />
          <div>
            <h2 className="text-3xl">{ME.handle}</h2>
            <p className="mt-1 text-lg italic" style={{ color: "var(--sk-ink-soft)" }}>
              {ME.title}
            </p>
            <p className="mt-3 text-sm" style={{ color: "var(--sk-ink-soft)" }}>
              level {ME.level} · joined {ME.joinedAt} · {ME.status}
            </p>
          </div>
        </section>
      </Settle>

      <section>
        <h2 className="mb-1 text-sm uppercase tracking-widest" style={{ color: "var(--sk-ink-soft)" }}>
          Progress
        </h2>
        <FinRail
          progress={xpFraction}
          seed="profile-xp"
          label={`${ME.xp.toLocaleString()} of ${ME.xpToNext.toLocaleString()} xp to level ${ME.level + 1}`}
        />
      </section>

      <section>
        <h2 className="mb-3 text-sm uppercase tracking-widest" style={{ color: "var(--sk-ink-soft)" }}>
          Record
        </h2>
        {/* tiles as fired glaze: kiln-varied cells, one carrying the mark */}
        <GlazeGrid columns={4} seed="profile-stats" markIndex={2} mark="窯">
          {stats.map((s) => (
            /* fired glaze is glossy: the tile catches light as the hand passes */
            <Sheen key={s.label} className="px-4 py-5">
              <p className="text-2xl">{s.value}</p>
              <p className="mt-1 text-[0.72rem] uppercase tracking-widest" style={{ opacity: 0.6 }}>
                {s.label}
              </p>
            </Sheen>
          ))}
        </GlazeGrid>
      </section>

      <section>
        <h2 className="mb-3 text-sm uppercase tracking-widest" style={{ color: "var(--sk-ink-soft)" }}>
          Account
        </h2>
        {/* the record is engraved, not printed: it has to be rubbed up before
            it is legible. max-w-sm keeps the plate the size of the plaque. */}
        <ProvenanceRubbing className="max-w-sm" label="rub the plate to raise your record">
          <ProvenancePlaque
            title="Senko account"
            registered
            footnote="issued once · not transferable"
            rows={[
              { term: "handle", description: ME.handle },
              { term: "joined", description: ME.joinedAt },
              /* home region: where this player's sessions actually run */
              { term: "region", description: SESSIONS[0].region },
              { term: "account id", description: `senko/${ME.id}` },
            ]}
          />
        </ProvenanceRubbing>
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm uppercase tracking-widest" style={{ color: "var(--sk-ink-soft)" }}>
            Achievements
          </h2>
          <span className="text-xs italic" style={{ color: "var(--sk-ink-soft)" }}>
            {ACHIEVEMENTS.filter((a) => a.acquired).length} of {ACHIEVEMENTS.length} fired
          </span>
        </div>
        {/* revealed is driven by the data: a locked box stays sealed on click */}
        <BlindBox
          columns={3}
          items={ACHIEVEMENTS.map((a) => ({
            id: a.id,
            front: a.name,
            revealed: a.acquired,
            reveal: (
              <span className="flex flex-col items-center gap-2">
                <KilnPlaque seed={a.id} size={54} />
                <span className="text-[0.72rem] italic" style={{ color: "var(--sk-ink-soft)" }}>
                  {a.name}
                </span>
              </span>
            ),
          }))}
        />
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm uppercase tracking-widest" style={{ color: "var(--sk-ink-soft)" }}>
            Trophy case
          </h2>
          <span className="text-xs italic" style={{ color: "var(--sk-ink-soft)" }}>
            the shutter opens on one piece at a time
          </span>
        </div>
        {/* BlindBox above owns the sealed/unsealed story for the whole set;
            this is the display wall, so the arch is the aperture instead. */}
        <div className="grid grid-cols-3" style={{ gap: "var(--sk-grout)" }}>
          {TROPHIES.map((t, i) => {
            const open = openCase === i;
            return (
              <button
                key={t.id}
                type="button"
                aria-expanded={open}
                onClick={() => setOpenCase((current) => (current === i ? -1 : i))}
                className="block w-full"
              >
                <ArchAperture open={open} aspect="4/5">
                  <span className="flex h-full flex-col items-center justify-center gap-2">
                    <KilnPlaque seed={t.id} size={58} />
                    <span className="px-2 text-center text-[0.74rem]">{t.name}</span>
                  </span>
                </ArchAperture>
                <p
                  className="mt-2 text-center text-[0.68rem] uppercase tracking-widest"
                  style={{ color: open ? "var(--sk-accent)" : "var(--sk-ink-soft)" }}
                >
                  {t.rarity}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm uppercase tracking-widest" style={{ color: "var(--sk-ink-soft)" }}>
          Friends
        </h2>
        <Cascade className="gap-2">
          {FRIENDS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => go("standings")}
              className="flex w-full items-center gap-3 border px-3 py-2 text-left"
              style={{
                borderColor: "var(--sk-rule)",
                borderRadius: "var(--sk-radius)",
                background: "var(--sk-surface)",
              }}
            >
              <KilnPlaque seed={f.id} size={40} />
              <div className="min-w-0">
                <p className="text-[0.98rem]">{f.handle}</p>
                <p className="text-xs italic" style={{ color: "var(--sk-ink-soft)" }}>
                  {f.title} · level {f.level}
                </p>
              </div>
              <span
                className="ml-auto flex shrink-0 items-center gap-2 text-xs"
                style={{ color: "var(--sk-ink-soft)" }}
              >
                <span
                  aria-hidden
                  className="block h-2 w-2"
                  style={{
                    borderRadius: 999,
                    background: STATUS_INK[f.status],
                    border: f.status === "offline" ? "1px solid var(--sk-ink-soft)" : undefined,
                    boxShadow: f.status === "online" ? "0 0 8px 1px var(--sk-glow-soft)" : undefined,
                  }}
                />
                {f.status}
                <Icon name="arrow-right" size={14} />
              </span>
            </button>
          ))}
        </Cascade>
      </section>
    </div>
  );
}
