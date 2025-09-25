import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getPayments } from '../services/payments.js';
import { getSupabase } from '../services/supabase.js';

export const payments = Router();

payments.post('/payments/checkout', requireAuth, async (req, res) => {
  const { packId } = req.body || {};
  if (![5, 30, 90].includes(Number(packId))) {
    return res.status(400).json({ code: 'bad_request', message: 'packId must be 5|30|90' });
  }
  const provider = getPayments();
  const { checkoutUrl } = await provider.createCheckout({ userEmail: req.user.email, packId });
  res.json({ checkoutUrl });
});

payments.post('/payments/webhook', async (req, res) => {
  const provider = getPayments();
  const evt = await provider.parseWebhook(req);
  if (!evt.ok) return res.status(400).end();
  // Credit the user by metadata if available
  const supabase = getSupabase();
  if (supabase && req.body?.data?.object?.metadata) {
    const { userEmail, credits } = req.body.data.object.metadata;
    if (userEmail && credits) {
      const { data: user, error: uErr } = await supabase
        .from('users')
        .select('CREDITOS')
        .eq('EMAIL', userEmail)
        .maybeSingle();
      if (!uErr && user) {
        const next = (user.CREDITOS || 0) + Number(credits);
        await supabase.from('users').update({ CREDITOS: next }).eq('EMAIL', userEmail);
      }
    }
  }
  res.json({ received: true });
});

