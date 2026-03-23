import express from 'express';
import cluster from 'cluster';
import helmet from 'helmet';
import os from 'os';
import cookieParser from 'cookie-parser';
import { PORT } from './config/env.js';
import router from './routes/route.js';
import { globalRateLimiter } from './middleware/rateLimiter.js';

const app = express();
app.disable('x-powered-by');

const numCPUs = os.availableParallelism ? os.availableParallelism : os.cpus().length;

if (cluster.isPrimary) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} exited. Code: ${code}, Signal: ${signal}`);
    cluster.fork();
  });
} else {
  console.log(`CPU: Worker ${process.pid}, PORT: ${PORT}`);
  app.use(helmet());
  app.use(express.json());
  app.use(cookieParser());
  app.set('trust proxy', 'loopback, 10.0.0.0/8'); // trust LB & internal proxies only
  app.use(globalRateLimiter);
  app.use('/api', router);

  app.listen(PORT, () => {
    console.log(`Worker ${process.pid} running on port ${PORT}`);
  });

  process.on('uncaughtException', (err) => {
    console.error(`Worker ${process.pid} - Uncaught Exception: ${err.message}`);
    process.exit(1);
  });
}
