import rateLimit from "express-rate-limit";
import RediStore from 'rate-limit-redis';
import redis from "../config/redis.client.js";
import { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUEST } from "../config/env.js";

export const globalRateLimier = rateLimit({
    store: new RediStore({
        client: redis,
    }),
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: RATE_LIMIT_MAX_REQUEST,
    message: {
        error: 'Too many request, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});