import {IMinefortClient} from './IMinefortClient';
import {Client, ResponseStatus, Server, ServersResponse} from 'minefort';
import {redis} from '../redis/RedisClient';

export class MinefortClient extends Client implements IMinefortClient {
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
      .then(value => {
        if (value.status === ResponseStatus.OK) {
          redis.setEx('servers', 60, JSON.stringify(value.result));

          return value.result.map(server => new Server(this, server));
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
