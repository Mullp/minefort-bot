import {Command} from '../src/commands/Command';
import {join} from 'path';
import {readdirSync} from 'fs';
import {
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
} from 'discord-api-types/v10';
import {REST} from 'discord.js';
import {env} from '../src/utils/env';

const TOKEN = env.TOKEN as string;
const CLIENTID = env.CLIENTID as string;
const GUILDID = env.GUILDID as string;

(async () => {
  const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
  const commandsPath = join(__dirname, '../src/commands/commands');
  const commandFiles = readdirSync(commandsPath).filter(file =>
    file.endsWith('.ts')
  );

  for (const file of commandFiles) {
    const filePath = join(commandsPath, file);
    const command: Command = (await import(filePath)).default;
    if (command.enabled === false) continue;
    commands.push(command.data.toJSON());
  }

  const rest = new REST({version: '10'}).setToken(TOKEN);

  await rest
    .put(Routes.applicationGuildCommands(CLIENTID, GUILDID), {body: commands})
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);
})();
