import rateLimit from "express-rate-limit";
import RedisStore from 'rate-limit-redis';
import redis from "../config/redis.client.js";
import { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUEST } from "../config/env.js";


export const globalRateLimiter = rateLimit({
    store: new RedisStore({
        sendCommand: (...args) => {
            console.log("Redis store, send cmd: ", args);
            return redis.call(...args);
        }
    }),
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: RATE_LIMIT_MAX_REQUEST,
    keyGenerator: (req) => {
        const ip = req.headers['x-forwarded-for'] || req.ip;
        console.log('req.ip: ', ip);
        return ip;
    },
    message: {
        error: 'Too many requests, please try again later.',
    },
    statusCode: 429,
    standardHeaders: true,
    legacyHeaders: false,
}); 