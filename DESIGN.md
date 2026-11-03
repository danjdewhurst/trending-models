---
name: Trending Models
description: Hugging Face trending printed as a two-colour trade-paper singles chart, with memory.
colors:
  chart-yellow: "#ffde17"
  stamp-pink: "#ff3d8b"
  ink: "#111"
  sheet: "#fff"
  muted: "#595959"
  rule: "#d4d4d4"
  hover-wash: "#fff8cc"
  one-muted: "#b8b8b8"
  sheet-dark: "#161513"
  chart-yellow-dark: "#e7c537"
  ink-dark: "#e8e4da"
  muted-dark: "#aaa69c"
  rule-dark: "#42403b"
  hover-wash-dark: "#24210f"
  position-dark: "#b3afa5"
  one-muted-dark: "#3d3616"
typography:
  display:
    fontFamily: "Big Shoulders Display, Arial Narrow, sans-serif"
    fontSize: "clamp(64px, 8.4vw, 124px)"
    fontWeight: 900
    lineHeight: 0.78
    letterSpacing: "-0.005em"
  headline:
    fontFamily: "Big Shoulders Display, Arial Narrow, sans-serif"
    fontSize: "72px"
    fontWeight: 900
    lineHeight: 0.82
    letterSpacing: "0em"
  numeral-position:
    fontFamily: "Big Shoulders Display, Arial Narrow, sans-serif"
    fontSize: "46px"
    fontWeight: 900
    lineHeight: 0.84
  numeral-gain:
    fontFamily: "Big Shoulders Display, Arial Narrow, sans-serif"
    fontSize: "28px"
    fontWeight: 800
    lineHeight: 0.9
  numeral-days:
    fontFamily: "Big Shoulders Display, Arial Narrow, sans-serif"
    fontSize: "22px"
    fontWeight: 800
    lineHeight: 1
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
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "11.5px"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "0.09em"
  stamp:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "10.5px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.1em"
rounded:
  none: "0px"
spacing:
  gutter: "40px"
  gutter-phone: "16px"
  column-gap: "48px"
  cell-gap: "14px"
  row-pad: "12px"
  row-pad-dense: "8px"
  key-pad: "14px"
components:
  masthead:
    backgroundColor: "{colors.chart-yellow}"
    textColor: "{colors.ink}"
    typography: "{typography.display}"
    rounded: "{rounded.none}"
    padding: "26px 40px 22px"
  chart-key:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.muted}"
    typography: "{typography.body-small}"
    padding: "14px 40px"
  column-heads:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    padding: "14px 0 7px"
  chart-row:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    rounded: "{rounded.none}"
    padding: "12px 0"
  chart-row-hover:
    backgroundColor: "{colors.hover-wash}"
  chart-row-one:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.sheet}"
    rounded: "{rounded.none}"
    padding: "16px 14px"
  chart-row-one-dark:
    backgroundColor: "{colors.chart-yellow-dark}"
    textColor: "{colors.ink}"
  stamp-new:
    backgroundColor: "{colors.stamp-pink}"
    textColor: "{colors.ink}"
    typography: "{typography.stamp}"
    rounded: "{rounded.none}"
    padding: "4px 6px 3px"
---

# Design System: Trending Models

This design comes from the sibling project trending-repos (GitHub trending). This page keeps its system and changes only what the data needs.

## Overview

**Creative North Star: "The Trade-Paper Chart Sheet"**

The page is a printed singles chart, not a list of cards. A yellow masthead band carries the title and the chart's own dateline and time; below it, a dense numbered sheet prints four columns per row: this chart's position, days on chart, the model, and its trending score. Two inks and one spot colour do all the work: chart yellow, ink black on a white sheet, and a hot pink reserved for NEW stamps. Hierarchy comes from condensed display numerals at very different sizes, heavy and hairline rules, and the reversed No. 1 row.

Density is the point. On wide screens the sheet prints two columns at chart density, one line of meta and one line of facts per row, so a full chart reads like a page of a trade paper. On phones it collapses to one column without losing the position, days-on and score columns. The system follows the operating system's light and dark preference; the dark sheet keeps the yellow band and prints No. 1 in yellow.

There is no client script. Motion is one gesture: the NEW stamp presses onto the sheet once on load.

**Key Characteristics:**
- Chart yellow masthead band; white sheet; ink #111; hot pink only for NEW.
- Condensed Big Shoulders Display numerals for positions, scores, days on and the chart time; Archivo for all text.
- Ruled, not boxed: hairline row rules, a 3px rule under column heads and over the footer, a 6px rule under the masthead.
- Square corners everywhere; no shadows.
- The No. 1 row prints reversed.
- Tabular numerals across the whole page.

## Colors

A two-colour trade-paper palette (yellow and ink) with one spot colour, on a white or near-black sheet.

### Primary
- **Chart Yellow** (`chart-yellow`): the masthead band, the text-selection highlight, the light `theme-color`, the favicon, and the No. 1 score figure, all on the light sheet. The dark sheet uses Night Chart Yellow instead.
- **Night Chart Yellow** (`chart-yellow-dark`): Chart Yellow under `prefers-color-scheme: dark`, for the masthead, the No. 1 row, the selection highlight and the dark `theme-color`. The favicon keeps Chart Yellow.

### Secondary
- **Stamp Pink** (`stamp-pink`): NEW stamps only, in the "Days on" column and once in the chart key as the legend sample. Text on it is ink.

### Neutral
- **Ink** (`ink`): all text on the light sheet, the masthead type and rule, column-head rule, footer rule, focus outlines, and the reversed No. 1 row's background.
- **Sheet** (`sheet`): the page background in light mode, and the No. 1 row's text.
- **Press Grey** (`muted`): secondary text: author meta line, "days" and "trending score" labels, the facts line, the chart key's prose, footer prose, the "–" no-history mark.
- **Hairline** (`rule`): 1px row rules and the key strip's bottom rule; the avatar placeholder.
- **Yellow Wash** (`hover-wash`): row hover background.
- **No. 1 Grey** (`one-muted`): secondary text inside the reversed No. 1 row.
- **Dark sheet set** (`sheet-dark`, `ink-dark`, `muted-dark`, `rule-dark`, `hover-wash-dark`, `one-muted-dark`): the same roles under `prefers-color-scheme: dark`. In dark mode the No. 1 row uses Night Chart Yellow as background with Ink text and Ink score, and `one-muted-dark` for its secondary text.
- **Night Position Grey** (`position-dark`): the position numerals on the dark sheet (except No. 1). In light mode positions print in Ink.

### Dark Sheet Legibility
The dark sheet is newsprint at night, not white on black. Pure white on near-black glares, and thin light strokes blur, so:
- Ink is a warm off-white (`#e8e4da`, 14:1 on the sheet) on a lifted warm sheet (`#161513`). Do not push ink back to white or the sheet to black.
- Text set in Archivo on the dark sheet prints at weight 450 instead of 400, and uses the platform's default font smoothing. Display numerals keep `antialiased`, so the heavy figures stay crisp. Dark type on light grounds (the masthead, the No. 1 row, the stale strip, NEW stamps) keeps the light-mode weight and smoothing.
- Yellow steps down to `chart-yellow-dark` (`#e7c537`, OKLCH 0.83 / 0.155, against 0.90 / 0.18 for Chart Yellow). Full-strength yellow blocks on the near-black sheet are the brightest thing on the page by far, and they glare. Ink on it stays above 11:1, and `one-muted-dark` stays above 7:1. Do not push the dark yellow back to `#ffde17`.
- Position numerals step down to `position-dark`: a column of large, full-white 900-weight figures pulls the eye off the model names. Scores stay full Ink, because they lead the row with the name.

### Named Rules
**The Spot Colour Rule.** Pink means NEW and nothing else. If an element does not mean "first seen on trending today", it is not pink.

**The Two-Ink Rule.** Everything else prints in yellow and ink. Author avatars are the only other colours, because they are data from Hugging Face, not palette.

## Typography

Both faces are self-hosted in `public/fonts` as variable woff2 files (Big Shoulders Display, latin; Archivo, latin and latin-ext), with their SIL OFL licences beside them. The CSP allows fonts from the site only.

**Display Font:** Big Shoulders Display 800/900 (with Arial Narrow, sans-serif)
**Body Font:** Archivo 400/450/600/800 (with system-ui, sans-serif). 450 is the text weight on the dark sheet

**Character:** A tall condensed poster face for every figure the eye scans, against a sturdy grotesque that stays readable at 11.5 to 17px. The contrast between the two sizes is the hierarchy.

### Hierarchy
- **Display** (900, clamp(64px, 8.4vw, 124px), 0.78, uppercase): the "Trending Models" title in the masthead only. Phones: clamp(52px, 17vw, 72px).
- **Headline** (900, 72px, 0.82): the chart time ("16:00") in the masthead; 44px on phones. The empty state title uses the same face at 48px, uppercase.
- **Position numeral** (900, 46px, 0.84): the "This chart" column. 40px on wide screens, 36px on phones; No. 1 prints at 76px (52px on phones).
- **Score numeral** (800, 28px, 0.9): "840" in the "Score" column. No. 1 at 40px (30px on phones); 24px on phones.
- **Days numeral** (800, 22px, 1): the "Days on" count; 20px on phones.
- **Title** (800, 17px, 1.2): model name. No. 1 at 23px (20px on phones).
- **Body** (400, 15px, 1.45): base text.
- **Small** (400, 13px): author meta line (the task at 700 in ink), facts line, chart key, footer, masthead "updated" line (600). "days" and "trending score" labels at 12px. Nothing the reader must read prints below 11.5px.
- **Label** (800, 11.5px, 0.09em tracking, uppercase): column heads. The NEW stamp is a printed mark, not running text, and stays at 10.5px with 0.1em tracking; the masthead strapline (14px, 0.06em) and dateline (12px, 0.08em) are its larger kin.

### Named Rules
**The Numerals Are Display Rule.** Every number the reader ranks by (position, days on, trending score, chart time) sets in Big Shoulders Display. Counts inside running text (parameters, likes, downloads, the key's totals) stay in Archivo.

**The Tabular Rule.** `font-variant-numeric: tabular-nums` applies to the whole page, so figures align down each column.

**The Label Names Data Rule.** Uppercase tracked labels name a column, a date or a data key. They never decorate a section heading.

## Layout

The page is a centred sheet, max 1520px, with 40px side gutters (16px at 640px and below). Every band (masthead, key strip, chart, footer) shares the same container and gutters, so their left edges align.

**Masthead.** A three-column grid (title, strapline and description, dateline and time), bottom-aligned, gaps 16px by 40px. At 1100px and below the title takes a full row; at 640px everything stacks and the time sits beside "UTC · updated" on one baseline.

**Chart key strip.** A full-width strip under the masthead, flex-wrapped with gaps 8px by 36px (6px by 20px on phones), closed by a hairline. It holds the live counts (models, new count), the NEW legend, the "Days on" definition with the first day of history, the score definition and the chart-order note. The key lives here, not in the masthead centre, because it carries live counts and needs the full width on phones and tablets. The NEW legend line is omitted when no model is new, because then there are no stamps to explain.

**Chart grid.** Each row is a four-column grid: position 56px, days on 52px, model flexible, score 104px, with 14px column gaps. Rows pad 12px top and bottom and close with a 1px hairline. Column heads repeat the grid over a 3px ink rule.

**Two-column reading order (>=1101px).** The chart prints as two columns, 48px apart: the left holds positions 1 to ceil(n/2), the right the rest. When the chart is taller than the viewport (Hugging Face lists 30 models), the reader finishes the left column before the right. This is inherent to the printed chart-sheet form. The DOM keeps assistive-tech order correct: two ordered lists, the second with `start`, each in a labelled section ("Positions 1 to 15", "Positions 16 to 30").

**Desktop density (>=1101px).** Both columns print at chart density:
- Rows pad 8px; positions drop to 40px.
- Downloads go to screen readers only. The meta line is 19px high with overflow hidden: an item that does not fit wraps onto the clipped second line and is hidden whole, never shown as a cut-off fragment. Screen readers still read it.
- The facts line stays on one line and ends in an ellipsis.
- The per-row "trending score" label is hidden; the column head names it.

**Tablet (641 to 1100px).** One chart column; the second list's column heads are hidden so the chart reads as one continuous sheet. The meta line wraps, and downloads show.

**Phone (<=640px).** Three columns: 40px left, flexible body, auto score. Days on moves under the position in the left column; its column head is hidden.

## Elevation & Depth

The system is flat. There are no shadows. Depth comes from print devices: rule weight (1px hairline, 3px head and footer rules, 6px masthead rule), solid bands of colour, and the reversed No. 1 row.

### Named Rules
**The Rules, Not Boxes Rule.** Separate content with horizontal rules of graded weight. Do not use cards, borders on four sides, or shadows.

**The Band Edge Rule.** In dark mode the 6px ink rule under the masthead does not print on the near-black sheet; the yellow band's own edge serves as the rule. Do not add a substitute rule colour to make it show.

## Shapes

Square corners throughout (0px), including avatars, stamps and the No. 1 row. The only angled element is the NEW stamp, set at -5 degrees like a rubber stamp. The No. 1 row bleeds 14px past the column on each side (16px on phones) so its reversed block reads as a printed bar, not a card.

## Components

### Masthead
Chart yellow band with ink type, closed by a 6px ink rule (light mode). Title left, strapline and two-line description centre (max 46ch), dateline right: "Chart of Sun 1 Nov 2026" over the time in display numerals over "UTC · updated 2 hours ago". The dateline is omitted when there is no snapshot.

### Chart Key
See Layout. Bold ink figures inside muted prose; the NEW legend shows a static stamp sample (no press motion).

### Stale Warning

When the snapshot is more than 12 hours old (three missed runs), a full-width strip prints between the masthead and the key: the sheet reversed (ink ground, sheet-coloured text), Archivo 600 at 14px, centred, `role="status"`. It is the one place the chart admits it is old, so it never uses yellow or pink.

### Chart Row
- **Columns:** position numeral, days on, model block (name, meta line, facts line), trending score.
- **Meta line:** 16px square avatar, author, task (ink, 700), parameter count ("1.73B params"), compact likes, compact downloads (last 30 days). Compact figures carry the full figure in `title` and in screen-reader text.
- **Facts line:** library, license, "gated" when access needs approval, and the creation date, joined by middle dots.
- **Model link:** only the name links to the model page; its accessible name includes the author ("author / name"). The row has no link overlay, so `title` tooltips and text selection work. Hover tints the row and underlines the name.
- **Hover:** yellow wash background and an underlined name.
- **Focus:** the row draws a 2px ink outline inset 2px when its name link has focus. Other links use a 2px currentColor outline, offset 2px.
- **Degrades quietly:** a missing task, parameter count or fact removes its element. A missing avatar prints as a blank hairline-grey square, so the author still lines up.

### No. 1 Row
Prints reversed. Light mode: ink background, white text, score in chart yellow. Dark mode: inverts to a Night Chart Yellow (`chart-yellow-dark`) row with ink text and ink score. Larger position (76px), name (23px) and score (40px). Its focus outline uses the score colour, inset 4px.

### Days On Cell
- **Count:** display numeral over a small "day"/"days" label (screen readers hear "Trended on 6 days").
- **Long run (>=7 days):** the numeral prints heavier (900, 26px; 22px on phones) with a 3px rule under it in the current colour, still well below position scale.
- **NEW:** a pink stamp replaces the count (screen readers hear "New today").
- **No history:** a muted "–" with screen-reader text "No history yet".

### NEW Stamp
Pink block, ink uppercase label (800, 10.5px, 0.1em), padding 4px 6px 3px, rotated -5 degrees. On load it presses onto the sheet: scale 1.9 and -14 degrees to rest in 0.42s, `cubic-bezier(.16, 1, .3, 1)`, staggered 40ms per position (capped at position 25). The animation is disabled under `prefers-reduced-motion: reduce`, and on the key's legend sample.

### Empty State
"No trending data yet." in uppercase display at 48px, then one line saying when the first chart compiles. The key strip and dateline are omitted.

### Footer
A 3px ink rule over muted small text: the data credit to huggingface.co/models, "Not affiliated with Hugging Face", and bold ink links to the JSON, the source and the author's blog (ddewhurst.com).

## Do's and Don'ts

### Do:
- **Do** set every ranking figure (position, days on, score, chart time) in Big Shoulders Display, at sizes that keep position largest.
- **Do** keep pink for NEW stamps only.
- **Do** separate rows with 1px hairlines and heads with a 3px ink rule.
- **Do** keep the two-column chart in DOM order as two ordered lists, the second with `start`.
- **Do** print No. 1 reversed: ink with a yellow score on the light sheet, yellow with an ink score on the dark sheet.
- **Do** hide a meta item whole when it does not fit the one-line desktop meta row.
- **Do** give every compact or visual-only figure a full screen-reader equivalent.
- **Do** disable the stamp press under reduced motion.

### Don't:
- **Don't** put models in cards, rounded boxes or shadowed panels.
- **Don't** round corners.
- **Don't** add a third palette colour; avatars are data, not palette.
- **Don't** print a truncated fragment of a link; hide it whole.
- **Don't** put uppercase tracked labels above section headings as decoration.
- **Don't** add motion beyond the stamp press.
