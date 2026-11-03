import { addAvatars, fetchTrending } from "./huggingface";
import { getTrendingStats, saveSnapshot, type TrendingStats } from "./history";
import type { Snapshot } from "./types";

// KV key of the published snapshot
export const KEY = "latest";
// The API returns 30 models. Fewer than this means something is wrong with the response.
const MIN_MODELS = 5;
// The cron runs every 4 hours. A scheduled run sooner than this after the last scrape is a
// stray trigger (an old schedule can keep firing after a change), so it does nothing.
export const MIN_CRON_INTERVAL_MS = 60 * 60 * 1000;

export interface RefreshResult {
	snapshot: Snapshot;
	// Set when D1 failed. The snapshot is still published, without badges
	historyError: string | null;
}

export async function refresh(env: Env): Promise<RefreshResult> {
	const token = env.HF_TOKEN || undefined;
	const fetched = await fetchTrending(token);
	// Throwing keeps the old data in KV and makes the failure show up in logs and /__refresh
	checkScrape(fetched.length, fetched.filter((m) => m.trendingScore > 0).length);

	// Avatars rarely change, so reuse the ones the last snapshot found
	const previous = await env.TRENDING.get<Snapshot>(KEY, "json");
	const known = new Map<string, string>();
	for (const m of previous?.models ?? []) if (m.author && m.avatarUrl) known.set(m.author, m.avatarUrl);
	const models = await addAvatars(fetched, token, known);
	const snapshot: Snapshot = { fetchedAt: new Date().toISOString(), models };

	// History is a bonus: if D1 fails, still publish the fresh list without badges,
	// but report the error so the cron run fails and the health check sees it
	let historyError: string | null = null;
	try {
		await saveSnapshot(env.DB, snapshot);
		addHistory(snapshot, await getTrendingStats(env.DB, snapshot.fetchedAt));
	} catch (err) {
		console.error("history:", err);
		historyError = String(err);
	}

	// A slower overlapping refresh (cron and manual) mustn't replace newer data
	const current = await env.TRENDING.get<Snapshot>(KEY, "json");
	if (current && current.fetchedAt > snapshot.fetchedAt) {
		console.warn(`refresh: KV already has ${current.fetchedAt}, not writing ${snapshot.fetchedAt}`);
		return { snapshot: current, historyError };
	}
	await env.TRENDING.put(KEY, JSON.stringify(snapshot));
	return { snapshot, historyError };
}

export function checkScrape(total: number, withScore: number): void {
	if (total < MIN_MODELS) throw new Error(`Hugging Face listed ${total} models (expected at least ${MIN_MODELS}); check src/huggingface.ts`);
	if (withScore === 0) throw new Error("Hugging Face listed no trending scores; check src/huggingface.ts");
}

export function addHistory(snapshot: Snapshot, stats: TrendingStats): void {
	const today = snapshot.fetchedAt.slice(0, 10);
	snapshot.historyStart = stats.historyStart ?? undefined;
	snapshot.models.forEach((model, i) => {
		const rank = i + 1;
		model.daysTrending = stats.days.get(rank);
		// Without yesterday's data, "first seen today" may only mean we weren't looking
		model.isNew = stats.scrapedYesterday && stats.firstSeen.get(rank) === today;
	});
}
