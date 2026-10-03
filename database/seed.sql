INSERT INTO locke_types (name) VALUES
('Nuzlocke'), ('Hardlocke'), ('Randomlocke'), ('Ruletalocke');

INSERT INTO pokemon_types (name, color) VALUES
('Normal','#A8A77A'), ('Fire','#EE8130'), ('Water','#6390F0'),
('Electric','#F7D02C'), ('Grass','#7AC74C'), ('Ice','#96D9D6'),
('Fighting','#C22E28'), ('Poison','#A33EA1'), ('Ground','#E2BF65'),
('Flying','#A98FF3'), ('Psychic','#F95587'), ('Bug','#A6B91A'),
('Rock','#B6A136'), ('Ghost','#735797'), ('Dragon','#6F35FC'),
('Dark','#705746'), ('Steel','#B7B7CE'), ('Fairy','#D685AD');

INSERT INTO natures (name, increased_stat, decreased_stat) VALUES
('Hardy',NULL,NULL), ('Docile',NULL,NULL), ('Serious',NULL,NULL),
('Bashful',NULL,NULL), ('Quirky',NULL,NULL),
('Lonely','Atk','Def'), ('Brave','Atk','Speed'), ('Adamant','Atk','Sp.Atk'), ('Naughty','Atk','Sp.Def'),
('Bold','Def','Atk'), ('Relaxed','Def','Speed'), ('Impish','Def','Sp.Atk'), ('Lax','Def','Sp.Def'),
('Timid','Speed','Atk'), ('Hasty','Speed','Def'), ('Jolly','Speed','Sp.Atk'), ('Naive','Speed','Sp.Def'),
('Modest','Sp.Atk','Atk'), ('Mild','Sp.Atk','Def'), ('Quiet','Sp.Atk','Speed'), ('Rash','Sp.Atk','Sp.Def'),
('Calm','Sp.Def','Atk'), ('Gentle','Sp.Def','Def'), ('Sassy','Sp.Def','Speed'), ('Careful','Sp.Def','Sp.Atk');