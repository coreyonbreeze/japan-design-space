/* Senko 線弧 — <MenuCard>
 * Source: IMG_2024–2026 (Butagumi's laminated tonkatsu menu: a pastel
 * color-block names each cut, colored-pencil illustration inside the grid,
 * white topping pills with prices, a physical SOLD OUT sticker, an "About"
 * story at the bottom). Hand-drawn warmth living inside a rigid grid,
 * sealed under laminate. Use for product cards, dishes, pricing tiles.
 */
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { kiln } from "../primitives/kiln";
import { BEAT, EASE, cn } from "../lib";

export interface MenuTopping {
  label: string;
  price: string;
}

export interface MenuCardProps {
  title: string;
  subtitle?: string;
  price: string;
  /** pastel color-block header — any CSS color */
  headerColor?: string;
  /** illustration slot, shown on a paper ground */
  media?: ReactNode;
  /** white pills with prices, like the topping row */
  toppings?: MenuTopping[];
  /** the small "About" story at the bottom */
  lore?: string;
  soldOut?: boolean;
  onAdd?: () => void;
  className?: string;
}

export function MenuCard(props: MenuCardProps) {
  const { title, subtitle, price, headerColor = "var(--color-sakura)" } = props;
  const { media, toppings, lore, soldOut, onAdd, className } = props;
  const headerInk = `color-mix(in oklab, ${headerColor} 22%, var(--color-ink-900))`;
  const aboutInk = `color-mix(in oklab, ${headerColor} 45%, var(--sk-ink))`;

  return (
    <article
      className={cn("relative overflow-hidden", className)}
      style={{
        background: "var(--sk-surface-raised)",
        border: "1px solid var(--sk-rule)",
        borderRadius: "var(--radius-arc-2)",
        fontFamily: "var(--sk-font)",
        color: "var(--sk-ink)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ opacity: soldOut ? 0.72 : 1 }}>
        <header
          className="flex items-baseline justify-between gap-3 px-5 py-4"
          style={{ background: headerColor, color: headerInk }}
        >
          <div className="min-w-0">
            <h3 className="text-[1.15rem]" style={{ letterSpacing: "0.02em" }}>
              {title}
            </h3>
            {subtitle && (
              <p className="mt-0.5 text-[0.8rem]" style={{ opacity: 0.75 }}>
                {subtitle}
              </p>
            )}
          </div>
          <span className="shrink-0 text-[1.05rem] italic">{price}</span>
        </header>

        {media && (
          <div
            className="flex aspect-[4/3] items-center justify-center overflow-hidden"
            style={{ background: "var(--color-paper-0)" }}
          >
            {media}
          </div>
        )}

        {toppings && toppings.length > 0 && (
          <ul
            className="m-3 flex list-none flex-wrap gap-2 p-3"
            style={{ background: "var(--color-paper-1)", borderRadius: "var(--radius-arc-2)" }}
          >
            {toppings.map((t) => (
              <li
                key={t.label}
                className="flex items-baseline gap-2 px-3 py-1 text-[0.8rem]"
                style={{
                  /* white pills are material, like the laminated menu */
                  background: "#FFFFFF",
                  color: "var(--color-ink-900)",
                  border: "1px solid var(--sk-rule)",
                  borderRadius: "999px",
                }}
              >
                <span>{t.label}</span>
                <span style={{ color: "var(--color-ink-500)" }}>{t.price}</span>
              </li>
            ))}
          </ul>
        )}

        {lore && (
          <p className="px-5 pb-4 pt-1 text-[0.82rem] italic leading-relaxed" style={{ color: "var(--sk-ink-soft)" }}>
            <span className="pr-2 text-[1rem]" style={{ color: aboutInk }}>
              About
            </span>
            {lore}
          </p>
        )}

        {onAdd && (
          <footer className="flex justify-end px-5 pb-4">
            <motion.button
              type="button"
              disabled={soldOut}
              onClick={onAdd}
              className="px-4 py-1.5 text-[0.85rem] italic"
              style={{
                border: "1px solid var(--sk-rule)",
                borderRadius: "999px",
                background: "transparent",
                color: "var(--sk-ink)",
                cursor: soldOut ? "default" : "pointer",
              }}
              whileHover={
                soldOut
                  ? undefined
                  : { backgroundColor: "var(--sk-glow-soft)", borderColor: "var(--sk-glow)" }
              }
              transition={{ duration: BEAT.b2, ease: [...EASE.drift] }}
            >
              Add to order
            </motion.button>
          </footer>
        )}
      </div>

      {soldOut && (
        <span
          className="absolute left-1/2 top-1/2 z-20 border-2 px-3 py-1 text-[0.78rem] font-bold tracking-widest"
          style={{
            color: "var(--sk-accent)",
            borderColor: "var(--sk-accent)",
            background: "var(--color-paper-0)",
            borderRadius: "var(--sk-radius)",
            transform: `translate(-50%, -50%) rotate(${kiln(title + "sticker").range(-10, -5).toFixed(1)}deg)`,
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          }}
        >
          SOLD OUT
        </span>
      )}

      {/* laminate finish */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(115deg, rgba(255,255,255,0) 42%, rgba(255,255,255,0.26) 47%, rgba(255,255,255,0.07) 53%, rgba(255,255,255,0) 60%)",
        }}
      />
    </article>
  );
}
