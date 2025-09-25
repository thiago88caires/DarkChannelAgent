import { getSupabase } from '../services/supabase.js';
import { config } from '../config.js';

export async function optionalAuth(req, _res, next) {
  const token = getToken(req);
  if (!token) return next();
  try {
    const supabase = getSupabase();
    if (!supabase) {
      req.user = { email: 'anon@example.com', is_admin: config.flags.allowAnonAdmin };
      return next();
    }
    const { data, error } = await supabase.auth.getUser(token);
    if (error) return next();
    req.user = { email: data.user.email };
    return next();
  } catch {
    return next();
  }
}

export async function requireAuth(req, res, next) {
  const token = getToken(req);
  if (!token) {
    if (config.flags.allowAnon) {
      req.user = { email: 'anon@example.com', is_admin: config.flags.allowAnonAdmin };
      return next();
    }
    return res.status(401).json({ code: 'unauthorized', message: 'Missing bearer token' });
  }
  const supabase = getSupabase();
  if (!supabase) {
    // Degraded mode
    req.user = { email: 'anon@example.com', is_admin: config.flags.allowAnonAdmin };
    return next();
  }
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user?.email) {
    return res.status(401).json({ code: 'unauthorized', message: 'Invalid token' });
  }
  req.user = { email: data.user.email };
  return next();
}

export async function requireAdmin(req, res, next) {
  if (!req.user?.email) return res.status(401).json({ code: 'unauthorized', message: 'Auth required' });
  if (config.flags.allowAnonAdmin) return next();
  const supabase = getSupabase();
  if (!supabase) return res.status(403).json({ code: 'forbidden', message: 'Admin only' });
  const { data, error } = await supabase
    .from('users')
    .select('is_admin')
    .eq('EMAIL', req.user.email)
    .maybeSingle();
  if (error) return res.status(500).json({ code: 'db_error', message: error.message });
  if (!data?.is_admin) return res.status(403).json({ code: 'forbidden', message: 'Admin only' });
  return next();
}

function getToken(req) {
  const header = req.headers['authorization'] || '';
  const [type, token] = header.split(' ');
  if (type && type.toLowerCase() === 'bearer' && token) return token;
  return null;
}

