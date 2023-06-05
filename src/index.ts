import {DiscordClient} from './client/discord/DiscordClient';
import {GatewayIntentBits} from 'discord-api-types/v10';
import {env} from './utils/env';
import {MinefortClient} from './client/minefort/MinefortClient';

export const client = new DiscordClient({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});
export const minefort = new MinefortClient();

(async () => {
  await client.registerCommands();
  await client.registerEvents();
  // await client.registerModals();

  await client.login(env.TOKEN);
})();
