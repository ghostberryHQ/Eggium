const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('Replies with how long the bot has been running for'),
    async execute(interaction) {
        var uptime = process.uptime();
        var seconds = uptime % 60;
        var minutes = Math.floor(uptime / 60) % 60;
        var hours = Math.floor(uptime / 3600) % 24;
        var days = Math.floor(uptime / 86400);
        const embed = new EmbedBuilder()
        .setTitle('Uptime')
        .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
        .setDescription('Days: ' + days + '\nHours: ' + hours + '\nMinutes: ' + minutes + '\nSeconds: ' + seconds)
        .setFooter({ text: "Eggium - Tanner Approved" })
        .setTimestamp();
        //send embed
        interaction.reply({ embeds: [embed] , ephemeral: true});
    }
};