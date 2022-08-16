const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

//Later, port this to a Context Menu Interaction

module.exports = {
    name: 'userinfo',
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Get a users info')
        .addMentionableOption(option =>
            option.setName('username')
                .setDescription('The user you want to get the info of')
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
            id = username.user.id;
        }
        setTimeout(function() {
            console.log(username)
            var nickname;
            if(username.member.nickname === null) {
                nickname = "[not yet set]"
            } else {
                nickname = username.member.nickname;
            }
            var avatar = username.user.avatar;
            var joined = new Date(username.member.joinedTimestamp);
            const embed = new EmbedBuilder()
                .setTitle('User Info - ' + username.user.username)
                .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
                .setThumbnail('https://cdn.discordapp.com/avatars/'+id+'/'+avatar+'.png')
                .setDescription(
                '\nUsername: ' + username.user.tag +
                '\nNickname: ' + nickname + 
                '\nDiscord ID: ' + id +
                '\nJoined Server: ' + joined.toDateString())
                embed.setFooter({
                    text: "Eggium - Tanner Approved"
                })
                .setTimestamp();
            interaction.reply({ embeds: [embed] });
        }, 1000);
    }
};