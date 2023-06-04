import {IEvent} from './IEvent';
import {ClientEvents} from 'discord.js';
import {DiscordClient} from '../client/DiscordClient';

export class Event<K extends keyof ClientEvents> implements IEvent<K> {
  public readonly enabled?: boolean;
  public readonly name: K;
  public readonly once: boolean;
  public readonly execute: (
    client: DiscordClient,
    ...args: ClientEvents[K]
  ) => Promise<void>;

  constructor(options: IEvent<K>) {
    this.enabled = options.enabled;
    this.name = options.name;
    this.once = options.once;
    this.execute = options.execute;
  }
}
