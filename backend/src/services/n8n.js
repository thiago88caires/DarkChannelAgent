import fetch from 'node-fetch';
import { config } from '../config.js';

export async function callN8n(url, payload, headers = {}) {
  if (!url) return { ok: false, status: 501, data: { message: 'N8N not configured' } };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export function verifyN8nSecret(provided) {
  if (!config.n8n.callbackSecret) return true; // if not set, accept
  return provided === config.n8n.callbackSecret;
}

