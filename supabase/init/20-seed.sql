-- Seed initial genres for all supported languages in consolidated table
INSERT INTO public.genres (language, genre, description, structure, tone, video_title, video_description, video_tags, elements, composition_rules, techniques, lighting_and_atmosphere)
VALUES
  -- Portuguese (Brazil)
  ('pt-BR', 'Terror Alienigena', 'Suspense espacial com criaturas desconhecidas', 'Introducao, Encontro, Confronto, Desfecho', 'Sombrio, tenso', 'Sussurros no Vazio', 'Uma equipe encontra sinais de vida em uma estacao abandonada.', 'terror, alien, espaco', 'Naves, corredores, sombras', 'Regra dos tercos, linhas de fuga', 'Planos fechados, cortes rapidos', 'Luzes frias, neblina, estroboscopica'),
  ('pt-BR', 'Ficção Científica', 'Narrativas futuristas com tecnologia avançada', 'Introdução ao mundo, Conflito tecnológico, Resolução', 'Investigativo, especulativo', 'Ecos do Futuro', 'Uma sociedade descobre os perigos da inteligência artificial.', 'ficção científica, futuro, tecnologia', 'Cidade futurista, robôs, hologramas', 'Simetria, perspectiva forçada', 'Travelling, zoom, montagem paralela', 'Neon, azul, contrastes altos'),
  ('pt-BR', 'Drama Psicológico', 'Exploração profunda da psique humana', 'Apresentação, Deterioração mental, Catarse', 'Introspectivo, melancólico', 'Fragmentos da Mente', 'Um personagem luta contra seus próprios demônios internos.', 'drama, psicológico, mente', 'Espelhos, sombras, objetos pessoais', 'Close-ups, enquadramentos apertados', 'Cortes no movimento, flashbacks', 'Luz natural, tons quentes e frios'),
  
  -- English
  ('en', 'Alien Horror', 'Space suspense with unknown creatures', 'Intro, Encounter, Confrontation, Resolution', 'Dark, tense', 'Whispers in the Void', 'A crew finds signs of life in an abandoned station.', 'horror, alien, space', 'Ships, corridors, shadows', 'Rule of thirds, leading lines', 'Close-ups, quick cuts', 'Cold lights, fog, strobe'),
  ('en', 'Science Fiction', 'Futuristic narratives with advanced technology', 'World introduction, Tech conflict, Resolution', 'Investigative, speculative', 'Echoes of Tomorrow', 'A society discovers the dangers of artificial intelligence.', 'sci-fi, future, technology', 'Futuristic city, robots, holograms', 'Symmetry, forced perspective', 'Tracking shots, zoom, parallel editing', 'Neon, blue, high contrast'),
  ('en', 'Psychological Drama', 'Deep exploration of human psyche', 'Presentation, Mental deterioration, Catharsis', 'Introspective, melancholic', 'Mind Fragments', 'A character struggles against their inner demons.', 'drama, psychological, mind', 'Mirrors, shadows, personal objects', 'Close-ups, tight framing', 'Match cuts, flashbacks', 'Natural light, warm and cool tones'),
  
  -- Spanish
  ('es', 'Terror Alienigena', 'Suspenso espacial con criaturas desconocidas', 'Introduccion, Encuentro, Confrontacion, Cierre', 'Oscuro, tenso', 'Susurros en el Vacio', 'Una tripulacion encuentra senales de vida en una estacion abandonada.', 'terror, alien, espacio', 'Naves, pasillos, sombras', 'Regla de tercios, lineas guia', 'Primeros planos, cortes rapidos', 'Luces frias, niebla, estroboscopica'),
  ('es', 'Ciencia Ficcion', 'Narrativas futuristas con tecnologia avanzada', 'Introduccion al mundo, Conflicto tecnologico, Resolucion', 'Investigativo, especulativo', 'Ecos del Futuro', 'Una sociedad descubre los peligros de la inteligencia artificial.', 'ciencia ficcion, futuro, tecnologia', 'Ciudad futurista, robots, hologramas', 'Simetria, perspectiva forzada', 'Travelling, zoom, montaje paralelo', 'Neon, azul, alto contraste'),
  ('es', 'Drama Psicologico', 'Exploracion profunda de la psique humana', 'Presentacion, Deterioro mental, Catarsis', 'Introspectivo, melancolico', 'Fragmentos de la Mente', 'Un personaje lucha contra sus propios demonios internos.', 'drama, psicologico, mente', 'Espejos, sombras, objetos personales', 'Primeros planos, encuadres cerrados', 'Cortes en movimiento, flashbacks', 'Luz natural, tonos calidos y frios')
ON CONFLICT (language, genre) DO NOTHING;

-- Insert your user with unlimited credits
insert into public.users (email, name, credits, role)
values
  ('thiago88caires@gmail.com', 'Thiago Caires', 999999999, 'admin')
on conflict (email) do update set 
  name = excluded.name,
  credits = excluded.credits,
  role = excluded.role;

-- Insert demo user
insert into public.users (email, name, credits, role)
values
  ('demo@darkchannel.dev', 'Demo User', 50, 'admin')
on conflict (email) do update set name = excluded.name,
  role = excluded.role;

insert into public.youtube_channels (user_email, name, oauth_encrypted)
values
  ('demo@darkchannel.dev', 'Demo Channel', '{}')
on conflict (id) do nothing;

insert into public.videos (video_id, user_email, language, status, genre, screenplay)
values
  ('demo-job-1', 'demo@darkchannel.dev', 'pt-BR', 'Waiting', 'Terror Alienigena', 'Exemplo de roteiro inicial')
on conflict (video_id) do nothing;

