import {DiscordClient} from './client/DiscordClient';
import {GatewayIntentBits} from 'discord-api-types/v10';

const client = new DiscordClient({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

(async () => {
  await client.registerCommands();
  await client.registerEvents();
  await client.registerModals();

  await client.login(process.env.TOKEN!);
})();
