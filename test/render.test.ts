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
	avatarUrl: "https://cdn-avatars.huggingface.co/v1/production/uploads/1/a.png",
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
	});

	it("escapes the avatar URL inside its attribute", () => {
		const html = page(model({ avatarUrl: `https://cdn-avatars.huggingface.co/x" onerror="alert(1)` }));
		expect(html).not.toContain(`" onerror=`);
		expect(html).toContain(`src="https://cdn-avatars.huggingface.co/x&#34; onerror=&#34;alert(1)"`);
	});

	it("only puts avatars from Hugging Face's avatar host into <img>", () => {
		expect(page(model())).toContain(`<img class="avatar" src="https://cdn-avatars.huggingface.co/`);
		for (const avatarUrl of ["https://evil.example/a.png", "javascript:alert(1)", null, undefined]) {
			const html = page(model({ avatarUrl }));
			expect(html).not.toContain("<img");
			expect(html).toContain(`<span class="avatar" aria-hidden="true"></span>`);
		}
	});

	it("gives screen readers the exact counts and the author in the model link", () => {
		const html = page(model({ author: "acme", name: "awesome", params: 1_728_801_536 }));
		expect(html).toContain(`<span class="sr-only">12,345 likes</span>`);
		expect(html).toContain(`<span class="sr-only">6 downloads in the last 30 days</span>`);
		expect(html).toContain(`<span aria-hidden="true">1.73B params</span>`);
		expect(html).toContain(`<a class="name" href="https://huggingface.co/o/m"><span class="sr-only">acme / </span>awesome</a>`);
	});

	it("leaves out the author for a bare model id", () => {
		const html = page(model({ author: null, name: "gpt2" }));
		expect(html).toMatch(/<a class="name" href="[^"]+">gpt2<\/a>/);
		expect(html).not.toContain(`class="avatar"`);
	});

	it("prints the task, library, license, gate and creation date", () => {
		const html = page(
			model({ task: "image-text-to-text", library: "transformers", license: "apache-2.0", gated: true, createdAt: "2026-10-23T21:35:42.000Z" }),
		);
		expect(html).toContain(`<span class="task">Image text to text</span>`);
		expect(html).toContain(`<p class="facts">transformers · apache-2.0 license · gated · created 23 Oct 2026</p>`);
		expect(page(model())).not.toContain(`class="facts"`);
		expect(page(model())).not.toContain(`class="task"`);
	});

	it("shows the trending score in the gain column", () => {
		const html = page(model({ trendingScore: 1234 }));
		expect(html).toMatch(/<span class="gain-n">1,234<\/span>\s*<span class="gain-l">trending score<\/span>/);
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

	it("sets runs of 7 days or more heavier", () => {
		expect(page(model({ daysTrending: 6 }))).not.toContain("on-n long");
		expect(page(model({ daysTrending: 7 }))).toContain(`class="on-n long"`);
	});

	it("stamps new models instead of counting their days", () => {
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
		expect(none).toContain("Days on:");

		expect(page(model({ daysTrending: 1 }))).not.toContain("first seen on trending today");
		expect(page(model({ isNew: true, daysTrending: 1 }))).toContain("first seen on trending today");
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

	it("reverses only the No. 1 row", () => {
		const html = page(...names(3));
		expect(count(html, `class="row one"`)).toBe(1);
		expect(html).toMatch(/class="row one">\s*<span class="pos">1<\/span>/);
	});

	it("counts new models in the key, and says when history starts", () => {
		const html = renderPage({ fetchedAt: FETCHED_AT, historyStart: "2026-11-03", models: [model({ isNew: true }), model({ name: "s" })] });
		expect(html).toContain("<strong>2</strong> models trending, <strong>1</strong> of them new");
		expect(html).toContain("different days on Hugging Face trending since 3 Nov 2026");
		expect(page(model())).not.toContain("of them new");
		expect(page(model())).not.toContain(" since ");
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

	it("keeps No. 1's text at 7:1 or more on the dark cyan", () => {
		const html = renderPage(null);
		const dark = html.match(/prefers-color-scheme: dark\) \{\s*:root \{([^}]+)\}/)?.[1] ?? "";
		const token = (name: string) => dark.match(new RegExp(`--${name}: (#[0-9a-f]{3}(?:[0-9a-f]{3})?);`))?.[1] ?? "";
		const cyan = token("cyan");
		expect(dark).toContain("--one-bg: var(--cyan);");
		expect(contrast(cyan, token("one-fg"))).toBeGreaterThanOrEqual(7);
		expect(contrast(cyan, token("one-muted"))).toBeGreaterThanOrEqual(7);
	});

	it("keeps the masthead and No. 1's score at 7:1 or more on the light sheet, and the favicon in the same cyan", () => {
		const html = renderPage(null);
		const light = html.match(/:root \{([^}]+)\}/)?.[1] ?? "";
		const token = (name: string) => light.match(new RegExp(`--${name}: (#[0-9a-f]{3}(?:[0-9a-f]{3})?);`))?.[1] ?? "";
		const cyan = token("cyan");
		expect(contrast(cyan, token("black"))).toBeGreaterThanOrEqual(7);
		expect(token("one-gain")).toBe(cyan);
		expect(contrast(token("one-gain"), token("one-bg"))).toBeGreaterThanOrEqual(7);
		expect(html).toContain(encodeURIComponent(`fill="${cyan}"`));
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
		expect(html).toContain(`class="when-time"`);
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

	it("puts the raw timestamp on the time element", () => {
		expect(renderPage({ fetchedAt: "2026-10-05T23:30:00Z", models: [model()] })).toContain(
			`<time class="when-time" datetime="2026-10-05T23:30:00Z">23:30</time>`,
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
