import type { Snapshot } from "./types";

// Appends a scrape to D1 and marks each model as seen today. The batch runs as one transaction.
export async function saveSnapshot(db: D1Database, snapshot: Snapshot): Promise<void> {
	const insert = db.prepare(
		`INSERT INTO snapshot_models
			(fetched_at, rank, model_id, hf_id, task, library, license, params, likes, downloads, trending_score)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
	);
	// Keyed by name, so a model renamed during a day gets a row under each name. Stats count
	// distinct days, so that day still counts once
	const markDay = db.prepare(`INSERT INTO model_days (day, model_id, hf_id) VALUES (?, ?, ?) ON CONFLICT DO NOTHING`);
	const day = snapshot.fetchedAt.slice(0, 10);
	await db.batch([
		...snapshot.models.map((m, i) =>
			insert.bind(
				snapshot.fetchedAt,
				i + 1,
				m.id,
				m.hfId,
				m.task,
				m.library,
				m.license,
				m.params,
				m.likes,
				m.downloads,
				m.trendingScore,
			),
		),
		...snapshot.models.map((m) => markDay.bind(day, m.id, m.hfId)),
	]);
}

export interface TrendingStats {
	// Distinct UTC days each model has appeared, keyed by rank in the current scrape
	days: Map<number, number>;
	// First day each model appeared (YYYY-MM-DD), keyed by rank in the current scrape
	firstSeen: Map<number, string>;
	// Whether any scrape was saved on the previous UTC day. Without it, a model "first seen
	// today" may have trended while history was missing (before it started, or during a gap)
	scrapedYesterday: boolean;
	// First day in history (YYYY-MM-DD), or null if there is none
	historyStart: string | null;
}

type StatsRow = { rank: number; first_seen: string; days: number };

// History for the models in the scrape saved at `fetchedAt`, read from model_days so the cost
// grows with days trending, not with scrapes. A past day counts as the same model if its
// Hugging Face id matches (survives renames). A match on "author/name" (ignoring case) counts
// only when one side has no real Hugging Face id (hf_id fell back to the name), so a new model
// that reuses an old name doesn't inherit the old model's history.
export async function getTrendingStats(db: D1Database, fetchedAt: string): Promise<TrendingStats> {
	const today = fetchedAt.slice(0, 10);
	const yesterday = new Date(Date.parse(today) - 86_400_000).toISOString().slice(0, 10);
	const [models, prev, start] = await db.batch<StatsRow | { found: number } | { day: string | null }>([
		db
			.prepare(
				`SELECT c.rank,
					MIN(h.day) AS first_seen,
					COUNT(DISTINCT h.day) AS days
				FROM snapshot_models c
				-- A UNION of two lookups, not an OR, so each side uses its index instead of a full scan
				JOIN model_days h ON h.rowid IN (
					SELECT rowid FROM model_days WHERE hf_id = c.hf_id
					UNION
					SELECT rowid FROM model_days
					WHERE model_id = c.model_id AND (c.hf_id = c.model_id OR hf_id = model_id)
				)
				WHERE c.fetched_at = ?
				GROUP BY c.rank`,
			)
			.bind(fetchedAt),
		// fetched_at is ISO 8601, so a string range covers the day and uses the primary key
		db
			.prepare(`SELECT EXISTS (SELECT 1 FROM snapshot_models WHERE fetched_at >= ? AND fetched_at < ?) AS found`)
			.bind(yesterday, today),
		db.prepare(`SELECT MIN(day) AS day FROM model_days`),
	]);

	const stats: TrendingStats = {
		days: new Map(),
		firstSeen: new Map(),
		scrapedYesterday: (prev.results[0] as { found: number } | undefined)?.found === 1,
		historyStart: (start.results[0] as { day: string | null } | undefined)?.day ?? null,
	};
	for (const row of models.results as StatsRow[]) {
		stats.days.set(row.rank, row.days);
		stats.firstSeen.set(row.rank, row.first_seen);
	}
	return stats;
}
