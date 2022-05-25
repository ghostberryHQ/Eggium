const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('Replies with how long the bot has been running for'),
    async execute(interaction) {
        //get uptime
        var uptime = process.uptime();
        //convert uptime to seconds
        var seconds = uptime % 60;
        //convert uptime to minutes
        var minutes = Math.floor(uptime / 60) % 60;
        //convert uptime to hours
        var hours = Math.floor(uptime / 3600) % 24;
        //convert uptime to days
        var days = Math.floor(uptime / 86400);
        const embed = new MessageEmbed()
        .setTitle('Uptime')
        .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
        .setDescription('Days: ' + days + '\nHours: ' + hours + '\nMinutes: ' + minutes + '\nSeconds: ' + seconds)
        embed.setFooter({
            text: "Eggium - Tanner Approved"
        })
        .setTimestamp();
        //send embed
        interaction.reply({ embeds: [embed] , ephemeral: true});
    }
};