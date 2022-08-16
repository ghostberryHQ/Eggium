const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('General Help Command'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('Help Command')
            .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
            // .setDescription(data.description)
            .addFields(
                { name: 'Profile :man_technologist:', value: '`/profile`', inline: false },
                { name: 'Music :musical_note:', value: '`/music`', inline: false },
                { name: 'Utility :wrench:', value: '`/avatar`, `/nickname`, `/userinfo`, `/server`, `/steal`', inline: false },
                { name: 'Bot Info :robot:', value: '`/ping`, `/uptime`, `/source`', inline: false },
                { name: 'Fun :partying_face:', value: '`/detect`, `/pet`, `/pokedex`, `/randomwaifu`, `/sitelook`, `/suntzu`, `/tannercoin`', inline: false },
                { name: 'Video Game :video_game: ', value: '`/achievements`, `/steam`, `/deals`', inline: false },
                { name: 'Bot Info', value: '[Support Server](https://discord.gg/invite/YdaBd7xmuD) | [Bot Invite Link](https://discord.com/oauth2/authorize?client_id=972256916506025984&scope=bot&permissions=8) | [Bot Website](https://eggium.net) | [Top.gg Page](https://top.gg/bot/972256916506025984)', inline: false },
            )
            .setFooter({text: "Eggium - Tanner Approved"})
            .setTimestamp();
        //send embed
        interaction.reply({ embeds: [embed] });
    }
};