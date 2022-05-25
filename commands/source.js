const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('source')
        .setDescription('Links you to the source code for Eggium'),
    async execute(interaction) {
        const embed = new MessageEmbed()
        .setTitle('Source Code')
        .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
        .setDescription('Main Source Code: https://github.com/spjoes/Eggium\nUpdate JSON: https://gist.github.com/spjoes/ce745c5ebe201c005067472f5c8cf876')
        embed.setFooter({
            text: "Eggium - Tanner Approved"
        })
        .setTimestamp();
        //send embed
        interaction.reply({ embeds: [embed] , ephemeral: true});
    }
};