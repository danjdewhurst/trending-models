-- One row per model per scrape
CREATE TABLE snapshot_models (
	fetched_at      TEXT    NOT NULL, -- ISO 8601, shared by every row from one scrape
	rank            INTEGER NOT NULL, -- 1-based position on huggingface.co/models (trending)
	model_id        TEXT    NOT NULL COLLATE NOCASE, -- "author/name"; Hugging Face ids ignore case
	hf_id           TEXT    NOT NULL, -- Hugging Face's internal id, stable across renames
	task            TEXT,
	library         TEXT,
	license         TEXT,
	params          INTEGER,
	likes           INTEGER NOT NULL,
	downloads       INTEGER NOT NULL,
	trending_score  INTEGER NOT NULL,
	PRIMARY KEY (fetched_at, rank)
);

-- A model appears at most once per scrape
CREATE UNIQUE INDEX idx_snapshot_models_unique ON snapshot_models (fetched_at, model_id);
CREATE INDEX idx_snapshot_models_model ON snapshot_models (model_id, fetched_at);
CREATE INDEX idx_snapshot_models_hf_id ON snapshot_models (hf_id, fetched_at);

-- One row per model per UTC day it trended, so badge stats read at most one row per day
-- however often we scrape. snapshot_models keeps the full per-scrape history.
CREATE TABLE model_days (
	day       TEXT NOT NULL,                -- YYYY-MM-DD (UTC)
	model_id  TEXT NOT NULL COLLATE NOCASE,
	hf_id     TEXT NOT NULL,
	PRIMARY KEY (model_id, day)
);

CREATE INDEX idx_model_days_hf_id ON model_days (hf_id, day);
CREATE INDEX idx_model_days_day ON model_days (day);
