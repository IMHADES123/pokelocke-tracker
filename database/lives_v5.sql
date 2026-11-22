ALTER TABLE lockes ADD COLUMN IF NOT EXISTS start_lives INT CHECK (start_lives > 0);

-- Solo Megalocke usa series; Hardlocke y Randomlocke manejan vidas propias
UPDATE locke_types SET uses_lives = (lower(name) = 'megalocke');