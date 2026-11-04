import type { Model, Snapshot } from "./types";

// The cron runs every 4 hours, so this is three missed runs in a row
export const STALE_AFTER_MS = 12 * 60 * 60 * 1000;

export function isStale(fetchedAt: string, now: Date): boolean {
	return now.getTime() - Date.parse(fetchedAt) > STALE_AFTER_MS;
}

// Link previews need absolute URLs. The workers.dev address points here too
export const SITE_URL = "https://models.ddewhurst.com";
// Part of the page's ETag: bump it when the markup changes, so browsers don't revalidate an old page to 304
export const RENDER_VERSION = "2";
const TITLE = "Trending Models: Hugging Face trending, with memory";
const DESCRIPTION =
	"The models trending on Hugging Face right now, charted every four hours with how many days each has trended.";
// public/og.png, made from scripts/og-image.html
const OG_IMAGE_ALT = "Trending Models, printed as a cyan and black singles chart with positions, days on and trending scores.";

// "Days on" grows with a run, so staying power reads at a glance: a run this long prints boxed in ink,
// and a long run prints larger in its box
const MID_RUN = 4;
const LONG_RUN = 7;

// Hugging Face lists models by trending score, so its own order is already the score order: No. 1 has
// the top score, and the page needs no second order or top-score mark
export function renderPage(snapshot: Snapshot | null, now = new Date()): string {
	const models = snapshot?.models ?? [];
	const newCount = models.filter((m) => m.isNew).length;
	const historyStart = snapshot?.historyStart ? shortDate(`${snapshot.historyStart}T00:00:00Z`) : null;
	// Score bars scale to the top score, so scores compare at a glance
	const maxScore = Math.max(0, ...models.map((m) => m.trendingScore));
	// The legend's "days" sample is boxed, so it shows a run of at least MID_RUN days, the longest today if longer.
	// Without any history (D1 failed) the rows show "–", so the sample is left out
	const hasHistory = models.some((m) => m.daysTrending !== undefined);
	const keyDays = Math.max(MID_RUN, ...models.map((m) => m.daysTrending ?? 0));

	// Two printed columns on wide screens; one list order for everything else
	const half = Math.ceil(models.length / 2);
	const columns = [models.slice(0, half), models.slice(half)].filter((c) => c.length);

	const chart = models.length
		? `<div class="chart" style="--rows:${half}">${columns
				.map(
					(col, c) => `
		<section class="col"${c ? ` aria-label="Positions ${half + 1} to ${models.length}"` : ` aria-label="Positions 1 to ${col.length}"`}>
			<div class="heads" aria-hidden="true"><span>Rank</span><span><span class="h-d1">Days</span> <span class="h-d2">on</span></span><span>Model <span class="range">${c * half + 1}–${c * half + col.length}</span></span><span>Score</span></div>
			<ol class="rows" role="list" start="${c * half + 1}">${col.map((m, i) => renderRow(m, c * half + i + 1, maxScore)).join("")}</ol>
		</section>`,
				)
				.join("")}
	</div>`
		: `<div class="empty"><p class="empty-title">No trending data yet.</p><p>The first chart is compiled on the next 4-hour run.</p></div>`;

	const when = snapshot ? chartTime(snapshot.fetchedAt) : null;
	const stale =
		snapshot && isStale(snapshot.fetchedAt, now)
			? `<p class="stale" role="status">This chart is from ${timeAgo(snapshot.fetchedAt, now)}. Updates seem to have stopped, so it may be out of date.</p>`
			: "";

	return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${TITLE}</title>
<meta name="description" content="${DESCRIPTION}">
<link rel="canonical" href="${SITE_URL}/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Trending Models">
<meta property="og:url" content="${SITE_URL}/">
<meta property="og:title" content="${TITLE}">
<meta property="og:description" content="${DESCRIPTION}">
<meta property="og:image" content="${SITE_URL}/og.png">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${OG_IMAGE_ALT}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#20d4e6" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#2cc0cf" media="(prefers-color-scheme: dark)">
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(FAVICON)}">
<link rel="preload" href="/fonts/big-shoulders-display-v24-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/archivo-v25-latin.woff2" as="font" type="font/woff2" crossorigin>
<style>${CSS}</style>
</head>
<body>
<header class="mast">
	<div class="mast-in">
		<h1>Trending Models</h1>
		<div class="tag">
			<p class="tag-line">Hugging Face trending, with memory</p>
			<p>The models trending on Hugging Face right now, charted every four hours, with how many days each has trended.</p>
		</div>
		${
			when && snapshot
				? `<p class="when">
			<span class="when-label">Updated</span>
			<span class="when-ago">${timeAgo(snapshot.fetchedAt, now)}</span>
			<span class="when-day">Chart of ${when.day}, <time datetime="${esc(snapshot.fetchedAt)}">${when.time} UTC</time></span>
		</p>`
				: ""
		}
	</div>
</header>
${stale}
${
	models.length
		? `<div class="key">
	<p class="key-sum"><strong>${models.length}</strong> ${models.length === 1 ? "model" : "models"} trending${newCount ? `, <strong>${newCount}</strong> of them new to trending` : ""}. Ranked by Hugging Face's trending score.</p>
	<div class="key-legend">
		${newCount ? `<p class="key-sample"><span class="stamp stamp-key" aria-hidden="true">New</span> = first day on Hugging Face trending</p>` : ""}
		${hasHistory ? `<p class="key-sample key-days-item"><span class="key-days" aria-hidden="true"><span class="run"><span class="on-n mid">${keyDays}</span><span class="on-l">days</span></span></span> = days on Hugging Face trending${historyStart ? ` since ${historyStart}` : ""}; boxed from ${MID_RUN} days</p>` : ""}
		${models.length > 1 ? `<p class="key-sample key-bars"><span class="key-bar" aria-hidden="true"><span></span></span> = share of the top score</p>` : ""}
	</div>
</div>`
		: ""
}
<main>
	${chart}
</main>
<footer>
	<p>Data from <a href="https://huggingface.co/models">huggingface.co/models</a> and the Hugging Face API. Not affiliated with Hugging Face.</p>
	<p class="foot-links"><a href="https://trending.ddewhurst.com/">GitHub trending</a><a href="/api/trending">JSON</a><a href="https://github.com/danjdewhurst/trending-models">Source</a><a href="https://ddewhurst.com" rel="author">ddewhurst.com</a></p>
</footer>
</body>
</html>`;
}

function renderRow(model: Model, position: number, maxScore: number): string {
	const created = model.createdAt ? shortDate(model.createdAt) : null;
	const facts = [
		model.library ? esc(model.library) : null,
		model.license ? `${esc(model.license)} license` : null,
		model.gated ? "gated" : null,
		created ? `created ${created}` : null,
	]
		// No-break spaces keep a fact whole, so a date or a license never splits across lines
		.flatMap((f) => (f ? [f.replace(/ /g, "\u00a0")] : []));
	const delay = Math.min(position, 25) * 40;
	// The smallest score still shows a sliver; no score shows no bar
	const bar = maxScore > 0 && model.trendingScore > 0 ? Math.max(8, Math.round((model.trendingScore / maxScore) * 100)) : 0;

	return `
		<li class="row${position === 1 ? " one" : ""}">
			<span class="pos">${position}</span>
			<span class="on">${renderDaysOn(model, delay)}</span>
			<div class="body">
				<a class="name" href="${esc(model.url)}" title="${esc(model.author ? `${model.author} / ${model.name}` : model.name)}">${model.author ? `<span class="who"><span class="owner">${esc(model.author)}</span><span class="sep"> / </span></span>` : ""}<span class="model">${esc(model.name)}</span></a>
				<p class="by">
					${model.task ? `<span class="task">${esc(taskName(model.task))}</span>` : ""}
					${model.params ? `<span title="${formatFull(model.params)} parameters"><span aria-hidden="true">${formatParams(model.params)} params</span><span class="sr-only">${formatParams(model.params)} parameters</span></span>` : ""}
					<span title="${formatFull(model.likes)} likes"><span aria-hidden="true">${formatCompact(model.likes)} likes</span><span class="sr-only">${formatFull(model.likes)} likes</span></span>
					<span class="downloads" title="${formatFull(model.downloads)} downloads in the last 30 days"><span aria-hidden="true">${formatCompact(model.downloads)} downloads</span><span class="sr-only">${formatFull(model.downloads)} downloads in the last 30 days</span></span>
				</p>
				${facts.length ? `<p class="facts">${facts.join(" · ")}</p>` : ""}
			</div>
			<p class="gain">
				<span class="gain-n">${formatFull(model.trendingScore)}<span class="sr-only"> trending score</span></span>
				<span class="bar" aria-hidden="true"><span style="width:${bar}%"></span></span>
			</p>
		</li>`;
}

function renderDaysOn(model: Model, delay: number): string {
	if (model.isNew) {
		return `<span aria-hidden="true"><span class="stamp" style="animation-delay:${delay}ms" title="First day on Hugging Face trending">New</span></span><span class="sr-only">New today</span>`;
	}
	const days = model.daysTrending;
	if (!days) return `<span class="none" aria-hidden="true">–</span><span class="sr-only">No history yet</span>`;
	return `<span aria-hidden="true"><span class="${days >= MID_RUN ? "run" : "plain"}"><span class="on-n${days >= LONG_RUN ? " long" : days >= MID_RUN ? " mid" : ""}">${days}</span><span class="on-l">${days === 1 ? "day" : "days"}</span></span></span><span class="sr-only">Trended on ${days} ${days === 1 ? "day" : "days"}</span>`;
}

// "text-generation" → "Text generation". The tag is the pipeline name Hugging Face filters by
export function taskName(task: string): string {
	const words = task.replace(/[-_]+/g, " ").trim();
	return words.charAt(0).toUpperCase() + words.slice(1);
}

// 1728801536 → "1.73B", 763205315794 → "763B": close to the sizes models are named by
export function formatParams(n: number): string {
	return new Intl.NumberFormat("en-US", { notation: "compact", maximumSignificantDigits: 3 }).format(n);
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
// Spelled out, because Intl's en-GB short month is "Sept" in some runtimes and "Sep" in others
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "Sun 1 Nov 2026" and "16:00", in UTC. Null for a timestamp that doesn't parse, so the masthead drops it
export function chartTime(iso: string): { day: string; time: string } | null {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return null;
	const pad = (n: number) => String(n).padStart(2, "0");
	return {
		day: `${WEEKDAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`,
		time: `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`,
	};
}

function esc(text: string): string {
	return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function formatFull(n: number): string {
	return n.toLocaleString("en-US");
}

function formatCompact(n: number): string {
	return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n).toLowerCase();
}

// "23 Oct 2026", in UTC. Null for a timestamp that doesn't parse
export function shortDate(iso: string): string | null {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return null;
	return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function timeAgo(iso: string, now: Date): string {
	const minutes = Math.round((now.getTime() - new Date(iso).getTime()) / 60000);
	if (minutes < 1) return "just now";
	if (minutes < 60) return `${minutes} min ago`;
	const hours = Math.round(minutes / 60);
	if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
	const days = Math.round(hours / 24);
	return `${days} day${days === 1 ? "" : "s"} ago`;
}

// A cyan chart sheet with ruled rows
const FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="4" fill="#20d4e6"/><rect x="5" y="7" width="22" height="6" fill="#111"/><rect x="5" y="16" width="22" height="2.5" fill="#111"/><rect x="5" y="21.5" width="15" height="2.5" fill="#111"/></svg>`;

// Unicode ranges from Google Fonts' latin and latin-ext subsets. Font files are in public/fonts
const LATIN =
	"U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD";
const LATIN_EXT =
	"U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF";

// Both families are variable fonts, so one file covers every weight we use
const fontFace = (family: string, file: string, weight: string, range: string) =>
	`@font-face { font-family: "${family}"; font-style: normal; font-weight: ${weight}; font-display: swap; src: url(/fonts/${file}) format("woff2"); unicode-range: ${range}; }`;

const CSS = `
${fontFace("Big Shoulders Display", "big-shoulders-display-v24-latin.woff2", "800 900", LATIN)}
${fontFace("Archivo", "archivo-v25-latin.woff2", "400 800", LATIN)}
${fontFace("Archivo", "archivo-v25-latin-ext.woff2", "400 800", LATIN_EXT)}
:root {
	--cyan: #20d4e6;
	--black: #111;
	--sheet: #fff;
	--ink: #111;
	--muted: #444;
	--rule: #d4d4d4;
	--hover: #e0f8fa;
	--pos: var(--ink);
	--display: "Big Shoulders Display", "Arial Narrow", sans-serif;
	--text: "Archivo", system-ui, sans-serif;
	--gutter: 40px;
	color-scheme: light;
}
@media (prefers-color-scheme: dark) {
	:root {
		/* A warm off-white on a lifted sheet: pure white on black glares and blurs */
		--sheet: #161513;
		/* Full-strength cyan glares as a big block on a dark sheet, so it prints a step deeper */
		--cyan: #2cc0cf;
		--ink: #e8e4da;
		--muted: #d2cec4;
		--rule: #42403b;
		--hover: #10292c;
		/* Positions step back a little so the model name and the score lead the row */
		--pos: #c9c5bb;
		color-scheme: dark;
	}
}
* { box-sizing: border-box; }
html { scrollbar-color: var(--muted) var(--sheet); }
body {
	margin: 0;
	background: var(--sheet);
	color: var(--ink);
	font: 400 15px/1.45 var(--text);
	font-variant-numeric: tabular-nums;
	-webkit-font-smoothing: antialiased;
}
/* Light strokes on a dark sheet read thinner, so text gets a little more weight
   and keeps macOS's default rendering. The display face stays crisp */
@media (prefers-color-scheme: dark) {
	body { font-weight: 450; -webkit-font-smoothing: auto; }
	h1, .when-ago, .pos, .on-n, .gain-n, .empty-title { -webkit-font-smoothing: antialiased; }
	/* Dark type on a light ground prints as it does in light mode */
	.mast { font-weight: 400; }
	.mast, .stale, .stamp { -webkit-font-smoothing: antialiased; }
}
::selection { background: var(--cyan); color: var(--black); }
p { margin: 0; text-wrap: pretty; }
/* One underline for every link: thin, offset, a quiet tint of the text colour that goes solid on hover */
a { color: inherit; text-underline-offset: 3px; text-decoration-thickness: 1px; text-decoration-color: color-mix(in srgb, currentColor 45%, transparent); }
a:hover { text-decoration-color: currentColor; }
a:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
.sr-only {
	position: absolute;
	width: 1px;
	height: 1px;
	overflow: hidden;
	clip-path: inset(50%);
	white-space: nowrap;
}

/* Every band shares one measure, so left edges and rules line up down the page */
.mast-in, main, .key, footer { width: min(1440px, 100% - 2 * var(--gutter)); margin-left: auto; margin-right: auto; }

/* Masthead: the cyan band over a heavy rule */
.mast { background: var(--cyan); color: var(--black); border-bottom: 6px solid var(--black); }
.mast-in {
	padding: 16px 0 14px;
	display: grid;
	grid-template-columns: auto minmax(0, 1fr) auto;
	align-items: end;
	gap: 16px 40px;
}
h1 {
	margin: 0;
	font: 900 clamp(60px, 5.8vw, 92px)/.78 var(--display);
	text-transform: uppercase;
	letter-spacing: -.005em;
}
.tag { max-width: 54ch; padding-bottom: 4px; }
.tag-line { white-space: nowrap; font-weight: 800; font-size: 14px; letter-spacing: .06em; text-transform: uppercase; margin-bottom: 4px; }
.tag p:last-child { font-size: 16px; }
.when { display: grid; justify-items: end; text-align: right; }
/* The age leads, because "2 hours ago" needs no time-zone sums; the exact UTC time sits under it */
.when-label { font-weight: 800; font-size: 13px; letter-spacing: .08em; text-transform: uppercase; }
.when-ago { font: 900 32px/.9 var(--display); text-transform: uppercase; margin: 4px 0 6px; }
.when-day { font-weight: 600; font-size: 14px; }

/* Stale warning: a reversed strip across the sheet, the one place the chart admits it is old */
.stale {
	margin: 0;
	padding: 12px var(--gutter);
	background: var(--ink);
	color: var(--sheet);
	font-weight: 600;
	font-size: 14px;
	text-align: center;
}

/* Chart key, like the legend strip on a printed chart: the totals, then what the marks mean */
.key {
	padding: 10px 0;
	display: grid;
	gap: 6px;
	font-size: 14px;
	color: var(--muted);
	border-bottom: 1px solid var(--rule);
}
.key-sum { font-size: 14px; color: var(--ink); }
.key strong { color: var(--ink); font-weight: 800; }
.key-legend { display: grid; grid-template-columns: repeat(3, max-content); align-items: center; gap: 8px 40px; }
.key-sample { display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; column-gap: 8px; }
.key-sample > :first-child { justify-self: start; }
.key-days { color: var(--ink); white-space: nowrap; }
.key-days .on-n { font-size: 17px; }
.key-days .on-n.mid { font-size: 16px; }
.key-bar { display: flex; width: 56px; height: 7px; background: color-mix(in srgb, var(--ink) 12%, transparent); }
.key-bar span { width: 50%; background: var(--ink); }

main { padding-top: 0; }
.chart { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 48px; }
.heads, .row { display: grid; grid-template-columns: 40px 86px minmax(0, 1fr) 128px; column-gap: 14px; }
.heads {
	padding: 10px 10px 6px;
	border-bottom: 3px solid var(--ink);
	white-space: nowrap;
	font-weight: 800;
	font-size: 12px;
	line-height: 1.25;
	letter-spacing: .08em;
	text-transform: uppercase;
	align-items: end;
	/* The heads stay in view while the reader scrolls the chart */
	position: sticky;
	top: 0;
	z-index: 1;
	background: var(--sheet);
}

.heads span:nth-child(2) { text-align: center; }
.col:last-child .row:last-child { border-bottom: 0; }
.range { margin-left: 6px; display: none; }
.heads span:last-child { text-align: right; }
.rows { list-style: none; margin: 0; padding: 0; }

/* Each row is one grid: rank and days down the left, name and meta beside the score,
   then the facts run the full width under both */
.row { position: relative; padding: 12px 10px; border-bottom: 1px solid var(--rule); align-items: start; align-content: start; }
.body { display: contents; }
.pos { grid-column: 1; grid-row: 1 / span 3; font: 900 40px/.84 var(--display); color: var(--pos); }
.on { grid-column: 2; grid-row: 1 / span 3; text-align: center; padding-top: 3px; }
.name { grid-column: 3; grid-row: 1; justify-self: start; min-width: 0; }
.by { grid-column: 3; grid-row: 2; }
.gain { grid-column: 4; grid-row: 1 / span 2; }
.facts { grid-column: 3 / -1; grid-row: 3; }
.row:hover { background: var(--hover); }
/* Every count prints in ink, with a condensed unit */
.on-n { font: 800 23px/1 var(--display); color: var(--ink); }
/* A run of 4 days or more prints boxed in ink, number and unit together, the same shape as NEW */
.run { display: inline-block; padding: 3px 6px 2px; background: var(--ink); color: var(--sheet); white-space: nowrap; }
.run .on-n, .run .on-l { color: inherit; }
.on-n.mid { font-size: 22px; }
/* A long run prints larger in its box, still well below rank scale */
.on-n.long { font-size: 26px; font-weight: 900; }
.on-l { margin-left: 5px; font: 700 18px/1 var(--display); letter-spacing: .04em; text-transform: uppercase; color: var(--ink); }
.none { display: block; font-size: 15px; color: var(--muted); }
.name {
	font-weight: 800;
	font-size: 17px;
	line-height: 1.2;
	text-decoration: none;
	overflow-wrap: anywhere;
}
/* "author / name" is one link; the author is quieter, and a long pair breaks before the name, never inside it */
.who { font-weight: 500; color: var(--muted); }
.model { display: inline-block; max-width: 100%; }
/* A quiet underline on the name says "link"; it goes full ink on hover */
.model {
	text-decoration: underline;
	text-decoration-thickness: 1px;
	text-underline-offset: 3px;
	text-decoration-color: color-mix(in srgb, currentColor 45%, transparent);
}
.row:hover .model, .name:hover .model { text-decoration-color: currentColor; }
/* Where it is narrow (phones, and the two desktop columns), the author prints on a small line over the name,
   so every row has the same shape and a long pair never wraps at random. Model names run longer than
   GitHub repo names, so the desktop columns stack the author at every width */
@media (max-width: 640px), (min-width: 1101px) {
	.name { display: block; }
	.who { display: block; font-size: 14px; margin-bottom: 3px; }
	.sep { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
}
@media (min-width: 1101px) {
	.who { overflow: hidden; text-overflow: ellipsis; }
}
.name:focus-visible { outline: none; }
.row:has(.name:focus-visible) { outline: 2px solid var(--ink); outline-offset: -2px; }
.by {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 2px 14px;
	margin-top: 4px;
	font-size: 14px;
	color: var(--muted);
}
.task { font-weight: 700; color: var(--ink); }
.facts { margin-top: 3px; font-size: 14px; color: var(--muted); overflow-wrap: anywhere; }
.gain { text-align: right; padding-top: 1px; }
.gain-n { display: inline-block; font: 800 24px/.9 var(--display); }
/* A bar under each score, scaled to the top score, so scores compare at a glance */
.bar { display: flex; height: 7px; margin-top: 6px; background: color-mix(in srgb, var(--ink) 12%, transparent); }
.bar span { background: var(--ink); }

/* No. 1 leads with a bigger rank figure, on the same sheet as the rest */
.one .pos { font-size: 44px; color: var(--ink); }
.one .on { padding-top: 8px; }

.stamp {
	display: inline-block;
	/* A small tag tinted with the masthead's cyan: it marks a first day without
	   turning a chart that is mostly new into a cyan stripe */
	padding: 3px 5px 2px;
	background: color-mix(in srgb, var(--cyan) 42%, var(--sheet));
	color: var(--ink);
	font: 800 15px/1 var(--display);
	letter-spacing: .06em;
	text-transform: uppercase;
	animation: stamp .42s cubic-bezier(.16, 1, .3, 1) both;
}
.stamp-key { animation: none; }
@media (prefers-color-scheme: dark) {
	/* A cyan block shouts on the dark sheet, so NEW prints as a cyan outline */
	.stamp { background: none; color: var(--cyan); box-shadow: inset 0 0 0 1.5px var(--cyan); }
}
@keyframes stamp {
	from { transform: scale(1.9); }
	to { transform: scale(1); }
}
@media (prefers-reduced-motion: reduce) {
	.stamp { animation: none; }
}

.empty { padding: 72px 0; }
.empty-title { font: 900 48px/1 var(--display); text-transform: uppercase; margin-bottom: 8px; }

footer {
	margin-top: 24px;
	padding: 18px 0 40px;
	border-top: 3px solid var(--ink);
	display: flex;
	justify-content: space-between;
	gap: 8px 24px;
	flex-wrap: wrap;
	font-size: 14px;
	color: var(--muted);
}
.foot-links { display: flex; flex-wrap: wrap; gap: 4px 22px; font-weight: 600; font-size: 14px; color: var(--ink); }

/* Wide screens print both columns at chart density: one line each for name, meta and facts */
@media (min-width: 1101px) {
	/* Row N on the left and row N on the right share one grid row, so the columns stay in step
	   and each pair is only as tall as its taller row */
	.chart { grid-template-rows: auto repeat(var(--rows), auto); }
	.col { grid-row: 1 / -1; display: grid; grid-template-rows: subgrid; }
	.rows { grid-row: 2 / -1; display: grid; grid-template-rows: subgrid; }
	.row { padding: 7px 10px; }
	.pos { font-size: 36px; }
	.gain-n { font-size: 22px; }
	.range { display: inline; }
	/* A hairline down the gutter keeps the two columns reading top to bottom */
	.chart { column-gap: 0; }
	.col:first-child { padding-right: 24px; }
	/* The footer rule closes the chart, so the last rows drop their own hairline */
	.rows .row:last-child { border-bottom: 0; }
	.key-legend { display: flex; flex-wrap: wrap; gap: 8px 40px; }
	.col + .col { border-left: 2px solid var(--ink); padding-left: 24px; }
	/* Model names run long, so on two columns the link keeps to one line and ends in an ellipsis.
	   The full name is in its title, and screen readers get it whole. The padding keeps the underline */
	.name { display: block; max-width: 100%; line-height: 1.15; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-bottom: 3px; margin-bottom: -3px; }
	.model { display: inline; }
	/* Downloads go to screen readers only. The meta line keeps to one line: an item that
	   doesn't fit wraps onto a clipped second line, so it drops out whole instead of printing
	   a cut-off fragment. Screen readers still get it. The facts line ends in an ellipsis */
	.by { margin-top: 3px; line-height: 20px; height: 20px; overflow: hidden; row-gap: 4px; }
	.downloads { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
	.facts { margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.one .pos { font-size: 42px; }
}
/* Big screens have room for text a size up */
@media (min-width: 1500px) {
	.key-sum { font-size: 15px; }
	.name { font-size: 18px; }
	.by, .facts { font-size: 15px; }
	.by { line-height: 22px; height: 22px; }
}
@media (min-width: 641px) and (max-width: 1100px) {
	.key-legend { grid-template-columns: auto minmax(0, 1fr); column-gap: 40px; }
	.pos { font-size: 38px; }
	.name { font-size: 18px; }
}
/* Below desktop the legend wraps, so samples sit in one fixed column and their text lines up */
@media (max-width: 1100px) {
	/* One column: the sections give up their boxes, so the first heads stay stuck the whole way down */
	.col { display: contents; }
	.key-sample { grid-template-columns: 60px minmax(0, 1fr); }
	/* The dateline stands beside the title, and the strapline sits under it */
	.mast-in { grid-template-columns: minmax(0, 1fr) auto; }
	h1 { grid-column: 1; grid-row: 1; }
	.tag { grid-column: 1; grid-row: 2; }
	.when { grid-column: 2; grid-row: 1 / span 2; align-self: end; }
	.chart { grid-template-columns: minmax(0, 1fr); }
	.col + .col .heads { display: none; }
}
@media (max-width: 640px) {
	:root { --gutter: 16px; }
	.mast-in { grid-template-columns: minmax(0, 1fr); padding: 18px 0 14px; gap: 10px; }
	h1, .tag, .when { grid-column: 1; grid-row: auto; }
	/* One line: "TRENDING MODELS" sets about 6.5em wide */
	h1 { font-size: min(12vw, 64px); white-space: nowrap; }
	/* The key below says what the chart is, so the masthead keeps only the strapline */
	.tag p:last-child { display: none; }
	/* One line, "UPDATED 2 HOURS AGO", over the exact time */
	.when { justify-items: start; text-align: left; }
	.when-label { display: none; }
	.when-ago { font-size: 18px; margin: 0 0 3px; }
	.when-ago::before { content: "Updated "; }

	/* Legend text and the model column share one left edge */
	.key-legend { grid-template-columns: minmax(0, 1fr); gap: 6px; }
	.key-sample { grid-template-columns: 52px minmax(0, 1fr); column-gap: 12px; }
	.key-bars { display: none; }
	.heads { padding: 12px 0 7px; letter-spacing: .06em; }
	.heads, .row { grid-template-columns: 52px minmax(0, 1fr) auto; column-gap: 12px; }
	/* "Days" heads the left column under "Rank", as the cells stack */
	.heads { grid-template-rows: auto auto; }
	.heads > span:nth-child(1) { grid-column: 1; grid-row: 1; }
	.heads > span:nth-child(2) { grid-column: 1; grid-row: 2; text-align: left; }
	.h-d2 { display: none; }
	.heads > span:nth-child(3) { grid-column: 2; grid-row: 1 / span 2; }
	.heads > span:nth-child(4) { grid-column: 3; grid-row: 1 / span 2; }
	.row { padding: 14px 0; }
	.pos { grid-column: 1; font-size: 34px; }
	/* Days on sits right under the rank and reads as one unit, "3 days" */
	.on { grid-column: 1; margin-top: 38px; padding-top: 0; text-align: left; white-space: nowrap; }
	.on-n { font-size: 20px; }
	/* Boxed runs stack number over unit, so a two-digit run still fits the narrow column */
	.on .run { display: inline-flex; flex-direction: column; align-items: center; padding: 4px 6px 3px; }
	.on .run .on-l { margin: 2px 0 0; font-size: 14px; }
	.on-n.mid { font-size: 22px; }
	.on-n.long { font-size: 24px; }
	.name { grid-column: 2; font-size: 18px; }
	.gain { grid-column: 3; grid-row: 1; }
	.by, .facts { grid-column: 2 / -1; }
	.by { margin-top: 5px; }
	/* Downloads go to screen readers only, so the meta line keeps to one line */
	.downloads { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
	.gain-n { font-size: 22px; }
	.bar { display: none; }
	.one .pos { font-size: 44px; }
	.one .on { margin-top: 43px; padding-top: 0; }
	/* The score sits level with the model name, not the author line above it */
	.gain { align-self: end; }
	/* Taps land on the name even a little off the text */
	.name { position: relative; }
	.name::after { content: ""; position: absolute; inset: -10px -6px; }
	footer { flex-direction: column; }
	.foot-links { gap: 0 18px; }
	.foot-links a { padding: 10px 0; }
}
`;
