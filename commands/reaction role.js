const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('roles-poll')
		.setDescription('put up a poll for people to select roles')
		.setDefaultMemberPermissions('0'),
	async execute(interaction) {
		
        const Embed = new EmbedBuilder()
            .setTitle('Choosing optional server roles')
            .setColor(0x0099FF)
            .addFields(
                { name: 'Available tutor', value: 'React with 🚸'},
                { name: 'Opportunity updates ping', value: 'React with 🔎'},
                { name: 'Club updates ping', value: 'React with ♣'});

        //post request to tutors
        interaction.guild.channels.fetch('1005275051383345204')
            .then(channel => channel.send({ embeds: [Embed] })
                .then(request => {
                    request.react('🚸')
                    request.react('🔎')
                    request.react('♣')
                })
            )

        await interaction.reply({ content: 'poll posted', ephemeral: true })

        
	}
};