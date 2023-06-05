import {Event} from '../Event';

export default new Event({
  enabled: true,
  event: 'interactionCreate',
  once: false,
  execute: async (client, interaction) => {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(client, interaction);
      } catch (error) {
        console.error(error);
        await interaction
          .reply({
            content: 'There was an error',
            ephemeral: true,
          })
          .catch(console.error);
      }
    } else if (interaction.isAutocomplete()) {
      const command = client.commands.get(interaction.commandName);
      if (!command || !command.autocomplete) return;

      try {
        await command.autocomplete(client, interaction);
      } catch (error) {
        console.error(error);
      }
    } else if (interaction.isModalSubmit()) {
      const modal = client.modals.get(interaction.customId);
      if (!modal) return;

      try {
        await modal.execute(client, interaction);
      } catch (error) {
        console.error(error);
        await interaction
          .reply({
            content: 'There was an error',
            ephemeral: true,
          })
          .catch(console.error);
      }
    }
  },
});
