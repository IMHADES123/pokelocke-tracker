ALTER TABLE legends DROP COLUMN IF EXISTS champion_id;
ALTER TABLE legends DROP COLUMN IF EXISTS score_pokemon_id;
ALTER TABLE legends ALTER COLUMN species DROP NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS legends_name_unique ON legends (lower(nickname));