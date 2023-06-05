import {ServerPlan, ServerPlanSpecifics} from '../typings/ServerTypings';
import {Server} from 'minefort';

export class MinefortUtils {
  /**
   * Converts Minecraft colors to Discord ansi colors.
   * @param text - The text to convert.
   * @returns The converted text.
   */
  public static convertColorsToAnsi(text: string): string {
    return text
      .replace(/\\./g, '\\\\')
      .replace(/&0|§0/gi, '\u001b[0m\u001b[0;30m')
      .replace(/&1|§1/gi, '\u001b[0m\u001b[0;34m')
      .replace(/&2|§2/gi, '\u001b[0m\u001b[0;32m')
      .replace(/&3|§3/gi, '\u001b[0m\u001b[0;36m')
      .replace(/&4|§4/gi, '\u001b[0m\u001b[0;31m')
      .replace(/&5|§5/gi, '\u001b[0m\u001b[0;35m')
      .replace(/&6|§6/gi, '\u001b[0m\u001b[0;33m')
      .replace(/&7|§7/gi, '\u001b[0m\u001b[0;30m')
      .replace(/&8|§8/gi, '\u001b[0m\u001b[0;30m')
      .replace(/&9|§9/gi, '\u001b[0m\u001b[0;34m')
      .replace(/&a|§a/gi, '\u001b[0m\u001b[0;32m')
      .replace(/&b|§b/gi, '\u001b[0m\u001b[0;36m')
      .replace(/&c|§c/gi, '\u001b[0m\u001b[0;31m')
      .replace(/&d|§d/gi, '\u001b[0m\u001b[0;35m')
      .replace(/&e|§e/gi, '\u001b[0m\u001b[0;33m')
      .replace(/&f|§f/gi, '\u001b[0m\u001b[0;37m')
      .replace(/&k|§k/gi, '')
      .replace(/&l|§l/gi, '\u001b[1m')
      .replace(/&m|§m/gi, '')
      .replace(/&n|§n/gi, '\u001b[4m')
      .replace(/&o|§o/gi, '\u001b[1m')
      .replace(/&r|§r/gi, '\u001b[0m');
  }

  /**
   * Gets the Minefort ID from the auth0 ID.
   * @param auth0Id - The auth0 ID.
   * @returns The Minefort ID.
   */
  public static getMinefortIdFromAuth0Id(auth0Id: string): string {
    return auth0Id.includes('auth0|') ? auth0Id.split('auth0|')[1] : auth0Id;
  }

  /**
   * Checks whether a Minefort ID has two-factor authentication enabled.
   * @param minefortId - The Minefort ID.
   * @returns Whether two-factor authentication is enabled.
   */
  public static hasTwoFactorEnabled(minefortId: string): boolean {
    return minefortId.includes('auth0|');
  }

  /**
   * Gets the server version from the full version.
   * @param version - The full version.
   * @returns The server version.
   */
  public static getServerVersion(version: string): string {
    return version.split('-')[1];
  }

  /**
   * Gets the server software from the full version.
   * @param version - The full version.
   * @returns The server software.
   */
  public static getServerSoftware(version: string): string {
    return version.split('-')[0];
  }

  /**
   * Estimates the server plan from the max player count.
   * @param maxPlayerCount - The max player count.
   * @returns The estimated server plan.
   */
  public static estimateServerPlan(maxPlayerCount: number): ServerPlan | null {
    switch (maxPlayerCount) {
      case 20:
        return 'Free';
      case 35:
        return 'Cottage';
      case 50:
        return 'House';
      case 100:
        return 'Mansion';
      case 200:
        return 'Fort';
      default:
        return null;
    }
  }

  /**
   * Gets the server plan specifics from the server plan.
   * @param plan - The server plan.
   * @returns The server plan specifics.
   */
  public static getServerPlanSpecifics(plan: ServerPlan): ServerPlanSpecifics {
    switch (plan) {
      case 'Free':
        return {
          price: 0,
          online24h: false,
          pluginBrowser: true,
          fileManager: true,
          ftp: true,
          priorityQueue: false,
          adFree: false,
          unlimitedPlugins: true,
          ram: 1,
          maxPlayerCount: 20,
          backupSlots: 1,
          storage: 10,
        };
      case 'Cottage':
        return {
          price: 5.99,
          online24h: true,
          pluginBrowser: true,
          fileManager: true,
          ftp: true,
          priorityQueue: true,
          adFree: true,
          unlimitedPlugins: true,
          ram: 2,
          maxPlayerCount: 35,
          backupSlots: 3,
          storage: 20,
        };
      case 'House':
        return {
          price: 11.49,
          online24h: true,
          pluginBrowser: true,
          fileManager: true,
          ftp: true,
          priorityQueue: true,
          adFree: true,
          unlimitedPlugins: true,
          ram: 4,
          maxPlayerCount: 50,
          backupSlots: 5,
          storage: 20,
        };
      case 'Mansion':
        return {
          price: 23.99,
          online24h: true,
          pluginBrowser: true,
          fileManager: true,
          ftp: true,
          priorityQueue: true,
          adFree: true,
          unlimitedPlugins: true,
          ram: 8,
          maxPlayerCount: 100,
          backupSlots: 7,
          storage: 20,
        };
      case 'Fort':
        return {
          price: 47.99,
          online24h: true,
          pluginBrowser: true,
          fileManager: true,
          ftp: true,
          priorityQueue: true,
          adFree: true,
          unlimitedPlugins: true,
          ram: 12,
          maxPlayerCount: 200,
          backupSlots: 15,
          storage: 40,
        };
      default:
        return {
          price: 0,
          online24h: false,
          pluginBrowser: true,
          fileManager: true,
          ftp: true,
          priorityQueue: false,
          adFree: false,
          unlimitedPlugins: true,
          ram: 1,
          maxPlayerCount: 20,
          backupSlots: 1,
          storage: 10,
        };
    }
  }

  /**
   * Gets a window of five servers around the input server.
   * @param array - The array of servers.
   * @param input - The input server.
   * @returns The window of servers.
   * @example
   * // Simple example with numbers
   * const array = [1, 2, 3, 4, 5, 6, 7, 8, 9];
   *
   * getRankWindow(array, 5); // [3, 4, 5, 6, 7]
   * getRankWindow(array, 1); // [1, 2, 3, 4, 5]
   * getRankWindow(array, 9); // [5, 6, 7, 8, 9]
   */
  public static getServerRankWindow(array: Server[], input: Server): Server[] {
    const index = array.indexOf(input);
    const window = array.slice(index - 2, index + 3);
    return window.length === 5 ? window : array.slice(0, 5);
  }
}
