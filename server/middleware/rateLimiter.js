import rateLimit from "express-rate-limit";
import RedisStore from 'rate-limit-redis';
import redis from "../config/redis.client.js";
import { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUEST } from "../config/env.js";

const getClientIp = (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    
    return req.ip || req.socket.remoteAddress || 'unknown';
};

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
        const ip = getClientIp(req);
        console.log('Client IP: ', ip);
        return ip;
    },
    message: {
        error: 'Too many requests, please try again later.',
    },
    statusCode: 429,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        return req.path === '/health';
    }
}); 