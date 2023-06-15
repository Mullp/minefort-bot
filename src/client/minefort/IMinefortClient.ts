import {Server} from 'minefort';

export interface IMinefortClient {
  getOnlineServers(options: {
    paginationSkip?: number;
    limit?: number;
    sortOrder?: 'desc' | 'asc';
  }): Promise<Server[]>;
}
