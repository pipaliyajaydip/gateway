import Redis from 'ioredis';
import { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_DB } from './env.js'

const redis = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
    db: REDIS_DB,
});

redis.on('error', (err) => {
    console.error('Redis connection error: ', err);
});

redis.on('connect', () => {
    console.log('Redis connected successfully.')
});

export default redis;