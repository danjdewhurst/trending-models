---
name: Trending Models
description: Hugging Face trending printed as a two-colour trade-paper singles chart, with memory.
colors:
  chart-cyan: "#20d4e6"
  new-tint: "#a1edf5"
  ink: "#111"
  sheet: "#fff"
  muted: "#444"
  rule: "#d4d4d4"
  hover-wash: "#e0f8fa"
  sheet-dark: "#161513"
  chart-cyan-dark: "#2cc0cf"
  ink-dark: "#e8e4da"
  muted-dark: "#d2cec4"
  rule-dark: "#42403b"
  hover-wash-dark: "#10292c"
  position-dark: "#c9c5bb"
typography:
  display:
    fontFamily: "Big Shoulders Display, Arial Narrow, sans-serif"
    fontSize: "clamp(60px, 5.8vw, 92px)"
    fontWeight: 900
    lineHeight: 0.78
    letterSpacing: "-0.005em"
  headline:
    fontFamily: "Big Shoulders Display, Arial Narrow, sans-serif"
    fontSize: "32px"
    fontWeight: 900
    lineHeight: 0.9
    letterSpacing: "0em"
  numeral-position:
    fontFamily: "Big Shoulders Display, Arial Narrow, sans-serif"
    fontSize: "40px"
    fontWeight: 900
    lineHeight: 0.84
  numeral-gain:
    fontFamily: "Big Shoulders Display, Arial Narrow, sans-serif"
    fontSize: "24px"
    fontWeight: 800
    lineHeight: 0.9
  numeral-days:
    fontFamily: "Big Shoulders Display, Arial Narrow, sans-serif"
    fontSize: "23px"
    fontWeight: 800
    lineHeight: 1
  days-unit:
    fontFamily: "Big Shoulders Display, Arial Narrow, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.04em"
  stamp:
    fontFamily: "Big Shoulders Display, Arial Narrow, sans-serif"
    fontSize: "15px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.06em"
  title:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 800
    lineHeight: 1.2
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.45
    fontFeature: "\"tnum\" 1"
  body-small:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "0.08em"
rounded:
  none: "0px"
spacing:
  gutter: "40px"
  gutter-phone: "16px"
  column-gutter: "24px"
  cell-gap: "14px"
  cell-gap-phone: "12px"
  row-pad: "12px"
  row-pad-dense: "7px"
  row-pad-phone: "14px"
  key-pad: "10px"
components:
  masthead:
    backgroundColor: "{colors.chart-cyan}"
    textColor: "{colors.ink}"
    typography: "{typography.display}"
    rounded: "{rounded.none}"
    padding: "16px 0 14px"
  chart-key:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.muted}"
    typography: "{typography.body-small}"
    padding: "10px 0"
  column-heads:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    padding: "10px 10px 6px"
  chart-row:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    rounded: "{rounded.none}"
    padding: "12px 10px"
  chart-row-hover:
    backgroundColor: "{colors.hover-wash}"
  days-run:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.sheet}"
    typography: "{typography.numeral-days}"
    rounded: "{rounded.none}"
    padding: "3px 6px 2px"
  stamp-new:
    backgroundColor: "{colors.new-tint}"
    textColor: "{colors.ink}"
    typography: "{typography.stamp}"
    rounded: "{rounded.none}"
    padding: "3px 5px 2px"
  stamp-new-dark:
    backgroundColor: "{colors.sheet-dark}"
    textColor: "{colors.chart-cyan-dark}"
  stale-strip:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.sheet}"
    typography: "{typography.body-small}"
    padding: "12px 40px"
---

# Design System: Trending Models

This design comes from the sibling project trending-repos (GitHub trending). This page keeps its system, but prints in cyan instead of yellow so the two charts read as a pair and are not confused. It changes only what the data and the colour need. The differences are listed at the end, under "Differences from Trending Repos".

## Overview

**Creative North Star: "The Trade-Paper Chart Sheet"**

The page is a printed singles chart, not a list of cards. A cyan masthead band carries the title, the strapline and the dateline, which leads with how long ago the chart was updated. Below it, a key strip gives the totals and a legend. Then a dense numbered sheet prints four columns per row: rank, days on, the model, and its trending score. Two inks do all the work: chart cyan and ink black on a white sheet. Hierarchy comes from condensed display numerals at very different sizes, heavy and hairline rules, and small reversed ink boxes that mark the facts worth a second look.

The chart keeps Hugging Face's own order, which is already the trending-score order, so No. 1 has the top score and the scores and their bars read high to low. Memory is the point of difference: the "Days on" column counts the days each model has trended, and long runs print boxed in ink so staying power reads down the column at a glance.

Density is the point. On wide screens the sheet prints two columns at chart density, paired row by row, so a full chart reads like a page of a trade paper. On phones it collapses to one column without losing the rank, days-on and score figures. The system follows the operating system's light and dark preference; the dark sheet keeps the cyan band.

There is no client script. Motion is one gesture: the NEW tag presses onto the sheet once on load.

**Key Characteristics:**
- Chart cyan masthead band; white sheet; ink #111. Inside the chart, cyan marks NEW only.
- Condensed Big Shoulders Display numerals for ranks, scores, days on and the dateline's age; Archivo for all text.
- Ruled, not boxed: hairline row rules, a 3px rule under column heads and over the footer, a 6px rule under the masthead, a 2px ink divider between the desktop columns.
- Reversed ink boxes for runs of 4 days or more.
- Square corners everywhere; no shadows; no images.
- Tabular numerals across the whole page.

## Colors

A two-colour trade-paper palette (cyan and ink) on a white or near-black sheet. Greys are steps of the ink, not new colours.

### Primary
- **Chart Cyan** (`chart-cyan`): the masthead band, the text-selection highlight, the light `theme-color` and the favicon. The NEW tag on the light sheet is a 42% tint of it on the sheet (`new-tint`, from `color-mix(in srgb, var(--cyan) 42%, var(--sheet))`), so a chart with many new models does not turn into a cyan stripe.
- **Night Chart Cyan** (`chart-cyan-dark`): Chart Cyan under `prefers-color-scheme: dark`, for the masthead, the NEW tag outline, the selection highlight and the dark `theme-color`. The favicon keeps Chart Cyan.

### Neutral
- **Ink** (`ink`, also `--black` for type on cyan): all primary text, rank and days numerals, scores, the task, the masthead type and rule, the column-head and footer rules, the column divider, score bars, focus outlines, and the ground of every reversed box (days runs, the stale strip).
- **Sheet** (`sheet`): the page background, and the text in every reversed ink box.
- **Press Grey** (`muted`): secondary text: the author, the meta line (parameters, likes, downloads), the facts line, the chart key's prose, footer prose and the "–" no-history mark.
- **Hairline** (`rule`): 1px row rules and the key strip's bottom rule.
- **Cyan Wash** (`hover-wash`): row hover.
- **Dark sheet set** (`sheet-dark`, `ink-dark`, `muted-dark`, `rule-dark`, `hover-wash-dark`): the same roles under `prefers-color-scheme: dark`.
- **Night Position Grey** (`position-dark`): rank numerals on the dark sheet, except No. 1, which prints in full ink. In light mode ranks print in Ink.

### Dark Sheet Legibility
The dark sheet is newsprint at night, not white on black. Pure white on near-black glares, and thin light strokes blur, so:
- Ink is a warm off-white (`#e8e4da`, 14:1 on the sheet) on a lifted warm sheet (`#161513`). Do not push ink back to white or the sheet to black.
- Text set in Archivo on the dark sheet prints at weight 450 instead of 400, and uses the platform's default font smoothing. Display numerals (title, age, ranks, days, scores, empty title) keep `antialiased`, so the heavy figures stay crisp. Dark type on light grounds (the masthead, the stale strip) keeps the light-mode weight and smoothing.
- Cyan steps down to `chart-cyan-dark` (`#2cc0cf`). Full-strength cyan on the near-black sheet is the brightest thing on the page by far, and it glares. Ink #111 on it stays above 8:1. Do not push the dark cyan back to `#20d4e6`.
- The NEW tag does not fill on the dark sheet: it prints as a 1.5px Night Chart Cyan outline with cyan text (8:1 on the sheet).
- Rank numerals step down to `position-dark`: a column of large, full-white 900-weight figures pulls the eye off the model names. Scores stay full Ink, because they lead the row with the name.
- The tests hold ink, Press Grey and the rank colour at 7:1 or more on both sheets, ink on both cyans at 7:1 or more, and Night Chart Cyan at 7:1 or more on the dark sheet.

### Named Rules
**The Cyan Means New Rule.** Inside the chart, a cyan mark means "first day on Hugging Face trending" and nothing else. Long runs print in ink, never cyan. The row hover wash is a tint, not a mark.

**The Two-Ink Rule.** Everything prints in cyan and ink. There is no third colour and no image: the page prints no avatars.

## Typography

Both faces are self-hosted in `public/fonts` as variable woff2 files (Big Shoulders Display, latin; Archivo, latin and latin-ext), with their SIL OFL licences beside them. The CSP allows fonts from the site only.

**Display Font:** Big Shoulders Display 700/800/900 (with Arial Narrow, sans-serif)
**Body Font:** Archivo 400/450/500/600/700/800 (with system-ui, sans-serif). 450 is the text weight on the dark sheet

**Character:** A tall condensed poster face for every figure the eye scans, against a sturdy grotesque that stays readable at 12 to 18px. The contrast between the two sizes is the hierarchy.

### Hierarchy
- **Display** (900, clamp(60px, 5.8vw, 92px), 0.78, uppercase): the "Trending Models" title in the masthead only. Phones: min(12vw, 64px) on one line.
- **Headline** (900, 32px, 0.9, uppercase): the dateline's age ("2 hours ago"); 18px on phones. The empty state title uses the same face at 48px.
- **Position numeral** (900, 40px, 0.84): the "Rank" column. 38px at 641 to 1100px, 36px at 1101px and up, 34px on phones. No. 1 prints at 44px (42px at 1101px and up).
- **Score numeral** (800, 24px, 0.9): "822" in the "Score" column; 22px at 1101px and up and on phones.
- **Days numeral** (800, 23px, 1): the "Days on" count. A boxed run of 4 to 6 days sets at 22px; 7 days or more at 26px, weight 900. Phones: 20px, 22px and 24px. The legend sample sets at 16px.
- **Days unit** (Big Shoulders 700, 18px, 0.04em, uppercase): "DAYS" beside the count; 14px under the count in a stacked phone box.
- **NEW tag** (Big Shoulders 800, 15px, 0.06em, uppercase).
- **Title** (Archivo 800, 17px, 1.2): the model link. 18px at 641 to 1100px, at 1500px and up, and on phones; line-height 1.15 at 1101px and up. The author part is weight 500 in Press Grey, and 14px on its own line where it stacks.
- **Body** (400, 15px, 1.45): base text.
- **Small** (400, 14px): the meta line (the task at 700 in ink), the facts line, the chart key, the stale strip (600) and the footer (links 600, in ink). The meta and facts lines and the key's totals step up to 15px at 1500px and up.
- **Label** (800, 12px, 0.08em tracking, uppercase): column heads (0.06em on phones). The masthead strapline (800, 14px, 0.06em) and the dateline's "Updated" label (800, 13px, 0.08em) are its larger kin.

### Named Rules
**The Numerals Are Display Rule.** Every number the reader ranks by (rank, days on, trending score, the dateline's age) sets in Big Shoulders Display. Counts inside running text (parameters, likes, downloads, the key's totals, the exact UTC time) stay in Archivo.

**The Tabular Rule.** `font-variant-numeric: tabular-nums` applies to the whole page, so figures align down each column.

**The Label Names Data Rule.** Uppercase tracked labels name a column, a date or a data key. They never decorate a section heading.

## Layout

The page is a centred sheet, max 1440px, with 40px side gutters (16px at 640px and below). Every band (masthead, key strip, chart, footer) shares the same measure, so their left edges and rules align.

**Masthead.** A three-column grid (title, strapline and description, dateline), bottom-aligned, gaps 16px by 40px. At 1100px and below the title and strapline stack on the left and the dateline stands to their right. At 640px everything stacks: the title on one line, the strapline (which may wrap on the narrowest phones) without its description (the key already says what the chart is), then the dateline on one line, "UPDATED 2 HOURS AGO", over "Chart of Wed 4 Nov 2026, 16:00 UTC".

**Chart key strip.** A full-width strip under the masthead, padded 10px, closed by a hairline. Its top line gives the live counts and the order ("30 models trending, 3 of them new to trending. Ranked by Hugging Face's trending score."). Under it, the legend: NEW, a boxed days sample ("N DAYS = days on Hugging Face trending since 3 Nov 2026; boxed from 4 days"), and a bar sample ("share of the top score"). The days sample shows today's longest run (at least 4), and is omitted when no model has history (D1 failed). The NEW sample is omitted when no model is new, and the bar sample when there is only one model. At 1100px and below the samples sit in a 64px column so their text lines up; on phones that column is 52px, the same as the rank column, so the legend text and the model column share one left edge; the days sample stacks its number over its unit there, like the rows. A sample wider than its column (a three-digit run) widens it, so it never covers the text. The bar sample is hidden on phones, where bars are hidden.

**Chart order.** The page keeps the order of the Hugging Face API's `sort=trendingScore` list, which is the order huggingface.co/models shows. That order is the trending-score order, so the page has no second order and no "Rank by" switch.

**Chart grid.** Each row is a four-column grid: rank 40px, days on 86px, model flexible, score 128px, with 14px column gaps. Rows pad 12px by 10px and close with a 1px hairline. Rank and days span the row's height on the left; the link and the meta line sit beside the score; the facts line runs under both the model and the score columns. Column heads ("Rank", "Days on", "Model", "Score") repeat the grid over a 3px ink rule and stay stuck to the top of the viewport while the chart scrolls. In one column (1100px and below) the sections give up their boxes (`display: contents`), so the first heads stay stuck all the way down.

**Two-column reading order (1101px and up).** The chart prints as two columns, the left holding positions 1 to ceil(n/2), the right the rest. The column heads carry the range ("Model 1–15", "Model 16–30"). A 2px ink divider runs between the columns, with 24px on each side. Both columns are subgrids of one grid, so row N on the left and row N on the right share one grid row: each pair is only as tall as its taller row, and the columns stay in step. The DOM keeps assistive-tech order correct: two ordered lists, the second with `start`, each in a labelled section ("Positions 1 to 15", "Positions 16 to 30"). The last row of each column drops its hairline, because the footer rule closes the chart.

**Desktop density (1101px and up).**
- Rows pad 7px by 10px; ranks drop to 36px and scores to 22px.
- The author prints on its own small line over the name at every desktop width, because model names run long. The name keeps to one line and ends in an ellipsis; the link's `title` holds "author / name" in full, and screen readers get the whole link text.
- Downloads go to screen readers only. The meta line is one line high with overflow hidden: an item that does not fit wraps onto the clipped second line and is hidden whole, never shown as a cut-off fragment. Screen readers still read it.
- The facts line stays on one line and ends in an ellipsis.

**Tablet (641 to 1100px).** One chart column; the second list's column heads are hidden so the chart reads as one continuous sheet. "author / name" sits on one line. The meta line wraps, and downloads show.

**Phone (640px and below).** Three columns: 52px left, flexible body, auto score, with 12px gaps; rows pad 14px top and bottom with no side padding. Days on sits right under the rank in the left column, and its head ("Days") sits under "Rank". Boxed runs stack number over unit so a two-digit run fits. The author prints on its own line; the score aligns with the model name, not the author line. Downloads and score bars are hidden. Each fact keeps its words together with no-break spaces, so a date never splits across lines. The name link extends its tap area 10px by 6px. The footer stacks, and its links pad 10px top and bottom.

## Elevation & Depth

The system is flat. There are no shadows. Depth comes from print devices: rule weight (1px hairline, 2px column divider, 3px head and footer rules, 6px masthead rule), solid bands of colour, and small reversed ink boxes. The one `box-shadow` in the build is the dark NEW tag's 1.5px inset outline, a stroke with no offset or blur.

### Named Rules
**The Rules, Not Boxes Rule.** Separate content with rules of graded weight. Do not use cards, borders on four sides, or shadows.

**The Band Edge Rule.** In dark mode the 6px ink rule under the masthead does not print on the near-black sheet; the cyan band's own edge serves as the rule. Do not add a substitute rule colour to make it show.

## Shapes

Square corners throughout (0px): the NEW tag, days boxes and score bars (7px high). Nothing rotates.

## Components

### Masthead
Chart cyan band with ink type, closed by a 6px ink rule. Title left; strapline ("Hugging Face trending, with memory") and a one-line description centre (max 54ch); dateline right: an "Updated" label, then the age in display caps ("2 HOURS AGO"), then "Chart of Wed 4 Nov 2026, 16:00 UTC" with the time in a `<time>` element. The age leads because it needs no time-zone sums. The dateline is omitted when there is no snapshot or the timestamp does not parse.

### Chart Key
See Layout. Bold ink figures inside Press Grey prose; the NEW sample is static (no press motion).

### Stale Warning
When the snapshot is more than 12 hours old (three missed runs), a full-width strip prints between the masthead and the key: the sheet reversed (ink ground, sheet-coloured text), Archivo 600 at 14px, centred, `role="status"`. It is the one place the chart admits it is old, so it never uses cyan.

### Chart Row
- **Columns:** rank numeral, days on, model block (link, meta line, facts line), trending score with its bar.
- **Model link:** one link, "author / name". The author is weight 500 in Press Grey; only the name is underlined (1px, 3px offset, 45% of the text colour), and the underline goes solid on row hover. A long pair breaks before the name, never inside it. A bare id (no author) prints the name only. The link's `title` repeats "author / name".
- **Meta line:** task (ink, 700), parameter count ("1.73B params"), compact likes, compact downloads (last 30 days). Compact figures carry the full figure in `title` and in screen-reader text.
- **Facts line:** library, license, "gated" when access needs approval, and the creation date, joined by middle dots.
- **Score:** "822" over a 7px bar. The bar's width is the model's share of the top score, at least 8% (an empty track for a score of 0), in ink on a 12% ink track. Screen readers hear "trending score".
- **No. 1:** prints on the same sheet as the rest, never reversed. Only its rank numeral is larger (44px), and it stays full ink on the dark sheet. It has the top score, so it needs no other mark.
- **Hover:** cyan wash background and a solid underline on the name.
- **Focus:** the row draws a 2px ink outline inset 2px when its name link has focus. Other links use a 2px currentColor outline, offset 2px.
- **Degrades quietly:** a missing task, parameter count or fact removes its element.

### Days On Cell
- **Short run (1 to 3 days):** the count in ink with a condensed uppercase "DAY"/"DAYS" unit beside it (screen readers hear "Trended on 3 days").
- **Run (4 days or more):** count and unit print together in an ink box with sheet text, padding 3px 6px 2px; on phones the box stacks the number over the unit.
- **Long run (7 days or more):** the boxed count prints larger and heavier (900, 26px; 24px on phones).
- **NEW:** the NEW tag replaces the count (screen readers hear "New today").
- **No history:** a Press Grey "–" with screen-reader text "No history yet".

### NEW Tag
A small uppercase tag in Big Shoulders 800, 15px, 0.06em, padding 3px 5px 2px. Light sheet: `new-tint` ground with ink text. Dark sheet: no fill, Night Chart Cyan text and a 1.5px inset outline. On load it presses onto the sheet: scale 1.9 to 1 in 0.42s, `cubic-bezier(.16, 1, .3, 1)`, staggered 40ms per position (capped at position 25). The animation is disabled under `prefers-reduced-motion: reduce`, and on the key's legend sample.

### Empty State
"No trending data yet." in uppercase display at 48px, then one line saying the first chart is compiled on the next 4-hour run. The key strip is omitted; the dateline shows when a snapshot exists.

### Footer
A 3px ink rule over Press Grey 14px text: the data credit to huggingface.co/models and the Hugging Face API, "Not affiliated with Hugging Face", and ink links (600) to the sibling GitHub trending chart (trending.ddewhurst.com), the JSON, the source and the author's site (ddewhurst.com, `rel="author"`). The links wrap on narrow screens.

## Differences from Trending Repos

The two pages share tokens, type, rules, the days-on boxes, the NEW tag, the dateline and the layout. These parts differ because the data differs:

- **One order, no switch.** GitHub's trending order is not its stars-today order, so trending-repos ranks by stars today and keeps GitHub's order behind a "Rank by" switch. Hugging Face's order is the trending-score order, so this page has one order, and no top-gain chip.
- **No descriptions, homepages or topics.** The Hugging Face list has none of them. The facts line (library, license, gated, created) takes the description's place under the row.
- **The author stacks at every desktop width**, and the name ends in an ellipsis, because model names run much longer than repository names.
- **Cyan, not yellow**, for the band and for NEW.

## Do's and Don'ts

### Do:
- **Do** set every ranking figure (rank, days on, score, the dateline's age) in Big Shoulders Display, at sizes that keep rank largest.
- **Do** keep cyan inside the chart for NEW only.
- **Do** mark runs of 4 days or more with a reversed ink box.
- **Do** separate rows with 1px hairlines and heads with a 3px ink rule.
- **Do** keep the two-column chart in DOM order as two ordered lists, the second with `start`, and pair their rows with subgrid.
- **Do** keep Hugging Face's order.
- **Do** keep one underlined link per row: the model name.
- **Do** hide a meta item whole when it does not fit the one-line desktop meta row.
- **Do** give every compact or visual-only figure a full screen-reader equivalent.
- **Do** disable the NEW press under reduced motion.
- **Do** bump `RENDER_VERSION` when the markup or the CSS changes.

### Don't:
- **Don't** put models in cards, rounded boxes or shadowed panels.
- **Don't** round corners.
- **Don't** add a third palette colour.
- **Don't** reverse the No. 1 row or mark the top score in cyan.
- **Don't** print avatars; the author's name is enough.
- **Don't** print a truncated fragment of a meta item; hide it whole.
- **Don't** put uppercase tracked labels above section headings as decoration.
- **Don't** add motion beyond the NEW press.
