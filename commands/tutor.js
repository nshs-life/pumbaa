const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tutor')
        .setDescription('request a tutor for your needs')

        //subjects for user to choose from
        .addStringOption(option =>
            option.setName('subject')
                .setDescription('Select a subject')
                .setRequired(true)
                .addChoices(
                    { name: 'Math', value: 'Math' },
                    { name: 'English', value: 'English' },
                    { name: 'Science', value: 'Science' },
                    { name: 'History', value: 'History' },
                    { name: 'Language', value: 'Language' },
                    { name: 'Other', value: 'Other' },
                ))

        //description of what they need help with
        .addStringOption(option =>
            option.setName('request')
                .setDescription('tell tutors what you need help with')
                .setRequired(true)),
    async execute(interaction) {

        const subject = interaction.options.getString('subject')
        const request = interaction.options.getString('request')

        //format embed
        const Embed = new EmbedBuilder()
            .setTitle('New Request:')
            .setDescription('From: ' + interaction.user.tag.split(/#/)[0])
            .setColor(0x18e1ee)
            .addFields({ name: 'Subject: ' + subject, value: 'Description: ' + request });

        //post request to tutors
        interaction.guild.channels.fetch('1005048112890511450')
            .then(channel => channel.send({ embeds: [Embed] }))
        await interaction.reply({ content: 'request posted to tutors', ephemeral: true })
    }
};