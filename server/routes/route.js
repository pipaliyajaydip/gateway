import express from 'express';
import healthRouter from './health.route.js';
import { USER_SERVICE } from '../config/env.js';
import { createProxyMiddleware } from 'http-proxy-middleware';

const router = express.Router();

// router.use('/health', healthRouter);

// router.use('/users', createProxyMiddleware({
//     target: USER_SERVICE,
//     changeOrigin: true,
//     pathRewrite: {
//         '^/users': '/users'
//     },
//     logLevel: 'debug',
// }));

router.use('/health', createProxyMiddleware({
    target: USER_SERVICE,
    changeOrigin: true,
    pathRewrite: {
        '^/health': '/api/health'
    },
    on: {
      proxyReq: (proxyReq, req) => {
        console.log('ProxyReq:', req.method, req.originalUrl);
      },

      proxyRes: (proxyRes, req) => {
        console.log('ProxyRes:', proxyRes.statusCode);
      },

      error: (err, req, res) => {
        console.error('Proxy Error:', err.message);
      }
    },
    logLevel: 'debug',
}));

router.use('/api/auth', (req, res, next) => {
  console.log('Auth proxy route matched');
  next();
});

console.log("USER_SERVICE: ", USER_SERVICE);

// router.use('/auth', createProxyMiddleware({
//     target: 'https://api.genderize.io',
//     changeOrigin: true,
//     pathRewrite: {
//       '^/auth': ''
//     },
//     on: {
//         proxyReq: (proxyReq, req) => {
//           console.log('ProxyReq:', req.method, req.originalUrl);
//         },

//         proxyRes: (proxyRes, req) => {
//           console.log('ProxyRes:', proxyRes.statusCode);
//         },

//         error: (err, req, res) => {
//           console.error('Proxy Error:', err.message);
//         }
//     },
//     logLevel: 'debug',
// }));

router.use('/user', createProxyMiddleware({
    target: USER_SERVICE,
    changeOrigin: true,
    pathRewrite: (path) => `/api/${path}`,
    on: {
        proxyReq: (proxyReq, req) => {
          console.log('ProxyReq:', req.method, req.originalUrl);
          console.log('originalUrl:', req.originalUrl);
          console.log('baseUrl:', req.baseUrl);
          console.log('path:', req.path);
          console.log('url:', req.url);
        },

        proxyRes: (proxyRes, req) => {
          console.log('ProxyRes:', proxyRes.statusCode);
        },

        error: (err, req, res) => {
          console.error('Proxy Error:', err.message);
        }
    },
    logLevel: 'debug',
}));


export default router;