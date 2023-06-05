import {Command} from '../Command';
import {
  ApplicationCommandOptionChoiceData,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';
import {minefort} from '../../index';

export default new Command({
  enabled: true,
  data: new SlashCommandBuilder()
    .setName('server')
    .setDescription('Get information about a server')
    .addStringOption(option =>
      option
        .setName('server')
        .setDescription('The server you want to get information about')
        .setRequired(true)
        .setAutocomplete(true)
    ),
  execute: async (client, interaction) => {
    await interaction.deferReply({ephemeral: true});

    const serverId = interaction.options.getString('server', true);
    const server = await minefort.servers.getOnlineServer(serverId, {
      byName: false,
    });

    if (!server) {
      await interaction.editReply({
        content: 'Server not found',
      });
      return;
    }

    const serverEmbed = new EmbedBuilder().setTimestamp().setFooter({
      text: `Requested by ${interaction.user.tag}`,
      iconURL:
        interaction.user.avatarURL({size: 64}) ??
        interaction.user.displayAvatarURL({size: 64}),
    });

    await interaction.editReply({
      embeds: [serverEmbed],
    });
  },
  autocomplete: async (client, interaction) => {
    const serverName = interaction.options.getString('server', true);

    const servers = await minefort.servers.getOnlineServers();
    const choices: ApplicationCommandOptionChoiceData[] = servers.map(
      server => {
        return {name: server.name, value: server.id};
      }
    );

    const filtered = client.sortAutocompleteChoices(choices, serverName);
    await interaction.respond(filtered);
  },
});
