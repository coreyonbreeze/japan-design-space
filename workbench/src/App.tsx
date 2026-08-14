/* Senko 線弧 workbench — a plain viewer. The components carry all character.
 * Every section cites its source photos; see field-notes.md for the readings.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Ignite, Cascade, Sheen, Settle,
  KilnPlaque, GlazeGrid, ClipboardList, Lantern,
  SignDisc, Directory, Obi, ProvenancePlaque,
  Arcade, MenuCard, FinRail, BalconyStack, Scaffold, BlindBox,
  Icon, ICON_NAMES, PaletteStrip, PALETTES,
  KilnFiring, useDuskSweep, DuskSweepOverlay, NorenSplit,
  TowerIgnition, HoseUnspool, GateOpen, ArchAperture,
  LouverWipe, LatticeWeave, FusumaSlide, LeafScatter, ProvenanceRubbing,
} from "./senko";

function Section({ id, title, source, principle, replay, autoLoop, children }: {
  id: string; title: string; source: string; principle: string;
  /** show a replay control and let the global loop re-fire this demo */
  replay?: boolean; autoLoop?: boolean; children: ReactNode;
}) {
  const [gen, setGen] = useState(0);
  useEffect(() => {
    if (!replay || !autoLoop) return;
    const t = setInterval(() => setGen((g) => g + 1), 5200);
    return () => clearInterval(t);
  }, [replay, autoLoop]);
  return (
    <section id={id} className="mb-20 scroll-mt-8">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-2xl" style={{ letterSpacing: "0.01em" }}>{title}</h2>
        {replay && (
          <button
            type="button"
            onClick={() => setGen((g) => g + 1)}
            className="shrink-0 border px-2.5 py-0.5 text-xs"
            style={{ borderColor: "var(--sk-rule)", borderRadius: "var(--sk-radius)", color: "var(--sk-ink-soft)", background: "var(--sk-surface)" }}
          >
            ↻ replay
          </button>
        )}
      </div>
      <p className="mb-6 mt-1 text-sm italic" style={{ color: "var(--sk-ink-soft)" }}>
        {source} — {principle}
      </p>
      {/* key bump remounts the demo so every entrance animation re-fires */}
      <div key={gen}>{children}</div>
    </section>
  );
}

const NAV = [
  "primitives", "experiences", "mechanisms", "palettes", "kiln-plaque", "sign-disc", "clipboard", "arcade", "directory",
  "obi", "menu-card", "glaze-grid", "fin-rail", "balcony", "lantern",
  "scaffold", "plaque", "icons", "blind-box",
] as const;

export default function App() {
  const [register, setRegister] = useState<"paper" | "market">("paper");
  const dusk = useDuskSweep("day");
  const mode = dusk.mode;
  const [autoLoop, setAutoLoop] = useState(false);
  const [firing, setFiring] = useState<number | null>(null);
  const [noren, setNoren] = useState("a");
  const [louver, setLouver] = useState("a");
  const [gate, setGate] = useState(false);
  const [aperture, setAperture] = useState(false);
  const [weave, setWeave] = useState(false);
  const [fusuma, setFusuma] = useState(false);
  const [scattered, setScattered] = useState(false);
  const [tower, setTower] = useState(0);

  const firingRaf = useRef(0);
  useEffect(() => () => cancelAnimationFrame(firingRaf.current), []);
  const runFiring = () => {
    cancelAnimationFrame(firingRaf.current);
    const started = performance.now();
    const tick = () => {
      const p = Math.min(1, (performance.now() - started) / 3000);
      setFiring(p);
      if (p < 1) firingRaf.current = requestAnimationFrame(tick);
      else window.setTimeout(() => setFiring(null), 420);
    };
    firingRaf.current = requestAnimationFrame(tick);
  };
  const [seed, setSeed] = useState("901");
  const [disc, setDisc] = useState("overview");
  const [floor, setFloor] = useState<string | undefined>("f9");
  const [lanternOpen, setLanternOpen] = useState(false);

  return (
    <div data-register={register} data-mode={mode === "night" ? "night" : undefined} style={{ background: "var(--sk-ground)", color: "var(--sk-ink)", fontFamily: "var(--sk-font)" }}>
      <div className="mx-auto max-w-3xl px-6 py-14">
        <header className="mb-14">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl">Senko <span style={{ color: "var(--sk-ink-soft)" }}>線弧</span></h1>
              <p className="mt-2 italic" style={{ color: "var(--sk-ink-soft)" }}>
                line + arc · a component library extracted from 65 photographs, Aug 7–12
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <button
                type="button"
                onClick={() => setRegister(register === "paper" ? "market" : "paper")}
                className="border px-4 py-1.5 text-sm"
                style={{ borderColor: "var(--sk-rule)", borderRadius: "var(--sk-radius)", background: "var(--sk-surface)" }}
              >
                register: <b>{register}</b> ⇄
              </button>
              <button
                type="button"
                onClick={dusk.toggle}
                className="border px-4 py-1.5 text-sm"
                style={{ borderColor: "var(--sk-rule)", borderRadius: "var(--sk-radius)", background: "var(--sk-surface)" }}
              >
                mode: <b>{mode}</b> {mode === "day" ? "☾" : "☀"}
              </button>
              <button
                type="button"
                onClick={() => setAutoLoop(!autoLoop)}
                className="border px-4 py-1.5 text-sm"
                style={{ borderColor: "var(--sk-rule)", borderRadius: "var(--sk-radius)", background: "var(--sk-surface)", color: autoLoop ? "var(--sk-accent)" : "inherit" }}
              >
                loop demos: <b>{autoLoop ? "on" : "off"}</b> ⟳
              </button>
            </div>
          </div>
          <nav className="mt-8 flex flex-wrap gap-x-4 gap-y-1 border-y py-3 text-xs uppercase tracking-widest" style={{ borderColor: "var(--sk-rule)" }}>
            {NAV.map((n) => (
              <a key={n} href={`#${n}`} className="hover:underline" style={{ color: "var(--sk-ink-soft)" }}>{n}</a>
            ))}
          </nav>
        </header>

        <Section replay autoLoop={autoLoop} id="primitives" title="Motion primitives" source="IMG_2049 / 2052 / 2063 / 2075 / 2024" principle="ignite, cascade, sheen, settle — light and care as motion">
          <div className="grid grid-cols-2 gap-4">
            <Ignite><div className="p-6" style={{ background: "var(--sk-surface)", borderRadius: "var(--sk-radius)" }}>Ignite — warms up in view</div></Ignite>
            <Settle delay={0.15}><div className="p-6 border" style={{ borderColor: "var(--sk-rule)", borderRadius: "var(--sk-radius)" }}>Settle — caught by the prop</div></Settle>
            <Sheen className="col-span-2"><div className="p-6" style={{ background: "var(--color-glaze-0)", color: "var(--color-ink-900)", borderRadius: "var(--sk-radius)" }}>Sheen — laminate catches light on hover</div></Sheen>
          </div>
          <Cascade zigzag className="mt-4 gap-2">
            {["one", "two", "three", "four"].map((s) => (
              <div key={s} className="border px-4 py-2" style={{ borderColor: "var(--sk-rule)", background: "var(--sk-surface)", borderRadius: "var(--sk-radius)" }}>
                Cascade {s} — stair-tower stagger
              </div>
            ))}
          </Cascade>
        </Section>

        <Section id="experiences" title="Experiences" source="IMG_2050 · firing, IMG_2093 · golden hour, IMG_2058 · shop curtain" principle="screen-level events with mechanism and weight; drawn marks step, light stays smooth">
          <div className="flex flex-wrap gap-3">
            {[
              { label: "run kiln firing", on: runFiring },
              { label: "run dusk sweep", on: dusk.toggle },
              { label: "run noren split", on: () => setNoren(noren === "a" ? "b" : "a") },
            ].map((b) => (
              <button
                key={b.label}
                type="button"
                onClick={b.on}
                className="border px-4 py-2 text-sm"
                style={{ borderColor: "var(--sk-rule)", borderRadius: "var(--sk-radius)", background: "var(--sk-surface)" }}
              >
                {b.label}
              </button>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-end gap-8">
            <div>
              <KilnFiring seed="inline-a" size={116} />
              <p className="mt-2 text-[0.7rem]" style={{ color: "var(--sk-ink-soft)" }}>indeterminate</p>
            </div>
            <div>
              <KilnFiring seed="inline-b" size={116} progress={0.42} />
              <p className="mt-2 text-[0.7rem]" style={{ color: "var(--sk-ink-soft)" }}>progress 42%</p>
            </div>
            <div>
              <KilnFiring seed="inline-c" size={116} progress={1} />
              <p className="mt-2 text-[0.7rem]" style={{ color: "var(--sk-ink-soft)" }}>fired</p>
            </div>
          </div>

          <NorenSplit
            routeKey={noren}
            className="mt-8 overflow-hidden border"
            mark={<span style={{ fontSize: "1.4rem" }}>線弧</span>}
          >
            <div
              className="flex h-44 items-center justify-center"
              style={{ background: "var(--sk-surface)", color: "var(--sk-ink)" }}
            >
              <p className="italic">{noren === "a" ? "view A — outside the shop" : "view B — through the curtain"}</p>
            </div>
          </NorenSplit>
        </Section>

        <Section id="mechanisms" title="Mechanisms" source="IMG_2063 · stair towers, IMG_2113 · hose ring, IMG_2089 · plank gate, IMG_2032 · louvers, IMG_2037 · lattice, IMG_2086 · sliding screens" principle="things open, fall, slide and unspool — they do not fade">
          <div className="grid gap-10 sm:grid-cols-2">
            <div>
              <p className="mb-3 text-xs uppercase tracking-widest" style={{ color: "var(--sk-ink-soft)" }}>
                TowerIgnition — boot, floor by floor
              </p>
              <TowerIgnition
                stages={[
                  { id: "t1", label: "tokens" },
                  { id: "t2", label: "fonts" },
                  { id: "t3", label: "profile" },
                  { id: "t4", label: "sessions" },
                ]}
                current={tower}
                done={tower >= 4}
              />
              <button
                type="button"
                onClick={() => setTower((t) => (t >= 4 ? 0 : t + 1))}
                className="mt-3 border px-3 py-1.5 text-xs"
                style={{ borderColor: "var(--sk-rule)", borderRadius: "var(--sk-radius)" }}
              >
                {tower >= 4 ? "reset" : "next stage"}
              </button>
            </div>

            <div>
              <p className="mb-3 text-xs uppercase tracking-widest" style={{ color: "var(--sk-ink-soft)" }}>
                HoseUnspool — the coil pays out
              </p>
              <div className="flex items-end gap-6">
                <HoseUnspool progress={0.15} size={120} />
                <HoseUnspool progress={0.62} size={120} />
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs uppercase tracking-widest" style={{ color: "var(--sk-ink-soft)" }}>
                GateOpen — ceremonial entry
              </p>
              <GateOpen open={gate}>
                <div className="flex h-40 items-center justify-center" style={{ background: "var(--sk-surface)" }}>
                  <p className="italic">beyond the gate</p>
                </div>
              </GateOpen>
              <button
                type="button"
                onClick={() => setGate(!gate)}
                className="mt-3 border px-3 py-1.5 text-xs"
                style={{ borderColor: "var(--sk-rule)", borderRadius: "var(--sk-radius)" }}
              >
                {gate ? "close the gate" : "open the gate"}
              </button>
            </div>

            <div>
              <p className="mb-3 text-xs uppercase tracking-widest" style={{ color: "var(--sk-ink-soft)" }}>
                ArchAperture — the arch is the aperture
              </p>
              <ArchAperture open={aperture} aspect="16 / 10">
                <img src="/demo/IMG_2052-motif-arch-glow.jpg" alt="" className="h-full w-full object-cover" />
              </ArchAperture>
              <button
                type="button"
                onClick={() => setAperture(!aperture)}
                className="mt-3 border px-3 py-1.5 text-xs"
                style={{ borderColor: "var(--sk-rule)", borderRadius: "var(--sk-radius)" }}
              >
                {aperture ? "close" : "open the arch"}
              </button>
            </div>
          </div>

          <div className="mt-10">
            <p className="mb-3 text-xs uppercase tracking-widest" style={{ color: "var(--sk-ink-soft)" }}>
              LouverWipe — the blind turns and the view swaps behind it
            </p>
            <LouverWipe routeKey={louver} className="overflow-hidden border" announce={`view ${louver}`}>
              <div className="flex h-40 items-center justify-center" style={{ background: "var(--sk-surface)" }}>
                <p className="italic">{louver === "a" ? "view A — blind open" : "view B — turned through"}</p>
              </div>
            </LouverWipe>
            <button
              type="button"
              onClick={() => setLouver(louver === "a" ? "b" : "a")}
              className="mt-3 border px-3 py-1.5 text-xs"
              style={{ borderColor: "var(--sk-rule)", borderRadius: "var(--sk-radius)" }}
            >
              turn the louvers
            </button>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            {[
              { label: weave ? "unweave" : "weave the lattice", on: () => setWeave(!weave) },
              { label: fusuma ? "slide shut" : "slide the screen", on: () => setFusuma(!fusuma) },
              { label: scattered ? "restore" : "scatter the leaves", on: () => setScattered(!scattered) },
            ].map((b) => (
              <button
                key={b.label}
                type="button"
                onClick={b.on}
                className="border px-4 py-2 text-sm"
                style={{ borderColor: "var(--sk-rule)", borderRadius: "var(--sk-radius)", background: "var(--sk-surface)" }}
              >
                {b.label}
              </button>
            ))}
          </div>

          <div className="mt-6">
            <LeafScatter dismissed={scattered} seed="demo-leaves">
              <div
                className="flex h-28 items-center justify-center border"
                style={{ background: "var(--sk-surface)", borderColor: "var(--sk-rule)", borderRadius: "var(--sk-radius)" }}
              >
                <p className="italic">dismiss me and I fall like ginkgo leaves</p>
              </div>
            </LeafScatter>
          </div>

          <div className="mt-10">
            <p className="mb-3 text-xs uppercase tracking-widest" style={{ color: "var(--sk-ink-soft)" }}>
              ProvenanceRubbing — drag across the plate to raise the record
            </p>
            <ProvenanceRubbing>
              <ProvenancePlaque
                title="Senko 線弧"
                registered
                rows={[
                  { term: "Photographed", description: "Tokyo · Kanazawa, Aug 7–12" },
                  { term: "Extracted", description: "145 derivatives" },
                  { term: "Fired", description: "12 experiences, 6 screens" },
                ]}
              />
            </ProvenanceRubbing>
          </div>

          <LatticeWeave open={weave} onClose={() => setWeave(false)} label="woven panel">
            <div className="p-6">
              <h3 className="text-xl">Woven in</h3>
              <p className="mt-2 text-sm" style={{ color: "var(--sk-ink-soft)" }}>
                Diagonal members draw from both directions and cross. Closing unweaves them.
              </p>
            </div>
          </LatticeWeave>

          <FusumaSlide open={fusuma} onClose={() => setFusuma(false)} label="sliding screen">
            <div className="p-6">
              <h3 className="text-xl">Fusuma</h3>
              <p className="mt-2 text-sm" style={{ color: "var(--sk-ink-soft)" }}>
                It sticks, then glides, then meets the jamb. Closing takes longer than opening.
              </p>
            </div>
          </FusumaSlide>
        </Section>

        <Section id="palettes" title="Palettes" source="library/palettes.json · 32 photo extractions" principle="curated color stories; every hex measured from a frame — click a chip to copy">
          <div className="flex flex-col gap-8">
            {PALETTES.map((p) => (
              <PaletteStrip key={p.id} palette={p} />
            ))}
          </div>
        </Section>

        <Section id="kiln-plaque" title="KilnPlaque" source="IMG_2050 · Kutani room signs, IMG_2043" principle="lines and arcs only; each firing slightly different">
          <div className="flex flex-wrap items-end gap-4">
            {["901", "902", "903", "1004", "corey", "onbreeze"].map((s) => (
              <KilnPlaque key={s} seed={s} label={s} size={92} />
            ))}
          </div>
          <label className="mt-5 block text-sm" style={{ color: "var(--sk-ink-soft)" }}>
            fire your own:&nbsp;
            <input
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              className="border px-2 py-1"
              style={{ borderColor: "var(--sk-rule)", background: "var(--sk-surface)", borderRadius: "var(--sk-radius)", fontFamily: "inherit" }}
            />
          </label>
          <div className="mt-3"><KilnPlaque seed={seed} label={seed} size={120} /></div>
        </Section>

        <Section id="sign-disc" title="SignDisc" source="IMG_2038 · eight businesses, one shape" principle="uniformity is the design; the active tenant ignites">
          <SignDisc
            items={[
              { id: "overview", label: "Overview" },
              { id: "projects", label: "Projects", sublabel: "12" },
              { id: "library", label: "Library" },
              { id: "billing", label: "Billing" },
              { id: "settings", label: "Settings" },
            ]}
            activeId={disc}
            onSelect={(id: string) => setDisc(id)}
          />
        </Section>

        <Section replay autoLoop={autoLoop} id="clipboard" title="ClipboardList" source="IMG_2055 · hanging clipboard menu" principle="numbered, hanging, honest about stock">
          <ClipboardList
            items={[
              { id: "p1", title: "Starter", detail: "3 seats · community support", price: "$29/mo" },
              { id: "p2", title: "Growth", detail: "unlimited seats · analytics", price: "$79/mo" },
              { id: "p3", title: "Enterprise pilot", detail: "dedicated support", price: "$390/mo", soldOut: true },
              { id: "p4", title: "Self-hosted", detail: "annual license", price: "$990/yr" },
            ]}
          />
        </Section>

        <Section replay autoLoop={autoLoop} id="arcade" title="ArchFrame / Arcade" source="IMG_2044 · arch vignettes, IMG_2052 · night arcade" principle="the arch frames a story; at night, windows ignite one by one">
          <Arcade columns={3} night>
            {["IMG_2052-motif-arch-glow", "IMG_2044-motif-arch-vignettes", "IMG_2050-motif-kutani-plaques"].map((img) => (
              <img key={img} src={`/demo/${img}.jpg`} alt={img} className="h-full w-full object-cover" />
            ))}
          </Arcade>
        </Section>

        <Section id="directory" title="Directory" source="IMG_2042 · etched floor directory" principle="wayfinding as an architectural drawing; hovered floors light their windows, the elevator rides to your selection">
          <Directory
            floors={[
              { id: "f10", level: "10", label: "Admin & Access" },
              { id: "f9", level: "9", label: "Analytics" },
              { id: "f5", level: "5", label: "Automations", detail: "beta" },
              { id: "f2", level: "2", label: "Workspace" },
              { id: "f1", level: "1", label: "Onboarding" },
              { id: "b1", level: "B1", label: "Archive" },
            ]}
            activeId={floor}
            onSelect={(id: string) => setFloor(id)}
          />
          <p className="mb-2 mt-8 text-xs uppercase tracking-widest" style={{ color: "var(--sk-ink-soft)" }}>
            same component, circle glyphs
          </p>
          <Directory
            glyph="circle"
            floors={[
              { id: "s3", level: "03", label: "Signals" },
              { id: "s2", level: "02", label: "Streams" },
              { id: "s1", level: "01", label: "Base" },
            ]}
            activeId="s2"
          />
        </Section>

        <Section replay autoLoop={autoLoop} id="obi" title="Obi" source="IMG_2029 · photo-book cover" principle="90% quiet ground; one dense band carries all the words">
          <Obi band={{ title: "Field Notes, Vol. 1", meta: "132 entries · quarterly report" }}>
            <div className="flex h-56 items-center justify-center">
              <img src="/demo/IMG_2048-motif-milky-teal.jpg" alt="" className="h-40 w-64 object-cover" style={{ borderRadius: "var(--sk-radius)" }} />
            </div>
          </Obi>
        </Section>

        <Section id="menu-card" title="MenuCard" source="IMG_2024–2026 · laminated tonkatsu menu" principle="pastel block header, topping pills, a sticker when it's gone">
          <div className="grid grid-cols-2 gap-4">
            <MenuCard
              title="Studio Plan"
              subtitle="for small teams"
              price="$49/mo"
              media={<img src="/demo/IMG_2061-texture-oak-grain.jpg" alt="" className="h-full w-full object-cover" />}
              toppings={[{ label: "Extra seats", price: "+$9" }, { label: "Priority support", price: "+$15" }]}
              lore="Everything in Starter, plus shared libraries and review workflows."
              onAdd={() => {}}
            />
            <MenuCard
              title="Legacy Plan"
              price="$25/mo"
              headerColor="var(--color-sky)"
              toppings={[{ label: "Migration kit", price: "incl." }, { label: "Email support", price: "incl." }]}
              soldOut
            />
          </div>
        </Section>

        <Section id="glaze-grid" title="GlazeGrid" source="IMG_2060/2061 · handmade tiles, one signed" principle="an imperfect grid; one cell carries the maker's mark">
          <GlazeGrid columns={4} markIndex={5} mark="senko" seed="demo">
            {["kutani-plaques", "arch-glow", "maker-tile", "milky-teal", "disc-rail", "oak-grain", "propped-pine", "golden"].map((n) => {
              const file = {
                "kutani-plaques": "IMG_2050-motif-kutani-plaques", "arch-glow": "IMG_2052-motif-arch-glow",
                "maker-tile": "IMG_2060-motif-maker-tile", "milky-teal": "IMG_2048-motif-milky-teal",
                "disc-rail": "IMG_2038-motif-disc-rail", "oak-grain": "IMG_2061-texture-oak-grain",
                "propped-pine": "IMG_2075-motif-propped-pine", "golden": "IMG_2093-tone-golden",
              }[n];
              return <img key={n} src={`/demo/${file}.jpg`} alt={n} className="aspect-square w-full object-cover" />;
            })}
          </GlazeGrid>
        </Section>

        <Section replay autoLoop={autoLoop} id="fin-rail" title="FinRail" source="IMG_2032 · timber fin roofline, IMG_2090" principle="irregular fins, one rhythm; progress reads as lit fins">
          <FinRail progress={0.62} label="62% complete" />
        </Section>

        <Section replay autoLoop={autoLoop} id="balcony" title="BalconyStack" source="IMG_2063 · stair towers, IMG_2093 · golden hour" principle="steps zigzag; light climbs the stack">
          <BalconyStack
            golden
            steps={[
              { id: "s4", title: "Ship", detail: "hand the link over", status: "todo" },
              { id: "s3", title: "Verify", detail: "screenshot every state", status: "active" },
              { id: "s2", title: "Compose", detail: "tokens into components", status: "done" },
              { id: "s1", title: "Extract", detail: "65 photos, 145 cuts", status: "done" },
            ]}
          />
        </Section>

        <Section id="lantern" title="Lantern" source="IMG_2049 · lamps in darkness" principle="the page falls dark; one warm point holds the eye">
          <button
            type="button"
            onClick={() => setLanternOpen(true)}
            className="border px-4 py-2"
            style={{ borderColor: "var(--sk-rule)", background: "var(--sk-surface)", borderRadius: "var(--sk-radius)" }}
          >
            light the lantern
          </button>
          <Lantern open={lanternOpen} onClose={() => setLanternOpen(false)}>
            <h3 className="text-xl">A quiet confirmation</h3>
            <p className="mt-2 text-sm" style={{ color: "var(--sk-ink-soft)" }}>
              Nothing shouts. The darkness does the framing; the warmth does the pointing.
            </p>
            <button
              type="button"
              onClick={() => setLanternOpen(false)}
              className="mt-5 border px-4 py-2 text-sm"
              style={{ borderColor: "var(--sk-rule)", borderRadius: "var(--sk-radius)" }}
            >
              blow it out
            </button>
          </Lantern>
        </Section>

        <Section id="scaffold" title="Scaffold" source="IMG_2075–2082 · propped pines" principle="loading shown as visible care — the support is proud, not hidden">
          <Scaffold lines={3} seed="demo" />
        </Section>

        <Section id="plaque" title="ProvenancePlaque" source="IMG_2088 · preservation plaques, IMG_2077" principle="provenance displayed with ceremony">
          <ProvenancePlaque
            title="Japan Design Space"
            registered
            rows={[
              { term: "Photographed", description: "Tokyo · Kanazawa, Aug 7–12" },
              { term: "Extracted", description: "145 deterministic derivatives" },
              { term: "Fired", description: "19 components, 2 registers" },
            ]}
            footnote="登録有形文化財 — registered tangible design property"
          />
        </Section>

        <Section id="icons" title="Icons" source="IMG_2050 · line+arc law, IMG_2049 · the lamp" principle="every icon is lines and arcs only; one geometry, three inks — duo ignites the lit element, multi also re-inks the element you act on">
          {(["mono", "duo", "multi"] as const).map((tone) => (
            <div key={tone} className="mb-6">
              <p className="mb-2 text-xs uppercase tracking-widest" style={{ color: "var(--sk-ink-soft)" }}>{tone}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-3">
                {ICON_NAMES.map((n) => (
                  <div key={n} className="flex flex-col items-center gap-1">
                    <Icon name={n} tone={tone} size={22} aria-label={n} />
                    <span className="text-[0.6rem]" style={{ color: "var(--sk-ink-soft)" }}>{n}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Section>

        <div data-register="market">
          <Section replay autoLoop={autoLoop} id="blind-box" title="BlindBox" source="IMG_2110/2111 · SMISKI, IMG_2102 · hanafuda" principle="market register: the reveal is the product; hover to make it peek">
            <BlindBox
              columns={4}
              items={[
                { id: "no.1", reveal: <span style={{ fontSize: "2rem" }}>🏆</span> },
                { id: "no.2", reveal: <span style={{ fontSize: "2rem" }}>🗝️</span> },
                { id: "no.3", reveal: <span style={{ fontSize: "2rem" }}>🌟</span> },
                { id: "secret", reveal: <span style={{ fontSize: "2rem" }}>🎁</span> },
              ]}
            />
          </Section>
        </div>

        <footer className="mt-24 border-t pt-6 text-xs" style={{ borderColor: "var(--sk-rule)", color: "var(--sk-ink-soft)" }}>
          Senko 線弧 — extracted, not imagined. Sources: photos/ · field-notes.md · library/index.html
        </footer>
      </div>
      {firing !== null && <KilnFiring fullscreen progress={firing} seed="boot" label="firing the plaque" />}
      <DuskSweepOverlay sweeping={dusk.sweeping} />
    </div>
  );
}
