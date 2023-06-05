import {IEvent} from './IEvent';
import {ClientEvents} from 'discord.js';
import {DiscordClient} from '../client/discord/DiscordClient';

export class Event<K extends keyof ClientEvents> implements IEvent<K> {
  public readonly enabled?: boolean;
  public readonly event: K;
  public readonly once: boolean;
  public readonly execute: (
    client: DiscordClient,
    ...args: ClientEvents[K]
  ) => Promise<void>;

  constructor(options: IEvent<K>) {
    this.enabled = options.enabled;
    this.event = options.event;
    this.once = options.once;
    this.execute = options.execute;
  }
}
