import {IMinefortClient} from './IMinefortClient';
import {Client, ResponseStatus, Server, ServersResponse} from 'minefort';
import {redis} from '../redis/RedisClient';
import {EventEmitter} from 'events';
import {Mixin} from 'ts-mixer';
import {HistoryManager} from '../../history/HistoryManager';
import {join} from 'path';
import {readdirSync} from 'fs';
import {Collection} from 'discord.js';
import {MinefortEvent} from '../../events/minefort/MinefortEvent';

export interface MinefortEvents {
  serverUpdate: [oldServer: Server | null, newServer: Server];
  serverStart: [server: Server];
  serverStop: [server: Server];
  serverPlayerJoin: [server: Server, player: string];
  serverPlayerLeave: [server: Server, player: string];
}

export class MinefortClient
  extends Mixin(Client, EventEmitter)
  implements IMinefortClient
{
  public readonly events: Collection<
    string,
    MinefortEvent<keyof MinefortEvents>
  >;
  private oldResponse: Server[] = [];

  constructor() {
    super();
    this.events = new Collection();
  }

  public async handleServersResponse(servers: Server[]): Promise<void> {
    if (this.oldResponse.length === 0) {
      this.oldResponse = servers;
      return;
    }
    for (const server of servers) {
      const oldServer = this.oldResponse.find(s => s.id === server.id);
      if (!oldServer) {
        this.emit('serverStart', server);
        if (!server.playerData.online) continue;
        for (const player of server.playerData.online) {
          this.emit('serverPlayerJoin', server, player);
        }
      } else {
        if (!(oldServer.playerData.online && server.playerData.online)) {
          return;
        }
        for (const player of server.playerData.online) {
          if (!oldServer.playerData.online.includes(player)) {
            this.emit('serverPlayerJoin', server, player);
          }
        }
        for (const oldPlayer of oldServer.playerData.online) {
          if (!server.playerData.online.includes(oldPlayer)) {
            this.emit('serverPlayerLeave', server, oldPlayer);
          }
        }
      }
    }
    for (const oldServer of this.oldResponse) {
      if (!servers.map(s => s.id).includes(oldServer.id)) {
        this.emit('serverStop', oldServer);
        if (!oldServer.playerData.online) continue;
        for (const player of oldServer.playerData.online) {
          this.emit('serverPlayerLeave', oldServer, player);
        }
      }
    }

    this.oldResponse = servers;
  }

  public async registerEvents(): Promise<void> {
    const eventsPath = join(__dirname, '../../events/minefort/events');
    const eventFiles = readdirSync(eventsPath).filter(file =>
      file.endsWith('.js')
    );

    for (const file of eventFiles) {
      const filePath = join(eventsPath, file);
      const event: MinefortEvent<keyof MinefortEvents> = (
        await import(filePath)
      ).default;

      if (event.enabled === false) return;

      this.events.set(event.event, event);
      this[event.once ? 'once' : 'on'](event.event, (...args) =>
        event.execute(this, ...(args as MinefortEvents[typeof event.event]))
      );
      console.log('[SUCCESS]', file, 'event file loaded.');
    }
  }

  public async getOnlineServers(
    options: {
      paginationSkip?: number;
      limit?: number;
      sortOrder?: 'desc' | 'asc';
    } = {paginationSkip: 0, limit: 500, sortOrder: 'desc'}
  ): Promise<Server[]> {
    const servers = await redis
      .get('servers')
      .then(value => {
        if (value) {
          return JSON.parse(value) as Extract<
            ServersResponse,
            {status: ResponseStatus.OK}
          >['result'];
        }

        return null;
      })
      .then(value => {
        if (value) {
          return value.map(server => new Server(this, server));
        }

        return null;
      });

    if (servers) {
      return servers;
    }

    return await fetch(this.BASE_URL + '/servers/list', {
      method: 'POST',
      body: JSON.stringify({
        pagination: {
          skip: options.paginationSkip || 0,
          limit: options.limit || 500,
        },
        sort: {
          field: 'players.online',
          order: options.sortOrder || 'desc',
        },
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(res => res.json() as Promise<ServersResponse>)
      .then(async value => {
        if (value.status === ResponseStatus.OK) {
          const servers = value.result.map(server => new Server(this, server));

          redis.setEx('servers', 60, JSON.stringify(value.result));
          this.handleServersResponse(servers);
          HistoryManager.createHistory(servers);

          return servers;
        } else if (value.status === ResponseStatus.INVALID_INPUT) {
          throw new Error('Invalid input: ' + value.error.body[0].message);
        } else if (value.status === ResponseStatus.INTERNAL_ERROR) {
          throw new Error('Internal server error');
        }

        return [];
      })
      .catch(error => {
        throw error;
      });
  }
}
