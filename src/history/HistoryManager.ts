import {Server} from 'minefort';
import {MinefortUserModel} from '../database/models/MinefortUser.model';
import {ServerHistoryModel} from '../database/models/ServerHistoryModel';
import {PlayerModel} from '../database/models/PlayerModel';
import {ServerModel} from '../database/models/ServerModel';
import {MinefortUtils} from '../utils/MinefortUtils';

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

      const minefortPlayerDocuments = await Promise.all(
        server.playerData.online.map(player => {
          return PlayerModel.findOneAndUpdate(
            {uuid: player},
            {},
            {upsert: true, new: true}
          );
        })
      );

      const serverDocument = await ServerModel.findOneAndUpdate(
        {serverId: server.id},
        {
          $set: {
            serverName: server.name,
          },
        },
        {
          new: true,
          upsert: true,
        }
      );

      const serverHistoryDocument = await ServerHistoryModel.create({
        server: serverDocument.id,
        players: minefortPlayerDocuments.map(player => player.id),
      });

      await MinefortUserModel.findOneAndUpdate(
        {minefortId: MinefortUtils.getMinefortIdFromAuth0Id(server.ownerId)},
        {
          $addToSet: {
            servers: serverDocument.id,
          },
        },
        {new: true, upsert: true}
      );
    }

    console.log('History created');
  }
}
