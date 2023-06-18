import {IMinefortEvent} from './IMinefortEvent';
import {
  MinefortClient,
  MinefortEvents,
} from '../../client/minefort/MinefortClient';

export class MinefortEvent<K extends keyof MinefortEvents>
  implements IMinefortEvent<K>
{
  public readonly enabled?: boolean;
  public readonly event: K;
  public readonly once: boolean;
  public readonly execute: (
    client: MinefortClient,
    ...args: MinefortEvents[K]
  ) => Promise<void>;

  constructor(options: IMinefortEvent<K>) {
    this.enabled = options.enabled;
    this.event = options.event;
    this.once = options.once;
    this.execute = options.execute;
  }
}
