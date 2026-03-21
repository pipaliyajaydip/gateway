import express from 'express';
import healthRouter from './health.route.js';
import { USER_SERVICE } from '../config/env.js';
import { createProxyMiddleware } from 'http-proxy-middleware';

const router = express.Router();

router.use('/health', healthRouter);
router.use('/users', createProxyMiddleware({
    target: USER_SERVICE,
    changeOrigin: true,
    pathRewrite: {
        '^/users': '/users'
    },
    logLevel: 'debug',
}));


export default router;