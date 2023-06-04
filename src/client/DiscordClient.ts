import {Client, ClientEvents, ClientOptions, Collection} from 'discord.js';
import {IDiscordClient} from './IDiscordClient';
import {Command} from '../commands/Command';
import {Modal} from '../modals/Modal';
import {Event} from '../events/Event';

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

  registerCommands(): Promise<void> {
    return Promise.resolve(undefined);
  }

  registerEvents(): Promise<void> {
    return Promise.resolve(undefined);
  }

  registerModals(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
