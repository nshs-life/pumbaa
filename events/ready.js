const { ActivityType, EmbedBuilder } = require('discord.js');
module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(`nshs.life.bot logged in as ${client.user.tag}`);

		client.user.setActivity('Hakuna Matata', { type: ActivityType.Listening });

		const roleEmbed = new EmbedBuilder()
			.setTitle('Choosing optional server roles')
			.setColor(0x0099FF)
			.addFields(
				{ name: 'Developer', value: 'React with 👩‍💻' },
				{ name: 'Available tutor', value: 'React with 🚸' },
				{ name: 'Opportunity updates ping', value: 'React with 🔎' },
				{ name: 'Club updates ping', value: 'React with ♣' },
				{ name: 'She/Her', value: 'React with 💛' },
				{ name: 'They/Them', value: 'React with 💗' },
				{ name: 'He/Him', value: 'React with 💚' });

		let roleChannel = client.channels.cache.get('1005275051383345204')

		roleChannel.messages.fetch()
			.then(msgs => {
				if (msgs.size < 1) {
					//post request to tutors
					roleChannel.send({ embeds: [roleEmbed] })
						.then(request => {
							request.react('👩‍💻')
							request.react('🚸')
							request.react('🔎')
							request.react('♣')
						})
				}
			})

		const aboutEmbed = new EmbedBuilder()
			.setTitle('Our mission')
			.setDescription('[mission.nshs.life](https://docs.google.com/document/u/5/d/e/2PACX-1vToUA9QApqWmo_k5YGaouh1-FexC5tqLzUIZv6fJZGneyBZwM_ImYNDzraq3mT5FzQVS_EGC7Kdk_Oj/pub)')
			.setColor(0x0099FF);

		let aboutChannel = client.channels.cache.get('1004509828879757393')

		aboutChannel.messages.fetch()
			.then(msgs => {
				if (msgs.size < 1) {
					//post request to tutors
					aboutChannel.send({ embeds: [aboutEmbed] })
				}
			})
	},
};
