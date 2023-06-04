import {DiscordClient} from './client/DiscordClient';
import {GatewayIntentBits} from 'discord-api-types/v10';
import {env} from './utils/env';

const client = new DiscordClient({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

(async () => {
  await client.registerCommands();
  await client.registerEvents();
  await client.registerModals();

  await client.login(env.TOKEN);
})();
