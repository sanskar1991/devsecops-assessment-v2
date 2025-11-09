import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import morgan from 'morgan';
import pino from 'pino';
import pinoHttp from 'pino-http';
import itemsRouter from './routes/items.js';
import { config } from './config.js';

const logger = pino({ level: 'info' });

export function buildApp() {
  const app = express();

  // Security & performance middleware
  app.use(helmet());
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(mongoSanitize());
  app.use(
    rateLimit({
      windowMs: config.rateLimitWindowMs,
      max: config.rateLimitMax,
      standardHeaders: true,
      legacyHeaders: false
    })
  );

  // Logging
  app.use(morgan('combined'));
  app.use(pinoHttp({ logger }));

  // Health & readiness probes
  app.get('/healthz', (_req, res) => res.status(200).json({ status: 'ok' }));
  // Readiness – for orchestrator usage
  app.get('/readyz', (_req, res) => res.status(200).json({ ready: true }));

  // API
  app.use('/api/items', itemsRouter);

  // Error handler
  app.use((_req, res) => res.status(404).json({ error: 'not found' }));
  app.use((err, _req, res, _next) => {
    req?.log?.error?.(err); // pino-http if available
    // Hide internals in production
    const payload =
      config.env === 'development' ? { error: err.message, stack: err.stack } : { error: 'internal error' };
    res.status(500).json(payload);
  });

  return app;
}
