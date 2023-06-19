import {Server} from 'minefort';
import {Collection} from 'discord.js';
import {MinefortEvent} from '../../events/minefort/MinefortEvent';
import {MinefortEvents} from './MinefortClient';
import {EventEmitter} from 'events';

export interface IMinefortClient {
  readonly events: Collection<string, MinefortEvent<keyof MinefortEvents>>;
  readonly eventEmitter: EventEmitter;
  handleServersResponse(servers: Server[]): Promise<void>;
  registerEvents(): Promise<void>;
  getOnlineServers(options: {
    paginationSkip?: number;
    limit?: number;
    sortOrder?: 'desc' | 'asc';
  }): Promise<Server[]>;
}
