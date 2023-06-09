import {Command} from '../Command';
import {
  ApplicationCommandOptionChoiceData,
  chatInputApplicationCommandMention,
  hyperlink,
  SlashCommandBuilder,
  time,
} from 'discord.js';
import {PlayerUtils} from '../../utils/PlayerUtils';
import {minefortClient} from '../../index';
import {MinefortUtils} from '../../utils/MinefortUtils';
import {StringUtils} from '../../utils/StringUtils';
import {prisma} from '../../client/prisma/PrismaClient';
import {redis} from '../../client/redis/RedisClient';
import {Player} from '../../typings/PlayerTypings';

export default new Command({
  enabled: true,
  data: new SlashCommandBuilder()
    .setName('player')
    .setDescription('Get information about a player')
    .addStringOption(option =>
      option
        .setName('player')
        .setDescription('The player you want to get information about')
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

    const databaseHistory = databasePlayer.history.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );

    const servers = await minefortClient.getOnlineServers({limit: 500});

    const currentlyPlaying = servers.find(
      server =>
        server.playerData.online && server.playerData.online.includes(player.id)
    );

    const timePlayedPerServer =
      MinefortUtils.getTimePlayedPerServer(databaseHistory);

    const totalPlaytime = Array.from(timePlayedPerServer).reduce(
      (prev, current) => prev + current[1],
      0
    );

    const highestTimePlayedServer = Array.from(
      timePlayedPerServer.entries()
    ).reduce((prev, current) => (prev[1] > current[1] ? prev : current));

    const playerEmbed = client
      .getBaseEmbed(interaction)
      .setAuthor({
        name: player.name,
        iconURL: `https://mc-heads.net/avatar/${player.id}/64`,
      })
      .setDescription(
        `Use ${chatInputApplicationCommandMention(
          'history',
          '1116117866446602352'
        )} to see ${hyperlink(
          player.name,
          `https://namemc.com/profile/${player.id}`
        )}'s history`
      )
      .addFields([
        {
          name: 'Total playtime',
          value: StringUtils.formatUnixTime(totalPlaytime),
          inline: true,
        },
        {
          name: 'Most played server',
          value: `${
            highestTimePlayedServer[0]
          } with ${StringUtils.formatUnixTime(highestTimePlayedServer[1])}`,
          inline: true,
        },
        {
          name: currentlyPlaying ? 'Currently playing' : 'Last online',
          value: currentlyPlaying
            ? currentlyPlaying.name
            : time(databaseHistory[0].createdAt, 'R'),
          inline: true,
        },
      ]);

    await interaction.editReply({
      embeds: [playerEmbed],
    });
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
