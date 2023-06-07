import {Command} from '../Command';
import {
  ApplicationCommandOptionChoiceData,
  hyperlink,
  SlashCommandBuilder,
  time,
} from 'discord.js';
import {PlayerModel} from '../../database/models/PlayerModel';
import {PlayerUtils} from '../../utils/PlayerUtils';
import {ServerHistory} from '../../database/models/ServerHistoryModel';
import {Server} from '../../database/models/ServerModel';
import {minefort} from '../../index';
import {HistoryManager} from '../../history/HistoryManager';

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
    ),
  execute: async (client, interaction) => {
    await interaction.deferReply({ephemeral: false});

    const playerArgument = interaction.options.getString('player', true);
    const amountArgument =
      interaction.options.getInteger('amount', false) || 10;

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
    const history = databaseHistory
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
    const sortedHistory = databaseHistory
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

    // console.log(
    //   databaseHistory
    //     .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    //     .filter(
    //       (value, index) =>
    //         index === 0 ||
    //         value.createdAt.getTime() -
    //           databaseHistory[index - 1].createdAt.getTime() >
    //           1000 * 60 * 6
    //     )
    // );

    const servers = await minefort.servers.getOnlineServers({limit: 500});
    HistoryManager.createHistory(servers);
    const currentlyPlaying = !!servers.find(
      server =>
        server.playerData.online && server.playerData.online.includes(player.id)
    );

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
        )}`
      )
      .setFields([
        {
          name: 'Server',
          value: sortedHistory
            .slice(0, amountArgument)
            .map(value => value.server.serverName)
            .join('\n'),
          inline: true,
        },
        {
          name: 'Joined',
          value: sortedHistory
            .slice(0, amountArgument)
            .map(value => time(value.createdAt, 'R'))
            .join('\n'),
          inline: true,
        },
        {
          name: 'Left',
          value: history
            .slice(0, amountArgument)
            .map((value, index) =>
              !(currentlyPlaying && index === 0)
                ? time(value.createdAt, 'R')
                : 'Currently playing'
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
