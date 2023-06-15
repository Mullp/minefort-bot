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
import {prisma} from '../../client/prisma/PrismaClient';
import {redis} from '../../client/redis/RedisClient';
import {Player} from '../../typings/PlayerTypings';

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

    const servers = await minefort.getOnlineServers({limit: 500});
    HistoryManager.createHistory(servers);

    const databasePlayer = await prisma.player.findUnique({
      where: {
        uuid: player.id,
      },
      include: {
        history: {
          include: {
            server: true,
          },
        },
      },
    });
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

    const databaseHistory = databasePlayer.history.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
    const history = databaseHistory
      .filter(
        (value, index) =>
          index === 0 ||
          value.server.name !== databaseHistory[index - 1].server.name ||
          value.createdAt.getTime() -
            databaseHistory[index - 1].createdAt.getTime() >
            1000 * 60 * 6
      )
      .filter(history => history.server.name === server.name)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const joinedAtHistory =
      history[0]?.createdAt ?? Math.round(new Date().getTime() / 1000);

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
        '1116117866446602355'
      )} to get more information about the server`
    );

    await interaction.editReply({embeds: [findEmbed]});
  },
  autocomplete: async (client, interaction) => {
    const playerArgument = interaction.options.getString('player', true);

    const players = await redis.keys('player:uuid:*').then(keys =>
      Promise.all(
        keys.map(key =>
          redis.get(key).then(player => {
            return {
              key,
              player: player !== null ? (JSON.parse(player) as Player) : null,
            };
          })
        )
      )
    );
    const choices: ApplicationCommandOptionChoiceData[] = players
      .filter(player => player.player !== null)
      .map(player => {
        return {name: player.player!.name, value: player.player!.name};
      });

    const filtered = client.sortAutocompleteChoices(choices, playerArgument);
    await interaction.respond(filtered);
  },
});
