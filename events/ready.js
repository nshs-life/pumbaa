const { ActivityType, EmbedBuilder } = require('discord.js');
const CronJob = require('cron').CronJob;
const { discordIDSwitcher } = require('../helper.js');

let discord_ids = discordIDSwitcher();

const fs = require('node:fs');
const path = require('node:path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');

const { config_load } = require('../helper.js');
const { DISCORD_CLIENT_ID, DISCORD_SERVER_ID, DISCORD_TOKEN } = config_load();

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {

		//logged in
		console.log(`nshs.life.bot logged in as ${client.user.tag}`);

		//set bot's activity
		client.user.setActivity('Hakuna Matata', { type: ActivityType.Listening });

		//registering commands
		const commands = [];
		const commandsPath = path.join(__dirname, '../commands');
		const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

		for (const file of commandFiles) {
			const filePath = path.join(commandsPath, file);
			const command = require(filePath);
			commands.push(command.data.toJSON());
		}

		const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

		rest.put(Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_SERVER_ID), { body: commands })
			.then(() => console.log('Successfully registered application commands.'))
			.catch(console.error);


		//send out intial messages
		const roleEmbed = new EmbedBuilder()
			.setTitle('Choosing optional server roles')
			.setColor(0x0099FF)
			.addFields(
				{ name: 'Developer', value: 'React with 👩‍💻' },
				{ name: 'Available tutor', value: 'React with 🚸' },
				{ name: 'Opportunity updates ping', value: 'React with 🔎' },
				{ name: 'Club updates ping', value: 'React with ♣' },
				{ name: 'Access to memes channel', value: 'React with 😆' },
				{ name: 'She/Her', value: 'React with 💛' },
				{ name: 'They/Them', value: 'React with 💗' },
				{ name: 'He/Him', value: 'React with 💚' });

		let roleChannel = client.channels.cache.get(discord_ids["channels"]["role-assignment"])

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
							request.react('😆')
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

		let aboutChannel = client.channels.cache.get(discord_ids["channels"]["about"])

		aboutChannel.messages.fetch()
			.then(msgs => {
				if (msgs.size < 1) {
					//post request to tutors
					aboutChannel.send({ embeds: [aboutEmbed] })
				}
			})

		//send message at 9am and 9pm prompting new users to verify schoology
		let scheduledMessage = new CronJob(
			'20 4 * * *',
			async function () {

				const joinReminder = new EmbedBuilder()
					.setTitle('Hey there!')
					.setDescription('It seems like you still have the New Member role. Remember to DM me your nps email (example@newton.k12.ma.us) to get access to the nshs.life server! If you have any questions, feel free to DM an admin')
					.setColor(0x0099FF)

				//send reminder to people with new member role
				let guild = client.guilds.cache.get(discord_ids["server"])

				members = await guild.members.fetch()
				members.forEach((member) => {
					if (member.roles.cache.has(discord_ids["roles"]["new-member"])) {
						member.send({ embeds: [joinReminder] })
					}
				});
			},
			null,

			//start command
			true,
			'America/New_York'
		);

	},
};
