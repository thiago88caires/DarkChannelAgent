import { createApp } from './app.js';
import { config } from './config.js';
import { logger } from './logger.js';

const app = createApp();
app.listen(config.port, () => {
  logger.info({ msg: `API listening on :${config.port}` });
});

