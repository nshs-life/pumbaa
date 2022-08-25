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

        .addStringOption(option =>
            option.setName('tagtwo')
                .setDescription("What category does the club belong to?")
                .addChoices(
                    { name: 'None', value: 'None' },
                    { name: 'Affinity', value: 'Affinity' },
                    { name: 'Competitive', value: 'Competitive' },
                    { name: 'STEM', value: 'STEM' },
                    { name: 'Humanities', value: 'Humanities' },
                    { name: 'Public Speaking', value: 'Public Speaking' },
                    { name: 'Fun', value: 'Fun' },
                )
                .setRequired(true))

        .addStringOption(option =>
            option.setName('tagthree')
                .setDescription("What category does the club belong to?")
                .addChoices(
                    { name: 'None', value: 'None' },
                    { name: 'Affinity', value: 'Affinity' },
                    { name: 'Competitive', value: 'Competitive' },
                    { name: 'STEM', value: 'STEM' },
                    { name: 'Humanities', value: 'Humanities' },
                    { name: 'Public Speaking', value: 'Public Speaking' },
                    { name: 'Fun', value: 'Fun' },
                )
                .setRequired(true))

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

        //club member count
        .addIntegerOption(option =>
            option.setName('size')
                .setDescription('How many people are in the club?')
                .setRequired(true)),

    async execute(interaction) {

        const name = interaction.options.getString('name')
        const tag1 = interaction.options.getString('tag')
        const tag2 = interaction.options.getString('tagtwo')
        const tag3 = interaction.options.getString('tagthree')
        const leader = interaction.options.getString('leaders')
        const description = interaction.options.getString('description')
        const size = interaction.options.getInteger('size')

        let category = tag1 + ", " + tag2 + ", " + tag3
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
                { name: 'Member count', value: String(size)});

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