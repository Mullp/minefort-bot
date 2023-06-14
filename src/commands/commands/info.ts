import {Command} from '../Command';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  hyperlink,
  SlashCommandBuilder,
  userMention,
} from 'discord.js';

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
        value:
          'This bot is not affiliated, associated, authorized, endorsed by, or in any way officially connected with Minefort, or any of its subsidiaries or its affiliates. The official Minefort website can be found at https://minefort.com. The name Minefort, the Minefort brand, and the Minefort Assets are the sole property of Minefort, all rights reserved. The bot, its maintainer, and its contributors claim no ownership of any kind of the Minefort brand or assets. Any use of the Minefort brand or assets in this bot is for the sole purpose of identifying the Minefort service to potential users.',
      },
      {
        name: 'Source code',
        value:
          'This bot is open source and can be found at https://github.com/Mullp/minefort-bot.',
      },
      {
        name: 'Contributors',
        value: `The project is started and mainly maintained by ${userMention(
          '302760948748517376'
        )}, to find a list of all contributors, click ${hyperlink(
          'here',
          'https://github.com/Mullp/minefort-bot/graphs/contributors'
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

    const inviteButton = new ButtonBuilder()
      .setLabel('Invite the bot')
      .setEmoji({id: '1118632905950900257', name: 'minefortwhite'})
      .setURL(
        `https://discord.com/api/oauth2/authorize?client_id=${client.user?.id}&permissions=0&scope=bot%20applications.commands`
      )
      .setStyle(ButtonStyle.Link);

    const githubButton = new ButtonBuilder()
      .setLabel('Source code')
      .setEmoji({id: '1118584928846745630', name: 'githubmarkwhite'})
      .setURL('https://github.com/Mullp/minefort-bot')
      .setStyle(ButtonStyle.Link);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      inviteButton,
      githubButton
    );

    await interaction.editReply({
      embeds: [infoEmbed],
      components: [row],
    });
  },
});
