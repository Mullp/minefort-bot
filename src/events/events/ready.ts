import {Event} from '../Event';
import {ActivityType} from 'discord-api-types/v10';

export default new Event({
  enabled: true,
  event: 'ready',
  once: true,
  execute: async client => {
    console.log(`Ready! Logged in as ${client.user?.tag}`);

    client.user?.setActivity('Minefort', {type: ActivityType.Playing});
  },
});
