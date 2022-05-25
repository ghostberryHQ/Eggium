const { SlashCommandBuilder } = require('@discordjs/builders');
var sunTzu = require('sun-tzu-quotes')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('suntzu')
        .setDescription('Will reply with the wise words from Sun Tzu'),
    async execute(interaction) {
        quote = sunTzu() + " -Sun Tzu"
        interaction.reply({ content: quote});
    }
};