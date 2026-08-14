/* Senko 線弧 — Home screen.
 * The hub. Identity, progress, what is running now, what is next.
 * Uses: KilnPlaque, Obi, FinRail, ClipboardList, BalconyStack, Icon.
 */
import { Obi, FinRail, ClipboardList, BalconyStack, KilnPlaque, Icon, Settle, Cascade } from "../senko";
import { ME, SESSIONS, QUESTS } from "./data";
import type { ScreenId, ScreenProps } from "./types";

export function Home({ go }: ScreenProps) {
  const xpFraction = ME.xp / ME.xpToNext;
  return (
    <div className="flex flex-col gap-10">
      <Settle>
        <Obi
          band={{
            title: `Welcome back, ${ME.handle}`,
            meta: `${ME.title} · level ${ME.level} · joined ${ME.joinedAt}`,
          }}
        >
          <div className="flex h-44 items-center justify-center gap-6">
            <KilnPlaque seed={ME.id} label={ME.handle} size={104} />
            <div>
              <p className="text-2xl">Level {ME.level}</p>
              <p className="mt-1 text-sm italic" style={{ color: "var(--sk-ink-soft)" }}>
                {ME.xp.toLocaleString()} of {ME.xpToNext.toLocaleString()} to level {ME.level + 1}
              </p>
            </div>
          </div>
        </Obi>
      </Settle>

      <section>
        <h2 className="mb-1 text-sm uppercase tracking-widest" style={{ color: "var(--sk-ink-soft)" }}>
          Progress
        </h2>
        <FinRail progress={xpFraction} label={`${Math.round(xpFraction * 100)}% to next level`} seed="home-xp" />
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm uppercase tracking-widest" style={{ color: "var(--sk-ink-soft)" }}>
            Open sessions
          </h2>
          <button
            type="button"
            onClick={() => go("lobby")}
            className="flex items-center gap-1.5 text-sm"
            style={{ color: "var(--sk-accent)" }}
          >
            all lobbies <Icon name="arrow-right" size={15} />
          </button>
        </div>
        <ClipboardList
          items={SESSIONS.slice(0, 3).map((s) => ({
            id: s.id,
            title: s.name,
            detail: `${s.mode} · ${s.region}`,
            price: `${s.players}/${s.capacity}`,
            soldOut: s.state === "full",
          }))}
          onSelect={() => go("lobby")}
        />
      </section>

      <section>
        <h2 className="mb-3 text-sm uppercase tracking-widest" style={{ color: "var(--sk-ink-soft)" }}>
          Quests
        </h2>
        <BalconyStack golden steps={QUESTS} />
      </section>

      <Cascade className="gap-2">
        {([
          { icon: "user", label: "Your profile", to: "profile" },
          { icon: "folder", label: "Collection", to: "collection" },
          { icon: "star", label: "Standings", to: "standings" },
        ] as { icon: "user" | "folder" | "star"; label: string; to: ScreenId }[]).map((row) => (
          <button
            key={row.to}
            type="button"
            onClick={() => go(row.to)}
            className="flex w-full items-center gap-3 border px-4 py-3 text-left"
            style={{
              borderColor: "var(--sk-rule)",
              borderRadius: "var(--sk-radius)",
              background: "var(--sk-surface)",
            }}
          >
            <Icon name={row.icon} size={18} tone="duo" />
            <span>{row.label}</span>
            <Icon name="arrow-right" size={15} className="ml-auto" />
          </button>
        ))}
      </Cascade>
    </div>
  );
}
