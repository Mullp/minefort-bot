import {IDiscordEvent} from './IDiscordEvent';
import {ClientEvents} from 'discord.js';
import {DiscordClient} from '../../client/discord/DiscordClient';

export class DiscordEvent<K extends keyof ClientEvents>
  implements IDiscordEvent<K>
{
  public readonly enabled?: boolean;
  public readonly event: K;
  public readonly once: boolean;
  public readonly execute: (
    client: DiscordClient,
    ...args: ClientEvents[K]
  ) => Promise<void>;

  constructor(options: IDiscordEvent<K>) {
    this.enabled = options.enabled;
    this.event = options.event;
    this.once = options.once;
    this.execute = options.execute;
  }
}
