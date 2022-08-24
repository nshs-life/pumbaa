const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { discordIDSwitcher } = require('./helper.js');

let discord_ids = discordIDSwitcher();

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
            option.setName('details')
                .setDescription('tell tutors what you need help with')
                .setRequired(true))

        //meeting time needed
        .addIntegerOption(option =>
            option.setName('time')
                .setDescription('request length of meeting (minutes)')
                .setRequired(true)),
    async execute(interaction) {

        const subject = interaction.options.getString('subject')
        const details = interaction.options.getString('details')
        const time = interaction.options.getInteger('time')

        //format embed
        const Embed = new EmbedBuilder()
            .setTitle('New Tutor Request')
            .setDescription(`From: ${interaction.member.nickname ?  interaction.member.nickname : interaction.user.username}`)
            .setColor(0x0099FF)
            .addFields(
                { name: 'Subject: ' + subject, value: 'Details: ' + details },
                { name: 'Estimated meeting length: ', value: time + ' minutes' })
            .setTimestamp()
            .setFooter({ text: interaction.user.id });

        //post request to tutors
        interaction.guild.channels.fetch(discord_ids["channels"]["tutor-requests"])
            .then(channel => channel.send({ embeds: [Embed] })
                .then(request => {
                    request.react("🎓")
                })
            )

        await interaction.reply({ content: 'request posted to tutors', ephemeral: true })
    }
};