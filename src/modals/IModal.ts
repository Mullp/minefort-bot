import {ModalBuilder, ModalSubmitInteraction} from 'discord.js';
import {DiscordClient} from '../client/discord/DiscordClient';

export interface IModal {
  enabled?: boolean;
  data: ModalBuilder;
  execute: (
    client: DiscordClient,
    interaction: ModalSubmitInteraction
  ) => Promise<void>;
}
