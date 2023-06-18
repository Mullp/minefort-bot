import {MinefortEvent} from '../MinefortEvent';
import {prisma} from '../../../client/prisma/PrismaClient';
import {EmbedBuilder, underscore, WebhookClient} from 'discord.js';
import {discordClient} from '../../../index';
import {MinefortUtils} from '../../../utils/MinefortUtils';

export default new MinefortEvent({
  enabled: true,
  event: 'serverStart',
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
        .setColor('#ff03a7')
        .setAuthor({
          name: server.name,
          iconURL:
            server?.icon.image ??
            'https://cdn.minefort.com/img/item_icons/WHITE_WOOL.png',
        })
        .setTitle(`🟢   ${server.name} has started`)
        .setDescription(
          `IP: ${underscore(
            `${server.name}.minefort.com`
          )}\nSoftware: ${MinefortUtils.getServerSoftware(
            server.version
          )}\nVersion: ${MinefortUtils.getServerVersion(server.version)}`
        )
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
          console.log(`Deleting follow ${follow.id}`);
          await prisma.follow.delete({
            where: {
              id: follow.id,
            },
          });
        });
    }
  },
});
