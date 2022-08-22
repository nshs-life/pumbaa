//required classes
const fetch = require('node-fetch');
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, ChannelType, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');
const keepAlive = require('./server');

const { SchoologyAuthenticate } = require('./schoologyListener.js');

if (fs.existsSync("./config.json")) {
    var { token } = require('./config.json');
} else {
    var { token } = process.env;
}

/**
 * Create discord client
 */
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates], partials: [Partials.Channel, Partials.Message, Partials.Reaction] });

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
	channel.send(`Hakuna Matata! Welcome to nshs.life, ${member}, please check your DMs for steps to join!`)

	//DMing new member
	const Embed = new EmbedBuilder()
		.setThumbnail(client.user.displayAvatarURL())
		.setTitle('Welcome to nshs.life!')
		.setColor("#0e3675")
		.addFields({ name: 'Our Mission', value: '[mission.nshs.life](https://docs.google.com/document/u/5/d/e/2PACX-1vToUA9QApqWmo_k5YGaouh1-FexC5tqLzUIZv6fJZGneyBZwM_ImYNDzraq3mT5FzQVS_EGC7Kdk_Oj/pub)' })
		.addFields({ name: 'Our Rules', value: '[rules.nshs.life](https://docs.google.com/document/u/5/d/e/2PACX-1vSJ1NB4b7RmcOWPEiDMXVQtug1nHvnzwaSjTvEBq_keDMVgDrut2aZxN6uGD8ccL8xMnvWFXIS8PT09/pub)' })

		.addFields({ name: 'Join Requirement', value: 'Please type out your school email to Pumbaa' });

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
                        SchoologyAuthenticate(msg)
                            .then(displayName => {
				
                                //user has to select a newton email to join
                                member.setNickname(displayName)
				
				//make sure they don't have a grade role already
				if (!member.roles.cache.has('1004509586142806094') && !member.roles.cache.has('1004509586142806093') && !member.roles.cache.has('1004509586142806092') && !member.roles.cache.has('1004509586142806091')) {
					const gradeEmbed = new EmbedBuilder()
					    .setTitle('Please select your grade')
					    .setColor(0x0099FF)
					    .addFields(
						{ name: 'Freshman', value: 'React with 🕘' },
						{ name: 'Sophomore', value: 'React with 🕙' },
						{ name: 'Junior', value: 'React with 🕚' },
						{ name: 'Senior', value: 'React with 🕛' });

					msg.channel.send({ embeds: [gradeEmbed] })
					    .then(request => {
						request.react('🕘')
						request.react('🕙')
						request.react('🕚')
						request.react('🕛')
					    })
				}
                                })
                            .catch(err => {
                                const errorEmbed = new EmbedBuilder()
                                    .setTitle('Verification Timed Out')
                                    .setColor(0xFF0000)
                                    .setDescription('Schoology authentication timed out. Send your school email again to re-verify.')
                                msg.channel.send({ embeds: [errorEmbed] })
                            })
					} else {
						const loginReqEmbed = new EmbedBuilder()
							.setTitle('Please type out your nps email in this dm')
						msg.channel.send({ embeds: [loginReqEmbed] })
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
								.setColor("#14499c")
								.addFields({ name: quote.text, value: `- ${quote.author ? quote.author : 'unknown'} ` })
							msg.channel.send({ embeds: [Embed] })

						})
                        .catch(err => {
                            const errorEmbed = new EmbedBuilder()
                                .setTitle("You're already a member!")
                                .setColor("#14499c")
                                .setDescription("You've already authenticated. If you're having trouble, please contact a moderator.")
                            msg.channel.send({ embeds: [errorEmbed] })
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

			//they-them
			if (reaction.emoji.name == '💗') {
				const role = guild.roles.cache.get('1011326050283819108')
				guild.members.fetch(user.id)
					.then(member => {
						member.roles.add(role)
					})
			}

			//she-her
			if (reaction.emoji.name == '💛') {

				const role = guild.roles.cache.get('1011325973213495358')
				guild.members.fetch(user.id)
					.then(member => {
						member.roles.add(role)
					})
			}

			//he-him
			if (reaction.emoji.name == '💚') {
				const role = guild.roles.cache.get('1011326024795037806')
				guild.members.fetch(user.id)
					.then(member => {
						member.roles.add(role)
					})
			}
			
			//accepting tutor request
		} else if (reaction.message.channelId == '1005048112890511450' && reaction.emoji.name == '🎓') {

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
						if (reaction.message.reactions.cache.get('🎓').count == 2) {
							reaction.message.react('✅')

							//get tutor's username
							guild.members.fetch(user.id)
								.then(tutor => {

									//send confirmation to tutee
									const toTutee = new EmbedBuilder()
										.setTitle(`${tutor.nickname ? tutor.nickname : user.username} accepted your tutor request.`)
										.setDescription('Estimated meeting length: ' + reaction.message.embeds[0].fields[1].value)
										.setColor(0x0099FF)
										.addFields(
											{ name: reaction.message.embeds[0].fields[0].name, value: reaction.message.embeds[0].fields[0].value },
											{ name: 'To confirm', value: 'React with ✅' },
											{ name: 'To cancel', value: 'React with ⛔' })
										.setTimestamp()
										.setFooter({ text: user.id });

									member.user.send({ embeds: [toTutee] }).then(message => {
										message.react('✅')
										message.react('⛔')
									})

									const toTutor = new EmbedBuilder()
										.setTitle('Tutoring confirmation sent to ' + requestorName);
									user.send({ embeds: [toTutor] })
								})



						}


					}
				})

			//dm reaction
		} else if (reaction.message.guildId === null && reaction.count == 2) {

			//grade handling
			if (reaction.message.embeds[0].title.toString().includes('select your grade')) {

				guild.members.fetch(user.id)
					.then(member => {
						//freshman
						if (reaction.emoji.name == '🕘') {
							const role = guild.roles.cache.get('1004509586142806091')
							member.roles.add(role)
						}

						//sophomore
						if (reaction.emoji.name == '🕙') {
							const role = guild.roles.cache.get('1004509586142806092')
							member.roles.add(role)
						}

						//junior
						if (reaction.emoji.name == '🕚') {
							const role = guild.roles.cache.get('1004509586142806093')
							member.roles.add(role)
						}

						//senior
						if (reaction.emoji.name == '🕛') {
							const role = guild.roles.cache.get('1004509586142806094')
							member.roles.add(role)
						}
						member.roles.remove(guild.roles.cache.get('1004509586142806087'))
					})

				const welcome = new EmbedBuilder()
				    .setColor(0x00AE86)
				    .setTitle('Welcome to nshs.life!')
				    .setDescription('You can check out the server now! If you would like to change your name, please DM @Admin')
				    .addFields(
					{ name: 'Rules', value: '[rules.nshs.life](https://docs.google.com/document/u/5/d/e/2PACX-1vSJ1NB4b7RmcOWPEiDMXVQtug1nHvnzwaSjTvEBq_keDMVgDrut2aZxN6uGD8ccL8xMnvWFXIS8PT09/pub)' });
				user.send({ embeds: [welcome] })
				reaction.message.delete()
			}

			//tutor confirmation handling
			if (reaction.message.embeds[0].title.toString().includes('accepted your tutor request')) {
				if (reaction.emoji.name == '✅') {
					const toTutee = new EmbedBuilder()
						.setTitle(`Tutoring session confirmed`);
					user.send({ embeds: [toTutee] })
					guild.members.fetch(reaction.message.embeds[0].footer.text)
						.then(member => {
							guild.members.fetch(user.id)
								.then(tutee => {
									const toTutor = new EmbedBuilder()
										.setTitle(`${tutee.nickname ? tutee.nickname : user.username} confirmed the tutoring session`);
									member.user.send({ embeds: [toTutor] })
								})

						})

					guild.members.fetch(user.id)
						.then(tutee => {

							//voice channel for tutor and tutee
							guild.channels.create({
								name: `Tutor - ${reaction.message.embeds[0].title.split(/ accepted your tutor request/)[0]} | Tutee - ${tutee.nickname ? tutee.nickname : user.username}`,
								type: ChannelType.GuildVoice,
							}).then(channel => {

								//add vc to tutoring category and make it visible to only the tutor and tutee 
								let category = guild.channels.cache.get('1005208881024217181');
								channel.setParent(category.id);
								channel.permissionOverwrites.edit(guild.id, { ViewChannel: false });
								channel.permissionOverwrites.edit(user.id, { ViewChannel: true });
								channel.permissionOverwrites.edit(reaction.message.embeds[0].footer.text, { ViewChannel: true });

								//meeting details so ids can be pulled later to log tutor hours
								const Embed = new EmbedBuilder()
									.setTitle(`Meeting Details`)
									.setColor(0x0099FF)
									.addFields(
										{ name: reaction.message.embeds[0].fields[0].name, value: reaction.message.embeds[0].fields[0].value },
										{ name: 'Estimated meeting length', value: reaction.message.embeds[0].description.split(/Estimated meeting length: /)[1] },
										{ name: 'Tutor ID', value: reaction.message.embeds[0].footer.text },
										{ name: 'Tutee ID', value: user.id });


								channel.send({ embeds: [Embed] })
								channel.send('@everyone The tutor session will start when both tutor and tutee join the voice call. Once one leaves, the session is "ended" and the channel will be deleted')
							});

						})





				} else {
					user.send('Tutor cancelled. Please create another request to schedule a new tutor')
				}

				reaction.message.delete()

			}
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
		
		//they-them
		if (reaction.emoji.name == '💗') {
			const role = guild.roles.cache.get('1011326050283819108')
			guild.members.fetch(user.id)
				.then(member => {
					member.roles.remove(role)
				})
		}

		//she-her
		if (reaction.emoji.name == '💛') {

			const role = guild.roles.cache.get('1011325973213495358')
			guild.members.fetch(user.id)
				.then(member => {
					member.roles.remove(role)
				})
		}

		//he-him
		if (reaction.emoji.name == '💚') {
			const role = guild.roles.cache.get('1011326024795037806')
			guild.members.fetch(user.id)
				.then(member => {
					member.roles.remove(role)
				})
		}

	}

})


client.on('voiceStateUpdate', async (oldState, newState) => {

	let guild = client.guilds.cache.get('1004509586142806086')

	if (newState.channel !== null) {

		//get first message (the bot's embed)
		const fetchedMsg = await newState.channel.messages.fetch({ after: 1, limit: 1 })
		const firstMsg = fetchedMsg.first()

		//when the people in the vc are the tutor and tutee, start the session
		const memberIds = Array.from(newState.channel.members.keys())
		if (memberIds.length == 2 && memberIds.includes(firstMsg.embeds[0].fields[2].value) && memberIds.includes(firstMsg.embeds[0].fields[3].value)) {
			guild.channels.fetch(newState.channelId).then(channel => {
				channel.send("@everyone This tutor session has started, only leave when you are sure that you're done")
			})
		}

	} else if (newState.channel === null) {

		//get first message (the bot's embed)
		const fetchedMsg = await oldState.channel.messages.fetch({ after: 1, limit: 1 })
		const firstMsg = fetchedMsg.first()

		//possible people allowed
		const memberIds = [firstMsg.embeds[0].fields[2].value, firstMsg.embeds[0].fields[3].value]
		//whoever's left (tutee/tutor)
		const personLeft = Array.from(oldState.channel.members.keys())
		if (personLeft.length == 1 && memberIds.includes(oldState.id) && memberIds.includes(personLeft[0])) {
			
			
			
			guild.channels.fetch(oldState.channelId).then(channel => {
				channel.delete()
			})

		}
	}



})

keepAlive()
client.login(token);
