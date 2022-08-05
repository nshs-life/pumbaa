const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('clear')
		.setDescription('clear messages')
		.addIntegerOption(option => option.setName('int').setDescription('clear ammount'))
		.setDefaultMemberPermissions('0'),
	async execute(interaction) {
		const integer = interaction.options.getInteger('int')
		if (!integer) return interaction.reply({ content: 'please enter a clear amount', ephemeral: true });
		if (integer > 100) return interaction.reply({ content: "You can't delete more than 100 messages", ephemeral: true })

		await interaction.channel.messages.fetch({ limit: integer })
			.then(messages => {
				interaction.channel.bulkDelete(messages);
			});

		await interaction.reply({ content: 'cleared', ephemeral: true })
	}
};