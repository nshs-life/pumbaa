const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rant')
        .setDescription('type in a rant to be posted anonymously')
        .addStringOption(option => option.setName('rant').setDescription('rant contect')),
    async execute(interaction) {
        const rant = interaction.options.getString('rant')
        if (!rant) return interaction.reply({ content: 'enter a rant', ephemeral: true });

        //post rant in rant-approval channel
        interaction.guild.channels.fetch('1004918083254751303')
            .then(channel => channel.send(rant))
        await interaction.reply({ content: 'rant posted for review', ephemeral: true })
    }
};