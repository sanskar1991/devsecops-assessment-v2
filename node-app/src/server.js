import mongoose from 'mongoose';
import { buildApp } from './app.js';
import { config } from './config.js';

const app = buildApp();
let server;

// Mongo connection with retry
async function connectWithRetry() {
  try {
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('[mongo] connected');
  } catch (err) {
    console.error('[mongo] connection error, retrying in 3s:', err.message);
    setTimeout(connectWithRetry, 3000);
  }
}

function startHttpServer() {
  server = app.listen(config.port, () => {
    console.log(`[http] listening on port ${config.port}`);
  });
}

async function start() {
  await connectWithRetry();
  startHttpServer();
}

function shutdown(signal) {
  console.log(`[lifecycle] received ${signal}, shutting down...`);
  server?.close?.(() => console.log('[http] closed'));
  mongoose.connection
    .close()
    .then(() => {
      console.log('[mongo] connection closed');
      process.exit(0);
    })
    .catch((e) => {
      console.error('[mongo] close error', e);
      process.exit(1);
    });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start();
