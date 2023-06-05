export interface ServerPlanSpecifics {
  name: ServerPlan;
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

export type ServerPlan = 'Hut' | 'Cottage' | 'House' | 'Mansion' | 'Fort';
