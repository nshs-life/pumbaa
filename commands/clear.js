const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('clear')
		.setDescription('clear messages')
		.addIntegerOption(option => option.setName('int').setDescription('clear ammount'))
		.setDefaultMemberPermissions('0'),
	async execute(interaction) {
		const integer = interaction.options.getInteger('int')
		if (!integer) return interaction.reply('please enter a clear amount');
		if (integer > 100) return interaction.reply("You can't delete more than 100 messages")

		await interaction.channel.messages.fetch({ limit: integer })
			.then(messages => {
				interaction.channel.bulkDelete(messages);
			});
		
		await interaction.reply({ content: 'cleared', ephemeral: true })
	}
};