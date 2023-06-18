import {Command} from '../Command';
import {
  chatInputApplicationCommandMention,
  inlineCode,
  parseWebhookURL,
  SlashCommandBuilder,
  time,
} from 'discord.js';
import {prisma} from '../../client/prisma/PrismaClient';

export default new Command({
  enabled: true,
  data: new SlashCommandBuilder()
    .setName('follow')
    .setDescription(
      'Follow a server, and get notifications about certain events through a webhook'
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription(
          'Follow a server, and get notifications about certain events through a webhook'
        )
        .addStringOption(option =>
          option
            .setName('server')
            .setDescription('The server to follow')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('webhook')
            .setDescription('The URL of the webhook to send notifications to')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Remove a server from your followed servers')
        .addStringOption(option =>
          option
            .setName('server')
            .setDescription('The server to remove')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('List all servers you are following')
    ),
  execute: async (client, interaction) => {
    await interaction.deferReply({ephemeral: true});

    const subcommand = interaction.options.getSubcommand(true);

    if (subcommand === 'add') {
      const serverArgument = interaction.options.getString('server', true);
      const webhookArgument = interaction.options.getString('webhook', true);

      const databaseServer =
        (await prisma.minefortServer.findUnique({
          where: {
            serverId: serverArgument,
          },
        })) ??
        (await prisma.minefortServer.findFirst({
          where: {
            name: serverArgument,
          },
        }));

      if (!databaseServer) {
        const notFoundEmbed = client
          .getBaseEmbed(interaction)
          .setTitle('Server not found')
          .setDescription(
            `Could not find a server with the ID or name: ${inlineCode(
              serverArgument
            )}.`
          );

        await interaction.editReply({
          embeds: [notFoundEmbed],
        });
        return;
      }

      const alreadyFollowing = await prisma.follow.findFirst({
        where: {
          minefortServer: {
            serverId: databaseServer.serverId,
          },
          discordUser: {
            discordId: interaction.user.id,
          },
        },
      });

      if (alreadyFollowing) {
        const alreadyFollowingEmbed = client
          .getBaseEmbed(interaction)
          .setTitle('Already following')
          .setDescription(
            `You are already following the server ${inlineCode(
              databaseServer.name ?? 'Unknown'
            )}.\nYou can remove the server from your followed servers with the command ${chatInputApplicationCommandMention(
              'follow',
              'remove',
              '1120062748735328276'
            )}.`
          );

        await interaction.editReply({
          embeds: [alreadyFollowingEmbed],
        });
        return;
      }

      const parsedWebhookUrl = parseWebhookURL(webhookArgument);
      const webhook = await client
        .fetchWebhook(parsedWebhookUrl?.id ?? '', parsedWebhookUrl?.token ?? '')
        .catch(() => null);

      if (!webhook) {
        const notFoundEmbed = client
          .getBaseEmbed(interaction)
          .setTitle('Webhook not found')
          .setDescription(
            `Could not find a webhook with the URL ${inlineCode(
              webhookArgument
            )}. Make sure the URL is correct.`
          );

        await interaction.editReply({
          embeds: [notFoundEmbed],
        });
        return;
      }

      await prisma.follow.create({
        data: {
          webhookUrl: webhookArgument,
          minefortServer: {
            connect: {
              serverId: databaseServer.serverId,
            },
          },
          discordUser: {
            connectOrCreate: {
              where: {
                discordId: interaction.user.id,
              },
              create: {
                discordId: interaction.user.id,
              },
            },
          },
        },
      });

      const successEmbed = client
        .getBaseEmbed(interaction)
        .setTitle('Followed server')
        .setDescription(
          `Successfully followed the server ${inlineCode(
            databaseServer.name ?? 'Unknown'
          )}.\nYou will now receive notifications through the webhook.`
        );

      await interaction.editReply({
        embeds: [successEmbed],
      });
    } else if (subcommand === 'remove') {
      const serverArgument = interaction.options.getString('server', true);

      const databaseDiscordUser = await prisma.discordUser.findUnique({
        where: {
          discordId: interaction.user.id,
        },
        include: {
          follows: {
            include: {
              minefortServer: true,
            },
          },
        },
      });

      if (!databaseDiscordUser) {
        const notFollowingEmbed = client
          .getBaseEmbed(interaction)
          .setTitle('Not following any servers')
          .setDescription(
            `You are not following any servers.\nTo follow a server, use the ${chatInputApplicationCommandMention(
              'follow',
              'add',
              '1120062748735328276'
            )} command.`
          );

        await interaction.editReply({
          embeds: [notFollowingEmbed],
        });
        return;
      }

      const unfollowFollow = databaseDiscordUser.follows.find(
        follow =>
          follow.minefortServer.serverId === serverArgument ||
          follow.minefortServer.name === serverArgument
      );
      if (!unfollowFollow) {
        const notFollowingEmbed = client
          .getBaseEmbed(interaction)
          .setTitle('Not following server')
          .setDescription(
            `You are not following the server ${inlineCode(
              serverArgument
            )}.\nTo follow a server, use the ${chatInputApplicationCommandMention(
              'follow',
              'add',
              '1120062748735328276'
            )} command.`
          );

        await interaction.editReply({
          embeds: [notFollowingEmbed],
        });
        return;
      }

      await prisma.follow.deleteMany({
        where: {
          minefortServer: {
            serverId: unfollowFollow.minefortServer.serverId,
          },
          discordUser: {
            discordId: interaction.user.id,
          },
        },
      });

      const successEmbed = client
        .getBaseEmbed(interaction)
        .setTitle('Unfollowed server')
        .setDescription(
          `Successfully unfollowed the server ${inlineCode(
            unfollowFollow.minefortServer.name ?? 'Unknown'
          )}.\nYou will no longer receive notifications through the webhook.`
        );

      await interaction.editReply({
        embeds: [successEmbed],
      });
    } else if (subcommand === 'list') {
      const databaseDiscordUser = await prisma.discordUser.findUnique({
        where: {
          discordId: interaction.user.id,
        },
        include: {
          follows: {
            include: {
              minefortServer: true,
            },
          },
        },
      });

      if (!databaseDiscordUser || databaseDiscordUser.follows.length === 0) {
        const notFollowingEmbed = client
          .getBaseEmbed(interaction)
          .setTitle('Not following any servers')
          .setDescription(
            `You are not following any servers.\nTo follow a server, use the ${chatInputApplicationCommandMention(
              'follow',
              'add',
              '1120062748735328276'
            )} command.`
          );

        await interaction.editReply({
          embeds: [notFollowingEmbed],
        });
        return;
      }

      const followingEmbed = client
        .getBaseEmbed(interaction)
        .setTitle('Following servers')
        .setDescription(
          `You are currently following ${databaseDiscordUser.follows.length} servers.`
        )
        .addFields([
          {
            name: 'Server',
            value: databaseDiscordUser.follows
              .map(follow =>
                inlineCode(follow.minefortServer.name ?? 'Unknown')
              )
              .join('\n'),
            inline: true,
          },
          {
            name: 'Webhook ID',
            value: databaseDiscordUser.follows
              .map(follow =>
                inlineCode(parseWebhookURL(follow.webhookUrl)?.id ?? '')
              )
              .join('\n'),
            inline: true,
          },
          {
            name: 'Created',
            value: databaseDiscordUser.follows
              .map(follow => time(follow.createdAt, 'R'))
              .join('\n'),
            inline: true,
          },
        ]);

      await interaction.editReply({
        embeds: [followingEmbed],
      });
    }
  },
});
