'use strict';
import 'dotenv/config';

const required = (name) => {
  const val = process.env[name];
  if (!val) throw new Error(`Variable de entorno requerida: ${name}`);
  return val;
};

export default {
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  db: {
    host:              required('DB_HOST'),
    port:              parseInt(process.env.DB_PORT ?? '5432', 10),
    database:          required('DB_NAME'),
    user:              required('DB_USER'),
    password:          required('DB_PASSWORD'),
    max:               parseInt(process.env.DB_POOL_MAX ?? '10', 10),
    idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT ?? '30000', 10),
    connectionTimeoutMillis: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT ?? '5000', 10),
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  },
  jwt: {
    secret:    required('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
  },
  refreshToken: {
    expiresInDays: parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS ?? '7', 10),
  },
  google: {
    clientId:     required('GOOGLE_CLIENT_ID'),
    clientSecret: required('GOOGLE_CLIENT_SECRET'),
    callbackUrl:  `${process.env.BACKEND_URL ?? 'http://localhost:3000'}/api/auth/google/callback`,
  },
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
};
