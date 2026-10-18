ALTER TABLE lockes        ADD COLUMN IF NOT EXISTS trainer VARCHAR(50) NOT NULL DEFAULT 'Hades';
ALTER TABLE champions     ADD COLUMN IF NOT EXISTS evo_line VARCHAR(60);
ALTER TABLE score_pokemon ADD COLUMN IF NOT EXISTS evo_line VARCHAR(60);
ALTER TABLE legends       ADD COLUMN IF NOT EXISTS trainer VARCHAR(50) NOT NULL DEFAULT 'Hades';
ALTER TABLE legends       ADD COLUMN IF NOT EXISTS evo_line VARCHAR(60);

-- Opcional: asigna los lockes de tu novia (ajusta los ids y el nombre)
-- UPDATE lockes SET trainer = 'Novia' WHERE id IN (2, 3);