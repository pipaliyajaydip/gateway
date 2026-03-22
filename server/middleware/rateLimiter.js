import rateLimit from "express-rate-limit";
import RediStore from 'rate-limit-redis';
import redis from "../config/redis.client.js";

export const globalRateLimier = rateLimit({
    store: new RediStore({
        client: redis,
    }),
    windowMs: 15 * 60 * 1000, //15 Min
    max: 100, //max limit per each ip, across all process
    message: {
        error: 'Too many request, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});