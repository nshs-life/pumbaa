const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('about')
		.setDescription('about nshs.life'),
	async execute(interaction) {
		const Embed = new EmbedBuilder()
			.setTitle('nshs.life')
			.setDescription('Redefining South')
			.setColor(0x18e1ee)
			.addFields({ name: 'What?', value: 'nshs.life is empowering students to build the South we want. It is an organization providing resources to those who want to run clubs, organize events, and create projects. It is a community flagging issues and tackling problems. From lack of working water fountains to knowing whether your teacher is out, nshs.life is reshaping South through student action and empowerment.' })
			.addFields({ name: 'Why?', value: 'South’s administration is burdened by a slow and unproductive bureaucracy leaving problems at school unsolved and often unaddressed. On the other hand, South students are eager to improve current systems but lack the support to take those first steps. So how do you tap into the youthful energy of students to reshape South for the better? By giving students support. That is nshs.life.' })
			.addFields({ name: 'Who?', value: 'A group of passionate students who hope to solve problems and inspire creativity among classmates. We are thinkers and philosophers, tinkerers and writers, students and mentors, but most importantly, builders and action-takers. When we see a problem, we fix it. When we see something wrong, we correct it. nshs.life is about taking initiative when others hesitate, and solving problems while others wait.' })
			.addFields({ name: 'Join Us!', value: 'Redefining South will take more than just a handful of students. It will take a school. We are open to all who are passionate about shaping South for the better. If you want to empower your fellow classmates and see real-world change in our school, join nshs.life and be part of our journey in building a South we want.' });

		await interaction.user.send({ embeds: [Embed] });
		await interaction.reply({ content: 'check your DMs', ephemeral: true })
	}
};