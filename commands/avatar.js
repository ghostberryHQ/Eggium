const { SlashCommandBuilder } = require('@discordjs/builders');
const { ContextMenuInteraction, EmbedBuilder } = require('discord.js');

//Later, port this to a Context Menu Interaction

module.exports = {
    name: 'avatar',
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Get a users avatar')
        .addMentionableOption(option =>
            option.setName('username')
                .setDescription('The user you want to get the avatar of')
                .setRequired(false)),
    async execute(interaction) {
        // console.log(await interaction.channel.messages.fetch(interaction.targetId))
        var username;
        var id;
        if(interaction.options.get("username") === undefined || interaction.options.get("username") === null) {
            username = interaction;
            id = username.user.id;
        } else {
            username = interaction.options.get("username");
            id = username.value;
        }
        setTimeout(function() {
            console.log(username.user.username)

            const embed = new EmbedBuilder()
                .setTitle('Avatar - ' + username.user.username)
                .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
                .setThumbnail('https://cdn.discordapp.com/avatars/'+id+'/'+username.user.avatar+'.png')
                .setDescription('https://cdn.discordapp.com/avatars/'+id+'/'+username.user.avatar+'.png')
                .setFooter({ text: "Eggium - Tanner Approved" })
                .setTimestamp();
            interaction.reply({ embeds: [embed] });
        }, 1000);
    }
};