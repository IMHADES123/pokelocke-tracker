CREATE TABLE score_logs (
  id SERIAL PRIMARY KEY,
  locke_id INT NOT NULL REFERENCES lockes(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE score_pokemon (
  id SERIAL PRIMARY KEY,
  log_id INT NOT NULL REFERENCES score_logs(id) ON DELETE CASCADE,
  nickname VARCHAR(50) NOT NULL,
  species VARCHAR(50) NOT NULL,
  gender VARCHAR(1) CHECK (gender IN ('M', 'F', 'N')),
  image_url TEXT,
  type1_id INT REFERENCES pokemon_types(id),
  type2_id INT REFERENCES pokemon_types(id),
  kills INT NOT NULL DEFAULT 0 CHECK (kills >= 0),
  assists INT NOT NULL DEFAULT 0 CHECK (assists >= 0),
  mvps INT NOT NULL DEFAULT 0 CHECK (mvps >= 0),
  is_dead BOOLEAN NOT NULL DEFAULT FALSE,
  died_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);