const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { discordIDSwitcher } = require('../helper.js');

let discord_ids = discordIDSwitcher();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addclub')
        .setDescription('add a club to our notion page')

        //club name
        .addStringOption(option =>
            option.setName('name')
                .setDescription("What is the name of the club?")
                .setRequired(true))

        //club categories
        .addStringOption(option =>
            option.setName('tag')
                .setDescription("What category does the club belong to?")
                .setRequired(true)
                .addChoices(
                    { name: 'Affinity', value: 'Affinity' },
                    { name: 'Competitive', value: 'Competitive' },
                    { name: 'STEM', value: 'STEM' },
                    { name: 'Humanities', value: 'Humanities' },
                    { name: 'Public Speaking', value: 'Public Speaking' },
                    { name: 'Fun', value: 'Fun' },
                ))


        //leader of the club
        .addStringOption(option =>
            option.setName('leaders')
                .setDescription('Who is in charge?')
                .setRequired(true))

        //about the club
        .addStringOption(option =>
            option.setName('description')
                .setDescription('What does the club do?')
                .setRequired(true))

        //meeting times
        .addStringOption(option =>
            option.setName('meetingtime')
                .setDescription("When does the club meet?")
                .setRequired(true))

        //meeting room
        .addStringOption(option =>
            option.setName('meetingroom')
                .setDescription("What room does the club meet in?")
                .setRequired(true))

        //club advisor
        .addStringOption(option =>
            option.setName('advisor')
                .setDescription("Who is the teacher advising the club?")
                .setRequired(true))

        //club member count
        .addStringOption(option =>
            option.setName('size')
                .setDescription('How many people are in the club?')
                .setRequired(true)
                .addChoices(
                    { name: '1-5', value: '1-5' },
                    { name: '6-10', value: '6-10' },
                    { name: '11-20', value: '11-20' },
                    { name: '21-30', value: '21-30' },
                    { name: '30+', value: '30+' },
                )),

    async execute(interaction) {

        const name = interaction.options.getString('name')
        const category = interaction.options.getString('tag')
        const leader = interaction.options.getString('leaders')
        const description = interaction.options.getString('description')
        const time = interaction.options.getString('meetingtime')
        const room = interaction.options.getString('meetingroom')
        const advisor = interaction.options.getString('advisor')
        const size = interaction.options.getString('size')

        //format embed
        const clubEmbed = new EmbedBuilder()
            .setTitle('New club that needs approval')
            .setDescription(`From: ${interaction.member.nickname ? interaction.member.nickname : interaction.user.username}`)
            .setColor(0x0099FF)
            .addFields(
                { name: 'Name', value: name },
                { name: 'Category', value: category },
                { name: 'Leader(s)', value: leader },
                { name: 'Description', value: description },
                { name: 'Meeting Times', value: time },
                { name: 'Meeting Room', value: room },
                { name: 'Advisor', value: advisor },
                { name: 'Member count', value: size });

        //post request to verify-club
        interaction.guild.channels.fetch(discord_ids["channels"]["verify-club"])
            .then(channel => channel.send({ embeds: [clubEmbed] })
                .then(request => {
                    request.react("✅")
                    request.react("⛔")
                })
            )

        await interaction.reply({ content: 'club posted for verification...', ephemeral: true })
    }
};