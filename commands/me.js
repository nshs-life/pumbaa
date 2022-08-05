const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('me')
		.setDescription('user information'),
	async execute(interaction) {
		await interaction.reply({ content: `Your username: ${interaction.user.tag.split(/#/)[0]}\nYour id: ${interaction.user.id}`, ephemeral: true });
	}
};