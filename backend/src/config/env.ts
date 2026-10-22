import dotenv from 'dotenv';

dotenv.config({ quiet: true });

export const env = {
  port: Number(process.env.PORT) || 3000,
  mongodbUri: process.env.MONGODB_URI ?? '',
  mongodbDb: process.env.MONGODB_DB ?? 'minha_colheita',
  jwtSecret: process.env.JWT_SECRET ?? '',
};
