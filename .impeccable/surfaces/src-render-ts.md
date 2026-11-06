---
version: 3
slug: "src-render-ts"
primary_target: "src/render.ts"
related_targets: ["src/index.ts"]
---

# Surface: trending page (`GET /`, rendered by src/render.ts)

Mode: Read. A visitor checks which models trend on Hugging Face now and which are new or staying.

Audience and job: first-time and returning developers, desk or phone, a 10-second scan, then open a model.
Content: one KV snapshot (30 models), freshness (age and exact UTC time), per-model history (days on chart, new today). API fields can be missing.
Order: Hugging Face's own trending order, which is the trending-score order. `src/index.ts` adds `RENDER_VERSION` to the page ETag.
Constraints: no client JS (CSP has no script-src), no remote images (CSP img-src data: only), fonts self-hosted in public/fonts (CSP font-src 'self'), follows system light/dark, keep "Not affiliated with Hugging Face" and the data credit.

## Direction contract

Revised 2026-11-04 to match the trending-repos redesign (forjd/trending-repos#10), and on 2026-11-06 to bring colour back into the chart. The build wins; DESIGN.md records it in full, with the differences from trending-repos.

THESIS: Hugging Face trending is a singles chart; this page is the chart with memory. It refuses the card-list-of-models and prints a dense numbered chart sheet: rank, days on chart, title, trending score. The system is shared with trending-repos; the inks inside the chart may differ (see DESIGN.md).
OWN-WORLD: three-ink trade-paper chart sheet. Chart cyan #20d4e6 masthead band over a 6px ink rule, white sheet, ink #111. Inside the chart, cyan prints the score bars (a deeper #0c8796 on the light sheet) and a band on the No. 1 row; pink #ff3d8b (#f2508f on the dark sheet) prints the NEW tag and nothing else. Big Shoulders Display condensed numerals for ranks, scores, days on and the update age; Archivo for text. Hairline row rules, a heavy rule under column heads, a 2px ink divider between desktop columns, reversed ink boxes for runs of 4+ days.
STORY: the visitor sees how long ago the chart was updated, reads No. 1 (the top score), scans scores and their bars, spots NEW tags and boxed runs in "Days on", opens a model.
FIRST VIEWPORT: full-width cyan masthead: "TRENDING MODELS" huge condensed, left; strapline and one-line description centre; "Updated" over "2 HOURS AGO" in display caps over "Chart of <day>, <hh:mm> UTC", right. Below, the key strip: totals and the order, then the legend. Then a two-column chart (positions 1 to n/2 left, rest right, rows paired by subgrid, sticky heads with ranges) on desktop. One column on phones, with "UPDATED 2 HOURS AGO" on one line.
FORM: The Singles Chart, position 1 on my ordered list (IMPECCABLE'S PICK). seed:14250a7849ea27dc
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Signature interaction: NEW tags press onto the sheet once on load (scale only), disabled under reduced motion.
Memorable moment: the boxed runs down the "Days on" column, and the update age leading the masthead.
