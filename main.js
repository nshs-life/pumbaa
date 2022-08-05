//required classes
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, ChannelType, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');
const { token } = require('./config.json');

//create client
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.DirectMessages, GatewayIntentBits.MessageContent], partials: [Partials.Channel] });

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
					msg.channel.send('hello!')
				}

			})
	}

});


//reactions handler
client.on('messageReactionAdd', async (reaction, user) => {

	let guild = client.guilds.cache.get('1004509586142806086')

	//tutor accept
	if (reaction.emoji.name == '✅' && reaction.message.channelId == '1005048112890511450' && user.bot == false) {
		const requestorName = reaction.message.embeds[0].description.split(/From: /)[1]

		//send message to tutor and tutee
		guild.members.fetch(reaction.message.embeds[0].footer.text)
			.then(member => {
				member.user.send(user.username + ' accepted your tutor request')
				user.send('Tutoring confirmation sent to ' + requestorName)
			})

		//create thread for tutor and tutee
		let channel = client.channels.cache.get('1005202136080068628')
		const thread = await channel.threads.create({
			name: `Session ongoing. Tutor - ${user.username} | Tutee - ${requestorName}`,
			autoArchiveDuration: 10080,
			type: ChannelType.GuildPublicThread
		});

		thread.members.add(user.id);
		thread.members.add(reaction.message.embeds[0].footer.text);

	}
})



client.login(token);