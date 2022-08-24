const { SlashCommandBuilder } = require('discord.js');
const { discordIDSwitcher } = require('./helper.js');

let discord_ids = discordIDSwitcher();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rant')
        .setDescription('type in a rant to be posted anonymously')
        .addStringOption(option => option.setName('rant').setDescription('rant contect')),
    async execute(interaction) {
        const rant = interaction.options.getString('rant')
        if (!rant) return interaction.reply({ content: 'enter a rant', ephemeral: true });

        //post rant in rant-approval channel
        interaction.guild.channels.fetch(discord_ids["channels"]["rant-approval"])
            .then(channel => channel.send(rant))
        await interaction.reply({ content: 'rant posted for review', ephemeral: true })
    }
};