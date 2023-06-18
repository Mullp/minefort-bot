import {MinefortEvent} from '../MinefortEvent';
import {prisma} from '../../../client/prisma/PrismaClient';
import {EmbedBuilder, WebhookClient} from 'discord.js';
import {discordClient} from '../../../index';
import {PlayerUtils} from '../../../utils/PlayerUtils';

export default new MinefortEvent({
  enabled: true,
  event: 'serverPlayerJoin',
  once: false,
  execute: async (client, server, playerUuid) => {
    const minefortServer = await prisma.minefortServer.findUnique({
      where: {
        serverId: server.id,
      },
      include: {
        follows: true,
      },
    });

    const player = await PlayerUtils.getPlayerByUuid(playerUuid);

    if (!(minefortServer && player)) return;

    for (const follow of minefortServer.follows) {
      const webhookClient = new WebhookClient({url: follow.webhookUrl});

      const playerEmbed = new EmbedBuilder()
        .setColor('#80ed99')
        .setAuthor({
          name: player.name,
          iconURL: `https://mc-heads.net/avatar/${player.id}/64`,
        })
        .setTitle(`${player.name} has joined ${server.name}`)
        .setTimestamp()
        .setFooter({
          text: 'Minefort Utils',
        });

      await webhookClient
        .send({
          embeds: [playerEmbed],
          username: 'Minefort Utils',
          avatarURL: discordClient.user?.displayAvatarURL(),
        })
        .catch(async () => {
          await prisma.follow.delete({
            where: {
              id: follow.id,
            },
          });
        });
    }
  },
});
