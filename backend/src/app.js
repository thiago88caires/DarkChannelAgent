import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pinoHttp from 'pino-http';
import rateLimit from 'express-rate-limit';
import { logger } from './logger.js';
import { config } from './config.js';
import { notFound, errorHandler } from './middleware/error.js';

// Routes
import { health } from './routes/health.js';
import { me } from './routes/me.js';
import { genres } from './routes/genres.js';
import { ai } from './routes/ai.js';
import { videos } from './routes/videos.js';
import { admin } from './routes/admin.js';
import { payments } from './routes/payments.js';
import { youtube } from './routes/youtube.js';
import { n8n } from './routes/n8n.js';

export function createApp() {
  const app = express();
  app.use(pinoHttp({ logger }));
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigin, credentials: true }));
  app.use(express.json({ limit: '2mb' }));

  const limiter = rateLimit({ windowMs: 60_000, max: 300 });
  app.use(limiter);

  app.use(health);
  app.use(me);
  app.use(genres);
  app.use(youtube);
  app.use(ai);
  app.use(videos);
  app.use(admin);
  app.use(payments);
  app.use(n8n);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

