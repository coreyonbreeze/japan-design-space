#!/usr/bin/env python3
"""Build a theme-grouped browser over the derivatives.

Grouping by theme rather than by photo is the point. Browsing by photo shows
you sixty separate frames; browsing by theme shows a relationship holding
across a sign, a wall and a floor at once, which is what a design system is.

Themes and their order come from recipes.json, so this carries no opinion
about what the themes should be.

Usage:
    python3 scripts/contact_sheet.py [--library library] [--recipes recipes.json]
                                     [--title "..."]
"""
import argparse
import html
import json
import os
import sys


def theme_order(recipes: dict) -> list:
    """Themes in first-appearance order, so the user's own ordering wins."""
    seen = []
    for frame in sorted(recipes):
        for t in recipes[frame].get("themes", []):
            if t not in seen:
                seen.append(t)
    return seen


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--library", default="library")
    ap.add_argument("--recipes", default="recipes.json")
    ap.add_argument("--title", default="Photograph extractions")
    ap.add_argument("--subtitle", default="Grouped by theme. A derivative may appear under several.")
    args = ap.parse_args()

    with open(os.path.join(args.library, "manifest.json")) as f:
        manifest = json.load(f)
    with open(args.recipes) as f:
        recipes = json.load(f)
    recipes.pop("_format", None)

    themes = theme_order(recipes)
    grouped = {t: [m for m in manifest if t in m.get("themes", [])] for t in themes}
    loose = [m for m in manifest if not m.get("themes")]
    if loose:
        grouped["unfiled"] = loose
        themes = themes + ["unfiled"]

    e = html.escape
    out = [
        """<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>""" + e(args.title) + """</title>
<style>
  :root { color-scheme: light dark; }
  * { box-sizing: border-box; margin: 0; }
  body { font: 15px/1.5 ui-serif, Georgia, serif; padding: 3rem 4vw 6rem; }
  h1 { font-size: 1.8rem; font-weight: normal; }
  .sub { opacity: .65; margin: .4rem 0 2.5rem; font-style: italic; }
  nav { display: flex; flex-wrap: wrap; gap: .6rem 1.4rem;
        border-block: 1px solid currentColor; padding: .8rem 0; margin-bottom: 3rem; }
  nav a { color: inherit; text-decoration: none; font-size: .8rem;
          letter-spacing: .06em; text-transform: uppercase; opacity: .75; }
  nav a:hover { opacity: 1; }
  section { margin-bottom: 4rem; }
  h2 { font-weight: normal; font-size: 1.3rem; }
  .count { opacity: .6; font-style: italic; margin-bottom: 1.2rem; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.4rem; }
  figure { border: 1px solid; padding: .6rem; }
  figure img { width: 100%; display: block; }
  figcaption { font-size: .76rem; opacity: .75; margin-top: .5rem; }
  .type { display: inline-block; font-size: .66rem; letter-spacing: .08em;
          text-transform: uppercase; border: 1px solid; padding: 0 .4rem; margin-right: .35rem; }
</style></head><body>
<h1>""" + e(args.title) + """</h1>
<p class="sub">""" + e(args.subtitle) + """</p>
<nav>""",
    ]
    for t in themes:
        out.append(f'<a href="#{e(t)}">{e(t.replace("-", " "))}</a>')
    out.append("</nav>")

    for t in themes:
        items = grouped[t]
        out.append(
            f'<section id="{e(t)}"><h2>{e(t.replace("-", " "))}</h2>'
            f'<p class="count">{len(items)} extractions</p><div class="grid">'
        )
        for m in items:
            cap = (
                f'<span class="type">{e(m["type"])}</span>'
                f'<b>{e(m["source"])} · {e(m["name"])}</b><br>{e(m.get("note", ""))}'
            )
            out.append(
                f'<figure><img loading="lazy" src="{e(m["file"])}" '
                f'alt="{e(m["source"])} {e(m["name"])}"><figcaption>{cap}</figcaption></figure>'
            )
        out.append("</div></section>")

    out.append("</body></html>")
    path = os.path.join(args.library, "index.html")
    with open(path, "w") as f:
        f.write("\n".join(out))
    print(f"{path} written — {len(themes)} themes, {len(manifest)} extractions")
    return 0


if __name__ == "__main__":
    sys.exit(main())
