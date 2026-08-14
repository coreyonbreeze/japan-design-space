/* Senko 線弧 — the screen contract.
 * The shell owns the chrome: brand bar, disc nav, transitions, boot. A
 * screen renders its own body and calls `go` to move.
 */
export type ScreenId = "home" | "lobby" | "profile" | "collection" | "standings" | "settings";

export interface ScreenProps {
  go: (id: ScreenId) => void;
}

export const SCREEN_TITLES: Record<ScreenId, string> = {
  home: "Home",
  lobby: "Lobby",
  profile: "Profile",
  collection: "Collection",
  standings: "Standings",
  settings: "Settings",
};
