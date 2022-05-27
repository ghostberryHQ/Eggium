const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with pong'),
    async execute(interaction) {
        const delay = Math.abs(Date.now() - interaction.createdTimestamp);
        interaction.reply({ content: '🏓 Pong! ' + delay +'ms' , ephemeral: true});
    }
};