export interface ServerPlanSpecifics {
  price: number;
  online24h: boolean;
  pluginBrowser: boolean;
  fileManager: boolean;
  ftp: boolean;
  priorityQueue: boolean;
  adFree: boolean;
  unlimitedPlugins: boolean;
  ram: number;
  maxPlayerCount: number;
  backupSlots: number;
  storage: number;
}

export type ServerPlan = 'Free' | 'Cottage' | 'House' | 'Mansion' | 'Fort';
