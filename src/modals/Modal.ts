import {IModal} from './IModal';
import {ModalBuilder, ModalSubmitInteraction} from 'discord.js';
import {DiscordClient} from '../client/DiscordClient';

export class Modal implements IModal {
  public readonly enabled?: boolean;
  public readonly data: ModalBuilder;
  public readonly execute: (
    client: DiscordClient,
    interaction: ModalSubmitInteraction
  ) => Promise<void>;

  constructor(options: IModal) {
    this.enabled = options.enabled;
    this.data = options.data;
    this.execute = options.execute;
  }
}
