const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('serverinfo')
		.setDescription('Replies with server info')
		.setDefaultMemberPermissions('0'),
	async execute(interaction) {
		await interaction.reply({ content: `Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`, ephemeral: true })
	}
};