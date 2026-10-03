ALTER TABLE champions ADD COLUMN shiny BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE score_pokemon ADD COLUMN shiny BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE legends (
  id SERIAL PRIMARY KEY,
  nickname VARCHAR(50) NOT NULL,
  species VARCHAR(50) NOT NULL,
  gender VARCHAR(1) CHECK (gender IN ('M', 'F', 'N')),
  image_url TEXT,
  shiny BOOLEAN NOT NULL DEFAULT FALSE,
  champion_id INT REFERENCES champions(id) ON DELETE SET NULL,
  score_pokemon_id INT REFERENCES score_pokemon(id) ON DELETE SET NULL,
  extra_points NUMERIC(6,1) NOT NULL DEFAULT 0,
  extra_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);