const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('randomwaifu')
        .setDescription('Replies with a random waifu'),
    async execute(interaction) {
        const digit = (Math.floor(Math.random() * 10000) + 1).toString();
        interaction.reply({  content: 'https://www.thiswaifudoesnotexist.net/example-'+digit+'.jpg' });
    }
};