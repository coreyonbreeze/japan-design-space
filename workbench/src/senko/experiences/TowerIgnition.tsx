/* Senko 線弧 — <TowerIgnition>
 * Source: IMG_2063 (night stair towers: stacked flights glowing white in
 * the black, repetition plus internal light), IMG_2052 (a hotel whose every
 * floor is an arcade of lit arches).
 * A boot screen shaped like a building. The silhouette draws itself in line
 * and arc. Then each finished load stage lights a floor, ground up. Lit
 * floors stay lit, the working floor breathes, the rest stay dark. When the
 * load finishes the tower dips and flares once, every floor together, then
 * settles. The flare is the beat where a sound lands.
 *
 * The silhouette is a drawn mark, so it steps. Window light is light, so it
 * stays smooth. The tower is a night object: it keeps its dark ground in
 * every register, the way the kiln keeps its amber.
 */
import { motion, useReducedMotion, type Variants } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { kiln } from "../primitives/kiln";
import { BEAT, EASE, clamp01, cn, ease, stepFrames } from "../lib";

export interface TowerStage {
  id: string;
  label: string;
}

export interface TowerIgnitionProps {
  stages: TowerStage[];
  /** Index of the stage in progress. Floors below it are already lit. */
  current: number;
  /** Every stage finished: the tower flares. */
  done?: boolean;
  /** Cover the viewport on a dark ground. */
  fullscreen?: boolean;
  className?: string;
}

/* ---- the drawing, in user units (1 unit = 1px at rest) ---- */
const FLOOR_H = 34;
const TOWER_W = 100;
const PAD = 12;
const CAP_H = 18;
const BASE_H = 12;
const SHAFT_W = 26;
const SVG_W = TOWER_W + PAD * 2;
const WIN_GAP = 5;
const WIN_L = PAD + 8;
const WIN_R = PAD + TOWER_W - SHAFT_W - 4;
const SHAFT_L = PAD + TOWER_W - SHAFT_W;
const SHAFT_R = PAD + TOWER_W;

/* ---- the drawing pass: one hand, three layers, bottom up ---- */
const DRAW_MS = 1150;
/** The rest between the last mark and the first light. Sound lands here. */
const REST_MS = 240;
const SHELL_TO = 0.4;
const LINES_FROM = 0.3;
const LINES_TO = 0.66;
const WIN_FROM = 0.54;
const WIN_TO = 1;
/** Each mark draws for this share of its slot, then the hand lifts. */
const DUTY = 0.76;

type FloorState = "dark" | "working" | "lit" | "flare";

const RIDE = { type: "spring", stiffness: 120, damping: 18 } as const;

/** two verticals and a half-circle top — the arch module of IMG_2042/2052 */
function archWindow(x: number, w: number, yTop: number, yBase: number): string {
  const r = w / 2;
  return `M ${x} ${yBase} L ${x} ${yTop + r} A ${r} ${r} 0 0 1 ${x + w} ${yTop + r} L ${x + w} ${yBase} Z`;
}

/** Light per floor. Each floor carries its own small delay, so the flare
 *  reads as one event with a hand in it rather than a switch being thrown. */
function glowVariants(delay: number): Variants {
  return {
    dark: { opacity: 0, transition: { duration: BEAT.b3, ease: ease(EASE.drift) } },
    // strike, fall back, then warm up — a tube catching before it holds
    working: {
      opacity: [0, 0.88, 0.1, 0.56],
      transition: {
        duration: 0.95,
        delay,
        times: [0, 0.05, 0.18, 1],
        ease: [ease(EASE.drift), ease(EASE.drift), ease(EASE.ignite)],
      },
    },
    lit: { opacity: 1, transition: { duration: BEAT.b4, delay, ease: ease(EASE.ignite) } },
    // the whole tower draws breath before it flares
    flare: {
      opacity: [0.26, 1, 0.72, 0.94],
      transition: {
        duration: 1.15,
        delay,
        times: [0, 0.2, 0.56, 1],
        ease: [ease(EASE.ignite), ease(EASE.drift), ease(EASE.settle)],
      },
    },
  };
}

interface TowerFloorProps {
  stage: TowerStage;
  /** Row counted from the top of the tower. */
  row: number;
  /** Row counted from the ground, which is the order everything happens in. */
  fromGround: number;
  rows: number;
  state: FloorState;
  /** 0 to 1 across the whole drawing pass. */
  draw: number;
  reduced: boolean;
}

function TowerFloor({ stage, row, fromGround, rows, state, draw, reduced }: TowerFloorProps) {
  const k = kiln(`tower:${stage.id}`);
  // fenestration varies floor to floor, the way the room signs do
  const n = k.int(3, 4);
  const lag = k.range(0, 0.05);
  const flareDelay = k.range(0, 0.06);

  const yTop = PAD + CAP_H + row * FLOOR_H;
  const w = (WIN_R - WIN_L - WIN_GAP * (n - 1)) / n;
  const windows = Array.from({ length: n }, (_, i) =>
    archWindow(WIN_L + i * (w + WIN_GAP), w, yTop + 7, yTop + FLOOR_H - 9)
  );
  // stair flights alternate direction, so the stack zigzags — IMG_2063
  const up = fromGround % 2 === 0;
  const sx0 = SHAFT_L + 4;
  const sx1 = SHAFT_R - 4;
  const flight = up
    ? `M ${sx0} ${yTop + FLOOR_H - 7} L ${sx1} ${yTop + 7}`
    : `M ${sx1} ${yTop + FLOOR_H - 7} L ${sx0} ${yTop + 7}`;

  // Marks arrive bottom up, each with a duty cycle so the hand lifts
  // between floors instead of scribbling continuously.
  const span = (to: number, from: number) => (to - from) / rows;
  const lineFrom = LINES_FROM + fromGround * span(LINES_TO, LINES_FROM);
  const winFrom = WIN_FROM + (fromGround + lag) * span(WIN_TO, WIN_FROM);
  const lineDraw = reduced
    ? 1
    : stepFrames(clamp01((draw - lineFrom) / (span(LINES_TO, LINES_FROM) * DUTY)), 4);
  const winDraw = reduced
    ? 1
    : stepFrames(clamp01((draw - winFrom) / (span(WIN_TO, WIN_FROM) * DUTY)), 8);

  // Light climbs the tower. Capped, so a tall building never leaves the
  // working floor waiting on the ones under it.
  const climb = Math.min(fromGround, 5) * 0.07 + lag;
  const variants = glowVariants(state === "flare" ? flareDelay : climb);

  return (
    <g>
      {row > 0 && (
        <path
          d={`M ${PAD} ${yTop} L ${PAD + TOWER_W} ${yTop}`}
          fill="none"
          stroke="var(--color-ink-500)"
          strokeWidth={0.75}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - lineDraw}
          opacity={0.7}
        />
      )}
      {/* the dark building: ink marks, stepped like a drawn line */}
      <g
        fill="none"
        stroke="var(--color-ink-500)"
        strokeWidth={1}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - winDraw}
        opacity={winDraw > 0 ? 0.85 : 0}
      >
        {windows.map((d) => (
          <path key={d} d={d} />
        ))}
        <path d={flight} />
      </g>
      {/* the light: continuous, and it never steps */}
      <motion.g
        aria-hidden
        style={{ filter: "drop-shadow(0 0 5px var(--sk-glow-soft))" }}
        variants={variants}
        initial={false}
        animate={reduced ? (state === "dark" ? "dark" : "lit") : state}
      >
        {windows.map((d) => (
          <path key={d} d={d} fill="var(--sk-glow)" opacity={0.92} />
        ))}
        <path d={flight} fill="none" stroke="var(--sk-glow)" strokeWidth={2.4} strokeLinecap="round" />
      </motion.g>
      {/* the working floor breathes on top of its own steady light */}
      {state === "working" && !reduced && (
        <motion.g
          aria-hidden
          style={{ filter: "drop-shadow(0 0 7px var(--sk-glow-soft))" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.1, 0.44] }}
          transition={{
            duration: 1.7,
            delay: 0.55,
            repeat: Infinity,
            repeatType: "mirror",
            ease: ease(EASE.ignite),
          }}
        >
          {windows.map((d) => (
            <path key={d} d={d} fill="var(--color-amber-300)" />
          ))}
        </motion.g>
      )}
    </g>
  );
}

export function TowerIgnition({
  stages,
  current,
  done,
  fullscreen,
  className,
}: TowerIgnitionProps) {
  const reduced = useReducedMotion();
  const [draw, setDraw] = useState(() => (reduced ? 1 : 0));
  const [wired, setWired] = useState(() => Boolean(reduced));
  const overlay = useRef<HTMLDivElement>(null);

  // The drawing pass runs once. Nothing this effect sets may appear in its
  // dependency list, or the pass would cancel its own frames.
  useEffect(() => {
    if (reduced) {
      setDraw(1);
      setWired(true);
      return;
    }
    let raf = 0;
    let start = 0;
    const tick = (t: number) => {
      if (!start) start = t;
      const e = (t - start) / DRAW_MS;
      setDraw(e >= 1 ? 1 : e);
      if (e < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const wire = window.setTimeout(() => setWired(true), DRAW_MS + REST_MS);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(wire);
    };
  }, [reduced]);

  // Move focus into the blocking overlay and restore it on close.
  useEffect(() => {
    if (!fullscreen) return;
    const previous = document.activeElement as HTMLElement | null;
    overlay.current?.focus();
    return () => previous?.focus?.();
  }, [fullscreen]);

  const rows = Math.max(stages.length, 1);
  const cursor = Math.max(0, Math.min(current, rows - 1));
  const height = PAD * 2 + CAP_H + rows * FLOOR_H + BASE_H;
  const yTop = PAD + CAP_H;
  const yBase = yTop + rows * FLOOR_H;

  const shell = `M ${PAD} ${yBase} L ${PAD} ${yTop} L ${PAD + TOWER_W} ${yTop} L ${PAD + TOWER_W} ${yBase}`;
  const cap = `M ${PAD - 7} ${yTop} L ${PAD - 7} ${yTop - 9} L ${PAD + TOWER_W + 7} ${yTop - 9} L ${PAD + TOWER_W + 7} ${yTop}`;
  const plinth = `M ${PAD - 5} ${yBase} L ${PAD + TOWER_W + 5} ${yBase} M ${PAD - 5} ${yBase + 6} L ${PAD + TOWER_W + 5} ${yBase + 6}`;
  const shaftRule = `M ${SHAFT_L} ${yTop} L ${SHAFT_L} ${yBase}`;
  const shellDraw = reduced ? 1 : stepFrames(clamp01(draw / (SHELL_TO * DUTY)), 14);
  const capDraw = reduced ? 1 : stepFrames(clamp01((draw - SHELL_TO * 0.55) / (SHELL_TO * 0.6)), 6);

  const floorState = (i: number): FloorState => {
    if (done) return "flare";
    if (!wired) return "dark";
    if (i < cursor) return "lit";
    if (i === cursor) return "working";
    return "dark";
  };

  const row = (i: number) => rows - 1 - i;
  const activeLabel = done ? "ready" : (stages[cursor]?.label ?? "loading");

  // The progressbar role makes its own contents presentational, so it wraps
  // the drawing only. The stage list stays outside it, as real text.
  const tower = (
    <div
      className="relative"
      style={{ width: SVG_W, height }}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={rows}
      aria-valuenow={done ? rows : cursor}
      aria-valuetext={activeLabel}
      aria-label="loading"
    >
      {/* the flare bloom: the whole tower spilling light into the night */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          inset: -PAD * 2,
          background: "radial-gradient(60% 50% at 50% 55%, var(--sk-glow-soft), transparent 72%)",
        }}
        initial={false}
        animate={{ opacity: done && !reduced ? [0, 0.95, 0.18] : 0 }}
        transition={{ duration: 1.15, times: [0, 0.22, 1], ease: ease(EASE.drift) }}
      />
      <motion.svg
        viewBox={`0 0 ${SVG_W} ${height}`}
        width={SVG_W}
        height={height}
        aria-hidden
        className="relative"
        initial={false}
        // mass: the tower takes the flare in its knees
        animate={{ y: done && !reduced ? [0, -3, 0.8, 0] : 0 }}
        transition={{ duration: 1.15, times: [0, 0.24, 0.6, 1], ease: ease(EASE.settle) }}
      >
        <g
          fill="none"
          stroke="var(--color-ink-300)"
          strokeWidth={1.1}
          strokeLinecap="square"
          pathLength={1}
          strokeDasharray={1}
        >
          <path d={shell} strokeDashoffset={1 - shellDraw} />
          <path d={plinth} strokeDashoffset={1 - shellDraw} />
          <path d={cap} strokeDashoffset={1 - capDraw} strokeWidth={1.4} />
          <path d={shaftRule} strokeDashoffset={1 - capDraw} strokeWidth={0.75} opacity={0.55} />
        </g>
        {stages.map((stage, i) => (
          <TowerFloor
            key={stage.id}
            stage={stage}
            row={row(i)}
            fromGround={i}
            rows={rows}
            state={floorState(i)}
            draw={draw}
            reduced={Boolean(reduced)}
          />
        ))}
      </motion.svg>
    </div>
  );

  const list = (
    <ol
      className="relative m-0 min-w-[10rem] list-none p-0"
      style={{ paddingTop: PAD + CAP_H, fontFamily: "var(--sk-font)" }}
      aria-label="load stages"
    >
      {/* the highlight rides the shaft, like the directory car */}
      {!done && (
        <motion.span
          aria-hidden
          className="absolute inset-x-0 top-0"
          style={{
            height: FLOOR_H,
            background: "color-mix(in oklab, var(--sk-glow) 13%, transparent)",
            borderRadius: "var(--radius-arc-1)",
          }}
          initial={false}
          animate={{ y: PAD + CAP_H + row(cursor) * FLOOR_H, opacity: wired ? 1 : 0 }}
          transition={reduced ? { duration: 0 } : RIDE}
        />
      )}
      {stages
        .map((stage, i) => ({ stage, i }))
        .reverse()
        .map(({ stage, i }, slot) => {
          const state = done ? "lit" : i < cursor ? "lit" : i === cursor ? "working" : "dark";
          return (
            <motion.li
              key={stage.id}
              className="relative flex items-center gap-3 px-2"
              style={{ height: FLOOR_H }}
              aria-current={state === "working" ? "step" : undefined}
              initial={reduced ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: BEAT.b3,
                delay: reduced ? 0 : (DRAW_MS / 1000) * 0.5 + slot * 0.055,
                ease: ease(EASE.settle),
              }}
            >
              <span
                className="shrink-0 italic"
                style={{
                  fontSize: "0.95rem",
                  minWidth: "1.6rem",
                  // the scrim is always dark, so this text is always paper
                  color: state === "dark" ? "var(--color-ink-500)" : "var(--color-paper-2)",
                }}
              >
                {i + 1}
              </span>
              <span
                className="truncate text-[0.84rem]"
                style={{
                  letterSpacing: "0.02em",
                  color:
                    state === "working"
                      ? "var(--color-amber-300)"
                      : state === "lit"
                        ? "var(--color-paper-2)"
                        : "var(--color-ink-300)",
                }}
              >
                {stage.label}
              </span>
            </motion.li>
          );
        })}
    </ol>
  );

  const assembly = (
    <div
      className="flex items-start gap-6"
      style={{
        padding: PAD,
        background: "var(--sk-night)",
        borderRadius: "var(--sk-radius)",
        border: "1px solid color-mix(in oklab, var(--color-paper-1) 12%, transparent)",
        transform: fullscreen ? "scale(1.35)" : undefined,
        transformOrigin: "center",
      }}
    >
      {tower}
      {list}
    </div>
  );

  const body = (
    <div className={cn("inline-flex", fullscreen ? undefined : className)}>
      {assembly}
      <span className="sr-only" role="status">
        {activeLabel}
      </span>
    </div>
  );

  if (!fullscreen) return body;

  return (
    <div
      ref={overlay}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={activeLabel}
      aria-busy={done ? undefined : "true"}
      className={cn("fixed inset-0 z-50 flex items-center justify-center outline-none", className)}
      style={{ background: "var(--sk-night)" }}
    >
      {body}
    </div>
  );
}
