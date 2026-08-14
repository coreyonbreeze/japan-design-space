/* Senko 線弧 — curated palettes
 * The named color stories of the system, curated from the raw per-photo
 * extractions in library/palettes.json. Every hex matches tokens/senko.css;
 * sources are the photos the color was measured from.
 */

export interface PaletteColor {
  name: string;
  value: string;
  source?: string[];
}

export interface Palette {
  id: string;
  title: string;
  description: string;
  colors: PaletteColor[];
}

export const PALETTES: Palette[] = [
  {
    id: "paper",
    title: "Paper 紙",
    description: "The quiet grounds — menus, the hotel book, the photo-book cover.",
    colors: [
      { name: "paper-0", value: "#FAF7EF", source: ["IMG_2044", "IMG_2029"] },
      { name: "paper-1", value: "#F3EEE2", source: ["IMG_2023", "IMG_2024"] },
      { name: "paper-2", value: "#E5DDCB", source: ["IMG_2044"] },
      { name: "paper-3", value: "#D5CDB8", source: ["IMG_2029"] },
    ],
  },
  {
    id: "sumi",
    title: "Sumi 墨",
    description: "The inks — machiya slats, the statue, the hydrant ring.",
    colors: [
      { name: "ink-950", value: "#14161A", source: ["IMG_2049", "IMG_2062"] },
      { name: "ink-900", value: "#22262E", source: ["IMG_2091", "IMG_2113"] },
      { name: "ink-700", value: "#343A44", source: ["IMG_2083"] },
      { name: "ink-500", value: "#5A626E", source: ["IMG_2031"] },
      { name: "ink-300", value: "#9AA1AB", source: ["IMG_2089"] },
    ],
  },
  {
    id: "craft",
    title: "Craft 工",
    description: "Porcelain, glaze, grout, oak, walnut — surfaces with hands in their history.",
    colors: [
      { name: "glaze-0", value: "#EFEAE0", source: ["IMG_2050", "IMG_2060"] },
      { name: "glaze-1", value: "#E2DCCE", source: ["IMG_2061"] },
      { name: "grout", value: "#C8BBA8", source: ["IMG_2060"] },
      { name: "hinoki", value: "#C9A87C", source: ["IMG_2061", "IMG_2077"] },
      { name: "walnut", value: "#6A5849", source: ["IMG_2023", "IMG_2086"] },
    ],
  },
  {
    id: "garden",
    title: "Garden 庭",
    description: "Kenrokuen moss, the milky bath, the plaque's patina.",
    colors: [
      { name: "moss-600", value: "#65746E", source: ["IMG_2073"] },
      { name: "moss-400", value: "#879379", source: ["IMG_2073", "IMG_2075"] },
      { name: "verdigris", value: "#7BA08F", source: ["IMG_2088"] },
      { name: "teal-milk", value: "#688488", source: ["IMG_2048"] },
    ],
  },
  {
    id: "light",
    title: "Light 光",
    description: "The amber ramp of night windows and lamps, golden hour, and the one saturated accent.",
    colors: [
      { name: "amber-300", value: "#F5C168", source: ["IMG_2052"] },
      { name: "amber-500", value: "#E8A33D", source: ["IMG_2052", "IMG_2049"] },
      { name: "amber-700", value: "#B97722", source: ["IMG_2095"] },
      { name: "gold-dusk", value: "#C97B2D", source: ["IMG_2093"] },
      { name: "vermillion", value: "#A93A2C", source: ["IMG_2092", "IMG_2101"] },
    ],
  },
  {
    id: "market",
    title: "Market 市",
    description: "The kawaii shelves — blind boxes, hanafuda, the toy laptop.",
    colors: [
      { name: "sun", value: "#EDD94A", source: ["IMG_2110", "IMG_2111"] },
      { name: "sky", value: "#9FD3E8", source: ["IMG_2111", "IMG_2104"] },
      { name: "sakura", value: "#F2C6D3", source: ["IMG_2104", "IMG_2105"] },
      { name: "mint", value: "#BCDCC0", source: ["IMG_2103"] },
      { name: "grape", value: "#6E5497", source: ["IMG_2102"] },
    ],
  },
  {
    id: "night",
    title: "Night 夜",
    description: "The observed dark mode: sumi grounds, paper ink, amber as the accent.",
    colors: [
      { name: "ground", value: "#14161A", source: ["IMG_2049"] },
      { name: "surface", value: "#22262E", source: ["IMG_2062"] },
      { name: "raised", value: "#343A44" },
      { name: "ink", value: "#F3EEE2" },
      { name: "glow", value: "#E8A33D", source: ["IMG_2052"] },
    ],
  },
  {
    id: "matsuri",
    title: "Matsuri 祭",
    description: "Market × night — the lantern-lit night market.",
    colors: [
      { name: "ground", value: "#241F35" },
      { name: "surface", value: "#2A2440" },
      { name: "raised", value: "#3A3358" },
      { name: "ink", value: "#F5EFDC" },
      { name: "glow", value: "#EDD94A", source: ["IMG_2110"] },
    ],
  },
];
