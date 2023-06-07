import {Command} from '../Command';
import {
  ActionRow,
  ActionRowBuilder,
  bold,
  ButtonBuilder,
  ButtonStyle,
  hyperlink,
  SlashCommandBuilder
} from "discord.js";

export default new Command({
  enabled: true,
  data: new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Invite the bot to your server'),
  execute: async (client, interaction) => {
    await interaction.deferReply({ephemeral: false});

    const inviteEmbed = client
      .getBaseEmbed(interaction)
      .setAuthor({
        name: 'Minefort',
        iconURL: client.user?.displayAvatarURL(),
        url: 'https://github.com/Mullp/minefort-bot',
      })
      .setDescription(
        `${hyperlink(
          bold('Invite the bot to your server by clicking here.'),
          `https://discord.com/api/oauth2/authorize?client_id=${client.user?.id}&permissions=0&scope=bot%20applications.commands`
        )}\n\nInvite the bot to your server with the link above. The bot requires no permissions to function, but it does require the ability to register slash commands.\n\nIf the link above doesn't work for you, you can use this link instead: https://discord.com/api/oauth2/authorize?client_id=${
          client.user?.id
        }&permissions=0&scope=bot%20applications.commands`
      );

    const linkButton = new ButtonBuilder()
      .setLabel('Invite the bot')
      .setURL(
        `https://discord.com/api/oauth2/authorize?client_id=${client.user?.id}&permissions=0&scope=bot%20applications.commands`
      )
      .setStyle(ButtonStyle.Link);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(linkButton);

    await interaction.editReply({
      embeds: [inviteEmbed],
      components: [row],
    });
  },
});
