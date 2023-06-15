import 'dotenv/config';

export const env = {
  TOKEN: process.env.TOKEN as string,
  CLIENT_ID: process.env.CLIENT_ID as string,
  GUILD_ID: process.env.GUILD_ID as string,
  DATABASE_URL: process.env.DATABASE_URL as string,
  REDIS_URL: process.env.REDIS_URL as string,
  MINEFORT_USERNAME: process.env.MINEFORT_USERNAME as string,
  MINEFORT_PASSWORD: process.env.MINEFORT_PASSWORD as string,
};
