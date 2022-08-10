//required classes
const fetch = require('node-fetch');
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, ChannelType, PermissionsBitField, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');
const { token } = require('./config.json');
const keepAlive = require('./server')

//create client
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.MessageContent], partials: [Partials.Channel, Partials.Message, Partials.Reaction] });

//registering commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}


//registering events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}


//user commands handler
client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);
	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});


//new members handler
client.on('guildMemberAdd', member => {

	//adding "new member" role
	member.roles.add(member.guild.roles.cache.get('1004509586142806087'))

	//pinging in welcome channel
	const channel = member.guild.channels.cache.find(channel => channel.name === "welcome");
	channel.send(`Welcome to nshs.life, ${member}, please check your DMs for steps to join!`)

	//DMing new member
	const Embed = new EmbedBuilder()
		.setThumbnail(client.user.displayAvatarURL())
		.setTitle('Welcome to nshs.life!')
		.setColor(0x18e1ee)
		.addFields({ name: 'Our Mission', value: '[mission.nshs.life](https://docs.google.com/document/u/5/d/e/2PACX-1vToUA9QApqWmo_k5YGaouh1-FexC5tqLzUIZv6fJZGneyBZwM_ImYNDzraq3mT5FzQVS_EGC7Kdk_Oj/pub)' })
		.addFields({ name: 'Join Requirement', value: 'Please enter your school LASID' });

	member.send({ embeds: [Embed] })
})


//replying to DMs
client.on('messageCreate', msg => {

	//DM (not from the bot itself)
	if (msg.channel.type == 1 && msg.author != client.user) {

		//check if member is in guild
		let guild = client.guilds.cache.get('1004509586142806086')

		//add specific grade role to member
		guild.members.fetch(msg.author.id)
			.then(member => {

				//new member
				if (member.roles.cache.has('1004509586142806087')) {

					//regex school email

					/* also need them to enter full name */
					if (msg.content.match(/\d{9}@newton.k12.ma.us/)) {
						// add grade, remove new member
						member.roles.add(guild.roles.cache.get('1004509586142806093'))
						member.roles.remove(guild.roles.cache.get('1004509586142806087'))
						msg.channel.send("you can check out the server now!")

					} else {
						msg.channel.send("Please enter your school email to join the server")
					}

					//already a member
				} else {
					fetch("https://type.fit/api/quotes")
						.then(function (response) {
							return response.json();
						})
						.then(function (data) {

							const quote = data[Math.floor(Math.random() * data.length)]
							const Embed = new EmbedBuilder()
								.setTitle("Hello! Here's a quote for you to think about")
								.setColor(0x18e1ee)
								.addFields({ name: quote.text, value: `- ${quote.author ? quote.author : 'unknown'} ` })
							msg.channel.send({ embeds: [Embed] })

						});
				}

			})
	}

});


//reactions handler
client.on('messageReactionAdd', async (reaction, user) => {

	// checks if the reaction is partial
	if (reaction.partial) {
		try {
			await reaction.fetch(); //fetches reaction
		} catch (error) {
			console.error('Fetching message failed: ', error);
			return;
		}
	}

	let guild = client.guilds.cache.get('1004509586142806086')

	if (user.bot == false) {

		//role-poll selection
		if (reaction.message.channelId == '1005275051383345204') {

			//developer
			if (reaction.emoji.name == '👩‍💻') {
				const role = guild.roles.cache.get('1004509586142806089')
				guild.members.fetch(user.id)
					.then(member => {
						member.roles.add(role)
					})
			}

			//available tutor
			if (reaction.emoji.name == '🚸') {
				const role = guild.roles.cache.get('1005048288061444167')
				guild.members.fetch(user.id)
					.then(member => {
						member.roles.add(role)
					})
			}

			//opportunity pings
			if (reaction.emoji.name == '🔎') {
				const role = guild.roles.cache.get('1005371788349419560')
				guild.members.fetch(user.id)
					.then(member => {
						member.roles.add(role)
					})
			}

			//club pings
			if (reaction.emoji.name == '♣') {
				const role = guild.roles.cache.get('1005371922688778311')
				guild.members.fetch(user.id)
					.then(member => {
						member.roles.add(role)
					})
			}

			//accepting tutor request
		} else if (reaction.message.channelId == '1005048112890511450' && reaction.emoji.name == '✅') {

			guild.members.fetch(reaction.message.embeds[0].footer.text)
				.then(member => {
					if (member.user.id == user.id) {
						reaction.users.remove(user.id)
						return user.send("Sorry, this isn't a self-tutor system")
					} else {

						const requestorName = reaction.message.embeds[0].description.split(/From: /)[1]

						let emojiCount = 0
						reaction.message.reactions.cache.forEach((value, key) => {
							emojiCount += value.count
						});
						if (emojiCount > 2) {
							reaction.users.remove(user.id)
							return user.send('Somebody already reached out to help ' + requestorName);
						}


						// someone accepts tutor request
						if (reaction.message.reactions.cache.get('✅').count == 2) {
							reaction.message.react('➡')

							//get tutor's username
							guild.members.fetch(user.id)
								.then(tutor => {

									//send confirmation to tutee
									const Embed = new EmbedBuilder()
										.setTitle(`${tutor.nickname ? tutor.nickname : user.username} accepted your tutor request.`)
										.setDescription('Estimated meeting length: ' + reaction.message.embeds[0].fields[1].value)
										.setColor(0x0099FF)
										.addFields(
											{ name: reaction.message.embeds[0].fields[0].name, value: reaction.message.embeds[0].fields[0].value },
											{ name: 'To confirm', value: 'React with ✅' },
											{ name: 'To cancel', value: 'React with ⛔' })
										.setTimestamp()
										.setFooter({ text: user.id });

									member.user.send({ embeds: [Embed] }).then(message => {
										message.react('✅')
										message.react('⛔')
									})
									user.send('Tutoring confirmation sent to ' + requestorName)
								})



						}


					}
				})

			//dm reaction
		} else if (reaction.message.guildId === null && reaction.count == 2) {

			//tutor confirmation handling
			if (reaction.emoji.name == '✅') {
				user.send('Tutoring session confirmed')
				guild.members.fetch(reaction.message.embeds[0].footer.text)
					.then(member => {
						guild.members.fetch(user.id)
							.then(tutee => {
								member.user.send(`${tutee.nickname ? tutee.nickname : user.username} confirmed the tutoring session`)
							})

					})

				guild.members.fetch(user.id)
					.then(tutee => {

						guild.channels.create({
							name: `Subject - ${reaction.message.embeds[0].fields[0].name.split(/Subject: /)[1]} | Tutor - ${reaction.message.embeds[0].title.split(/ accepted your tutor request/)[0]} | Tutee - ${tutee.nickname ? tutee.nickname : user.username}`,
							type: ChannelType.GuildVoice,
						}).then(channel => {
							let category = guild.channels.cache.get('1005208881024217181');
							channel.setParent(category.id);
							channel.permissionOverwrites.edit(guild.id, { ViewChannel: false });
							channel.permissionOverwrites.edit(user.id, { ViewChannel: true });
							channel.permissionOverwrites.edit(reaction.message.embeds[0].footer.text, { ViewChannel: true });
						});

					})





			} else {
				user.send('Tutor cancelled. Please create another request to schedule a new tutor')
			}

			reaction.message.delete()

		}
	}

})

//reactions handler
client.on('messageReactionRemove', async (reaction, user) => {

	// checks if the reaction is partial
	if (reaction.partial) {
		try {
			await reaction.fetch(); //fetches reaction
		} catch (error) {
			console.error('Fetching message failed: ', error);
			return;
		}
	}

	const { guild } = reaction.message

	//role-poll selection
	if (user.bot == false && reaction.message.channelId == '1005275051383345204') {

		//developer
		if (reaction.emoji.name == '👩‍💻') {
			const role = guild.roles.cache.get('1004509586142806089')
			guild.members.fetch(user.id)
				.then(member => {
					member.roles.remove(role)
				})
		}

		//available tutor
		if (reaction.emoji.name == '🚸') {

			const role = guild.roles.cache.get('1005048288061444167')
			guild.members.fetch(user.id)
				.then(member => {
					member.roles.remove(role)
				})
		}

		//opportunity pings
		if (reaction.emoji.name == '🔎') {
			const role = guild.roles.cache.get('1005371788349419560')
			guild.members.fetch(user.id)
				.then(member => {
					member.roles.remove(role)
				})
		}

		//club pings
		if (reaction.emoji.name == '♣') {
			const role = guild.roles.cache.get('1005371922688778311')
			guild.members.fetch(user.id)
				.then(member => {
					member.roles.remove(role)
				})
		}

	}

})


keepAlive()
client.login(token);