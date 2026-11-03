import { afterEach, describe, expect, it, vi } from "vitest";
import { addAvatars, fetchTrending, LIMIT, toModel, TRENDING_URL } from "../src/huggingface";
import { apiModel, AVATAR, mockHuggingFace, trendingJson } from "./helpers";

afterEach(() => vi.restoreAllMocks());

describe("fetchTrending", () => {
	it("reads the API's trending list in its own order", async () => {
		mockHuggingFace(trendingJson);
		const models = await fetchTrending();
		expect(models.map((m) => m.id)).toEqual([
			"LiquidAI/LFM3-1.7B",
			"deepseek-ai/DeepSeek-V4.1-Flash-1017",
			"nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B",
			"mistralai/Mistral-Large-4-1T-A52B",
			"speridlabs/idol",
		]);
		expect(models[0]).toEqual({
			id: "LiquidAI/LFM3-1.7B",
			author: "LiquidAI",
			name: "LFM3-1.7B",
			url: "https://huggingface.co/LiquidAI/LFM3-1.7B",
			hfId: "6adbd32e8a9fcd3cba5db0ff",
			task: "text-generation",
			library: "transformers",
			license: "other",
			params: 1728801536,
			likes: 1363,
			downloads: 47817,
			trendingScore: 839,
			createdAt: "2026-10-23T21:35:42.000Z",
			gated: false,
		});
	});

	it("asks for the trending sort, the page size and the fields it uses", async () => {
		const fetch = mockHuggingFace(trendingJson);
		await fetchTrending("hf_token");
		const [url, init] = fetch.mock.calls[0];
		const params = new URL(String(url)).searchParams;
		expect(String(url)).toBe(TRENDING_URL);
		expect(params.get("sort")).toBe("trendingScore");
		expect(params.get("limit")).toBe(String(LIMIT));
		expect(params.getAll("expand[]")).toEqual(expect.arrayContaining(["trendingScore", "likes", "safetensors", "tags"]));
		expect((init?.headers as Record<string, string>).authorization).toBe("Bearer hf_token");
	});

	it("sends no authorization header without a token", async () => {
		const fetch = mockHuggingFace(trendingJson);
		await fetchTrending();
		expect((fetch.mock.calls[0][1]?.headers as Record<string, string>).authorization).toBeUndefined();
	});

	it("drops unsafe ids and duplicates that differ only in case", async () => {
		mockHuggingFace([
			apiModel("o/a"),
			apiModel("O/A"),
			apiModel("o/../x"),
			apiModel("../x"),
			apiModel(`o/"><script>`),
			{ id: 42 },
			null,
			apiModel("o/b"),
		]);
		expect((await fetchTrending()).map((m) => m.id)).toEqual(["o/a", "o/b"]);
	});

	it("fails on an error status or a response that isn't a list", async () => {
		mockHuggingFace(new Response("busy", { status: 503 }));
		await expect(fetchTrending()).rejects.toThrow(/returned 503/);
		vi.restoreAllMocks();
		mockHuggingFace(Response.json({ error: "nope" }));
		await expect(fetchTrending()).rejects.toThrow(/other than a list/);
	});
});

describe("toModel", () => {
	it("reads a bare id from the early days, with its author field", () => {
		expect(toModel(apiModel("gpt2", { author: "openai-community" }))).toMatchObject({
			id: "gpt2",
			name: "gpt2",
			author: "openai-community",
			url: "https://huggingface.co/gpt2",
		});
		expect(toModel(apiModel("gpt2"))?.author).toBeNull();
	});

	it("falls back to GGUF for the parameter count, and to null", () => {
		expect(toModel(apiModel("o/a", { safetensors: undefined, gguf: { total: 7_000_000 } }))?.params).toBe(7_000_000);
		expect(toModel(apiModel("o/a", { safetensors: null }))?.params).toBeNull();
	});

	it("treats missing or odd fields as empty", () => {
		const model = toModel({ id: "o/a", likes: "many", downloads: -5, tags: "license:mit", gated: "manual", pipeline_tag: " " });
		expect(model).toMatchObject({
			hfId: "o/a",
			likes: 0,
			downloads: 0,
			trendingScore: 0,
			license: null,
			task: null,
			params: null,
			createdAt: null,
			gated: true,
		});
	});

	it("reads the license from its tag", () => {
		expect(toModel(apiModel("o/a", { tags: ["region:us", "license:mit"] }))?.license).toBe("mit");
		expect(toModel(apiModel("o/a", { tags: ["region:us"] }))?.license).toBeNull();
	});
});

describe("addAvatars", () => {
	const models = () => ["o/a", "o/b", "p/c"].map((id) => toModel(apiModel(id))!);

	it("looks each author up once, as an organization and then as a user", async () => {
		const fetch = mockHuggingFace([], (author) =>
			author === "p" ? new Response("Not found", { status: 404 }) : Response.json({ avatarUrl: AVATAR }),
		);
		const out = await addAvatars(models());
		expect(out.map((m) => m.avatarUrl)).toEqual([AVATAR, AVATAR, null]);
		const urls = fetch.mock.calls.map(([input]) => new URL(String(input)).pathname).sort();
		expect(urls).toEqual(["/api/organizations/o/avatar", "/api/organizations/p/avatar", "/api/users/p/avatar"]);
	});

	it("keeps only avatars on Hugging Face's avatar host", async () => {
		mockHuggingFace([], () => Response.json({ avatarUrl: "https://evil.example/a.png" }));
		expect((await addAvatars(models())).map((m) => m.avatarUrl)).toEqual([null, null, null]);
	});

	it("stops looking up after a rate limit, and keeps the models", async () => {
		const fetch = mockHuggingFace([], () => new Response("slow down", { status: 429 }));
		const many = Array.from({ length: 20 }, (_, i) => toModel(apiModel(`a${i}/m`))!);
		const out = await addAvatars(many);
		expect(out).toHaveLength(20);
		// The first round of parallel lookups is already in flight; nothing starts after it
		expect(fetch.mock.calls.length).toBeLessThanOrEqual(6);
		expect(out.every((m) => !m.avatarUrl)).toBe(true);
	});

	it("survives a lookup that throws", async () => {
		mockHuggingFace([], () => {
			throw new Error("network down");
		});
		expect((await addAvatars(models())).map((m) => m.avatarUrl)).toEqual([null, null, null]);
	});
});
