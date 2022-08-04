module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(`nshs.life.bot logged in as ${client.user.tag}`);
	},
};