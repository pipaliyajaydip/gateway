import express, { Router } from 'express';
import cluster from 'cluster';
import os from 'os';
import cookieParser from 'cookie-parser';

const app = express();

const noOfCPU = os.availableParallelism ? os.availableParallelism : os.cpus().length;

if (cluster.isPrimary) {
  for (let i = 0; i < noOfCPU; i++) {
    cluster.fork();
  }
  cluster.on('exit', (Worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} exited. Code: ${code}, Signal: ${signal}`);
    cluster.fork();
  });
} else {
  console.log(`CPU: Worker ${process.pid}, PORT: ${PORT}`);
  app.use(express.json());
  app.use(cookieParser());


  app.listen(5001, () => {
    console.log(`Worker ${process.pid} running on port ${PORT}`);
  });

  process.on('uncaughtException', (err) => {
    console.error(`Worker ${process.pid} - Uncaught Exception: ${err.message}`);
    process.exit(1);
  });
}
