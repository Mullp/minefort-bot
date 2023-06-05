import fetch from 'cross-fetch';
import {Player} from '../typings/PlayerTypings';

export class PlayerUtils {
  public static readonly playerCache: Map<
    string,
    {player: Player; createdAt: Date}
  > = new Map();

  public static async getPlayer(uuid: string) {
    const player = this.playerCache.get(uuid);

    if (player) {
      const diffInMs = Date.now() - player.createdAt.getTime();

      // 20 days
      if (1000 * 60 * 60 * 24 * 20 > diffInMs) {
        console.log('Returning old cached player');
        return player.player;
      }
    }

    return await fetch(
      `https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`
    )
      .then(res => res.json() as Promise<Player>)
      .then(res => {
        this.playerCache.set(uuid, {player: res, createdAt: new Date()});

        console.log('retuning new player');

        return res;
      })
      .catch(() => null);
  }
}
