ALTER TABLE locke_types ADD COLUMN IF NOT EXISTS uses_lives BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS locke_series (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  trainer VARCHAR(50) NOT NULL DEFAULT 'Hades',
  locke_type_id INT REFERENCES locke_types(id),
  start_lives INT NOT NULL DEFAULT 50 CHECK (start_lives > 0),
  bonus_lives INT NOT NULL DEFAULT 3 CHECK (bonus_lives >= 0),
  bonus_if_deaths_under INT NOT NULL DEFAULT 10 CHECK (bonus_if_deaths_under >= 0),
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE lockes ADD COLUMN IF NOT EXISTS series_id INT REFERENCES locke_series(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_lockes_series ON lockes(series_id);

INSERT INTO locke_types (name, uses_lives) VALUES ('Megalocke', TRUE)
  ON CONFLICT (name) DO UPDATE SET uses_lives = TRUE;
UPDATE locke_types SET uses_lives = TRUE WHERE lower(name) IN ('hardlocke', 'randomlocke');