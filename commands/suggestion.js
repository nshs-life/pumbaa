const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { discordIDSwitcher } = require('../helper.js');

let discord_ids = discordIDSwitcher();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('suggestion')
        .setDescription('anonymous suggestions')
        .addStringOption(option =>
            option.setName('suggestion')
                .setDescription('type a suggestion to be posted anonymously')
                .setRequired(true)),
    async execute(interaction) {
        const text = interaction.options.getString('suggestion')
        const suggestion = new EmbedBuilder()
            .setTitle('New Suggestion')
            .setDescription(text)
            .setColor(0xD9EAD3)

        //post rant in rant-approval channel
        interaction.guild.channels.fetch(discord_ids["channels"]["suggestion-approval"])
            .then(channel => channel.send({ embeds: [suggestion] })
                .then(msg => {
                    msg.react("✅")
                    msg.react("⛔")
                }))

        await interaction.reply({ content: 'suggestion sent', ephemeral: true })
    }
};