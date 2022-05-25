const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nickname')
        .setDescription("Sets user's nickname")
        .addUserOption(option =>
            option.setName('username')
                .setDescription('User to set nickname for')
                .setRequired(true))
        .addStringOption(option2 =>
            option2.setName('nickname')
                .setDescription('Nickname to set to user')
                .setRequired(true)),
    async execute(interaction) { 
        var nickname = interaction.options.getString("nickname")
        var username = interaction.options.get("username")
        var enabled = false

        if(enabled = false) {
            interaction.reply({ content: 'this command is currently out of order', ephemeral: true});
        } else if (enabled = true) {
            if(username == "") {
                username = interaction.author.username
                //message.guild.members.get(username).setNickname(nickname)
                //set nickname
                interaction.guild.members.get(username).setNickname(nickname)
                interaction.reply({ content: 'set your nickname to ' + nickname, ephemeral: true});
            } else {
                username = interaction.options.getString("user")
                interaction.guild.members.get(username).setNickname(nickname)
                interaction.reply({ content: 'set' + username + "'s " +'nickname to ' + nickname});
            }
        }
    }
};