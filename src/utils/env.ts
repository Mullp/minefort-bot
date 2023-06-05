import 'dotenv/config';

export const env = {
  TOKEN: process.env.TOKEN as string,
  CLIENT_ID: process.env.CLIENTID as string,
  GUILD_ID: process.env.GUILDID as string,
  DATABASE_URL: process.env.DATABASE_URL as string,
};
