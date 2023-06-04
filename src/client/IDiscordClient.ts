import {ClientEvents, Collection} from 'discord.js';
import {Command} from '../commands/Command';
import {Modal} from '../modals/Modal';
import {Event} from '../events/Event';

export interface IDiscordClient {
  commands: Collection<string, Command>;
  events: Collection<string, Event<keyof ClientEvents>>;
  modals: Collection<string, Modal>;
  registerCommands(): Promise<void>;
  registerEvents(): Promise<void>;
  registerModals(): Promise<void>;
}
