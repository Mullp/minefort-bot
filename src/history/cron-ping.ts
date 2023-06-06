const cron = require('node-cron');
import {minefort} from '../index';
import {HistoryManager} from './HistoryManager';

export const cronPing = cron.schedule('*/5 * * * *', async () => {
  await minefort.servers.getOnlineServers({limit: 500}).then(async servers => {
    await HistoryManager.createHistory(servers);
  });
});
