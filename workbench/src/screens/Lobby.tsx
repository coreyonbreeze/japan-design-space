/* Senko 線弧 — Lobby screen.
 * Two halves of one moment: the sessions on offer, and the one you joined.
 * Confirming the start hands the screen over: the tower brings the session
 * up floor by floor, then the gate lets you through.
 * Uses: ClipboardList, Cascade, Sheen, KilnPlaque, Icon, FinRail, Lantern,
 * Settle, TowerIgnition, GateOpen.
 */
import { useEffect, useState } from "react";
import {
  ClipboardList,
  Cascade,
  Sheen,
  KilnPlaque,
  Icon,
  FinRail,
  Lantern,
  Settle,
  TowerIgnition,
  GateOpen,
  type TowerStage,
} from "../senko";
import { ME, FRIENDS, SESSIONS } from "./data";
import type { ScreenProps } from "./types";

/** who has confirmed in the joined lobby — the rest are still deciding */
const READY = new Set(["corey", "mika", "ren"]);

/** what the service does between "start" and a seat in the world */
const LAUNCH_STAGES: TowerStage[] = [
  { id: "l1", label: "allocating" },
  { id: "l2", label: "syncing roster" },
  { id: "l3", label: "loading region" },
  { id: "l4", label: "ready" },
];

/** the tower draws its own silhouette before a floor can light */
const LEAD_MS = 900;
const STAGE_MS = 700;
/** every floor lit: the tower flares, and only then does the gate take over */
const FLARE_MS = 820;
/** the leaves swing shut and land before the overlay leaves */
const SHUT_MS = 1000;

type Launch = "off" | "loading" | "open" | "closing";

export function Lobby({ go }: ScreenProps) {
  const [joinedId, setJoinedId] = useState(SESSIONS[0].id);
  const [confirming, setConfirming] = useState(false);
  const [launch, setLaunch] = useState<Launch>("off");
  const [stage, setStage] = useState(0);

  const joined = SESSIONS.find((s) => s.id === joinedId) ?? SESSIONS[0];
  const roster = [ME, ...FRIENDS];
  const readyCount = roster.filter((p) => READY.has(p.id)).length;
  const fill = joined.players / joined.capacity;

  // The launch runs on its own clock. `launch` alone drives it, so nothing
  // set in here may join the dependency list.
  useEffect(() => {
    if (launch !== "loading") return;
    const timers = LAUNCH_STAGES.map((_, i) =>
      window.setTimeout(() => setStage(i), LEAD_MS + i * STAGE_MS)
    );
    const lit = LEAD_MS + LAUNCH_STAGES.length * STAGE_MS;
    // past the last floor is `done`: the tower dips and flares
    timers.push(window.setTimeout(() => setStage(LAUNCH_STAGES.length), lit));
    timers.push(window.setTimeout(() => setLaunch("open"), lit + FLARE_MS));
    return () => timers.forEach(clearTimeout);
  }, [launch]);

  useEffect(() => {
    if (launch !== "closing") return;
    const t = window.setTimeout(() => {
      setLaunch("off");
      setStage(0);
    }, SHUT_MS);
    return () => clearTimeout(t);
  }, [launch]);

  return (
    <div className="flex flex-col gap-10">
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm uppercase tracking-widest" style={{ color: "var(--sk-ink-soft)" }}>
            Sessions
          </h2>
          <span className="text-xs italic" style={{ color: "var(--sk-ink-soft)" }}>
            pick one to join
          </span>
        </div>
        <ClipboardList
          items={SESSIONS.map((s) => ({
            id: s.id,
            title: s.name,
            detail: `${s.mode} · ${s.region}`,
            price: `${s.players}/${s.capacity}`,
            soldOut: s.state === "full",
          }))}
          onSelect={(item) => setJoinedId(item.id)}
        />
      </section>

      <Settle>
        <section
          className="border p-6"
          style={{
            borderColor: "var(--sk-rule)",
            borderRadius: "var(--sk-radius)",
            background: "var(--sk-surface)",
          }}
        >
          <header className="flex items-baseline justify-between gap-4">
            <div>
              <h2 className="text-2xl">{joined.name}</h2>
              <p className="mt-1 text-sm italic" style={{ color: "var(--sk-ink-soft)" }}>
                {joined.mode} · {joined.region} · {joined.state}
              </p>
            </div>
            <span className="shrink-0 text-sm" style={{ color: "var(--sk-ink-soft)" }}>
              {readyCount} of {roster.length} ready
            </span>
          </header>

          <h3
            className="mb-3 mt-6 text-sm uppercase tracking-widest"
            style={{ color: "var(--sk-ink-soft)" }}
          >
            Roster
          </h3>
          <Cascade className="gap-2">
            {roster.map((p) => {
              const ready = READY.has(p.id);
              return (
                /* the laminate on each card catches the light as you pass it */
                <Sheen key={p.id}>
                  <div
                    className="flex w-full items-center gap-3 border px-3 py-2"
                    style={{
                      borderColor: "var(--sk-rule)",
                      borderRadius: "var(--sk-radius)",
                      background: "var(--sk-surface-raised)",
                    }}
                  >
                    <KilnPlaque seed={p.id} size={40} />
                    <div className="min-w-0">
                      <p className="text-[0.98rem]">
                        {p.handle}
                        {p.id === ME.id && (
                          <span className="ml-1.5 text-xs" style={{ color: "var(--sk-ink-soft)" }}>
                            you
                          </span>
                        )}
                      </p>
                      <p className="text-xs italic" style={{ color: "var(--sk-ink-soft)" }}>
                        {p.title} · level {p.level}
                      </p>
                    </div>
                    <span
                      className="ml-auto flex shrink-0 items-center gap-1.5 text-xs"
                      style={{ color: ready ? "var(--sk-ink)" : "var(--sk-ink-soft)" }}
                    >
                      {/* check has no lit element, so it takes multi to gain accent ink */}
                      <Icon
                        name={ready ? "check" : "close"}
                        size={15}
                        tone={ready ? "multi" : "mono"}
                      />
                      {ready ? "ready" : "waiting"}
                    </span>
                  </div>
                </Sheen>
              );
            })}
          </Cascade>

          <div className="mt-6">
            <FinRail
              progress={fill}
              seed={`lobby-${joined.id}`}
              label={`${joined.players} of ${joined.capacity} seats filled`}
            />
          </div>

          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="mt-6 flex items-center gap-2 px-4 py-2 text-sm"
            style={{
              background: "var(--sk-accent)",
              color: "var(--sk-surface)",
              borderRadius: "var(--sk-radius)",
            }}
          >
            Start session <Icon name="arrow-right" size={15} />
          </button>
        </section>
      </Settle>

      <Lantern open={confirming} onClose={() => setConfirming(false)}>
        <h3 className="text-xl">Start {joined.name}?</h3>
        <p className="mt-2 text-sm" style={{ color: "var(--sk-ink-soft)" }}>
          {roster.length - readyCount} players have not marked ready. Starting closes the lobby.
        </p>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="border px-4 py-2 text-sm"
            style={{ borderColor: "var(--sk-rule)", borderRadius: "var(--sk-radius)" }}
          >
            wait
          </button>
          <button
            type="button"
            /* the session is brought up in front of you, then you walk in */
            onClick={() => {
              setConfirming(false);
              setStage(0);
              setLaunch("loading");
            }}
            className="px-4 py-2 text-sm"
            style={{
              background: "var(--sk-accent)",
              color: "var(--sk-surface)",
              borderRadius: "var(--sk-radius)",
            }}
          >
            start
          </button>
        </div>
      </Lantern>

      {/* The gate is mounted shut behind the tower, so the swing is a real
          change of state rather than a panel that arrives already open. */}
      {launch !== "off" && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-6"
          style={{ background: "color-mix(in oklab, var(--sk-night) 90%, transparent)" }}
        >
          <GateOpen open={launch === "open"} className="w-[min(30rem,92vw)]">
            <div
              className="px-6 py-7 text-center"
              style={{ background: "var(--sk-surface)", color: "var(--sk-ink)" }}
            >
              <p
                className="text-xs uppercase tracking-widest"
                style={{ color: "var(--sk-ink-soft)" }}
              >
                Session ready
              </p>
              <h3 className="mt-2 text-2xl">{joined.name}</h3>
              <p className="mt-1 text-sm italic" style={{ color: "var(--sk-ink-soft)" }}>
                {joined.mode} · {joined.region} · {roster.length} on the roster, {readyCount} ready
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setLaunch("closing")}
                  className="border px-4 py-2 text-sm"
                  style={{
                    borderColor: "var(--sk-rule)",
                    borderRadius: "var(--sk-radius)",
                    color: "var(--sk-ink)",
                  }}
                >
                  return to lobby
                </button>
                <button
                  type="button"
                  /* the session runs outside the hub; its result lands in standings */
                  onClick={() => {
                    setLaunch("off");
                    setStage(0);
                    go("standings");
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm"
                  style={{
                    background: "var(--sk-accent)",
                    color: "var(--sk-surface)",
                    borderRadius: "var(--sk-radius)",
                  }}
                >
                  standings <Icon name="arrow-right" size={15} />
                </button>
              </div>
            </div>
          </GateOpen>
        </div>
      )}

      {launch === "loading" && (
        <TowerIgnition
          fullscreen
          stages={LAUNCH_STAGES}
          current={stage}
          done={stage >= LAUNCH_STAGES.length}
        />
      )}
    </div>
  );
}
