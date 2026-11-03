# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Developers and people who follow open models and want a better view of Hugging Face trending than huggingface.co/models gives. A first-time visitor must understand the page without explanation. Typical visit: a quick check, often on a phone or between tasks, to see which models are trending and which are new.

## Product Purpose

trending-models reads the Hugging Face trending list every 4 hours from the public API, adds each author's avatar, and keeps a history in D1. A visit must give two things at once: today's trending list with trending scores, easy to scan, and a clear view of which models are new today and which keep trending across days.

Success: a visitor finds a model worth opening within a few seconds, and can tell a one-day spike from a model with staying power.

## Positioning

Hugging Face's own trending page shows only now. This site remembers. Each model carries history from D1 (first seen, distinct days trending, a "new today" signal), so the page can show persistence, which huggingface.co/models cannot.

## Operating Context

- Data refreshes every 4 hours (cron), so the page is a snapshot with a known age.
- Page loads read one KV snapshot. D1 is queried only during a refresh, so any history the page shows must be computed then and stored on the snapshot.
- The same snapshot is public JSON at `/api/trending`.

## Capabilities and Constraints

- Per model: id, author, name, URL, Hugging Face's internal id, task (pipeline tag), library, license, parameter count, likes, downloads (last 30 days), trending score, creation date, gated flag, and the author's avatar when that lookup works. From history: `daysTrending`, `isNew`. On the snapshot: `historyStart`.
- 30 models per snapshot, the first page of huggingface.co/models.
- Any field except the id can be missing; avatar lookups can fail or be rate limited. Design must hold up without them.
- Rendered server-side in a Cloudflare Worker from one template (`src/render.ts`), with no client JavaScript. The CSP (`src/index.ts`) has no `script-src`.
- Follows the system light/dark preference.

## Brand Commitments

- Name in use: "Trending Models" (page title); planned domain models.ddewhurst.com.
- Sibling of Trending Repos (trending.ddewhurst.com), and shares its design.
- Not affiliated with Hugging Face. Data credit to huggingface.co/models must stay.
- MIT licensed.

## Evidence on Hand

- Live data: the KV snapshot at `/api/trending`, and `test/fixtures/trending.json`.
- No testimonials, user counts or analytics exist. Do not invent them.

## Product Principles

1. Today first, memory second: the current list is the core; history adds meaning without slowing the scan.
2. Honest freshness: always show how old the snapshot is.
3. Degrade quietly: missing API data must never look broken.
4. Fast and light: one KV read per page; nothing should make the page feel heavy.
