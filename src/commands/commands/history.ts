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
    const timePlayed = history.map((value, index) => {
      const unixTime =
        (value.createdAt.getTime() - sortedHistory[index].createdAt.getTime()) /
        1000;

      const seconds = unixTime;
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      return {
        seconds: seconds,
        minutes: minutes,
        hours: hours,
        days: days,
      };
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
          value: sortedHistory
            .slice(0, amountArgument)
            .map((value, index) =>
              !(currentlyPlaying && index === 0)
                ? value.server.serverName
                : `${bold(underscore(value.server.serverName))}`
            )
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
        // {
        //   name: 'Left',
        //   value: history
        //     .slice(0, amountArgument)
        //     .map((value, index) =>
        //       !(currentlyPlaying && index === 0)
        //         ? time(value.createdAt, 'R')
        //         : 'Currently playing'
        //     )
        //     .join('\n'),
        //   inline: true,
        // },
        {
          name: 'Time played',
          value: timePlayed
            .slice(0, amountArgument)
            .map(
              (value, index) =>
                new Intl.ListFormat('en-us').format(
                  [
                    value.days > 0
                      ? `${value.days} day${value.days !== 1 ? 's' : ''}`
                      : '',
                    Math.round(value.hours % 24) > 0
                      ? `${Math.round(value.hours % 24)} hour${
                          value.hours % 24 !== 1 ? 's' : ''
                        }`
                      : '',
                    Math.round(value.minutes % 60) > 0
                      ? `${Math.round(value.minutes % 60)} minute${
                          value.minutes % 60 !== 1 ? 's' : ''
                        }`
                      : '',
                    Math.round(value.seconds % 60) > 0
                      ? `${Math.round(value.seconds % 60)} second${
                          value.seconds % 60 !== 1 ? 's' : ''
                        }`
                      : '',
                  ].filter(value => value !== '')
                ) || 'under 5 minutes'
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
