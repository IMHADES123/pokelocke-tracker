CREATE TABLE locke_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE pokemon_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(20) UNIQUE NOT NULL,
  color VARCHAR(7) NOT NULL
);

CREATE TABLE natures (
  id SERIAL PRIMARY KEY,
  name VARCHAR(20) UNIQUE NOT NULL,
  increased_stat VARCHAR(10),
  decreased_stat VARCHAR(10)
);

CREATE TABLE lockes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  locke_type_id INT REFERENCES locke_types(id),
  game VARCHAR(50),
  status VARCHAR(10) NOT NULL DEFAULT 'en_curso'
    CHECK (status IN ('en_curso', 'ganado', 'perdido')),
  difficulty VARCHAR(30) DEFAULT 'Estándar',
  rules TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE champions (
  id SERIAL PRIMARY KEY,
  locke_id INT NOT NULL REFERENCES lockes(id) ON DELETE CASCADE,
  nickname VARCHAR(50) NOT NULL,
  species VARCHAR(50) NOT NULL,
  gender VARCHAR(1) CHECK (gender IN ('M', 'F', 'N')),
  image_url TEXT,
  type1_id INT NOT NULL REFERENCES pokemon_types(id),
  type2_id INT REFERENCES pokemon_types(id),
  ability VARCHAR(50),
  ability_description TEXT,
  nature_id INT REFERENCES natures(id),
  summary TEXT
);