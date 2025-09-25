import { Router } from 'express';
import { getSupabase } from '../services/supabase.js';

export const genres = Router();

const map = {
  'pt-BR': 'genres_pt_br',
  en: 'genres_en',
  es: 'genres_es'
};

genres.get('/genres', async (req, res) => {
  const lang = (req.query.lang || 'pt-BR').toString();
  const table = map[lang] || map['pt-BR'];
  const supabase = getSupabase();
  if (!supabase) return res.json([]);
  const { data, error } = await supabase.from(table).select('*').order('GENRE');
  if (error) return res.status(500).json({ code: 'db_error', message: error.message });
  res.json(data || []);
});

