import 'dotenv/config';

export const env = {
  TOKEN: process.env.TOKEN as string,
  CLIENTID: process.env.CLIENTID as string,
  GUILDID: process.env.GUILDID as string,
};
