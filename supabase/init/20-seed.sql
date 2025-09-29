-- Seed initial genres for testing
insert into public.genres_pt_br ("GENRE", "DESCRIPTION", "STRUCTURE", "TONE", "VIDEO TITLE", "VIDEO DESCRIPTION", "VIDEO TAGS", "ELEMENTS", "COMPOSITION RULES", "TECHNIQUES", "LIGHTING AND ATMOSPHERE")
values
  ('Terror Alienigena', 'Suspense espacial com criaturas desconhecidas', 'Introducao, Encontro, Confronto, Desfecho', 'Sombrio, tenso', 'Sussurros no Vazio', 'Uma equipe encontra sinais de vida em uma estacao abandonada.', 'terror, alien, espaco', 'Naves, corredores, sombras', 'Regra dos tercos, linhas de fuga', 'Planos fechados, cortes rapidos', 'Luzes frias, neblina, estroboscopica')
on conflict ("GENRE") do nothing;

insert into public.genres_en ("GENRE", "DESCRIPTION", "STRUCTURE", "TONE", "VIDEO TITLE", "VIDEO DESCRIPTION", "VIDEO TAGS", "ELEMENTS", "COMPOSITION RULES", "TECHNIQUES", "LIGHTING AND ATMOSPHERE")
values
  ('Alien Horror', 'Space suspense with unknown creatures', 'Intro, Encounter, Confrontation, Resolution', 'Dark, tense', 'Whispers in the Void', 'A crew finds signs of life in an abandoned station.', 'horror, alien, space', 'Ships, corridors, shadows', 'Rule of thirds, leading lines', 'Close-ups, quick cuts', 'Cold lights, fog, strobe')
on conflict ("GENRE") do nothing;

insert into public.genres_es ("GENRE", "DESCRIPTION", "STRUCTURE", "TONE", "VIDEO TITLE", "VIDEO DESCRIPTION", "VIDEO TAGS", "ELEMENTS", "COMPOSITION RULES", "TECHNIQUES", "LIGHTING AND ATMOSPHERE")
values
  ('Terror Alienigena', 'Suspenso espacial con criaturas desconocidas', 'Introduccion, Encuentro, Confrontacion, Cierre', 'Oscuro, tenso', 'Susurros en el Vacio', 'Una tripulacion encuentra senales de vida en una estacion abandonada.', 'terror, alien, espacio', 'Naves, pasillos, sombras', 'Regla de tercios, lineas guia', 'Primeros planos, cortes rapidos', 'Luces frias, niebla, estroboscopica')
on conflict ("GENRE") do nothing;

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

