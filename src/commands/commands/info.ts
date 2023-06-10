import {Command} from '../Command';
import {hyperlink, SlashCommandBuilder, userMention} from 'discord.js';

export default new Command({
  enabled: true,
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Information about the bot'),
  execute: async (client, interaction) => {
    await interaction.deferReply({ephemeral: false});

    const infoEmbed = client.getBaseEmbed(interaction).addFields([
      {
        name: 'Notice of Non-Affiliation and Disclaimer',
        value: `This bot is not affiliated, associated, authorized, endorsed by, or in any way officially connected with Minefort, or any of its subsidiaries or its affiliates. The official Minefort website can be found at ${hyperlink(
          'Minefort.com',
          'https://minefort.com'
        )}. The name Minefort, the Minefort brand, and the Minefort Assets are the sole property of Minefort, all rights reserved. The bot, its maintainer, and its contributors claim no ownership of any kind of the Minefort brand or assets. Any use of the Minefort brand or assets in this bot is for the sole purpose of identifying the Minefort service to potential users.`,
      },
      {
        name: 'Source code',
        value: `This bot is open source and can be found at ${hyperlink(
          'github.com/Mullp/minefort-bot',
          'https://github.com/Mullp/minefort-bot'
        )}.`,
      },
      {
        name: 'Contributors',
        value: `Currently, the only contributor is ${userMention(
          '302760948748517376'
        )}.`,
      },
      {
        name: 'Invite',
        value: hyperlink(
          'You can invite this bot to your server by clicking here.',
          `https://discord.com/api/oauth2/authorize?client_id=${client.user?.id}&permissions=0&scope=bot%20applications.commands`
        ),
      },
    ]);

    await interaction.editReply({
      embeds: [infoEmbed],
    });
  },
});
