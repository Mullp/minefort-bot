import {Command} from '../Command';
import {
  ApplicationCommandOptionChoiceData,
  bold,
  chatInputApplicationCommandMention,
  hyperlink,
  SlashCommandBuilder,
  time,
  underscore,
} from 'discord.js';
import {minefort} from '../../index';
import {PlayerUtils} from '../../utils/PlayerUtils';
import {HistoryManager} from '../../history/HistoryManager';
import {PlayerModel} from '../../database/models/PlayerModel';
import {ServerHistory} from '../../database/models/ServerHistoryModel';
import {Server} from '../../database/models/ServerModel';

export default new Command({
  enabled: true,
  data: new SlashCommandBuilder()
    .setName('find')
    .setDescription('Find a player')
    .addStringOption(option =>
      option
        .setName('player')
        .setDescription('The player you want to find')
        .setRequired(true)
        .setAutocomplete(true)
    ),
  execute: async (client, interaction) => {
    await interaction.deferReply({ephemeral: false});

    const playerArgument = interaction.options.getString('player', true);

    const player = await PlayerUtils.getPlayerByName(playerArgument);

    if (!player) {
      await interaction.editReply({
        content: "Player doesn't exist",
      });
      return;
    }

    const servers = await minefort.servers.getOnlineServers({limit: 500});
    HistoryManager.createHistory(servers);

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

    const server = servers.find(server => {
      if (!server.playerData.online) return false;
      return server.playerData.online.includes(player.id);
    });

    const findEmbed = client.getBaseEmbed(interaction).setAuthor({
      name: player.name,
      iconURL: `https://mc-heads.net/avatar/${player.id}/64`,
    });
    if (!server) {
      findEmbed.setDescription('Player is not online');
      await interaction.editReply({embeds: [findEmbed]});
      return;
    }

    const databaseHistory = databasePlayer.history as (ServerHistory & {
      server: Server;
    })[];
    const history = databaseHistory
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .filter(
        (history, index) =>
          index === 0 ||
          history.server.serverName !==
            databaseHistory[index - 1].server.serverName
      )
      .filter(history => history.server.serverName === server.name)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const joinedAtHistory = history[0].createdAt;

    findEmbed.setDescription(
      `${hyperlink(
        player.name,
        `https://namemc.com/${player.name}`
      )} is currently on ${bold(underscore(server.name))}${
        joinedAtHistory
          ? `\nJoined the server ${time(joinedAtHistory, 'R')}`
          : ''
      }\n\n${chatInputApplicationCommandMention(
        'server',
        ''
      )} to get more information about the server`
    );

    await interaction.editReply({embeds: [findEmbed]});
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
