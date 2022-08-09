const { EmbedBuilder } = require('discord.js');
module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(`nshs.life.bot logged in as ${client.user.tag}`);

		const Embed = new EmbedBuilder()
			.setTitle('Choosing optional server roles')
			.setColor(0x0099FF)
			.addFields(
				{ name: 'Developer', value: 'React with 👩‍💻' },
				{ name: 'Available tutor', value: 'React with 🚸' },
				{ name: 'Opportunity updates ping', value: 'React with 🔎' },
				{ name: 'Club updates ping', value: 'React with ♣' });

		let roleChannel = client.channels.cache.get('1005275051383345204')

		roleChannel.messages.fetch()
			.then(msgs => {
				if (msgs.size < 1) {
					//post request to tutors
					roleChannel.send({ embeds: [Embed] })
						.then(request => {
							request.react('👩‍💻')
							request.react('🚸')
							request.react('🔎')
							request.react('♣')
						})
				}
			})

	},
};