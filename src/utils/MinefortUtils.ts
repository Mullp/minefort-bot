import {ServerPlan, ServerPlanSpecifics} from '../typings/ServerTypings';

export class MinefortUtils {
  /**
   * Converts minecraft colors to discord ansi colors.
   * @param text - The text to convert.
   * @returns The converted text.
   */
  public static convertColorsToAnsi(text: string): string {
    return text
      .replace(/\\./g, '\\\\')
      .replace(/&0/gi, '\u001b[0m\u001b[0;30m')
      .replace(/&1/gi, '\u001b[0m\u001b[0;34m')
      .replace(/&2/gi, '\u001b[0m\u001b[0;32m')
      .replace(/&3/gi, '\u001b[0m\u001b[0;36m')
      .replace(/&4/gi, '\u001b[0m\u001b[0;31m')
      .replace(/&5/gi, '\u001b[0m\u001b[0;35m')
      .replace(/&6/gi, '\u001b[0m\u001b[0;33m')
      .replace(/&7/gi, '\u001b[0m\u001b[0;30m')
      .replace(/&8/gi, '\u001b[0m\u001b[0;30m')
      .replace(/&9/gi, '\u001b[0m\u001b[0;34m')
      .replace(/&a/gi, '\u001b[0m\u001b[0;32m')
      .replace(/&b/gi, '\u001b[0m\u001b[0;36m')
      .replace(/&c/gi, '\u001b[0m\u001b[0;31m')
      .replace(/&d/gi, '\u001b[0m\u001b[0;35m')
      .replace(/&e/gi, '\u001b[0m\u001b[0;33m')
      .replace(/&f/gi, '\u001b[0m\u001b[0;37m')
      .replace(/&k/gi, '')
      .replace(/&l/gi, '\u001b[1m')
      .replace(/&m/gi, '')
      .replace(/&n/gi, '\u001b[4m')
      .replace(/&o/gi, '\u001b[1m')
      .replace(/&r/gi, '\u001b[0m');
  }

  public static getMinefortIdFromAuth0Id(auth0Id: string): string {
    return auth0Id.includes('auth0|') ? auth0Id.split('auth0|')[1] : auth0Id;
  }

  public static getServerVersion(version: string): string {
    return version.split('-')[1];
  }

  public static getServerSoftware(version: string): string {
    return version.split('-')[0];
  }

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
}
