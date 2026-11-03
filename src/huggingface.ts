import type { Model } from "./types";

const API = "https://huggingface.co/api";
// The page lists this many, like the first page of huggingface.co/models
export const LIMIT = 30;
const FIELDS = [
	"author",
	"likes",
	"downloads",
	"trendingScore",
	"pipeline_tag",
	"library_name",
	"createdAt",
	"gated",
	"safetensors",
	"gguf",
	"tags",
];
// The same list huggingface.co/models shows by default, as JSON
export const TRENDING_URL =
	`${API}/models?sort=trendingScore&direction=-1&limit=${LIMIT}&` + FIELDS.map((f) => `expand%5B%5D=${f}`).join("&");
const USER_AGENT = "trending-models (Cloudflare Worker)";
// A hung request would otherwise stall the whole refresh
const TIMEOUT_MS = 10_000;
// Workers allows 6 open connections at once; more just queue
const CONCURRENCY = 6;
// Only this host goes into <img src>, and the CSP allows only this host
const AVATAR_ORIGIN = "https://cdn-avatars.huggingface.co/";
// Repo ids are "author/name", or a bare name for a few early models. Each part starts with a
// letter, digit or underscore, so ".." can't turn the link into another path
const MODEL_ID = /^\w[\w.-]*(?:\/\w[\w.-]*)?$/;

function headers(token: string | undefined, accept: string): Record<string, string> {
	const h: Record<string, string> = { "user-agent": USER_AGENT, accept };
	if (token) h.authorization = `Bearer ${token}`;
	return h;
}

// Reads the trending list from the Hugging Face API, in its own order.
export async function fetchTrending(token?: string): Promise<Model[]> {
	const res = await fetch(TRENDING_URL, {
		headers: headers(token, "application/json"),
		signal: AbortSignal.timeout(TIMEOUT_MS),
	});
	if (!res.ok) throw new Error(`Hugging Face API returned ${res.status}`);
	const data = await res.json();
	if (!Array.isArray(data)) throw new Error("Hugging Face API returned something other than a list");

	const seen = new Set<string>();
	return (data as unknown[]).flatMap((item): Model[] => {
		const model = toModel(item);
		// Repo ids are case-insensitive; keep the first of any duplicate
		if (!model || seen.has(model.id.toLowerCase())) return [];
		seen.add(model.id.toLowerCase());
		return [model];
	});
}

// Maps one API item, or returns null if it lacks an id we can safely link to
export function toModel(item: unknown): Model | null {
	if (!item || typeof item !== "object") return null;
	const m = item as ApiModel;
	if (typeof m.id !== "string" || !MODEL_ID.test(m.id)) return null;
	const slash = m.id.indexOf("/");
	const author = slash > 0 ? m.id.slice(0, slash) : str(m.author);
	const tags = Array.isArray(m.tags) ? m.tags.filter((t): t is string => typeof t === "string") : [];
	const license = tags.find((t) => t.startsWith("license:"))?.slice("license:".length) || null;
	return {
		id: m.id,
		author,
		name: slash > 0 ? m.id.slice(slash + 1) : m.id,
		url: `https://huggingface.co/${m.id}`,
		hfId: str(m._id) ?? m.id,
		task: str(m.pipeline_tag),
		library: str(m.library_name),
		license,
		params: num(m.safetensors?.total) || num(m.gguf?.total) || null,
		likes: num(m.likes),
		downloads: num(m.downloads),
		trendingScore: num(m.trendingScore),
		createdAt: str(m.createdAt),
		gated: m.gated !== undefined && m.gated !== false,
	};
}

interface ApiModel {
	_id?: unknown;
	id?: unknown;
	author?: unknown;
	likes?: unknown;
	downloads?: unknown;
	trendingScore?: unknown;
	pipeline_tag?: unknown;
	library_name?: unknown;
	createdAt?: unknown;
	gated?: unknown; // false, or "auto" / "manual"
	safetensors?: { total?: unknown } | null;
	gguf?: { total?: unknown } | null;
	tags?: unknown;
}

function str(v: unknown): string | null {
	return typeof v === "string" && v.trim() ? v.trim() : null;
}

function num(v: unknown): number {
	return typeof v === "number" && Number.isFinite(v) && v > 0 ? v : 0;
}

// Adds each author's avatar. An author is an organization or a user, and the API has a
// separate route for each, so a 404 from the first means try the second. A failed lookup
// leaves that author without an avatar. Once the API says we're rate limited, the remaining
// lookups are skipped.
export async function addAvatars(models: Model[], token?: string): Promise<Model[]> {
	const authors = [...new Set(models.map((m) => m.author).filter((a): a is string => a !== null))];
	const avatars = new Map<string, string | null>();
	let next = 0;
	let rateLimited = false;
	let skipped = 0;

	async function get(url: string): Promise<Response> {
		const res = await fetch(url, { headers: headers(token, "application/json"), signal: AbortSignal.timeout(TIMEOUT_MS) });
		if (res.status === 429) rateLimited = true;
		return res;
	}

	async function lookup(author: string): Promise<string | null> {
		try {
			const name = encodeURIComponent(author);
			let res = await get(`${API}/organizations/${name}/avatar`);
			if (res.status === 404 && !rateLimited) res = await get(`${API}/users/${name}/avatar`);
			if (!res.ok) {
				console.warn(`avatar ${author}: ${res.status}`);
				return null;
			}
			const { avatarUrl } = await res.json<{ avatarUrl?: unknown }>();
			return typeof avatarUrl === "string" && avatarUrl.startsWith(AVATAR_ORIGIN) ? avatarUrl : null;
		} catch (err) {
			console.warn(`avatar ${author}:`, err);
			return null;
		}
	}

	async function worker(): Promise<void> {
		while (next < authors.length) {
			const author = authors[next++];
			if (rateLimited) {
				skipped++;
				continue;
			}
			avatars.set(author, await lookup(author));
		}
	}

	await Promise.all(Array.from({ length: Math.min(CONCURRENCY, authors.length) }, worker));
	if (skipped) console.warn(`avatars: rate limited, skipped ${skipped} lookups`);
	return models.map((m) => (m.author && avatars.has(m.author) ? { ...m, avatarUrl: avatars.get(m.author) } : m));
}
