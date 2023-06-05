import {Command} from '../Command';
import {
  ApplicationCommandOptionChoiceData,
  bold,
  chatInputApplicationCommandMention,
  codeBlock,
  EmbedBuilder,
  hyperlink,
  inlineCode,
  SlashCommandBuilder,
  underscore,
} from 'discord.js';
import {minefort} from '../../index';
import {MinefortUtils} from '../../utils/MinefortUtils';

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
    const servers = await minefort.servers.getOnlineServers({limit: 500});
    const server = servers.find(server => server.id === serverId);

    if (!server) {
      await interaction.editReply({
        content: 'Server not found',
      });
      return;
    }

    const estimatedServerPlan = MinefortUtils.getServerPlanSpecifics(
      MinefortUtils.getEstimatedPlan(server.playerData.maxPlayers)
    );

    const serverEmbed = new EmbedBuilder()
      .setColor('#2cd3e1')
      .setAuthor({
        name: server.name,
        iconURL: server.icon.image,
      })
      .setDescription(
        `${server.name}.minefort.com\n` +
          codeBlock('ansi', MinefortUtils.convertColorsToAnsi(server.motd))
      )
      .addFields([
        {
          name: 'Server ID',
          value: `${inlineCode(server.id)}`,
          inline: true,
        },
        {
          name: 'Software',
          value: `${MinefortUtils.getServerSoftware(server.version)}`,
          inline: true,
        },
        {
          name: 'Version',
          value: `${MinefortUtils.getServerVersion(server.version)}`,
          inline: true,
        },
        {
          name: 'Owner',
          value: `Owner ID: ${inlineCode(
            MinefortUtils.getMinefortIdFromAuth0Id(server.ownerId)
          )}\nTwo factor: ${
            MinefortUtils.hasTwoFactorEnabled(server.ownerId) ? 'on' : 'off'
          }\n\nUse ${chatInputApplicationCommandMention(
            'servers',
            'user',
            ''
          )} to see\nservers owned by this user`,
          inline: true,
        },
        {
          name: 'Estimated plan',
          value: `Plan: ${underscore(
            estimatedServerPlan.name
          )}\nPrice: ${underscore(
            `$${estimatedServerPlan.price}⸍ᵐᵒ`
          )}\nRAM: ${underscore(
            `${estimatedServerPlan.ram * 1024} MB`
          )}\nStorage: ${underscore(
            `${estimatedServerPlan.storage} GB`
          )}\nMax players: ${underscore(
            estimatedServerPlan.maxPlayerCount.toString()
          )}\nBackup slots: ${underscore(
            estimatedServerPlan.backupSlots.toString()
          )}`,
          inline: true,
        },
        {
          name: 'Current rank',
          value: `${MinefortUtils.getServerRankWindow(servers, server)
            .map(
              value =>
                `${inlineCode(
                  `#${servers.findIndex(value1 => value.id === value1.id) + 1}`
                )}: ${
                  value.name === server.name
                    ? bold(underscore(value.name))
                    : value.name
                }`
            )
            .join('\n')}`,
          inline: true,
        },
      ])
      .setTimestamp()
      .setFooter({
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
