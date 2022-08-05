//required classes
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');
const { token } = require('./config.json');
const { waitForDebugger } = require('node:inspector');

//create client
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.DirectMessages, GatewayIntentBits.MessageContent], partials: [Partials.Channel] });

//creating commands collection and locating files in commands folder
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

//adding commands to collection
for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

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

//getting the command (whatever the user types) from client.commands Collection
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

//handing new members
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


		//regex school email
		if (msg.content.match(/\d{9}@newton.k12.ma.us/)) {

			//check if member is in guild
			let guild = client.guilds.cache.get('1004509586142806086')

			//add specific grade role to member
			guild.members.fetch(msg.author.id)
				.then(member => {
					// add grade, remove new member
					member.roles.add(guild.roles.cache.get('1004509586142806093'))
					member.roles.remove(guild.roles.cache.get('1004509586142806087'))
				})

			msg.channel.send("you can check out the server now!")
		} else {
			msg.channel.send("Please enter your school email:")
		}
	}

});

client.login(token);