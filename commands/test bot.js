const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('testbot')
		.setDescription('user information')
		.setDefaultMemberPermissions('0'),
	async execute(interaction) {
		await interaction.reply({ content: `bot is up`, ephemeral: true });
	}
};