/* Senko 線弧 — the screens demo.
 * A working product shell built only from this library: boot, brand bar,
 * disc nav, and cloth transitions between screens. No gameplay lives here.
 */
import { useEffect, useState } from "react";
import {
  SignDisc,
  NorenSplit,
  KilnFiring,
  DuskSweepOverlay,
  useDuskSweep,
  FusumaSlide,
  LeafScatter,
  KilnPlaque,
  Cascade,
  Sheen,
  Icon,
  Lantern,
} from "./senko";
import { FRIENDS } from "./screens/data";
import { Home } from "./screens/Home";
import { Lobby } from "./screens/Lobby";
import { Profile } from "./screens/Profile";
import { Collection } from "./screens/Collection";
import { Standings } from "./screens/Standings";
import { Settings } from "./screens/Settings";
import { SCREEN_TITLES, type ScreenId } from "./screens/types";

const ORDER: ScreenId[] = ["home", "lobby", "collection", "standings", "profile", "settings"];
const BOOT_MS = 2600;

export function ScreensApp() {
  const [booting, setBooting] = useState(true);
  const [bootP, setBootP] = useState(0);
  const [screen, setScreen] = useState<ScreenId>("home");
  const [register, setRegister] = useState<"paper" | "market">("paper");
  const [signOut, setSignOut] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const dusk = useDuskSweep("day");

  const NOTICES = [
    { id: "n1", text: "mika invited you to Evening Circuit" },
    { id: "n2", text: "Season 4 standings updated" },
    { id: "n3", text: "Two crates still sealed in your collection" },
  ];

  useEffect(() => {
    let raf = 0;
    const started = performance.now();
    const tick = () => {
      const p = Math.min(1, (performance.now() - started) / BOOT_MS);
      setBootP(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // A timer, not the frame loop, ends the boot. requestAnimationFrame
    // stops in a background tab, which would leave the splash up forever
    // for anyone who opens the app in a tab they are not looking at.
    const finish = window.setTimeout(() => {
      setBootP(1);
      setBooting(false);
    }, BOOT_MS + 360);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(finish);
    };
  }, []);

  const body = {
    home: <Home go={setScreen} />,
    lobby: <Lobby go={setScreen} />,
    profile: <Profile go={setScreen} />,
    collection: <Collection go={setScreen} />,
    standings: <Standings go={setScreen} />,
    settings: <Settings go={setScreen} />,
  }[screen];

  return (
    <div
      data-register={register}
      data-mode={dusk.mode === "night" ? "night" : undefined}
      className="min-h-screen"
      style={{ background: "var(--sk-ground)", color: "var(--sk-ink)", fontFamily: "var(--sk-font)" }}
    >
      <header
        className="sticky top-0 z-30 border-b"
        style={{ borderColor: "var(--sk-rule)", background: "var(--sk-ground)" }}
      >
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-4">
          <button
            type="button"
            onClick={() => setScreen("home")}
            className="flex items-baseline gap-2 text-left"
          >
            <span className="text-xl">Senko</span>
            <span className="text-sm" style={{ color: "var(--sk-ink-soft)" }}>線弧</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRegister(register === "paper" ? "market" : "paper")}
              className="border px-3 py-1.5 text-xs"
              style={{ borderColor: "var(--sk-rule)", borderRadius: "var(--sk-radius)" }}
              aria-label={`register: ${register}`}
            >
              {register}
            </button>
            <button
              type="button"
              onClick={dusk.toggle}
              className="flex items-center gap-1.5 border px-3 py-1.5 text-xs"
              style={{ borderColor: "var(--sk-rule)", borderRadius: "var(--sk-radius)" }}
              aria-label={`switch to ${dusk.mode === "day" ? "night" : "day"}`}
            >
              <Icon name={dusk.mode === "day" ? "lantern" : "star"} size={14} tone="duo" />
              {dusk.mode}
            </button>
            <button
              type="button"
              onClick={() => setDrawer(true)}
              className="flex items-center gap-1.5 border px-3 py-1.5 text-xs"
              style={{ borderColor: "var(--sk-rule)", borderRadius: "var(--sk-radius)" }}
              aria-label="open friends and notices"
            >
              <Icon name="bell" size={14} tone="multi" />
              {NOTICES.length - dismissed.length}
            </button>
            <button
              type="button"
              onClick={() => setSignOut(true)}
              className="border px-3 py-1.5 text-xs"
              style={{ borderColor: "var(--sk-rule)", borderRadius: "var(--sk-radius)" }}
            >
              sign out
            </button>
          </div>
        </div>
        <div className="mx-auto max-w-4xl px-6 pb-4">
          <SignDisc
            items={ORDER.map((id) => ({ id, label: SCREEN_TITLES[id] }))}
            activeId={screen}
            onSelect={(id: string) => setScreen(id as ScreenId)}
          />
        </div>
      </header>

      <NorenSplit
        routeKey={screen}
        announce={`${SCREEN_TITLES[screen]} screen`}
        mark={<span style={{ fontSize: "1.5rem" }}>線弧</span>}
      >
        <main className="mx-auto max-w-4xl px-6 py-12">{body}</main>
      </NorenSplit>

      <footer
        className="mx-auto max-w-4xl border-t px-6 py-8 text-xs"
        style={{ borderColor: "var(--sk-rule)", color: "var(--sk-ink-soft)" }}
      >
        Every screen is built from Senko components. Sources: photos/ · field-notes.md
      </footer>

      {/* the side screen: friends and notices slide in with door friction */}
      <FusumaSlide open={drawer} onClose={() => setDrawer(false)} label="friends and notices">
        <div className="flex flex-col gap-8 p-6">
          <section>
            <h3 className="mb-3 text-sm uppercase tracking-widest" style={{ color: "var(--sk-ink-soft)" }}>
              Notices
            </h3>
            <div className="flex flex-col gap-2">
              {NOTICES.map((n) => (
                <LeafScatter key={n.id} dismissed={dismissed.includes(n.id)} seed={n.id}>
                  <button
                    type="button"
                    onClick={() => setDismissed((d) => [...d, n.id])}
                    className="flex w-full items-center gap-3 border px-3 py-2.5 text-left text-sm"
                    style={{
                      borderColor: "var(--sk-rule)",
                      borderRadius: "var(--sk-radius)",
                      background: "var(--sk-surface)",
                    }}
                  >
                    <Icon name="lantern" size={16} tone="duo" />
                    <span className="flex-1">{n.text}</span>
                    <Icon name="close" size={14} />
                  </button>
                </LeafScatter>
              ))}
              {dismissed.length === NOTICES.length && (
                <p className="text-sm italic" style={{ color: "var(--sk-ink-soft)" }}>
                  All clear. The leaves have settled.
                </p>
              )}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm uppercase tracking-widest" style={{ color: "var(--sk-ink-soft)" }}>
              Friends
            </h3>
            <Cascade className="gap-2">
              {FRIENDS.map((f) => (
                <Sheen key={f.id}>
                  <div
                    className="flex items-center gap-3 border px-3 py-2"
                    style={{
                      borderColor: "var(--sk-rule)",
                      borderRadius: "var(--sk-radius)",
                      background: "var(--sk-surface)",
                    }}
                  >
                    <KilnPlaque seed={f.id} size={34} />
                    <span className="flex-1 text-sm">{f.handle}</span>
                    <span className="text-[0.68rem]" style={{ color: "var(--sk-ink-soft)" }}>
                      {f.status}
                    </span>
                  </div>
                </Sheen>
              ))}
            </Cascade>
          </section>
        </div>
      </FusumaSlide>

      <Lantern open={signOut} onClose={() => setSignOut(false)}>
        <h3 className="text-xl">Sign out?</h3>
        <p className="mt-2 text-sm" style={{ color: "var(--sk-ink-soft)" }}>
          Your session ends and the lantern goes out.
        </p>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => setSignOut(false)}
            className="border px-4 py-2 text-sm"
            style={{ borderColor: "var(--sk-rule)", borderRadius: "var(--sk-radius)" }}
          >
            stay
          </button>
          <button
            type="button"
            onClick={() => setSignOut(false)}
            className="px-4 py-2 text-sm"
            style={{
              background: "var(--sk-accent)",
              color: "var(--sk-surface)",
              borderRadius: "var(--sk-radius)",
            }}
          >
            sign out
          </button>
        </div>
      </Lantern>

      {booting && <KilnFiring fullscreen progress={bootP} seed={`boot:${ORDER.length}`} label="opening Senko" />}
      <DuskSweepOverlay sweeping={dusk.sweeping} />
    </div>
  );
}
