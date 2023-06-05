import 'dotenv/config';

export const env = {
  TOKEN: process.env.TOKEN as string,
  CLIENT_ID: process.env.CLIENT_ID as string,
  GUILD_ID: process.env.GUILD_ID as string,
  DATABASE_URL: process.env.DATABASE_URL as string,
};
