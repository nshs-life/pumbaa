const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('about bot commands'),
    async execute(interaction) {

        const Embed = new EmbedBuilder()
            .setTitle('nshs.life.bot slash commands')
            .setColor(0x18e1ee)
            .addFields({ name: '/about', value: 'about nshs.life' })
            .addFields({ name: '/me', value: 'your account information' })
            .addFields({ name: '/rant', value: 'send rants about school that will be posted anonymously' });

        // await interaction.user.send({  });
        await interaction.reply({ embeds: [Embed] })
    }
};