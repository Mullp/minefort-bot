import fetch from 'cross-fetch';
import {Player} from '../typings/PlayerTypings';
import {redis} from '../client/redis/RedisClient';

export class PlayerUtils {
  /**
   * Gets a player from the Mojang API by UUID, and caches it for 20 days.
   * @param uuid - The UUID of the player to get
   * @returns The player
   */
  public static async getPlayerByUuid(uuid: string) {
    const player = await redis.get(`player:uuid:${uuid}`);

    if (player) {
      return JSON.parse(player) as Player;
    }

    return await fetch(
      `https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`
    )
      .then(res => res.json() as Promise<Player>)
      .then(async res => {
        res.id = PlayerUtils.convertPlayerIdToUuid(res.id);
        await redis.setEx(
          `player:uuid:${res.id}`,
          60 * 60 * 24 * 5,
          JSON.stringify(res)
        );
        await redis.setEx(
          `player:username:${res.name.toLowerCase()}`,
          60 * 60 * 24 * 5,
          JSON.stringify(res)
        );

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
    const player = await redis.get(`player:username:${username.toLowerCase()}`);

    if (player) {
      return JSON.parse(player) as Player;
    }

    return await fetch(
      `https://api.mojang.com/users/profiles/minecraft/${username}`
    )
      .then(res => res.json() as Promise<Player>)
      .then(async res => {
        res.id = PlayerUtils.convertPlayerIdToUuid(res.id);
        await redis.setEx(
          `player:uuid:${res.id}`,
          60 * 60 * 24 * 5,
          JSON.stringify(res)
        );
        await redis.setEx(
          `player:username:${res.name.toLowerCase()}`,
          60 * 60 * 24 * 5,
          JSON.stringify(res)
        );

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
