const { ActivityType, EmbedBuilder } = require('discord.js');
const CronJob = require('cron').CronJob;

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
							request.react('💛')
							request.react('💗')
							request.react('💚')
						})
				}
			})

		const aboutEmbed = new EmbedBuilder()
			.setTitle('nshs.life')
			.setColor(0xe74c3c)
			.addFields(
				{ name: 'Our Mission', value: '[mission.nshs.life](https://docs.google.com/document/u/5/d/e/2PACX-1vToUA9QApqWmo_k5YGaouh1-FexC5tqLzUIZv6fJZGneyBZwM_ImYNDzraq3mT5FzQVS_EGC7Kdk_Oj/pub)' },
				{ name: 'Our Rules', value: '[rules.nshs.life](https://docs.google.com/document/u/5/d/e/2PACX-1vSJ1NB4b7RmcOWPEiDMXVQtug1nHvnzwaSjTvEBq_keDMVgDrut2aZxN6uGD8ccL8xMnvWFXIS8PT09/pub)' });

		let aboutChannel = client.channels.cache.get('1004509828879757393')

		aboutChannel.messages.fetch()
			.then(msgs => {
				if (msgs.size < 1) {
					//post request to tutors
					aboutChannel.send({ embeds: [aboutEmbed] })
				}
			})
		
		//send message at 9am, 3pm, and 9pm prompting new users to verify schoology
		let scheduledMessage = new CronJob(
			'0 9,15,21 * * *',
			function () {

				const joinReminder = new EmbedBuilder()
					.setTitle('Hey there!')
					.setDescription('It seems like you still have the New Member role. Remember to DM me your nps email to get access to the nshs.life server! If you have any questions, feel free to DM an admin')
					.setColor(0x0099FF)

				//send reminder to people with new member role
				let guild = client.guilds.cache.get('1011355033763324085')
				const members = guild.members.fetch().then(members => {
					members.forEach((value, key) => {
						guild.members.fetch(key)
							.then(member => {
								if (member.roles.cache.has('1011355033763324090')) {
									member.send({ embeds: [joinReminder] })
								}
							})
					})
				});
			},
			null,

			//start command
			true,
			'America/New_York'
		);
		
	},
};
