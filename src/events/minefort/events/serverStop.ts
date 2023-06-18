import {MinefortEvent} from '../MinefortEvent';
import {prisma} from '../../../client/prisma/PrismaClient';
import {EmbedBuilder, WebhookClient} from 'discord.js';
import {discordClient} from '../../../index';

export default new MinefortEvent({
  enabled: true,
  event: 'serverStop',
  once: false,
  execute: async (client, server) => {
    const minefortServer = await prisma.minefortServer.findUnique({
      where: {
        serverId: server.id,
      },
      include: {
        follows: true,
      },
    });

    if (!minefortServer) return;

    for (const follow of minefortServer.follows) {
      const webhookClient = new WebhookClient({url: follow.webhookUrl});

      const startedEmbed = new EmbedBuilder()
        .setColor('#d62828')
        .setAuthor({
          name: server.name,
          iconURL:
            server?.icon.image ??
            'https://cdn.minefort.com/img/item_icons/WHITE_WOOL.png',
        })
        .setTitle(`${server.name} has stopped`)
        .setTimestamp()
        .setFooter({
          text: 'Minefort Utils',
        });

      await webhookClient
        .send({
          embeds: [startedEmbed],
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
