import 'dotenv/config';

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 8080),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

  n8n: {
    baseUrl: process.env.N8N_BASE_URL || '',
    screenplayUrl: process.env.N8N_WEBHOOK_SCREENPLAY_URL || '',
    videoUrl: process.env.N8N_WEBHOOK_VIDEO_URL || '',
    callbackSecret: process.env.N8N_CALLBACK_SECRET || ''
  },

  payments: {
    provider: process.env.PAYMENT_PROVIDER || 'stripe',
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    priceCents: Number(process.env.CREDITS_PRICE_CENTS || 3000)
  },

  flags: {
    allowAnon: String(process.env.ALLOW_ANON || 'false') === 'true',
    allowAnonAdmin: String(process.env.ALLOW_ANON_ADMIN || 'false') === 'true'
  }
};

