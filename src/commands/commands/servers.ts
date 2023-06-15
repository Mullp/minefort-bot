import {Command} from '../Command';
import {
  chatInputApplicationCommandMention,
  inlineCode,
  SlashCommandBuilder,
  time,
} from 'discord.js';
import {prisma} from '../../client/prisma/PrismaClient';

export default new Command({
  enabled: true,
  data: new SlashCommandBuilder()
    .setName('servers')
    .setDescription('Get a list of servers owned by a user')
    .addStringOption(option =>
      option
        .setName('user')
        .setDescription('The ID of user you want to get information about')
        .setRequired(true)
    ),
  execute: async (client, interaction) => {
    await interaction.deferReply({ephemeral: false});

    const userArgument = interaction.options.getString('user', true);

    const user = await prisma.minefortUser.findUnique({
      where: {
        minefortId: userArgument,
      },
      include: {
        servers: true,
      },
    });
    if (!user) {
      await interaction.editReply({
        content: `User ${inlineCode(userArgument)} does not exist`,
      });
      return;
    }

    const serversEmbed = client
      .getBaseEmbed(interaction)
      .setTitle(`Servers owned by ${inlineCode(userArgument)}`)
      .addFields([
        {
          name: 'Name',
          value: user.servers
            .map(server => inlineCode(server?.name ?? 'Unknown'))
            .join('\n'),
          inline: true,
        },
        {
          name: 'ID',
          value: user.servers
            .map(server => inlineCode(server?.serverId ?? 'Unknown'))
            .join('\n'),
          inline: true,
        },
        {
          name: 'Created',
          value: user.servers.map(server => time(server?.createdAt)).join('\n'),
          inline: true,
        },
        {
          name: 'Info',
          value: `Use ${chatInputApplicationCommandMention(
            'server',
            '1116117866446602355'
          )} to get more information about a server.`,
        },
      ]);

    await interaction.editReply({embeds: [serversEmbed]});
  },
});
