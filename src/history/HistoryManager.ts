import {Server} from 'minefort';
import {prisma} from '../client/prisma/PrismaClient';

export class HistoryManager {
  public static lastUpdate: Date;

  public static async createHistory(servers: Server[]) {
    // 1 minute cooldown
    if (this.lastUpdate && Date.now() - this.lastUpdate.getTime() < 1000 * 5) {
      console.log('History already created in the last minute');
      return;
    }

    this.lastUpdate = new Date();

    console.log('Creating history...');

    for (const server of servers) {
      if (!server.playerData.online) continue;

      await prisma.serverHistory.create({
        data: {
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
          server: {
            connectOrCreate: {
              where: {
                serverId: server.id,
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
              },
            },
          },
        },
      });

      await prisma.minefortServer.update({
        where: {
          serverId: server.id,
        },
        data: {
          motd: server.motd,
          name: server.name,
          iconUrl: server.icon.image,
          version: server.version,
          maxPlayers: server.playerData.maxPlayers,
        },
      });
    }

    console.log('History created');
  }
}
