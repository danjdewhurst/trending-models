---
version: 1
slug: "src-render-ts"
primary_target: "src/render.ts"
related_targets: []
---

# Surface: trending page (`GET /`, rendered by src/render.ts)

Mode: Read. A visitor checks which models trend on Hugging Face now and which are new or staying.

Audience and job: first-time and returning developers, desk or phone, a 10-second scan, then open a model.
Content: one KV snapshot (30 models), freshness time, per-model history (days on chart, new today). API fields can be missing.
Constraints: no client JS (CSP has no script-src), fonts self-hosted in public/fonts (CSP font-src 'self'), follows system light/dark, keep "Not affiliated with Hugging Face" and the data credit.

## Direction contract

THESIS: Hugging Face trending is a singles chart; this page is the chart with memory. It refuses the card-list-of-models and prints a dense numbered chart sheet: position, days on chart, title, trending score. The design is shared with trending-repos.
OWN-WORLD: two-colour trade-paper chart sheet. Chart yellow #ffde17 masthead band over a 6px ink rule, white sheet, ink #111, one hot pink #ff3d8b for NEW stamps. Big Shoulders Display condensed numerals for positions and scores; Archivo for text. Hairline row rules, a heavy rule under column heads, the No. 1 row printed reversed.
STORY: the visitor sees the date and time of this chart, reads No. 1, scans positions, spots NEW stamps and long runs in "Days on", opens a model.
FIRST VIEWPORT: full-width yellow masthead: "TRENDING MODELS" huge condensed, left; tagline and chart key centre; chart date and "16:00 UTC" huge, right. Below, a two-column chart (positions 1 to n/2 left, rest right) on desktop; the No. 1 row reversed in ink with its score in yellow. One column on phones.
FORM: The Singles Chart, position 1 on my ordered list (IMPECCABLE'S PICK). seed:14250a7849ea27dc
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Signature interaction: NEW stamps print onto the sheet once on load (stamp press), disabled under reduced motion.
Memorable moment: the reversed No. 1 row and the pink NEW stamps down the "Days on" column.
