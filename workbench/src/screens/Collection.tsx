/* Senko 線弧 — Collection screen.
 * The shelf: what has been fired, what is still boxed. Filter the glaze
 * grid, open a sealed kiln box, watch the completion rail climb. A piece
 * you own opens behind a lattice and is shown through an arch.
 * Uses: GlazeGrid, BlindBox, KilnPlaque, FinRail, Icon, Settle, Scaffold,
 * HoseUnspool, LatticeWeave, ArchAperture.
 */
import { useEffect, useState } from "react";
import {
  GlazeGrid,
  BlindBox,
  KilnPlaque,
  FinRail,
  Icon,
  Settle,
  Scaffold,
  HoseUnspool,
  LatticeWeave,
  ArchAperture,
} from "../senko";
import { COLLECTION, type CollectionItem } from "./data";
import type { ScreenProps } from "./types";

type Filter = "all" | CollectionItem["rarity"];
const FILTERS: Filter[] = ["all", "common", "rare", "kiln"];

/* glaze is a material: cells keep craft-palette ink in every mode */
const RARITY_INK: Record<CollectionItem["rarity"], string> = {
  common: "var(--color-ink-500)",
  rare: "var(--color-teal-milk)",
  kiln: "var(--color-amber-700)",
};

/** the line a collector reads aloud when the piece comes off the shelf */
const FLAVOUR: Record<string, string> = {
  c1: "Cut for the light at four o'clock, and useless at every other hour.",
  c2: "The gap between two tiles, fired as a piece in its own right.",
  c3: "Held a pine upright for ninety years. Retired with honours.",
  c4: "Copper left out in the weather until the weather signed it.",
  c5: "Six floors up, one lamp lit, nobody home.",
  c6: "The maker's mark. One tile in each firing is allowed to carry it.",
  c7: "Yellow for eleven days a year, and worth the other three hundred.",
  c8: "Coiled behind glass since 1974 and never once paid out.",
  c9: "Half a doorway — and the half that decides who comes in.",
  c10: "Turns the sun into stripes, and the stripes into an afternoon.",
  c11: "Nobody planted it. Nobody has moved it.",
  c12: "Trimmed at dusk by a hand that never signs its work.",
};

/** the shelf is re-propped while the filter re-fires */
const REBUILD_MS = 450;
/** the lattice finishes, the panel seats, and only then does the arch open */
const APERTURE_MS = 1150;
const SYNC_MS = 2500;

export function Collection({ go }: ScreenProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [opened, setOpened] = useState<ReadonlySet<string>>(new Set());
  const [rebuilding, setRebuilding] = useState(false);
  const [detail, setDetail] = useState<CollectionItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [aperture, setAperture] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [sync, setSync] = useState(0);

  const has = (item: CollectionItem) => item.acquired || opened.has(item.id);
  const heldCount = COLLECTION.filter(has).length;
  const fraction = heldCount / COLLECTION.length;
  const shown = filter === "all" ? COLLECTION : COLLECTION.filter((c) => c.rarity === filter);
  // the maker's mark rides the Kutani Seal wherever the filter puts it
  const markIndex = shown.findIndex((c) => c.id === "c6");
  const sealed = COLLECTION.filter((c) => c.rarity === "kiln" && !c.acquired);
  const stillSealed = sealed.filter((c) => !opened.has(c.id)).length;

  // A new filter re-props the shelf. `filter` is a dependency so a second
  // click restarts the prop rather than inheriting the first click's clock.
  useEffect(() => {
    if (!rebuilding) return;
    const t = window.setTimeout(() => setRebuilding(false), REBUILD_MS);
    return () => clearTimeout(t);
  }, [rebuilding, filter]);

  useEffect(() => {
    if (!detailOpen) {
      setAperture(false);
      return;
    }
    const t = window.setTimeout(() => setAperture(true), APERTURE_MS);
    return () => clearTimeout(t);
  }, [detailOpen]);

  useEffect(() => {
    if (!syncing) return;
    let raf = 0;
    let start = 0;
    const tick = (t: number) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / SYNC_MS);
      setSync(p);
      if (p < 1) raf = requestAnimationFrame(tick);
      else setSyncing(false);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [syncing]);

  const cell = "flex aspect-square w-full flex-col items-center justify-center gap-1 px-2 text-center";

  return (
    <div className="flex flex-col gap-10">
      <Settle>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl">Collection</h1>
            <p className="mt-1 text-sm italic" style={{ color: "var(--sk-ink-soft)" }}>
              {heldCount} of {COLLECTION.length} collected
              {stillSealed > 0 && ` · ${stillSealed} still sealed`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => go("profile")}
            className="flex shrink-0 items-center gap-1.5 text-sm"
            style={{ color: "var(--sk-accent)" }}
          >
            your profile <Icon name="arrow-right" size={15} />
          </button>
        </div>
      </Settle>

      <section className="flex flex-wrap items-center gap-x-8 gap-y-6">
        <div className="min-w-[15rem] flex-1">
          <h2 className="mb-1 text-sm uppercase tracking-widest" style={{ color: "var(--sk-ink-soft)" }}>
            Completion
          </h2>
          <FinRail progress={fraction} label={`${Math.round(fraction * 100)}% of the shelf fired`} seed="collection" />
        </div>
        {/* the shelf checking itself against the kiln: the coil pays out once */}
        <div className="flex shrink-0 flex-col items-center gap-2">
          <HoseUnspool progress={sync} size={104} label="collection sync" />
          <button
            type="button"
            onClick={() => {
              setSync(0);
              setSyncing(true);
            }}
            disabled={syncing}
            className="border px-3 py-1.5 text-xs"
            style={{
              borderColor: "var(--sk-rule)",
              borderRadius: "var(--sk-radius)",
              color: "var(--sk-ink)",
              opacity: syncing ? 0.55 : 1,
            }}
          >
            {syncing ? "syncing…" : sync >= 1 ? "sync again" : "sync collection"}
          </button>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between gap-4">
          <h2 className="text-sm uppercase tracking-widest" style={{ color: "var(--sk-ink-soft)" }}>
            Pieces
          </h2>
          <div role="group" aria-label="filter by rarity" className="flex gap-1.5">
            {FILTERS.map((f) => {
              const on = filter === f;
              return (
                <button
                  key={f}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    if (on) return;
                    setFilter(f);
                    setRebuilding(true);
                  }}
                  className="border px-3 py-1 text-xs"
                  style={{
                    borderColor: on ? "var(--sk-accent)" : "var(--sk-rule)",
                    borderRadius: "var(--sk-radius)",
                    background: on ? "var(--sk-accent)" : "transparent",
                    color: on ? "var(--sk-surface)" : "var(--sk-ink)",
                  }}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>

        {/* loading as visible care: the shelf is propped while it re-fires */}
        {rebuilding ? (
          <Scaffold lines={4} seed={`shelf:${filter}`} label={`re-firing the ${filter} shelf`} />
        ) : (
          <GlazeGrid columns={4} markIndex={markIndex} mark="線" seed="collection">
            {shown.map((item) => {
              const held = has(item);
              const face = (
                <>
                  {!held && <Icon name="close" size={16} aria-label="not yet collected" />}
                  <span className="text-[0.82rem] leading-tight">{item.name}</span>
                  <span
                    className="text-[0.6rem] uppercase tracking-widest"
                    style={{ color: RARITY_INK[item.rarity] }}
                  >
                    {item.rarity}
                  </span>
                </>
              );
              // only a piece you hold has a record to open
              return held ? (
                <button
                  key={item.id}
                  type="button"
                  className={cell}
                  aria-label={`open ${item.name}`}
                  onClick={() => {
                    setDetail(item);
                    setDetailOpen(true);
                  }}
                >
                  {face}
                </button>
              ) : (
                <div
                  key={item.id}
                  className={cell}
                  style={{ opacity: 0.45, filter: "saturate(0.3)" }}
                >
                  {face}
                </div>
              );
            })}
          </GlazeGrid>
        )}
      </section>

      <section>
        <h2 className="mb-1 text-sm uppercase tracking-widest" style={{ color: "var(--sk-ink-soft)" }}>
          Sealed rewards
        </h2>
        <p className="mb-3 text-sm italic" style={{ color: "var(--sk-ink-soft)" }}>
          Kiln-rarity pieces arrive boxed. Open one and it takes its place on the shelf.
        </p>
        <BlindBox
          columns={2}
          className="max-w-sm"
          items={sealed.map((c) => ({
            id: c.id,
            front: "kiln",
            reveal: <KilnPlaque seed={c.id} label={c.name} size={72} />,
          }))}
          onReveal={(id) => setOpened((prev) => new Set(prev).add(id))}
        />
      </section>

      {/* Mounted shut so the first open weaves. It renders nothing until
          then, and it unweaves on the scrim, on Escape, or on the button. */}
      <LatticeWeave
        open={detailOpen}
        label={detail ? `${detail.name} record` : "piece record"}
        onClose={() => setDetailOpen(false)}
      >
        {detail && (
          <div className="flex flex-col items-center gap-5 text-center">
            <div>
              <h3 className="text-2xl">{detail.name}</h3>
              <p
                className="mt-1 text-[0.66rem] uppercase tracking-widest"
                style={{ color: RARITY_INK[detail.rarity] }}
              >
                {detail.rarity}
              </p>
            </div>
            {/* the piece is not handed over — it is revealed through the arch */}
            <ArchAperture open={aperture} aspect="3/4" className="w-44">
              <div className="flex h-full w-full items-center justify-center">
                <KilnPlaque seed={detail.id} label={detail.name} size={112} />
              </div>
            </ArchAperture>
            <p className="max-w-sm text-sm italic" style={{ color: "var(--sk-ink-soft)" }}>
              {FLAVOUR[detail.id] ?? "No record survives of this firing."}
            </p>
            <button
              type="button"
              onClick={() => setDetailOpen(false)}
              className="border px-4 py-2 text-sm"
              style={{
                borderColor: "var(--sk-rule)",
                borderRadius: "var(--sk-radius)",
                color: "var(--sk-ink)",
              }}
            >
              back to the shelf
            </button>
          </div>
        )}
      </LatticeWeave>
    </div>
  );
}
