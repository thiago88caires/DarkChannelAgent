-- Seed initial genres for testing
insert into public.genres_pt_br (GENRE, DESCRIPTION, STRUCTURE, TONE, "VIDEO TITLE", "VIDEO DESCRIPTION", "VIDEO TAGS", ELEMENTS, "COMPOSITION RULES", TECHNIQUES, "LIGHTING AND ATMOSPHERE")
values
  ('Terror Alienígena', 'Suspense espacial com criaturas desconhecidas', 'Introdução, Encontro, Confronto, Desfecho', 'Sombrio, tenso', 'Sussurros no Vácuo', 'Uma equipe encontra sinais de vida em uma estação abandonada.', 'terror, alien, espaço', 'Naves, corredores, sombras', 'Regra dos terços, linhas de fuga', 'Planos fechados, cortes rápidos', 'Luzes frias, neblina, estroboscópica')
on conflict (GENRE) do nothing;

insert into public.genres_en (GENRE, DESCRIPTION, STRUCTURE, TONE, "VIDEO TITLE", "VIDEO DESCRIPTION", "VIDEO TAGS", ELEMENTS, "COMPOSITION RULES", TECHNIQUES, "LIGHTING AND ATMOSPHERE")
values
  ('Alien Horror', 'Space suspense with unknown creatures', 'Intro, Encounter, Confrontation, Resolution', 'Dark, tense', 'Whispers in the Void', 'A crew finds signs of life in an abandoned station.', 'horror, alien, space', 'Ships, corridors, shadows', 'Rule of thirds, leading lines', 'Close-ups, quick cuts', 'Cold lights, fog, strobe')
on conflict (GENRE) do nothing;

insert into public.genres_es (GENRE, DESCRIPTION, STRUCTURE, TONE, "VIDEO TITLE", "VIDEO DESCRIPTION", "VIDEO TAGS", ELEMENTS, "COMPOSITION RULES", TECHNIQUES, "LIGHTING AND ATMOSPHERE")
values
  ('Terror Alienígena', 'Suspenso espacial con criaturas desconocidas', 'Introducción, Encuentro, Confrontación, Cierre', 'Oscuro, tenso', 'Susurros en el Vacío', 'Una tripulación encuentra señales de vida en una estación abandonada.', 'terror, alien, espacio', 'Naves, pasillos, sombras', 'Regla de tercios, líneas guía', 'Primeros planos, cortes rápidos', 'Luces frías, niebla, estroboscópica')
on conflict (GENRE) do nothing;

