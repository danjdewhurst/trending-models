import { vi } from "vitest";
import trending from "./fixtures/trending.json";

// A trimmed copy of a real API response: 5 models
export const trendingJson = trending as object[];

export const HEALTHCHECK_URL = "https://hc.example/ping/abc";

// Stubs fetch: the trending list returns `models`, and pings to HEALTHCHECK_URL return 200.
// Any other request throws
export function mockHuggingFace(models: unknown[] | Response) {
	return vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
		const url = new URL(input instanceof Request ? input.url : String(input));
		if (url.hostname === "huggingface.co" && url.pathname === "/api/models") {
			return models instanceof Response ? models.clone() : Response.json(models);
		}
		if (url.hostname === "hc.example") return new Response("OK");
		throw new Error(`unexpected fetch ${url}`);
	});
}

// One model as the API lists it
export function apiModel(id: string, fields: Record<string, unknown> = {}) {
	return {
		_id: `hf-${id.toLowerCase()}`,
		id,
		author: id.includes("/") ? id.split("/")[0] : undefined,
		likes: 100,
		downloads: 1000,
		trendingScore: 50,
		pipeline_tag: "text-generation",
		library_name: "transformers",
		createdAt: "2026-10-01T00:00:00.000Z",
		gated: false,
		safetensors: { total: 1_000_000_000 },
		tags: ["transformers", "license:apache-2.0"],
		...fields,
	};
}

export const five = ["a", "b", "c", "d", "e"].map((n) => apiModel(`o/${n}`));
