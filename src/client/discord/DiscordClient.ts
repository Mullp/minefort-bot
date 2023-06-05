import {
  ApplicationCommandOptionChoiceData,
  Client,
  ClientEvents,
  ClientOptions,
  Collection,
  EmbedBuilder, Interaction
} from "discord.js";
import {IDiscordClient} from './IDiscordClient';
import {Command} from '../../commands/Command';
import {Modal} from '../../modals/Modal';
import {Event} from '../../events/Event';
import {join} from 'path';
import {readdirSync} from 'fs';

export class DiscordClient extends Client implements IDiscordClient {
  public readonly commands: Collection<string, Command>;
  public readonly events: Collection<string, Event<keyof ClientEvents>>;
  public readonly modals: Collection<string, Modal>;

  constructor(clientOptions: ClientOptions) {
    super(clientOptions);
    this.commands = new Collection();
    this.events = new Collection();
    this.modals = new Collection();
  }

  public getBaseEmbed(interaction: Interaction): EmbedBuilder {
    return new EmbedBuilder()
      .setColor('#ff03a7')
      .setTimestamp()
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL:
          interaction.user.avatarURL({size: 64}) ??
          interaction.user.displayAvatarURL({size: 64}),
      });
  }

  public async registerCommands(): Promise<void> {
    const commandsPath = join(__dirname, '../../commands/commands');
    const commandFiles = readdirSync(commandsPath).filter(file =>
      file.endsWith('.js')
    );

    for (const file of commandFiles) {
      const filePath = join(commandsPath, file);
      const command: Command = (await import(filePath)).default;

      if (command.enabled === false) return;

      this.commands.set(command.data.name, command);
      console.log('[SUCCESS]', file, 'command file loaded.');
    }
  }

  public async registerEvents(): Promise<void> {
    const eventsPath = join(__dirname, '../../events/events');
    const eventFiles = readdirSync(eventsPath).filter(file =>
      file.endsWith('.js')
    );

    for (const file of eventFiles) {
      const filePath = join(eventsPath, file);
      const event: Event<keyof ClientEvents> = (await import(filePath)).default;

      if (event.enabled === false) return;

      this.events.set(event.event, event);
      this[event.once ? 'once' : 'on'](event.event, (...args) =>
        event.execute(this, ...args)
      );
      console.log('[SUCCESS]', file, 'event file loaded.');
    }
  }

  public async registerModals(): Promise<void> {
    const modalsPath = join(__dirname, '../../modals/modals');
    const modalFiles = readdirSync(modalsPath).filter(file =>
      file.endsWith('.js')
    );

    for (const file of modalFiles) {
      const filePath = join(modalsPath, file);
      const modal: Modal = (await import(filePath)).default;

      if (modal.enabled === false) return;

      if (modal.data.data.custom_id) {
        this.modals.set(modal.data.data.custom_id, modal);
        console.log('[SUCCESS]', file, 'modal file loaded.');
      }
    }
  }

  public sortAutocompleteChoices(
    choices: ApplicationCommandOptionChoiceData[],
    value: string
  ) {
    return choices
      .filter(choice => choice.name.toLowerCase().includes(value.toLowerCase()))
      .sort((a, b) =>
        a.name.toLowerCase().startsWith(value.toLowerCase()) &&
        !b.name.toLowerCase().startsWith(value.toLowerCase())
          ? -1
          : 1
      )
      .filter((_, index) => index < 25);
  }
}
