import {ClientEvents} from 'discord.js';
import {DiscordClient} from '../../client/discord/DiscordClient';

export interface IDiscordEvent<K extends keyof ClientEvents> {
  enabled?: boolean;
  event: K;
  once: boolean;
  execute: (client: DiscordClient, ...args: ClientEvents[K]) => Promise<void>;
}
