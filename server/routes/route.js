import express from 'express';
import healthRouter from './health.route.js';

const router = express.Router();

router.use('/health', healthRouter);


export default router;