/* Senko 線弧 — demo data for the screens.
 * One fictional product so every screen reads as the same app. The product
 * is a hub around a game: lobbies, profiles, collections, standings. No
 * gameplay screens live here.
 */

export interface Player {
  id: string;
  handle: string;
  title: string;
  level: number;
  xp: number;
  xpToNext: number;
  status: "online" | "away" | "offline";
  joinedAt: string;
}

export interface Session {
  id: string;
  name: string;
  mode: string;
  players: number;
  capacity: number;
  region: string;
  state: "open" | "starting" | "full";
}

export interface CollectionItem {
  id: string;
  name: string;
  rarity: "common" | "rare" | "kiln";
  acquired: boolean;
}

export interface Standing {
  id: string;
  rank: number;
  handle: string;
  score: string;
  delta: string;
}

export interface Quest {
  id: string;
  title: string;
  detail: string;
  status: "done" | "active" | "todo";
}

export const ME: Player = {
  id: "corey",
  handle: "corey",
  title: "Kiln Keeper",
  level: 24,
  xp: 6180,
  xpToNext: 10000,
  status: "online",
  joinedAt: "Aug 2026",
};

export const FRIENDS: Player[] = [
  { id: "mika", handle: "mika", title: "Lanternwright", level: 31, xp: 2400, xpToNext: 9000, status: "online", joinedAt: "Mar 2026" },
  { id: "aoi", handle: "aoi", title: "Slatsmith", level: 18, xp: 5100, xpToNext: 8000, status: "online", joinedAt: "Jun 2026" },
  { id: "ren", handle: "ren", title: "Glazier", level: 27, xp: 800, xpToNext: 9500, status: "away", joinedAt: "Jan 2026" },
  { id: "hana", handle: "hana", title: "Gatekeeper", level: 12, xp: 3300, xpToNext: 6000, status: "offline", joinedAt: "Jul 2026" },
];

export const SESSIONS: Session[] = [
  { id: "s1", name: "Evening Circuit", mode: "ranked", players: 6, capacity: 8, region: "NA-West", state: "open" },
  { id: "s2", name: "Quiet Hours", mode: "casual", players: 3, capacity: 6, region: "NA-West", state: "open" },
  { id: "s3", name: "Kanazawa Open", mode: "ranked", players: 8, capacity: 8, region: "JP-Central", state: "full" },
  { id: "s4", name: "First Light", mode: "practice", players: 2, capacity: 4, region: "EU-North", state: "starting" },
];

export const COLLECTION: CollectionItem[] = [
  { id: "c1", name: "Arch Window", rarity: "common", acquired: true },
  { id: "c2", name: "Grout Line", rarity: "common", acquired: true },
  { id: "c3", name: "Timber Prop", rarity: "rare", acquired: true },
  { id: "c4", name: "Verdigris Plate", rarity: "rare", acquired: true },
  { id: "c5", name: "Night Balcony", rarity: "common", acquired: true },
  { id: "c6", name: "Kutani Seal", rarity: "kiln", acquired: true },
  { id: "c7", name: "Ginkgo Leaf", rarity: "common", acquired: false },
  { id: "c8", name: "Hose Ring", rarity: "rare", acquired: false },
  { id: "c9", name: "Noren Crest", rarity: "kiln", acquired: false },
  { id: "c10", name: "Louver Fin", rarity: "common", acquired: true },
  { id: "c11", name: "Moss Stone", rarity: "common", acquired: true },
  { id: "c12", name: "Lantern Wick", rarity: "kiln", acquired: false },
];

export const STANDINGS: Standing[] = [
  { id: "r1", rank: 1, handle: "mika", score: "18,420", delta: "+240" },
  { id: "r2", rank: 2, handle: "ren", score: "17,905", delta: "+95" },
  { id: "r3", rank: 3, handle: "corey", score: "16,180", delta: "+610" },
  { id: "r4", rank: 4, handle: "aoi", score: "15,744", delta: "−30" },
  { id: "r5", rank: 5, handle: "hana", score: "12,006", delta: "+18" },
];

export const QUESTS: Quest[] = [
  { id: "q4", title: "Fire ten plaques", detail: "0 of 10", status: "todo" },
  { id: "q3", title: "Win a ranked circuit", detail: "in progress", status: "active" },
  { id: "q2", title: "Join a lobby", detail: "complete", status: "done" },
  { id: "q1", title: "Claim your handle", detail: "complete", status: "done" },
];

export const BOOT_STAGES = [
  { id: "b1", label: "tokens" },
  { id: "b2", label: "fonts" },
  { id: "b3", label: "profile" },
  { id: "b4", label: "collection" },
  { id: "b5", label: "sessions" },
];
