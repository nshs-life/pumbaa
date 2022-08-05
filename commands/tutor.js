const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tutor')
        .setDescription('request a tutor for your needs')
        .addChannelOption(option => option.setName('subject').setDescription('Select a channel'))
        .addStringOption(option => option.setName('request').setDescription('tell tutors what you need help with')),
    async execute(interaction) {

        //format embed
        const channel = interaction.options.getChannel('subject')
        if (!channel) return interaction.reply({ content: 'please select a subject', ephemeral: true });
        interaction.guild.channels.fetch(channel)
            .then(subject => console.log(subject.name))
        
        const request = interaction.options.getString('request')
        if (!request) return interaction.reply({ content: 'please enter a description of what you need help with', ephemeral: true });
        const Embed = new EmbedBuilder()
            .setTitle('New Request:')
            .setDescription('From: ' + interaction.user.tag.split(/#/)[0])
            .setColor(0x18e1ee)
            .addFields({ name: 'Subject: ', value: 'Description: ' + request });

        //post request to tutors
        interaction.guild.channels.fetch('1005048112890511450')
            .then(channel => channel.send({ embeds: [Embed] }))
        await interaction.reply({ content: 'request posted to tutors', ephemeral: true })
    }
};