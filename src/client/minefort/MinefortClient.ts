import {IMinefortClient} from './IMinefortClient';
import {Client} from 'minefort';

export class MinefortClient extends Client implements IMinefortClient {
  public constructor() {
    super();
  }
}
