import {ClientEvents} from 'discord.js';
import {DiscordClient} from '../client/DiscordClient';

export interface IEvent<K extends keyof ClientEvents> {
  enabled?: boolean;
  event: K;
  once: boolean;
  execute: (client: DiscordClient, ...args: ClientEvents[K]) => Promise<void>;
}
