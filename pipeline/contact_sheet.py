#!/usr/bin/env python3
"""Generate library/index.html — theme-grouped browser for the inspiration library."""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LIB = os.path.join(ROOT, "library")

THEME_ORDER = [
    ("module-variation", "Module × Variation", "A repeated unit where every instance differs slightly — mass production with a hand in it."),
    ("line-and-arc", "Line + Arc", "Straight lines and circle segments are a complete vocabulary."),
    ("light-as-animator", "Light as the Animator", "Things don't get highlighted; they ignite."),
    ("visible-care", "Visible Care", "Support structures shown proudly, not hidden."),
    ("paper-calm", "Paper Calm", "Cream grounds, sparse color events, letterpress quiet."),
    ("market-density", "Market Density", "Sticker joy, collection grids, warm clutter — deliberate density."),
    ("tactility", "Tactility & Imperfection", "Surfaces with hands in their history: grout, glaze, laminate, weathering."),
    ("signage-systems", "Signage as System", "One shape, many tenants; numbered clipboards; unified marks."),
]

with open(os.path.join(LIB, "manifest.json")) as f:
    manifest = json.load(f)

cards_by_theme = {k: [] for k, _, _ in THEME_ORDER}
for m in manifest:
    for t in m["themes"]:
        if t in cards_by_theme:
            cards_by_theme[t].append(m)

html = ["""<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Japan Design Space — Inspiration Library</title>
<style>
  :root { --paper:#F7F3EA; --ink:#22282F; --rule:#D8D0C0; --accent:#B03A2E; }
  * { box-sizing:border-box; margin:0; }
  body { background:var(--paper); color:var(--ink); font:15px/1.5 Georgia,'Times New Roman',serif; padding:3rem 4vw 6rem; }
  h1 { font-size:1.9rem; font-weight:normal; letter-spacing:.02em; }
  .sub { color:#6b6558; margin:.4rem 0 2.5rem; font-style:italic; }
  nav { display:flex; flex-wrap:wrap; gap:.6rem 1.4rem; margin-bottom:3rem; border-top:1px solid var(--rule); border-bottom:1px solid var(--rule); padding:.8rem 0; }
  nav a { color:var(--ink); text-decoration:none; font-size:.85rem; letter-spacing:.06em; text-transform:uppercase; }
  nav a:hover { color:var(--accent); }
  section { margin-bottom:4rem; }
  h2 { font-weight:normal; font-size:1.35rem; margin-bottom:.2rem; }
  .thesis { color:#6b6558; font-style:italic; margin-bottom:1.2rem; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:1.4rem; }
  figure { background:#fff; border:1px solid var(--rule); padding:.6rem; }
  figure img { width:100%; display:block; }
  figcaption { font-size:.78rem; color:#6b6558; margin-top:.5rem; }
  figcaption b { color:var(--ink); font-weight:normal; }
  .type { display:inline-block; font-size:.68rem; letter-spacing:.08em; text-transform:uppercase; border:1px solid var(--rule); padding:0 .4rem; margin-right:.35rem; }
</style></head><body>
<h1>Japan Design Space — Inspiration Library</h1>
<p class="sub">Deterministic extractions from 65 photos, Aug 7–12. Grouped by essence theme; a derivative may appear under several.</p>
<nav>"""]
for key, title, _ in THEME_ORDER:
    html.append(f'<a href="#{key}">{title}</a>')
html.append("</nav>")

for key, title, thesis in THEME_ORDER:
    items = cards_by_theme[key]
    html.append(f'<section id="{key}"><h2>{title}</h2><p class="thesis">{thesis} — {len(items)} extractions</p><div class="grid">')
    for m in items:
        cap = f'<span class="type">{m["type"]}</span><b>{m["source"]} · {m["name"]}</b><br>{m["note"]}'
        html.append(f'<figure><img loading="lazy" src="{m["file"]}" alt="{m["source"]} {m["name"]}"><figcaption>{cap}</figcaption></figure>')
    html.append("</div></section>")

html.append("</body></html>")
with open(os.path.join(LIB, "index.html"), "w") as f:
    f.write("\n".join(html))
print("library/index.html written")
