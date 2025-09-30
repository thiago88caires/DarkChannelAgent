import { Router } from 'express';
import { getSupabase } from '../services/supabase.js';

export const genres = Router();

genres.get('/genres', async (req, res) => {
  const lang = (req.query.lang || 'pt-BR').toString();
  const supabase = getSupabase();
  if (!supabase) return res.json([]);
  
  // Query the consolidated genres table filtering by language
  const { data, error } = await supabase
    .from('genres')
    .select('*')
    .eq('language', lang)
    .order('genre');
    
  if (error) return res.status(500).json({ code: 'db_error', message: error.message });
  res.json(data || []);
});

