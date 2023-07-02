import {DiscordClient} from './client/discord/DiscordClient';
import {GatewayIntentBits} from 'discord-api-types/v10';
import {env} from './utils/env';
import {MinefortClient} from './client/minefort/MinefortClient';
import {cronPing} from './history/cron-ping';
import {HistoryManager} from './history/HistoryManager';

export const discordClient = new DiscordClient({
  intents: [GatewayIntentBits.Guilds],
});
export const minefortClient = new MinefortClient();

(async () => {
  await discordClient.registerCommands();
  await discordClient.registerEvents();
  // await client.registerModals();

  await minefortClient.registerEvents();

  const sessionToken = await minefortClient.auth(
    env.MINEFORT_USERNAME,
    env.MINEFORT_PASSWORD
  );

  if (!sessionToken) {
    console.error('Failed to authenticate with Minefort');
    throw new Error('Failed to authenticate with Minefort');
  } else {
    console.log('Authenticated with Minefort');
  }

  await discordClient.login(env.TOKEN);

  cronPing.start();

  await minefortClient.servers
    .getOnlineServers({limit: 500})
    .then(async servers => {
      await HistoryManager.createHistory(servers);
      await minefortClient.handleServersResponse(servers);
    });
})();
