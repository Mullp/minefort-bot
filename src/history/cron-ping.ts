const cron = require('node-cron');
import {minefortClient} from '../index';
import {HistoryManager} from './HistoryManager';

export const cronPing = cron.schedule('*/5 * * * *', async () => {
  await minefortClient.servers
    .getOnlineServers({limit: 500})
    .then(async servers => {
      await HistoryManager.createHistory(servers);
      await minefortClient.handleServersResponse(servers);
    });
});
