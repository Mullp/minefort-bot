import {ICommand} from './ICommand';
import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';
import {DiscordClient} from '../client/DiscordClient';

export class Command implements ICommand {
  public readonly enabled?: boolean;
  public readonly data:
    | SlashCommandBuilder
    | SlashCommandSubcommandsOnlyBuilder
    | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;
  public readonly execute: (
    client: DiscordClient,
    interaction: ChatInputCommandInteraction
  ) => Promise<void>;
  public readonly autocomplete?: (
    client: DiscordClient,
    interaction: AutocompleteInteraction
  ) => Promise<void>;

  constructor(options: ICommand) {
    this.enabled = options.enabled;
    this.data = options.data;
    this.execute = options.execute;
    this.autocomplete = options.autocomplete;
  }
}
