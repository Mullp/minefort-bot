import {Command} from '../Command';
import {
  ApplicationCommandOptionChoiceData,
  bold,
  chatInputApplicationCommandMention,
  codeBlock,
  EmbedBuilder,
  escapeMarkdown,
  hyperlink,
  inlineCode,
  SlashCommandBuilder,
  time,
  underscore,
} from 'discord.js';
import {minefort} from '../../index';
import {MinefortUtils} from '../../utils/MinefortUtils';
import {PlayerUtils} from '../../utils/PlayerUtils';
import {HistoryManager} from '../../history/HistoryManager';
import {Server, ServerModel} from '../../database/models/ServerModel';
import {ServerHistory} from '../../database/models/ServerHistoryModel';

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
    await interaction.deferReply({ephemeral: false});

    const serverId = interaction.options
      .getString('server', true)
      .toLowerCase();
    const servers = await minefort.servers.getOnlineServers({limit: 500});
    HistoryManager.createHistory(servers);
    const server = servers.find(
      server =>
        server.id.toLowerCase() === serverId ||
        server.name.toLowerCase() === serverId
    );
    const databaseServer = await ServerModel.findOne({
      serverId: server?.id ?? serverId,
    }).populate('serverHistory');

    if (!(server && databaseServer)) {
      await interaction.editReply({
        content: 'Server not found',
      });
      return;
    }

    const serverHistory = databaseServer.serverHistory as ServerHistory[];
    const sortedServerHistory = serverHistory
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .filter(
        (history, index) =>
          index === 0 ||
          history.createdAt.getTime() -
            serverHistory[index - 1].createdAt.getTime() >
            1000 * 60 * 6
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const estimatedServerPlan = MinefortUtils.getServerPlanSpecifics(
      MinefortUtils.getEstimatedPlan(server.playerData.maxPlayers)
    );

    const playersFormatted = new Intl.ListFormat('en-us', {
      style: 'long',
    })
      .format(
        (
          await Promise.all(
            (server.playerData.online ?? []).map(uuid =>
              PlayerUtils.getPlayerByUuid(uuid).then(player => player?.name)
            )
          )
        )
          .filter((name): name is string => !!name)
          .map(name => hyperlink(name, `https://namemc.com/${name}`))
      )
      .substring(0, 1024);

    const serverEmbed = new EmbedBuilder()
      .setColor('#ff03a7')
      .setAuthor({
        name: server.name,
        iconURL: server.icon.image,
      })
      .setDescription(
        `${underscore(`${server.name}.minefort.com`)}\n` +
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
          name: 'Estimated startup',
          value: time(sortedServerHistory[0].createdAt, 'R') || 'Unknown',
          inline: true,
        },
        {
          name: '\u200b',
          value: '\u200b',
          inline: true,
        },
        {
          name: '\u200b',
          value: '\u200b',
          inline: true,
        },
        {
          name: 'Owner',
          value: `Owner ID: ${inlineCode(
            MinefortUtils.getMinefortIdFromAuth0Id(server.ownerId)
          )}\nTwo factor: ${
            MinefortUtils.hasTwoFactorEnabled(server.ownerId) ? 'on' : 'off'
          }`,
          // \n\nUse ${chatInputApplicationCommandMention(
          //   'servers',
          //   'user',
          //   ''
          // )} to see servers owned by this user
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
        {
          name: `Players: ${server.playerData.playerCount}/${server.playerData.maxPlayers} (Only Java players)`,
          value: playersFormatted || 'No players online',
          inline: false,
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
    const serverArgument = interaction.options.getString('server', true);

    const servers = await minefort.servers.getOnlineServers();
    HistoryManager.createHistory(servers);
    const choices: ApplicationCommandOptionChoiceData[] = servers.map(
      server => {
        return {name: server.name, value: server.id};
      }
    );

    const filtered = client.sortAutocompleteChoices(choices, serverArgument);
    await interaction.respond(filtered);
  },
});
