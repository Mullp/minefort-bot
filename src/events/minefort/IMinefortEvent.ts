import {
  MinefortClient,
  MinefortEvents,
} from '../../client/minefort/MinefortClient';

export interface IMinefortEvent<K extends keyof MinefortEvents> {
  enabled?: boolean;
  event: K;
  once: boolean;
  execute: (
    client: MinefortClient,
    ...args: MinefortEvents[K]
  ) => Promise<void>;
}
