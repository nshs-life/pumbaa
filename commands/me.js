const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('me')
		.setDescription('Replies with user info'),
	async execute(interaction) {
		await interaction.reply(`Your username: ${interaction.user.tag.split(/#/)[0]}\nYour id: ${interaction.user.id}`);
	}
};