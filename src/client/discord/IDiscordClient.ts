import {
  ApplicationCommandOptionChoiceData,
  ClientEvents,
  Collection,
  EmbedBuilder,
} from 'discord.js';
import {Command} from '../../commands/Command';
import {Modal} from '../../modals/Modal';
import {Event} from '../../events/Event';

export interface IDiscordClient {
  readonly commands: Collection<string, Command>;
  readonly events: Collection<string, Event<keyof ClientEvents>>;
  readonly modals: Collection<string, Modal>;
  registerCommands(): Promise<void>;
  registerEvents(): Promise<void>;
  registerModals(): Promise<void>;

  /**
   * Sorts autocomplete choices by name, and limits to 25 choices.
   * @param choices - The choices to sort.
   * @param value - The value to sort by.
   * @returns The sorted choices.
   */
  sortAutocompleteChoices(
    choices: ApplicationCommandOptionChoiceData[],
    value: string
  ): ApplicationCommandOptionChoiceData[];
}
