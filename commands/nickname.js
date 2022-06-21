const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nickname')
        .setDescription("Sets user's nickname")
        .addStringOption(option2 =>
            option2.setName('nickname')
                .setDescription('Nickname to set to user')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('username')
                .setDescription('User to set nickname for')
                .setRequired(false)),
    async execute(interaction) { 
        if(!interaction.member.permissions.has("ADMINISTRATOR")) return interaction.reply({content: "You do not have permission to use this command!", ephemeral: true});
        var nickname = interaction.options.getString("nickname")
        var username;
        if(interaction.options.getUser("username") === undefined || interaction.options.getUser("username") === null) {
            username = interaction.user;
        } else {
            username = interaction.options.getUser("username");
        }
        if (username.id === interaction.guild.ownerId) return interaction.reply({content: "I can't change the owner's nickname.", ephemeral: true});
        interaction.guild.members.cache.get(username.id).setNickname(nickname)
        interaction.reply({ content: `set ${username.username}'s nickname to ${nickname}`, ephemeral: true});
    }
};