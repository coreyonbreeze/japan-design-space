/* Senko 線弧 — useKiln
 * Source: IMG_2050 (Kutani room signs — "lines and arcs only, each room
 * slightly different"), IMG_2060 (handmade tiles). The library's signature:
 * deterministic per-instance micro-variation. Same seed → same variation,
 * so renders are stable across reloads; no two seeds look alike.
 */
function hash(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Kiln {
  /** uniform [0,1) */
  rand(): number;
  /** uniform [min,max) */
  range(min: number, max: number): number;
  /** integer [min,max] inclusive */
  int(min: number, max: number): number;
  pick<T>(arr: readonly T[]): T;
  /** convenience: the standard "fired in the same kiln" jitter set */
  glaze(): { tilt: number; radii: string; tint: number };
}

export function kiln(seed: string): Kiln {
  const rand = mulberry32(hash(seed));
  const k: Kiln = {
    rand,
    range: (min, max) => min + rand() * (max - min),
    int: (min, max) => min + Math.floor(rand() * (max - min + 1)),
    pick: (arr) => arr[Math.floor(rand() * arr.length)],
    glaze: () => ({
      tilt: k.range(-0.9, 0.9),
      radii: [0, 0, 0, 0].map(() => `${k.range(4, 11).toFixed(1)}px`).join(" "),
      tint: k.range(-4, 4),
    }),
  };
  return k;
}

/* A kiln is a mutable random SEQUENCE, so it must restart from the seed on
 * every render — memoizing the instance would let re-renders keep drawing
 * from an advanced stream and silently re-fire the design each render.
 * Fresh instance per render = same draws in the same order = stable output. */
export function useKiln(seed: string): Kiln {
  return kiln(seed);
}
