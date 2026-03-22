import Redis from 'ioredis';
import { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_DB } from './env.js'

const redis = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
    db: REDIS_DB,
    retryStrategy: (times) => Math.min(times * 50, 2000),
});

redis.on('error', (err) => {
    console.error('Redis connection error: ', err);
});

redis.on('connect', () => {
    console.log('Redis connected successfully.')
});

redis.on('ready', () => {
    console.log('Redis is ready to use.');
});

redis.on('close', () => {
    console.log('Redis connection closed.');
});

export default redis;