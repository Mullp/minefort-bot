import {DiscordClient} from './client/discord/DiscordClient';
import {GatewayIntentBits} from 'discord-api-types/v10';
import {env} from './utils/env';
import {MinefortClient} from './client/minefort/MinefortClient';
import {cronPing} from './history/cron-ping';

export const discordClient = new DiscordClient({
  intents: [GatewayIntentBits.Guilds],
});
export const minefortClient = new MinefortClient();

(async () => {
  await discordClient.registerCommands();
  await discordClient.registerEvents();
  // await client.registerModals();

  await minefortClient.registerEvents();

  await minefortClient.auth(env.MINEFORT_USERNAME, env.MINEFORT_PASSWORD);

  await discordClient.login(env.TOKEN);

  cronPing.start();
})();
