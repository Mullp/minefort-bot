import {DiscordClient} from './client/discord/DiscordClient';
import {GatewayIntentBits} from 'discord-api-types/v10';
import {env} from './utils/env';
import {MinefortClient} from './client/minefort/MinefortClient';
import {cronPing} from './history/cron-ping';

export const client = new DiscordClient({
  intents: [GatewayIntentBits.Guilds],
});
export const minefort = new MinefortClient();

(async () => {
  await client.registerCommands();
  await client.registerEvents();
  // await client.registerModals();

  await minefort.auth(env.MINEFORT_USERNAME, env.MINEFORT_PASSWORD);

  await client.login(env.TOKEN);

  cronPing.start();
})();
