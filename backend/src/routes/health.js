import { Router } from 'express';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pkg = require('../../package.json');

export const health = Router();

health.get('/health', (_req, res) => {
  res.json({ status: 'ok', version: pkg.version });
});

