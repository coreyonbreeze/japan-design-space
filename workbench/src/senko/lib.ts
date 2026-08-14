/* Senko 線弧 — shared utilities */

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/** Easing vocabulary as number arrays for Motion (mirrors tokens/senko.css). */
export const EASE = {
  /** overshoot caught by the prop — supported pines IMG_2075–2082 */
  settle: [0.22, 1.12, 0.32, 1] as const,
  /** slow warm-up, no bounce — night arches IMG_2052, lamps IMG_2049 */
  ignite: [0.55, 0.06, 0.28, 0.99] as const,
  /** near-linear glide — haze IMG_2054, water IMG_2048 */
  drift: [0.33, 0, 0.2, 1] as const,
  /** market register only — blind-box reveal IMG_2110 */
  pop: [0.34, 1.56, 0.64, 1] as const,
  /** gravity: ease-in with a small terminal check — a curtain falling */
  drop: [0.34, 0, 0.22, 1.06] as const,
};

export const BEAT = { b1: 0.16, b2: 0.32, b3: 0.56, b4: 0.9 };

export type Bezier = [number, number, number, number];

/** Motion needs a 4-tuple. EASE entries are readonly, so copy and cast. */
export function ease(e: readonly number[]): Bezier {
  return [...e] as Bezier;
}

/** NaN must land on 0, not pass through and poison a style string. */
export function clamp01(n: number): number {
  return n > 0 ? (n > 1 ? 1 : n) : 0;
}

/** Snap a 0..1 value to `frames` discrete steps.
 *  Use it for drawn marks: brush strokes, ink, icon draw-ons. A stepped
 *  mark reads as hand-made. Do not use it for light, cloth, or any moving
 *  mass, which must stay continuous. */
export function stepFrames(t: number, frames = 12): number {
  return Math.round(clamp01(t) * frames) / frames;
}

/** Interpolate two rgb triples. */
export function mixRgb(a: readonly number[], b: readonly number[], t: number): string {
  const k = clamp01(t);
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * k));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}
