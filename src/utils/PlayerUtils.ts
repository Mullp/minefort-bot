import fetch from 'cross-fetch';
import {Player} from '../typings/PlayerTypings';

export class PlayerUtils {
  public static readonly playerCache: Map<
    string,
    {player: Player; createdAt: Date}
  > = new Map();

  /**
   * Gets a player from the Mojang API by UUID, and caches it for 20 days.
   * @param uuid - The UUID of the player to get
   * @returns The player
   */
  public static async getPlayerByUuid(uuid: string) {
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
        res.id = PlayerUtils.convertPlayerIdToUuid(res.id);
        this.playerCache.set(uuid, {player: res, createdAt: new Date()});

        console.log('retuning new player');

        return res;
      })
      .catch(() => null);
  }

  /**
   * Gets a player from the Mojang API by username, and caches it for 20 days.
   * @param username - The username of the player to get
   * @returns The player
   */
  public static async getPlayerByName(username: string) {
    // Check if the player is cached
    for (const [uuid, player] of this.playerCache) {
      if (player.player.name === username) {
        const diffInMs = Date.now() - player.createdAt.getTime();

        // 20 days
        if (1000 * 60 * 60 * 24 * 20 > diffInMs) {
          console.log('Returning old cached player');
          return player.player;
        }
      }
    }

    return await fetch(
      `https://api.mojang.com/users/profiles/minecraft/${username}`
    )
      .then(res => res.json() as Promise<Player>)
      .then(res => {
        res.id = PlayerUtils.convertPlayerIdToUuid(res.id);
        this.playerCache.set(res.id, {
          player: res,
          createdAt: new Date(),
        });

        return res;
      })
      .catch(() => null);
  }

  /**
   * Converts a player ID to a UUID
   * @param playerId - The player ID to convert
   * @returns The UUID of the player
   * @example
   * PlayerUtils.convertPlayerIdToUUID('f5b5c6d78e9f0a1b2c3d4e5f6a7b8c9d')
   * // => 'f5b5c6d7-8e9f-0a1b-2c3d-4e5f6a7b8c9d'
   */
  public static convertPlayerIdToUuid(playerId: string) {
    return playerId.replace(
      /(.{8})(.{4})(.{4})(.{4})(.{12})/,
      '$1-$2-$3-$4-$5'
    );
  }
}
