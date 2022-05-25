const { SlashCommandBuilder } = require('@discordjs/builders');
const { ContextMenuInteraction, MessageEmbed } = require('discord.js');

//Later, port this to a Context Menu Interaction

module.exports = {
    name: 'avatar',
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Get a users avatar')
        .addMentionableOption(option =>
            option.setName('username')
                .setDescription('The user you want to get the avatar of')
                .setRequired(true)),
    async execute(interaction) {
        // console.log(await interaction.channel.messages.fetch(interaction.targetId))
        var username = interaction.options.get("username")
        console.log(username.user.username)

        const embed = new MessageEmbed()
            .setTitle('Avatar - ' + username.user.username)
            .setColor(0x00AE86)
            .setImage('https://cdn.discordapp.com/avatars/'+username.value+'/'+username.user.avatar+'.jpeg')
            .setDescription('https://cdn.discordapp.com/avatars/'+username.value+'/'+username.user.avatar+'.jpeg')
            embed.setFooter({
                text: "Eggium - Tanner Approved"
            })
            .setTimestamp();
        interaction.reply({ embeds: [embed] });
    }
};