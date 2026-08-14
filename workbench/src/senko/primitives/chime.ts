/* Senko 線弧 — useChime (stub)
 * Sound is a first-class register of this system (planned, not yet built).
 * Components call chime(event) at meaningful moments; today it is silent.
 * When the sound pass lands, map events to samples here — no component
 * rework needed. Candidate palette: porcelain tap (select), paper slide
 * (navigate), distant bell (confirm), rain-on-leaves (ambient loading).
 */
export type ChimeEvent =
  | "select"
  | "navigate"
  | "confirm"
  | "reveal"
  | "ignite"
  | "settle";

export function useChime() {
  return (event: ChimeEvent) => {
    void event; // silent until the sound phase
  };
}
