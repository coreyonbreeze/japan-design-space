/* Senko 線弧 — Settings screen.
 * The system showing its own knobs: a Directory as the section nav, louvers
 * turning between floors, palettes browsable as fired chips, toggles that
 * ignite, plans on a laminated menu, one dangerous door.
 * Uses: Directory, LouverWipe, PaletteStrip, MenuCard, ProvenanceRubbing,
 * ProvenancePlaque, Lantern, Icon, Cascade, Settle.
 */
import { useState } from "react";
import {
  Cascade,
  Directory,
  Icon,
  Lantern,
  LouverWipe,
  MenuCard,
  PALETTES,
  PaletteStrip,
  ProvenancePlaque,
  ProvenanceRubbing,
  Settle,
  type IconName,
} from "../senko";
import { ME } from "./data";
import type { ScreenProps } from "./types";

type SectionId = "appearance" | "motion" | "plan" | "account";

/* read top-down like a floor directory: 04 is the top floor */
const SECTIONS: { id: SectionId; level: string; label: string; detail: string }[] = [
  { id: "appearance", level: "04", label: "Appearance", detail: "palettes" },
  { id: "motion", level: "03", label: "Motion", detail: "cues" },
  { id: "plan", level: "02", label: "Plan", detail: "billing" },
  { id: "account", level: "01", label: "Account", detail: "record" },
];

/* four of the eight color stories — enough to browse, not enough to drown in */
const SHOWN_PALETTES = PALETTES.filter((p) => ["paper", "craft", "light", "market"].includes(p.id));

type PlanId = "keeper" | "master";

/* plans read as dishes on a laminated menu: a color block per tier, the
 * add-ons priced as toppings, the story at the bottom */
const PLANS: {
  id: PlanId;
  title: string;
  subtitle: string;
  price: string;
  headerColor: string;
  toppings: { label: string; price: string }[];
  lore: string;
}[] = [
  {
    id: "keeper",
    title: "Keeper",
    subtitle: "one kiln · one season at a time",
    price: "free",
    headerColor: "var(--color-mint)",
    toppings: [
      { label: "extra kiln slot", price: "¥200" },
      { label: "season replay", price: "¥150" },
      { label: "custom noren", price: "¥300" },
    ],
    lore: "What every account starts on. Fire, rank, and keep the plaques you win.",
  },
  {
    id: "master",
    title: "Kiln Master",
    subtitle: "four kilns · private lobbies · early glazes",
    price: "¥900 / mo",
    headerColor: "var(--color-sakura)",
    toppings: [
      { label: "extra kiln slot", price: "included" },
      { label: "season replay", price: "included" },
      { label: "custom noren", price: "¥150" },
    ],
    lore: "For keepers running more than one circuit a night.",
  },
];

interface ToggleRowProps {
  icon: IconName;
  label: string;
  description: string;
  on: boolean;
  onChange: (next: boolean) => void;
}

function ToggleRow({ icon, label, description, on, onChange }: ToggleRowProps) {
  return (
    <div
      className="flex items-center gap-4 border px-4 py-3"
      style={{
        borderColor: "var(--sk-rule)",
        borderRadius: "var(--sk-radius)",
        background: "var(--sk-surface)",
      }}
    >
      <Icon name={icon} size={18} tone={on ? "duo" : "mono"} />
      <div className="min-w-0 flex-1">
        <p className="text-[0.95rem]">{label}</p>
        <p className="mt-0.5 text-[0.78rem] italic" style={{ color: "var(--sk-ink-soft)" }}>
          {description}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={() => onChange(!on)}
        className="relative h-6 w-11 shrink-0"
        style={{
          borderRadius: 999,
          border: "1px solid var(--sk-rule)",
          background: on ? "var(--sk-glow-soft)" : "transparent",
          transition: "background var(--duration-beat-2) var(--ease-ignite)",
        }}
      >
        {/* the knob is a lamp: it slides, then warms */}
        <span
          aria-hidden
          className="absolute top-1/2 block h-4 w-4"
          style={{
            left: on ? "calc(100% - 1.25rem)" : "0.25rem",
            transform: "translateY(-50%)",
            borderRadius: 999,
            background: on ? "var(--sk-glow)" : "var(--sk-ink-soft)",
            boxShadow: on ? "0 0 8px 1px var(--sk-glow-soft)" : "none",
            transition:
              "left var(--duration-beat-2) var(--ease-settle), background var(--duration-beat-2) var(--ease-ignite)",
          }}
        />
      </button>
    </div>
  );
}

interface SliderRowProps {
  icon: IconName;
  label: string;
  description: string;
  value: number;
  onChange: (next: number) => void;
  disabled?: boolean;
}

function SliderRow({ icon, label, description, value, onChange, disabled }: SliderRowProps) {
  return (
    <div
      className="flex items-center gap-4 border px-4 py-3"
      style={{
        borderColor: "var(--sk-rule)",
        borderRadius: "var(--sk-radius)",
        background: "var(--sk-surface)",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Icon name={icon} size={18} tone={disabled ? "mono" : "duo"} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[0.95rem]">{label}</p>
          <span className="text-[0.8rem] italic" style={{ color: "var(--sk-accent)" }}>
            {value}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={value}
          disabled={disabled}
          aria-label={label}
          onChange={(e) => onChange(Number(e.target.value))}
          className="mt-1.5 block w-full"
          style={{ accentColor: "var(--sk-accent)", cursor: disabled ? "default" : "pointer" }}
        />
        <p className="mt-0.5 text-[0.78rem] italic" style={{ color: "var(--sk-ink-soft)" }}>
          {description}
        </p>
      </div>
    </div>
  );
}

export function Settings({ go }: ScreenProps) {
  const [section, setSection] = useState<SectionId>("appearance");
  const [followSystem, setFollowSystem] = useState(true);
  const [marketRegister, setMarketRegister] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [soundCues, setSoundCues] = useState(true);
  const [speed, setSpeed] = useState(70);
  const [plan, setPlan] = useState<PlanId>("keeper");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const sectionLabel = SECTIONS.find((s) => s.id === section)?.label ?? "";

  return (
    <div className="flex flex-col gap-8">
      <Settle>
        <div>
          <h1 className="text-2xl">Settings</h1>
          <p className="mt-1 text-sm italic" style={{ color: "var(--sk-ink-soft)" }}>
            Signed in as {ME.handle} · every knob below is drawn from the system itself
          </p>
        </div>
      </Settle>

      <div className="grid gap-8 md:grid-cols-[19rem_1fr]">
        <nav aria-label="settings sections">
          <Directory
            floors={SECTIONS}
            activeId={section}
            onSelect={(id: string) => setSection(id as SectionId)}
          />
        </nav>

        {/* changing floor turns the blind: the fins close over the old panel,
            the swap lands behind them, and they keep turning open */}
        <LouverWipe routeKey={section} announce={`${sectionLabel} settings`} className="min-w-0">
          <div className="flex min-w-0 flex-col gap-6">
            {section === "appearance" && (
              <>
                <section>
                  <h2 className="mb-3 text-sm uppercase tracking-widest" style={{ color: "var(--sk-ink-soft)" }}>
                    Palettes
                  </h2>
                  <p className="mb-4 text-sm italic" style={{ color: "var(--sk-ink-soft)" }}>
                    The color stories, fired as chips. Click any chip to copy its hex.
                  </p>
                  <div className="flex flex-col gap-6">
                    {SHOWN_PALETTES.map((p) => (
                      <PaletteStrip key={p.id} palette={p} />
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="mb-3 text-sm uppercase tracking-widest" style={{ color: "var(--sk-ink-soft)" }}>
                    Register
                  </h2>
                  <Cascade className="gap-2">
                    <ToggleRow
                      icon="gate"
                      label="Market register"
                      description="Rounder corners, brighter accents, a quicker tempo."
                      on={marketRegister}
                      onChange={setMarketRegister}
                    />
                    <ToggleRow
                      icon="lantern"
                      label="Night mode follows system"
                      description="Let the device decide when the lamps come on."
                      on={followSystem}
                      onChange={setFollowSystem}
                    />
                  </Cascade>
                </section>
              </>
            )}

            {section === "motion" && (
              <section>
                <h2 className="mb-3 text-sm uppercase tracking-widest" style={{ color: "var(--sk-ink-soft)" }}>
                  Motion and sound
                </h2>
                <Cascade className="gap-2">
                  <ToggleRow
                    icon="arrow-right"
                    label="Reduced motion"
                    description="Screens cut instead of sweeping. Progress still lights up."
                    on={reducedMotion}
                    onChange={setReducedMotion}
                  />
                  <SliderRow
                    icon="settings"
                    label="Animation speed"
                    description={reducedMotion ? "Unavailable while reduced motion is on." : "How briskly the beats play."}
                    value={speed}
                    onChange={setSpeed}
                    disabled={reducedMotion}
                  />
                  <ToggleRow
                    icon="bell"
                    label="Sound cues"
                    description="A soft chime when a firing finishes or a lobby fills."
                    on={soundCues}
                    onChange={setSoundCues}
                  />
                </Cascade>
              </section>
            )}

            {section === "plan" && (
              <section>
                <h2 className="mb-3 text-sm uppercase tracking-widest" style={{ color: "var(--sk-ink-soft)" }}>
                  Plan
                </h2>
                <p className="mb-4 text-sm italic" style={{ color: "var(--sk-ink-soft)" }}>
                  Two ways to keep a kiln. Add-ons are priced per firing.
                </p>
                {/* stacked: the panel column never gets wide enough to put two
                    laminated cards side by side without crushing the pills */}
                <div className="grid gap-5">
                  {PLANS.map((p) => {
                    const current = p.id === plan;
                    return (
                      <div key={p.id} className="flex flex-col gap-2">
                        <span
                          className="text-[0.7rem] uppercase tracking-widest"
                          style={{ color: current ? "var(--sk-accent)" : "var(--sk-ink-soft)" }}
                        >
                          {current ? "current plan" : "available"}
                        </span>
                        {/* only the plan you are not on can be ordered */}
                        <MenuCard
                          title={p.title}
                          subtitle={p.subtitle}
                          price={p.price}
                          headerColor={p.headerColor}
                          toppings={p.toppings}
                          lore={p.lore}
                          onAdd={current ? undefined : () => setPlan(p.id)}
                        />
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {section === "account" && (
              <>
                <section>
                  <h2 className="mb-3 text-sm uppercase tracking-widest" style={{ color: "var(--sk-ink-soft)" }}>
                    Record
                  </h2>
                  {/* same engraved record as the profile: rub it up to read it */}
                  <ProvenanceRubbing className="max-w-sm" label="rub the plate to raise your record">
                    <ProvenancePlaque
                      title="Account"
                      registered
                      rows={[
                        { term: "handle", description: ME.handle },
                        { term: "title", description: ME.title },
                        { term: "level", description: String(ME.level) },
                        { term: "joined", description: ME.joinedAt },
                        { term: "id", description: ME.id },
                      ]}
                      footnote="Senko 線弧 · kept on file since first firing"
                    />
                  </ProvenanceRubbing>
                </section>

                <section>
                  <h2 className="mb-3 text-sm uppercase tracking-widest" style={{ color: "var(--sk-ink-soft)" }}>
                    Actions
                  </h2>
                  <Cascade className="gap-2">
                    <button
                      type="button"
                      onClick={() => go("profile")}
                      className="flex w-full items-center gap-3 border px-4 py-3 text-left"
                      style={{
                        borderColor: "var(--sk-rule)",
                        borderRadius: "var(--sk-radius)",
                        background: "var(--sk-surface)",
                      }}
                    >
                      <Icon name="user" size={18} tone="duo" />
                      <span>Your public profile</span>
                      <Icon name="arrow-right" size={15} className="ml-auto" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      className="flex w-full items-center gap-3 border px-4 py-3 text-left"
                      style={{
                        borderColor: "var(--sk-accent)",
                        borderRadius: "var(--sk-radius)",
                        background: "var(--sk-surface)",
                        color: "var(--sk-accent)",
                      }}
                    >
                      <Icon name="close" size={18} />
                      <span>Delete account</span>
                      <Icon name="arrow-right" size={15} className="ml-auto" />
                    </button>
                  </Cascade>
                </section>
              </>
            )}
          </div>
        </LouverWipe>
      </div>

      <Lantern open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <h3 className="text-xl">Delete your account?</h3>
        <p className="mt-2 text-sm" style={{ color: "var(--sk-ink-soft)" }}>
          Your collection, your standings and your record go cold. Nothing is kept, and nothing is
          re-fired.
        </p>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => setConfirmDelete(false)}
            className="border px-4 py-2 text-sm"
            style={{ borderColor: "var(--sk-rule)", borderRadius: "var(--sk-radius)" }}
          >
            keep it
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(false)}
            className="px-4 py-2 text-sm"
            style={{
              background: "var(--sk-accent)",
              color: "var(--sk-surface)",
              borderRadius: "var(--sk-radius)",
            }}
          >
            delete account
          </button>
        </div>
      </Lantern>
    </div>
  );
}
