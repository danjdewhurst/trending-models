export interface Model {
	id: string; // "author/name", or just "name" for a few old models
	author: string | null;
	name: string;
	url: string;
	hfId: string; // Hugging Face's internal id; stable across renames
	task: string | null; // pipeline tag, e.g. "text-generation"
	library: string | null; // e.g. "transformers"
	license: string | null; // from the "license:..." tag
	params: number | null; // parameter count from safetensors or GGUF metadata
	likes: number;
	downloads: number; // last 30 days, as Hugging Face counts them
	trendingScore: number;
	createdAt: string | null;
	gated: boolean;
	// Filled in from D1 history
	daysTrending?: number; // distinct UTC days seen on trending, including today
	isNew?: boolean; // first seen today, and we were tracking before today
}

export interface Snapshot {
	fetchedAt: string;
	models: Model[];
	// First UTC day (YYYY-MM-DD) in D1 history, so the page can say what "days on" counts from
	historyStart?: string;
}
