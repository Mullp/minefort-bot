import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';
import {DiscordClient} from '../client/DiscordClient';

export interface ICommand {
  enabled?: boolean;
  data:
    | SlashCommandBuilder
    | SlashCommandSubcommandsOnlyBuilder
    | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;
  execute: (
    client: DiscordClient,
    interaction: ChatInputCommandInteraction
  ) => Promise<void>;
  autocomplete?: (
    client: DiscordClient,
    interaction: AutocompleteInteraction
  ) => Promise<void>;
}
