import {Command} from '../Command';
import {inlineCode, SlashCommandBuilder} from 'discord.js';
import {readFileSync} from 'fs';
import {minefortClient} from '../../index';

const words = readFileSync('./assets/words.txt', 'utf-8').split('\n');

export default new Command({
  enabled: true,
  data: new SlashCommandBuilder()
    .setName('names')
    .setDescription('Generate a list of available server names')
    .addIntegerOption(option =>
      option
        .setName('amount')
        .setDescription('The amount of names you want to generate')
        .setMinValue(1)
        .setMaxValue(20)
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('regex')
        .setDescription('The RegEx you want to use to filter the names')
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option
        .setName('length')
        .setDescription('The length of the names you want to generate')
        .setMinValue(4)
        .setMaxValue(24)
        .setRequired(false)
    ),
  execute: async (client, interaction) => {
    await interaction.deferReply({ephemeral: false});

    const amount = interaction.options.getInteger('amount', false) || 10;
    const length = interaction.options.getInteger('length', false);
    const regex = interaction.options.getString('regex', false);

    let names = words;
    if (length) {
      names = names.filter(name => name.length === length);
    }
    if (regex) {
      const regExp = new RegExp(regex);
      names = names.filter(name => regExp.test(name));
    }

    const checkedNames: string[] = [];
    const availableNames = (
      await Promise.all(
        [...Array(amount)].map(async () => {
          for (let i = 0; i < 100; i++) {
            if (names.length <= checkedNames.length) {
              break;
            }

            const randomWord = names[Math.floor(Math.random() * names.length)];

            if (checkedNames.includes(randomWord)) {
              continue;
            }
            checkedNames.push(randomWord);

            if (await minefortClient.servers.isNameAvailable(randomWord)) {
              return randomWord;
            }
          }
          return;
        })
      )
    ).filter((name): name is string => !!name);

    const chunks = [...Array(Math.ceil(availableNames.length / 10))].map(
      (_, i) => availableNames.slice(i * 10, i * 10 + 10)
    );

    const namesEmbed = client
      .getBaseEmbed(interaction)
      .setTitle(`${availableNames.length} available names`);

    chunks.forEach(chunk => {
      namesEmbed.addFields({
        name: '\u200b',
        value: chunk.map(value => inlineCode(value ?? '')).join('\n'),
        inline: true,
      });
    });

    await interaction.editReply({
      embeds: [namesEmbed],
    });
  },
});
