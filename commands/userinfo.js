const { SlashCommandBuilder } = require('@discordjs/builders');
const { ContextMenuInteraction, EmbedBuilder } = require('discord.js');

//Later, port this to a Context Menu Interaction

module.exports = {
    name: 'userinfo',
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Get a users info')
        .addMentionableOption(option =>
            option.setName('username')
                .setDescription('The user you want to get the info of')
                .setRequired(true)),
    async execute(interaction) {
        // console.log(await interaction.channel.messages.fetch(interaction.targetId))
        var username = interaction.options.get("username")
        console.log(username)

        //get user's id
        var id = username.user.id;
        //get user's tag
        var tag = username.user.tag;
        //get user's nickname
        var nickname;
        if(username.member.nickname === null) {
            nickname = "[not yet set]"
        } else {
            nickname = username.member.nickname;
        }
        //get user's avatar
        var avatar = username.user.avatar;
        //get user's joined date
        var joined = new Date(username.member.joinedTimestamp);

        const embed = new EmbedBuilder()
            .setTitle('User Info - ' + username.user.username)
            .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
            .setThumbnail('https://cdn.discordapp.com/avatars/'+username.value+'/'+avatar+'.png')
            .setDescription(
            '\nUsername: ' + tag +
            '\nNickname: ' + nickname + 
            '\nDiscord ID: ' + id +
            '\nJoined Server: ' + joined.toDateString())
            embed.setFooter({
                text: "Eggium - Tanner Approved"
            })
            .setTimestamp();
        interaction.reply({ embeds: [embed] });
    }
};