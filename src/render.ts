import type { Model, Snapshot } from "./types";

// The cron runs every 4 hours, so this is three missed runs in a row
export const STALE_AFTER_MS = 12 * 60 * 60 * 1000;

export function isStale(fetchedAt: string, now: Date): boolean {
	return now.getTime() - Date.parse(fetchedAt) > STALE_AFTER_MS;
}

// Link previews need absolute URLs. The workers.dev address points here too
export const SITE_URL = "https://models.ddewhurst.com";
const TITLE = "Trending Models: Hugging Face trending, with memory";
const DESCRIPTION =
	"The models trending on Hugging Face right now, charted every four hours with how many days each has trended.";
// public/og.png, made from scripts/og-image.html
const OG_IMAGE_ALT = "Trending Models, printed as a yellow and black singles chart with positions, days on and trending scores.";

// A run this long prints heavier in "Days on", so staying power reads at a glance
const LONG_RUN = 7;

export function renderPage(snapshot: Snapshot | null, now = new Date()): string {
	const models = snapshot?.models ?? [];
	const newCount = models.filter((m) => m.isNew).length;
	const historyStart = snapshot?.historyStart ? shortDate(`${snapshot.historyStart}T00:00:00Z`) : null;

	// Two printed columns on wide screens; one list order for everything else
	const half = Math.ceil(models.length / 2);
	const columns = [models.slice(0, half), models.slice(half)].filter((c) => c.length);

	const chart = models.length
		? `<div class="chart">${columns
				.map(
					(col, c) => `
		<section class="col"${c ? ` aria-label="Positions ${half + 1} to ${models.length}"` : ` aria-label="Positions 1 to ${col.length}"`}>
			<div class="heads" aria-hidden="true"><span>This chart</span><span>Days on</span><span>Model</span><span>Score</span></div>
			<ol class="rows" role="list" start="${c * half + 1}">${col.map((m, i) => renderRow(m, c * half + i + 1)).join("")}</ol>
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
<meta name="theme-color" content="#ffde17" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#e7c537" media="(prefers-color-scheme: dark)">
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
			<p>The models trending on Hugging Face right now, charted every four hours with how long each one has been on the chart.</p>
		</div>
		${
			when && snapshot
				? `<p class="when">
			<span class="when-day">Chart of ${when.day}</span>
			<time class="when-time" datetime="${esc(snapshot.fetchedAt)}">${when.time}</time>
			<span class="when-ago">UTC · updated ${timeAgo(snapshot.fetchedAt, now)}</span>
		</p>`
				: ""
		}
	</div>
</header>
${stale}
${
	models.length
		? `<div class="key">
	<p><strong>${models.length}</strong> models trending${newCount ? `, <strong>${newCount}</strong> of them new` : ""}</p>
	${newCount ? `<p><span class="stamp stamp-key" aria-hidden="true">New</span> first seen on trending today</p>` : ""}
	<p><strong>Days on:</strong> different days on Hugging Face trending${historyStart ? ` since ${historyStart}` : ""}</p>
	<p><strong>Score:</strong> Hugging Face's trending score</p>
	<p>Positions follow Hugging Face's own trending order</p>
</div>`
		: ""
}
<main>
	${chart}
</main>
<footer>
	<p>Data from <a href="https://huggingface.co/models">huggingface.co/models</a> and the Hugging Face API. Not affiliated with Hugging Face.</p>
	<p class="foot-links"><a href="/api/trending">JSON</a><a href="https://github.com/danjdewhurst/trending-models">Source</a><a href="https://ddewhurst.com" rel="author">ddewhurst.com</a></p>
</footer>
</body>
</html>`;
}

function renderRow(model: Model, position: number): string {
	const avatar =
		model.avatarUrl && model.avatarUrl.startsWith("https://cdn-avatars.huggingface.co/")
			? `<img class="avatar" src="${esc(model.avatarUrl)}" alt="" width="16" height="16" loading="lazy">`
			: `<span class="avatar" aria-hidden="true"></span>`;
	const created = model.createdAt ? shortDate(model.createdAt) : null;
	const facts = [
		model.library ? esc(model.library) : null,
		model.license ? `${esc(model.license)} license` : null,
		model.gated ? "gated" : null,
		created ? `created ${created}` : null,
	].filter(Boolean);
	const delay = Math.min(position, 25) * 40;

	return `
		<li class="row${position === 1 ? " one" : ""}">
			<span class="pos">${position}</span>
			<span class="on">${renderDaysOn(model, delay)}</span>
			<div class="body">
				<a class="name" href="${esc(model.url)}">${model.author ? `<span class="sr-only">${esc(model.author)} / </span>` : ""}${esc(model.name)}</a>
				<p class="by">
					${model.author ? `${avatar}<span>${esc(model.author)}</span>` : ""}
					${model.task ? `<span class="task">${esc(taskName(model.task))}</span>` : ""}
					${model.params ? `<span title="${formatFull(model.params)} parameters"><span aria-hidden="true">${formatParams(model.params)} params</span><span class="sr-only">${formatParams(model.params)} parameters</span></span>` : ""}
					<span title="${formatFull(model.likes)} likes"><span aria-hidden="true">${formatCompact(model.likes)} likes</span><span class="sr-only">${formatFull(model.likes)} likes</span></span>
					<span class="downloads" title="${formatFull(model.downloads)} downloads in the last 30 days"><span aria-hidden="true">${formatCompact(model.downloads)} downloads</span><span class="sr-only">${formatFull(model.downloads)} downloads in the last 30 days</span></span>
				</p>
				${facts.length ? `<p class="facts">${facts.join(" · ")}</p>` : ""}
			</div>
			<p class="gain">
				<span class="gain-n">${formatFull(model.trendingScore)}</span>
				<span class="gain-l">trending score</span>
			</p>
		</li>`;
}

function renderDaysOn(model: Model, delay: number): string {
	if (model.isNew) {
		return `<span class="stamp" style="animation-delay:${delay}ms" aria-hidden="true">New</span><span class="sr-only">New today</span>`;
	}
	const days = model.daysTrending;
	if (!days) return `<span class="none" aria-hidden="true">–</span><span class="sr-only">No history yet</span>`;
	return `<span aria-hidden="true"><span class="on-n${days >= LONG_RUN ? " long" : ""}">${days}</span><span class="on-l">${days === 1 ? "day" : "days"}</span></span><span class="sr-only">Trended on ${days} ${days === 1 ? "day" : "days"}</span>`;
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

// A yellow chart sheet with ruled rows and a reversed No. 1 row
const FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="4" fill="#ffde17"/><rect x="5" y="7" width="22" height="6" fill="#111"/><rect x="5" y="16" width="22" height="2.5" fill="#111"/><rect x="5" y="21.5" width="15" height="2.5" fill="#111"/></svg>`;

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
	--yellow: #ffde17;
	--pink: #ff3d8b;
	--black: #111;
	--sheet: #fff;
	--ink: #111;
	--muted: #595959;
	--rule: #d4d4d4;
	--hover: #fff8cc;
	--one-bg: #111;
	--one-fg: #fff;
	--one-muted: #b8b8b8;
	--one-gain: #ffde17;
	--pos: var(--ink);
	--display: "Big Shoulders Display", "Arial Narrow", sans-serif;
	--text: "Archivo", system-ui, sans-serif;
	color-scheme: light;
}
@media (prefers-color-scheme: dark) {
	:root {
		/* A warm off-white on a lifted sheet: pure white on black glares and blurs */
		--sheet: #161513;
		/* Full-strength yellow glares as a big block on a dark sheet, so it prints a step deeper */
		--yellow: #e7c537;
		--ink: #e8e4da;
		--muted: #aaa69c;
		--rule: #42403b;
		--hover: #24210f;
		/* Positions step back so the model name and the score lead the row */
		--pos: #b3afa5;
		--one-bg: var(--yellow);
		--one-fg: #111;
		--one-muted: #3d3616;
		--one-gain: #111;
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
	h1, .when-time, .pos, .on-n, .gain-n, .empty-title { -webkit-font-smoothing: antialiased; }
	/* Dark type on a light ground prints as it does in light mode */
	.mast, .row.one { font-weight: 400; }
	.mast, .row.one, .stale, .stamp { -webkit-font-smoothing: antialiased; }
}
::selection { background: var(--yellow); color: var(--black); }
p { margin: 0; }
a { color: inherit; text-underline-offset: 3px; text-decoration-thickness: 1px; }
a:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
.sr-only {
	position: absolute;
	width: 1px;
	height: 1px;
	overflow: hidden;
	clip-path: inset(50%);
	white-space: nowrap;
}

/* Masthead: the yellow band over a heavy rule */
.mast { background: var(--yellow); color: var(--black); border-bottom: 6px solid var(--black); }
.mast-in {
	max-width: 1520px;
	margin: 0 auto;
	padding: 26px 40px 22px;
	display: grid;
	grid-template-columns: auto minmax(0, 1fr) auto;
	align-items: end;
	gap: 16px 40px;
}
h1 {
	margin: 0;
	font: 900 clamp(64px, 8.4vw, 124px)/.78 var(--display);
	text-transform: uppercase;
	letter-spacing: -.005em;
}
.tag { max-width: 46ch; padding-bottom: 4px; }
.tag-line { font-weight: 800; font-size: 14px; letter-spacing: .06em; text-transform: uppercase; margin-bottom: 4px; }
.tag p:last-child { font-size: 14px; }
.when { display: grid; justify-items: end; text-align: right; font-weight: 800; font-size: 12px; letter-spacing: .08em; text-transform: uppercase; }
.when-time { font: 900 72px/.82 var(--display); letter-spacing: 0; margin: 4px 0 3px; }
.when-ago { font-weight: 600; letter-spacing: .02em; text-transform: none; font-size: 13px; }

/* Stale warning: a reversed strip across the sheet, the one place the chart admits it is old */
.stale {
	margin: 0;
	padding: 12px 40px;
	background: var(--ink);
	color: var(--sheet);
	font-weight: 600;
	font-size: 14px;
	text-align: center;
}

/* Chart key, like the legend strip on a printed chart */
.key {
	max-width: 1520px;
	margin: 0 auto;
	padding: 14px 40px;
	display: flex;
	flex-wrap: wrap;
	gap: 8px 36px;
	font-size: 13px;
	color: var(--muted);
	border-bottom: 1px solid var(--rule);
}
.key strong { color: var(--ink); font-weight: 800; }
.key p { display: flex; align-items: center; gap: 8px; }

main { max-width: 1520px; margin: 0 auto; padding: 8px 40px 0; }
.chart { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 48px; }
.heads, .row { display: grid; grid-template-columns: 56px 52px minmax(0, 1fr) 104px; column-gap: 14px; }
.heads {
	padding: 14px 0 7px;
	border-bottom: 3px solid var(--ink);
	font-weight: 800;
	font-size: 11.5px;
	line-height: 1.25;
	letter-spacing: .09em;
	text-transform: uppercase;
}
.heads span:nth-child(2), .heads span:last-child { text-align: right; }
.rows { list-style: none; margin: 0; padding: 0; }

.row { position: relative; padding: 12px 0; border-bottom: 1px solid var(--rule); align-items: start; }
.row:hover { background: var(--hover); }
.row:hover .name { text-decoration: underline; }
.pos { font: 900 46px/.84 var(--display); color: var(--pos); }
.on { text-align: right; padding-top: 3px; }
.on-n { display: block; font: 800 22px/1 var(--display); }
/* A long run gets a heavier numeral and a rule under it, still well below position scale */
.on-n.long { font-size: 26px; font-weight: 900; padding-bottom: 2px; border-bottom: 3px solid currentColor; display: inline-block; }
.on-l, .none { display: block; font-size: 12px; color: var(--muted); }
.none { font-size: 15px; }
.body { min-width: 0; }
.name {
	font-weight: 800;
	font-size: 17px;
	line-height: 1.2;
	text-decoration: none;
	overflow-wrap: anywhere;
}
.name:focus-visible { outline: none; }
.row:has(.name:focus-visible) { outline: 2px solid var(--ink); outline-offset: -2px; }
.row.one:has(.name:focus-visible) { outline-color: var(--one-gain); outline-offset: -4px; }
.by {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 2px 12px;
	margin-top: 3px;
	font-size: 13px;
	color: var(--muted);
}
/* A blank square holds the place of a missing avatar, so the author still lines up */
.avatar { display: inline-block; width: 16px; height: 16px; margin-right: -6px; background: var(--rule); object-fit: cover; }
.task { font-weight: 700; color: var(--ink); }
.facts { margin-top: 3px; font-size: 13px; color: var(--muted); overflow-wrap: anywhere; }
.gain { text-align: right; padding-top: 1px; }
.gain-n { display: block; font: 800 28px/.9 var(--display); }
.gain-l { display: block; margin-top: 4px; font-size: 12px; color: var(--muted); }

/* No. 1 prints reversed */
.row.one { background: var(--one-bg); color: var(--one-fg); padding: 16px 14px; margin: 0 -14px; border-bottom: 0; }
.one .pos { font-size: 76px; color: inherit; }
.one .name { font-size: 23px; }
.one .by, .one .on-l, .one .gain-l, .one .facts { color: var(--one-muted); }
.one .task { color: inherit; }
.one .gain-n { font-size: 40px; color: var(--one-gain); }

.stamp {
	display: inline-block;
	padding: 4px 6px 3px;
	background: var(--pink);
	color: var(--black);
	font-weight: 800;
	font-size: 10.5px;
	line-height: 1;
	letter-spacing: .1em;
	text-transform: uppercase;
	transform: rotate(-5deg);
	animation: stamp .42s cubic-bezier(.16, 1, .3, 1) both;
}
.stamp-key { animation: none; }
@keyframes stamp {
	from { transform: scale(1.9) rotate(-14deg); }
	to { transform: scale(1) rotate(-5deg); }
}
@media (prefers-reduced-motion: reduce) {
	.stamp { animation: none; }
}

.empty { padding: 72px 0; }
.empty-title { font: 900 48px/1 var(--display); text-transform: uppercase; margin-bottom: 8px; }

footer {
	max-width: 1520px;
	margin: 48px auto 0;
	padding: 18px 40px 40px;
	border-top: 3px solid var(--ink);
	display: flex;
	justify-content: space-between;
	gap: 8px 24px;
	flex-wrap: wrap;
	font-size: 13px;
	color: var(--muted);
}
.foot-links { display: flex; gap: 20px; font-weight: 800; color: var(--ink); }

/* Wide screens print both columns at chart density: one line each for meta and facts */
@media (min-width: 1101px) {
	.row { padding: 8px 0; }
	.pos { font-size: 40px; }
	.name { line-height: 1.15; }
	/* Downloads go to screen readers only. The meta line keeps to one line: an item that
	   doesn't fit wraps onto a clipped second line, so it drops out whole instead of printing
	   a cut-off fragment. Screen readers still get it. The facts line ends in an ellipsis */
	.by { margin-top: 1px; height: 19px; overflow: hidden; row-gap: 4px; }
	.downloads { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
	.facts { margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.gain-l { display: none; }
	.row.one { padding: 12px 14px; }
}
@media (max-width: 1100px) {
	.mast-in { grid-template-columns: minmax(0, 1fr) auto; }
	h1 { grid-column: 1 / -1; }
	.chart { grid-template-columns: minmax(0, 1fr); }
	.col + .col .heads { display: none; }
}
@media (max-width: 640px) {
	.mast-in, .key, main, footer, .stale { padding-left: 16px; padding-right: 16px; }
	.mast-in { grid-template-columns: minmax(0, 1fr); padding-top: 20px; gap: 12px; }
	h1 { font-size: clamp(52px, 17vw, 72px); }
	.when { justify-items: start; justify-content: start; text-align: left; grid-template-columns: auto auto; align-items: baseline; column-gap: 10px; }
	.when-day { grid-column: 1 / -1; }
	.when-time { font-size: 44px; margin: 2px 0 0; }
	.key { gap: 6px 20px; }
	.heads, .row { grid-template-columns: 40px minmax(0, 1fr) auto; column-gap: 12px; }
	/* Keeps "This chart" inside its 40px column */
	.heads { letter-spacing: .04em; }
	.row { grid-template-rows: auto 1fr; }
	.heads span:nth-child(2) { display: none; }
	.heads span:nth-child(3) { grid-column: 2; }
	.pos { font-size: 36px; grid-row: 1; }
	.on { grid-column: 1; grid-row: 2; align-self: start; text-align: left; padding-top: 6px; }
	.on-n { font-size: 20px; }
	.on-n.long { font-size: 22px; }
	.body { grid-column: 2; grid-row: 1 / span 2; }
	.gain { grid-column: 3; grid-row: 1 / span 2; }
	.gain-n { font-size: 24px; }
	.row.one { padding: 14px 16px; margin: 0 -16px; }
	.one .pos { font-size: 52px; }
	.one .name { font-size: 20px; }
	.one .gain-n { font-size: 30px; }
	footer { flex-direction: column; }
}
`;
