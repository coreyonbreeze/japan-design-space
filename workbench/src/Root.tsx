/* Senko 線弧 — the two views of this repo.
 * "library" is the component workbench: every part, isolated, with its
 * source photo cited. "app" is the screens demo: the same parts assembled
 * into a working product. The hash keeps the choice across reloads.
 */
import { useEffect, useState } from "react";
import App from "./App";
import { ScreensApp } from "./ScreensApp";

type View = "library" | "app";

function readView(): View {
  return window.location.hash.startsWith("#app") ? "app" : "library";
}

export function Root() {
  const [view, setView] = useState<View>(readView);

  useEffect(() => {
    const sync = () => setView(readView());
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const go = (next: View) => {
    window.location.hash = next === "app" ? "#app" : "";
    setView(next);
    window.scrollTo({ top: 0 });
  };

  return (
    <>
      {view === "app" ? <ScreensApp /> : <App />}
      <div
        className="fixed bottom-4 left-1/2 z-[70] flex -translate-x-1/2 gap-1 p-1 text-xs shadow-lg"
        style={{
          background: "var(--sk-surface)",
          border: "1px solid var(--sk-rule)",
          borderRadius: 999,
          fontFamily: "var(--sk-font)",
        }}
      >
        {(["library", "app"] as View[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => go(v)}
            className="px-4 py-1.5"
            style={{
              borderRadius: 999,
              background: view === v ? "var(--sk-ink)" : "transparent",
              color: view === v ? "var(--sk-surface)" : "var(--sk-ink-soft)",
            }}
          >
            {v === "library" ? "component library" : "screens demo"}
          </button>
        ))}
      </div>
    </>
  );
}
