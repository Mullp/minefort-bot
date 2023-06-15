import {Server} from 'minefort';
import {prisma} from '../client/prisma/PrismaClient';

export class HistoryManager {
  public static lastUpdate: Date;

  public static async createHistory(servers: Server[]) {
    // 1 minute cooldown
    if (this.lastUpdate && Date.now() - this.lastUpdate.getTime() < 1000 * 60) {
      console.log('History already created in the last minute');
      return;
    }

    this.lastUpdate = new Date();

    console.log('Creating history...');

    for (const server of servers) {
      if (!server.playerData.online) continue;

      await prisma.minefortServer.upsert({
        where: {
          serverId: server.id,
        },
        update: {
          name: server.name,
          motd: server.motd,
          iconUrl: server.icon.image,
          version: server.version,
          maxPlayers: server.playerData.maxPlayers,
          history: {
            create: {
              players: {
                connectOrCreate: server.playerData.online.map(player => {
                  return {
                    where: {
                      uuid: player,
                    },
                    create: {
                      uuid: player,
                    },
                  };
                }),
              },
            },
          },
        },
        create: {
          serverId: server.id,
          owner: {
            connectOrCreate: {
              where: {
                minefortId: server.ownerId,
              },
              create: {
                minefortId: server.ownerId,
              },
            },
          },
          name: server.name,
          motd: server.motd,
          iconUrl: server.icon.image,
          version: server.version,
          maxPlayers: server.playerData.maxPlayers,
          history: {
            create: {
              players: {
                connectOrCreate: server.playerData.online.map(player => {
                  return {
                    where: {
                      uuid: player,
                    },
                    create: {
                      uuid: player,
                    },
                  };
                }),
              },
            },
          },
        },
      });
    }

    console.log('History created');
  }
}
