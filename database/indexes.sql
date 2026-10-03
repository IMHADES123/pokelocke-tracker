CREATE INDEX IF NOT EXISTS idx_champions_locke ON champions(locke_id);
CREATE INDEX IF NOT EXISTS idx_score_pokemon_log ON score_pokemon(log_id);
CREATE INDEX IF NOT EXISTS idx_score_logs_locke ON score_logs(locke_id);
CREATE INDEX IF NOT EXISTS idx_lockes_type ON lockes(locke_type_id);