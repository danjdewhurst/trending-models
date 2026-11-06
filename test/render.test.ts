import { describe, expect, it } from "vitest";
import { chartTime, formatParams, renderPage, shortDate, SITE_URL, STALE_AFTER_MS, taskName, timeAgo } from "../src/render";
import type { Model } from "../src/types";

const FETCHED_AT = "2026-10-05T00:00:00.000Z";

const model = (fields: Partial<Model> = {}): Model => ({
	id: "o/m",
	author: "o",
	name: "m",
	url: "https://huggingface.co/o/m",
	hfId: "hf-1",
	task: null,
	library: null,
	license: null,
	params: null,
	likes: 12345,
	downloads: 6,
	trendingScore: 10,
	createdAt: null,
	gated: false,
	...fields,
});

const page = (...models: Model[]) => renderPage({ fetchedAt: FETCHED_AT, models });
const count = (html: string, needle: string) => html.split(needle).length - 1;

// WCAG contrast ratio between two #rgb or #rrggbb colours
const contrast = (a: string, b: string) => {
	const luminance = (color: string) => {
		const hex = color.length === 4 ? color.replace(/[0-9a-f]/g, "$&$&") : color;
		const [r, g, bl] = [1, 3, 5].map((i) => {
			const c = parseInt(hex.slice(i, i + 2), 16) / 255;
			return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
		});
		return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
	};
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (hi + 0.05) / (lo + 0.05);
};

describe("renderPage", () => {
	it("escapes model text", () => {
		const html = page(model({ name: `<script>alert(1)</script>`, author: `"><img>`, library: "<b>", license: "<i>", task: "<u>" }));
		expect(html).not.toContain("<script>alert");
		expect(html).not.toContain(`"><img>`);
		expect(html).not.toMatch(/<[biu]>/);
		// The link's title carries the name too, so it is escaped there as well
		expect(html).toContain(`title="&#34;&#62;&#60;img&#62; / &#60;script&#62;alert(1)&#60;/script&#62;"`);
	});

	it("prints no images, so the page loads nothing from other hosts", () => {
		const html = page(model(), model({ name: "s", isNew: true }));
		expect(html).not.toContain("<img");
		expect(html).not.toContain("avatar");
	});

	it("gives screen readers the exact counts, and links \"author / name\" as one link", () => {
		const html = page(model({ author: "acme", name: "awesome", params: 1_728_801_536 }));
		expect(html).toContain(`<span class="sr-only">12,345 likes</span>`);
		expect(html).toContain(`<span class="sr-only">6 downloads in the last 30 days</span>`);
		expect(html).toContain(`<span aria-hidden="true">1.73B params</span>`);
		expect(html).toContain(
			`<a class="name" href="https://huggingface.co/o/m" title="acme / awesome"><span class="who"><span class="owner">acme</span><span class="sep"> / </span></span><span class="model">awesome</span></a>`,
		);
		// The name is the row's only link
		expect(count(html.match(/<ol[\s\S]*<\/ol>/)?.[0] ?? "", "<a ")).toBe(1);
	});

	it("leaves out the author for a bare model id", () => {
		const html = page(model({ author: null, name: "gpt2" }));
		expect(html).toMatch(/<a class="name" href="[^"]+" title="gpt2"><span class="model">gpt2<\/span><\/a>/);
		expect(html).not.toContain(`class="who"`);
	});

	it("prints the task, library, license, gate and creation date", () => {
		const html = page(
			model({ task: "image-text-to-text", library: "transformers", license: "apache-2.0", gated: true, createdAt: "2026-10-23T21:35:42.000Z" }),
		);
		expect(html).toContain(`<span class="task">Image text to text</span>`);
		// Each fact keeps its words together with no-break spaces
		expect(html).toContain(`<p class="facts">transformers · apache-2.0\u00a0license · gated · created\u00a023\u00a0Oct\u00a02026</p>`);
		expect(page(model())).not.toContain(`class="facts"`);
		expect(page(model())).not.toContain(`class="task"`);
	});

	it("shows the trending score in the score column", () => {
		const html = page(model({ trendingScore: 1234 }));
		expect(html).toContain(`<span class="gain-n">1,234<span class="sr-only"> trending score</span></span>`);
	});
});

describe("formatting", () => {
	it("prints parameter counts the way models are named", () => {
		expect(formatParams(1_728_801_536)).toBe("1.73B");
		expect(formatParams(763_205_315_794)).toBe("763B");
		expect(formatParams(33_697_781_029)).toBe("33.7B");
		expect(formatParams(601_159_424)).toBe("601M");
		expect(formatParams(6_849_378_030_158)).toBe("6.85T");
	});

	it("turns a pipeline tag into words", () => {
		expect(taskName("text-generation")).toBe("Text generation");
		expect(taskName("automatic-speech-recognition")).toBe("Automatic speech recognition");
		expect(taskName("any_to_any")).toBe("Any to any");
	});

	it("formats a short UTC date, or null", () => {
		expect(shortDate("2026-10-23T23:59:00Z")).toBe("23 Oct 2026");
		expect(shortDate("nope")).toBeNull();
	});
});

describe("days on", () => {
	it("counts days, with the right plural", () => {
		const one = page(model({ daysTrending: 1 }));
		expect(one).toContain(`<span class="on-l">day</span>`);
		expect(one).toContain("Trended on 1 day");
		const three = page(model({ daysTrending: 3 }));
		expect(three).toContain(`<span class="on-l">days</span>`);
		expect(three).toContain("Trended on 3 days");
	});

	it("boxes runs of 4 days or more, and prints runs of 7 or more larger", () => {
		// The row's own cell, up to its screen-reader text, so the legend sample can't satisfy the check
		const cell = (days: number) => page(model({ daysTrending: days })).match(/<span class="on">([\s\S]*?)<\/span>\s*<div class="body">/)?.[1] ?? "";
		expect(cell(3)).toContain(`<span class="plain"><span class="on-n">3</span>`);
		expect(cell(4)).toContain(`<span class="run"><span class="on-n mid">4</span>`);
		expect(cell(6)).toContain(`<span class="run"><span class="on-n mid">6</span>`);
		expect(cell(7)).toContain(`<span class="run"><span class="on-n long">7</span>`);
	});

	it("shows a boxed legend sample that matches the rule it explains", () => {
		const short = page(model({ daysTrending: 2 }));
		expect(short).toMatch(/class="key-days"[^>]*><span class="run"><span class="on-n mid">4<\/span>[\s\S]*?boxed from 4 days/);
		expect(page(model({ daysTrending: 9 }))).toMatch(/class="key-days"[^>]*><span class="run"><span class="on-n mid">9<\/span>/);
	});

	it("tags new models instead of counting their days", () => {
		const html = page(model({ isNew: true, daysTrending: 4 }));
		expect(html).toContain(`class="stamp"`);
		expect(html).toContain("New today");
		expect(html).not.toContain("Trended on 4 days");
	});

	it("caps the stamp delay so late rows don't wait long", () => {
		const models = Array.from({ length: 30 }, (_, i) => model({ name: `r${i}`, isNew: i === 29 }));
		expect(page(...models)).toContain("animation-delay:1000ms");
	});

	it("shows a dash without history, and only explains NEW when a model is new", () => {
		const none = page(model(), model({ name: "s" }));
		expect(count(none, "No history yet")).toBe(2);
		expect(none).not.toContain(`class="stamp stamp-key"`);
		// No history at all (D1 failed), so there are no day counts to explain
		expect(none).not.toContain(`class="key-days"`);

		expect(page(model({ daysTrending: 1 }))).not.toContain("first day on Hugging Face trending");
		expect(page(model({ isNew: true, daysTrending: 1 }))).toContain("first day on Hugging Face trending");
	});
});

describe("chart layout", () => {
	const names = (n: number) => Array.from({ length: n }, (_, i) => model({ name: `r${i + 1}` }));

	it("splits the chart into two numbered columns", () => {
		const html = page(...names(5));
		expect(html).toContain(`aria-label="Positions 1 to 3"`);
		expect(html).toContain(`aria-label="Positions 4 to 5"`);
		expect(html).toContain(`start="1"`);
		expect(html).toContain(`start="4"`);
		const positions = [...html.matchAll(/<span class="pos">(\d+)<\/span>/g)].map((m) => Number(m[1]));
		expect(positions).toEqual([1, 2, 3, 4, 5]);
	});

	it("prints one column for one model and one row each for two", () => {
		const one = page(...names(1));
		expect(count(one, `<section class="col"`)).toBe(1);
		expect(one).toContain(`aria-label="Positions 1 to 1"`);
		const two = page(...names(2));
		expect(count(two, `<section class="col"`)).toBe(2);
		expect(two).toContain(`aria-label="Positions 2 to 2"`);
	});

	it("marks only the No. 1 row", () => {
		const html = page(...names(3));
		expect(count(html, `class="row one"`)).toBe(1);
		expect(html).toMatch(/class="row one">\s*<span class="pos">1<\/span>/);
	});

	it("keeps Hugging Face's order", () => {
		const html = page(model({ name: "a", trendingScore: 50 }), model({ name: "b", trendingScore: 200 }), model({ name: "c", trendingScore: 50 }));
		const order = [...html.matchAll(/<span class="model">(\w+)<\/span>/g)].map((m) => m[1]);
		expect(order).toEqual(["a", "b", "c"]);
		expect(html).toContain("Ranked by Hugging Face's trending score.");
	});

	it("prints each column's range in its heads, and pairs the rows across the columns", () => {
		const html = page(...names(5));
		expect(html).toContain(`<div class="chart" style="--rows:3">`);
		expect(html).toContain(`Model <span class="range">1–3</span>`);
		expect(html).toContain(`Model <span class="range">4–5</span>`);
	});

	it("scales each score bar to the top score", () => {
		const html = page(model({ name: "a", trendingScore: 200 }), model({ name: "b", trendingScore: 50 }), model({ name: "c", trendingScore: 1 }));
		const widths = [...html.matchAll(/<span style="width:(\d+)%"><\/span>/g)].map((m) => Number(m[1]));
		// The smallest still shows a sliver
		expect(widths).toEqual([100, 25, 8]);
	});

	it("draws no bar for no score", () => {
		const widths = (html: string) => [...html.matchAll(/<span style="width:(\d+)%"><\/span>/g)].map((m) => Number(m[1]));
		expect(widths(page(model({ name: "a", trendingScore: 200 }), model({ name: "b", trendingScore: 0 })))).toEqual([100, 0]);
		expect(widths(page(model({ name: "a", trendingScore: 0 }), model({ name: "b", trendingScore: 0 })))).toEqual([0, 0]);
	});

	it("explains the bars only when there is more than one model", () => {
		expect(page(...names(2))).toContain(`class="key-sample key-bars"`);
		expect(page(...names(1))).not.toContain(`class="key-sample key-bars"`);
	});

	it("counts new models in the key, and says when history starts", () => {
		const html = renderPage({ fetchedAt: FETCHED_AT, historyStart: "2026-11-03", models: [model({ isNew: true }), model({ name: "s", daysTrending: 1 })] });
		expect(html).toContain("<strong>2</strong> models trending, <strong>1</strong> of them new to trending.");
		expect(html).toContain("days on Hugging Face trending since 3 Nov 2026; boxed from 4 days");
		expect(page(model())).not.toContain("of them new");
		expect(page(model({ daysTrending: 1 }))).not.toContain(" since ");
		expect(page(model())).toContain("<strong>1</strong> model trending.");
	});
});

describe("freshness and fonts", () => {
	it("warns when the data is stale", () => {
		const at = (ms: number) => renderPage({ fetchedAt: FETCHED_AT, models: [model()] }, new Date(Date.parse(FETCHED_AT) + ms));
		expect(at(STALE_AFTER_MS - 60_000)).not.toContain(`class="stale"`);
		expect(at(STALE_AFTER_MS + 60_000)).toContain(`class="stale"`);
	});

	it("loads fonts from this site only", () => {
		const html = renderPage(null);
		expect(html).toContain("url(/fonts/archivo-v25-latin.woff2)");
		expect(html).toContain("url(/fonts/big-shoulders-display-v24-latin.woff2)");
		expect(html).not.toMatch(/fonts\.(googleapis|gstatic)\.com/);
	});

	it("tints the browser chrome with each scheme's cyan", () => {
		const html = renderPage(null);
		const cyans = [...html.matchAll(/--cyan: (#[0-9a-f]{6});/g)].map((m) => m[1]);
		// Light first, then the deeper cyan the dark sheet uses
		expect(cyans).toHaveLength(2);
		expect(cyans[1]).not.toBe(cyans[0]);
		expect(html).toContain(`<meta name="theme-color" content="${cyans[0]}" media="(prefers-color-scheme: light)">`);
		expect(html).toContain(`<meta name="theme-color" content="${cyans[1]}" media="(prefers-color-scheme: dark)">`);
	});

	it("keeps ink on both cyans, and both inks on their sheets, at 7:1 or more", () => {
		const html = renderPage(null);
		const tokens = (css: string) => (name: string) => css.match(new RegExp(`--${name}: (#[0-9a-f]{3}(?:[0-9a-f]{3})?);`))?.[1] ?? "";
		const light = tokens(html.match(/:root \{([^}]+)\}/)?.[1] ?? "");
		const dark = tokens(html.match(/prefers-color-scheme: dark\) \{\s*:root \{([^}]+)\}/)?.[1] ?? "");
		// The masthead prints black on cyan in both schemes
		expect(contrast(light("cyan"), light("black"))).toBeGreaterThanOrEqual(7);
		expect(contrast(dark("cyan"), light("black"))).toBeGreaterThanOrEqual(7);
		// Score bars print cyan on the dark sheet, so they must stand out from it
		expect(contrast(dark("cyan"), dark("sheet"))).toBeGreaterThanOrEqual(7);
		// Light --pos is var(--ink), so only it falls back to ink; any other token must be a hex colour
		expect(html).toContain("--pos: var(--ink);");
		for (const [t, fgs] of [[light, ["ink", "muted"]], [dark, ["ink", "muted", "pos"]]] as const) {
			for (const fg of fgs) {
				expect(t(fg), `--${fg}`).toMatch(/^#/);
				expect(contrast(t("sheet"), t(fg))).toBeGreaterThanOrEqual(7);
			}
		}
		// The NEW tag prints black on pink in both schemes
		expect(html).toMatch(/\.stamp \{[^}]*background: var\(--pink\);\s*color: var\(--black\);/);
		expect(contrast(light("pink"), light("black"))).toBeGreaterThanOrEqual(4.5);
		expect(contrast(dark("pink"), light("black"))).toBeGreaterThanOrEqual(4.5);
		// The No. 1 band is cyan, with black type and a deep cyan for its grey text
		const band = html.match(/\.row\.one, \.row\.one:hover \{([^}]+)\}/)?.[1] ?? "";
		expect(band).toContain("--ink: var(--black);");
		expect(band).toContain("background: var(--cyan);");
		const bandMuted = band.match(/--muted: (#[0-9a-f]{6});/)?.[1] ?? "";
		expect(bandMuted).toMatch(/^#/);
		for (const cyan of [light("cyan"), dark("cyan")]) expect(contrast(cyan, bandMuted)).toBeGreaterThanOrEqual(4.5);
		// A boxed run prints sheet-coloured text on ink, so its count and unit must not keep the ink colour
		expect(html).toContain(".run { display: inline-block; padding: 3px 6px 2px; background: var(--ink); color: var(--sheet);");
		expect(html).toContain(".run .on-n, .run .on-l { color: inherit; }");
	});

	it("prints the favicon in the light cyan, and keeps pink for NEW only", () => {
		const html = renderPage(null);
		const cyan = html.match(/--cyan: (#[0-9a-f]{6});/)?.[1] ?? "";
		expect(html).toContain(encodeURIComponent(`fill="${cyan}"`));
		// Pink is the second spot colour: the NEW tag is the only rule that uses it
		expect(html.match(/var\(--pink\)/g)).toHaveLength(1);
	});
});

describe("link previews", () => {
	it("gives sharing sites absolute URLs on the custom domain", () => {
		const html = renderPage(null);
		expect(SITE_URL).toBe("https://models.ddewhurst.com");
		expect(html).toContain(`<link rel="canonical" href="${SITE_URL}/">`);
		expect(html).toContain(`<meta property="og:url" content="${SITE_URL}/">`);
		expect(html).toContain(`<meta property="og:image" content="${SITE_URL}/og.png">`);
		expect(html).toContain(`<meta name="twitter:card" content="summary_large_image">`);
	});

	it("repeats the page title and description, and describes the image", () => {
		const html = renderPage(null);
		const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
		const description = html.match(/<meta name="description" content="([^"]+)">/)?.[1];
		expect(title).toBeTruthy();
		expect(description).toBeTruthy();
		expect(html).toContain(`<meta property="og:title" content="${title}">`);
		expect(html).toContain(`<meta property="og:description" content="${description}">`);
		// public/og.png is 1200x630; regenerate it with npm run og
		expect(html).toContain(`<meta property="og:image:type" content="image/png">`);
		expect(html).toContain(`<meta property="og:image:width" content="1200">`);
		expect(html).toContain(`<meta property="og:image:height" content="630">`);
		expect(html).toMatch(/<meta property="og:image:alt" content="[^"]+">/);
	});
});

describe("footer", () => {
	it("links to the GitHub trending chart, the JSON, the source and the author's blog", () => {
		for (const html of [renderPage(null), page(model())]) {
			const footer = html.match(/<footer>[\s\S]*<\/footer>/)?.[0];
			expect(footer, "page has no <footer>").toBeDefined();
			expect(footer).toContain(`<a href="https://trending.ddewhurst.com/">GitHub trending</a>`);
			expect(footer).toContain(`<a href="/api/trending">JSON</a>`);
			expect(footer).toContain(`<a href="https://github.com/danjdewhurst/trending-models">Source</a>`);
			expect(footer).toContain(`<a href="https://ddewhurst.com" rel="author">ddewhurst.com</a>`);
			// The sibling chart comes first, then this site's own links
			expect([...footer!.matchAll(/href="([^"]+)"/g)].map((m) => m[1])).toEqual([
				"https://huggingface.co/models",
				"https://trending.ddewhurst.com/",
				"/api/trending",
				"https://github.com/danjdewhurst/trending-models",
				"https://ddewhurst.com",
			]);
		}
	});
});

describe("empty and partial states", () => {
	it("shows the empty message and no key or time without a snapshot", () => {
		const html = renderPage(null);
		expect(html).toContain("No trending data yet");
		expect(html).not.toContain(`class="key"`);
		expect(html).not.toContain("<time");
	});

	it("shows the chart time but no key for a snapshot with no models", () => {
		const html = renderPage({ fetchedAt: FETCHED_AT, models: [] });
		expect(html).toContain("No trending data yet");
		expect(html).toContain(`class="when-ago"`);
		expect(html).not.toContain(`class="key"`);
	});

	it("still renders when the timestamp doesn't parse", () => {
		const html = renderPage({ fetchedAt: "not a date", models: [model()] });
		expect(html).toContain(`class="row one"`);
		expect(html).not.toContain("<time");
	});
});

describe("chartTime", () => {
	it("formats the UTC date and a 24-hour time", () => {
		expect(chartTime("2026-10-05T23:30:00Z")).toEqual({ day: "Mon 5 Oct 2026", time: "23:30" });
		expect(chartTime("2026-10-06T00:05:00Z")).toEqual({ day: "Tue 6 Oct 2026", time: "00:05" });
		expect(chartTime("2026-09-05T12:00:00Z")?.day).toBe("Sat 5 Sep 2026");
		expect(chartTime("nope")).toBeNull();
	});

	it("leads the dateline with the age, then the exact UTC time", () => {
		const html = renderPage({ fetchedAt: "2026-10-05T23:30:00Z", models: [model()] }, new Date("2026-10-06T01:30:00Z"));
		expect(html).toMatch(
			/<span class="when-label">Updated<\/span>\s*<span class="when-ago">2 hours ago<\/span>\s*<span class="when-day">Chart of Mon 5 Oct 2026, <time /,
		);
	});

	it("puts the raw timestamp on the time element", () => {
		expect(renderPage({ fetchedAt: "2026-10-05T23:30:00Z", models: [model()] })).toContain(
			`<time datetime="2026-10-05T23:30:00Z">23:30 UTC</time>`,
		);
	});
});

describe("timeAgo", () => {
	it("formats minutes, hours and days", () => {
		const now = new Date("2026-10-05T12:00:00Z");
		expect(timeAgo("2026-10-05T11:59:50Z", now)).toBe("just now");
		expect(timeAgo("2026-10-05T11:15:00Z", now)).toBe("45 min ago");
		expect(timeAgo("2026-10-05T11:00:00Z", now)).toBe("1 hour ago");
		expect(timeAgo("2026-10-03T12:00:00Z", now)).toBe("2 days ago");
	});
});
