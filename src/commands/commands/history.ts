import {Command} from '../Command';
import {
  ApplicationCommandOptionChoiceData,
  bold,
  hyperlink,
  SlashCommandBuilder,
  time,
  underscore,
} from 'discord.js';
import {PlayerModel} from '../../database/models/PlayerModel';
import {PlayerUtils} from '../../utils/PlayerUtils';
import {ServerHistory} from '../../database/models/ServerHistoryModel';
import {Server} from '../../database/models/ServerModel';
import {minefort} from '../../index';
import {HistoryManager} from '../../history/HistoryManager';
import {StringUtils} from '../../utils/StringUtils';

export default new Command({
  enabled: true,
  data: new SlashCommandBuilder()
    .setName('history')
    .setDescription('Get the history of a player')
    .addStringOption(option =>
      option
        .setName('player')
        .setDescription('The player you want to get the history of')
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addIntegerOption(option =>
      option
        .setName('amount')
        .setDescription('The amount of history entries you want to get')
        .setMinValue(1)
        .setMaxValue(50)
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('sort')
        .setDescription('The way you want to sort the history')
        .addChoices(
          {name: 'Date joined', value: 'date'},
          {name: 'Time played', value: 'time'}
        )
        .setRequired(false)
    ),
  execute: async (client, interaction) => {
    await interaction.deferReply({ephemeral: false});

    const playerArgument = interaction.options.getString('player', true);
    const amountArgument =
      interaction.options.getInteger('amount', false) || 10;
    const sortArgument = interaction.options.getString('sort', false) || 'date';

    const player = await PlayerUtils.getPlayerByName(playerArgument);
    if (!player) {
      await interaction.editReply({
        content: "Player doesn't exist",
      });
      return;
    }

    const databasePlayer = await PlayerModel.findOne({
      uuid: player.id,
    })
      .populate('history')
      .populate({path: 'history', populate: {path: 'server'}});
    if (!databasePlayer) {
      await interaction.editReply({
        content: 'Player not found',
      });
      return;
    }

    const databaseHistory = databasePlayer.history as (ServerHistory & {
      server: Server;
    })[];
    const joinedOnHistory = databaseHistory
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .filter(
        (value, index) =>
          index === 0 ||
          value.server.serverName !==
            databaseHistory[index - 1].server.serverName ||
          value.createdAt.getTime() -
            databaseHistory[index - 1].createdAt.getTime() >
            1000 * 60 * 6
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const leftOnHistory = databaseHistory
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .filter(
        (value, index) =>
          index === 0 ||
          value.server.serverName !==
            databaseHistory[index - 1].server.serverName ||
          databaseHistory[index - 1].createdAt.getTime() -
            value.createdAt.getTime() >
            1000 * 60 * 6
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const servers = await minefort.servers.getOnlineServers({limit: 500});
    HistoryManager.createHistory(servers);
    const currentlyPlaying = servers.find(
      server =>
        server.playerData.online && server.playerData.online.includes(player.id)
    );
    const timePlayed = leftOnHistory.map(
      (value, index) =>
        value.createdAt.getTime() - joinedOnHistory[index].createdAt.getTime()
    );

    const historyMerged = joinedOnHistory
      .map((value, index) => {
        return {
          serverName: value.server.serverName,
          joinedAt: value,
          timePlayed: timePlayed[index],
        };
      })
      .sort((a, b) => {
        if (sortArgument === 'date') {
          return (
            b.joinedAt.createdAt.getTime() - a.joinedAt.createdAt.getTime()
          );
        } else if (sortArgument === 'time') {
          return b.timePlayed - a.timePlayed;
        }

        return 0;
      });

    const historyEmbed = client
      .getBaseEmbed(interaction)
      .setAuthor({
        name: player.name,
        iconURL: `https://mc-heads.net/avatar/${player.id}/64`,
      })
      .setDescription(
        `History of ${hyperlink(
          player.name,
          `https://namemc.com/profile/${player.name}`,
          'Click to view on NameMC'
        )}\nIf the a server is ${bold(
          underscore('marked')
        )} it means that the player is currently playing on that server.`
      )
      .setFields([
        {
          name: 'Server',
          value: historyMerged
            .slice(0, amountArgument)
            .map((value, index) =>
              !(!!currentlyPlaying && index === 0)
                ? value.serverName
                : `${bold(underscore(value.serverName))}`
            )
            .join('\n'),
          inline: true,
        },
        {
          name: 'Joined',
          value: historyMerged
            .slice(0, amountArgument)
            .map(value => time(value.joinedAt.createdAt, 'R'))
            .join('\n'),
          inline: true,
        },
        {
          name: 'Time played',
          value: historyMerged
            .slice(0, amountArgument)
            .map(
              value =>
                StringUtils.formatUnixTime(value.timePlayed) ||
                'under 5 minutes'
            )
            .join('\n'),
          inline: true,
        },
      ]);

    await interaction.editReply({embeds: [historyEmbed]});
  },
  autocomplete: async (client, interaction) => {
    const playerArgument = interaction.options.getString('player', true);

    const players = Array.from(PlayerUtils.playerCache.values());
    const choices: ApplicationCommandOptionChoiceData[] = players.map(
      player => {
        return {name: player.player.name, value: player.player.name};
      }
    );

    const filtered = client.sortAutocompleteChoices(choices, playerArgument);
    await interaction.respond(filtered);
  },
});
