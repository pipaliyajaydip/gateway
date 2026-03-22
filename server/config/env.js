import dotenv from 'dotenv';
import ms from 'ms';
dotenv.config();

export const currentEnvType = process.env.NODE_ENV;
export const isProdEnv = currentEnvType === 'production';

const envFilePath = isProdEnv
  ? '.env.production'
  : '.env.development';

dotenv.config({
  path: envFilePath
});

export const PORT = process.env.PORT;

export const REDIS_HOST = process.env.REDIS_HOST;
export const REDIS_PORT = process.env.REDIS_PORT;
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
export const REDIS_DB = process.env.REDIS_DB;

export const USER_SERVICE = process.env.USER_SERVICE;

export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
export const JWT_EXPIRES_AT = ms(JWT_EXPIRES_IN);
export const REFRESH_SECRET = process.env.REFRESH_SECRET;
export const REFRESH_EXPIRES_IN = process.env.REFRESH_EXPIRES_IN;
export const REFRESH_EXPIRE_AT = ms(REFRESH_EXPIRES_IN);

