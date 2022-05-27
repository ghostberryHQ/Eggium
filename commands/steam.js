const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const SteamAPI = require('steamapi');
const config = require('../config.json');
const steam = new SteamAPI(config.steamAPIKey);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('steam')
        .setDescription('Links you to the source code for Eggium')
        .addStringOption(option =>
            option.setName('data')
                .setDescription('The type of data you would like to recieve')
                .addChoices({
                    name: 'Recently Played', 
                    value: 'recentlyplayed',
                })
                .setRequired(true))
        .addStringOption(option =>
            option.setName('username')
                .setDescription('Steam username/id')
                .setRequired(true)),
    async execute(interaction) {
        var steamName = interaction.options.getString("username");
        var dataType = interaction.options.getString("data");
        if(dataType == 'recentlyplayed') {
            function onlyNumbers(str) {
                return /^[0-9]+$/.test(str);
            }
            if(onlyNumbers(steamName)) {
                    console.log("STEAM ID: "+ steamName)
                    steam.getUserRecentGames(steamName).then(games => {
                        var mostRecentlyPlayedGame = games[0]
                        console.log(mostRecentlyPlayedGame);
    
                        let minToHm = (m) => {
                            let h = Math.floor(m / 60);
                            h += (h < 0) ? 1 : 0;
                            let m2 = Math.abs(m % 60);
                            m2 = (m2 < 10) ? '0' + m2 : m2;
                            return (h < 0 ? '' : '') + h + ':' + m2;
                        }

                        steam.getUserSummary(steamName).then(summary => {
                            console.log(summary);
                            const embed = new MessageEmbed()
                            .setTitle('Recently Played for - ' + summary.nickname)
                            .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
                            .setThumbnail(mostRecentlyPlayedGame.iconURL)
                            .setDescription('Most Recently Played Game: ' + mostRecentlyPlayedGame.name + '\nPlay Time: ' + minToHm(mostRecentlyPlayedGame.playTime))
                            embed.setFooter({
                                text: "Eggium - Tanner Approved"
                            })
                            .setTimestamp();
                            //send embed
                            interaction.reply({ embeds: [embed] , ephemeral: true});
                        });
    
                    });
            } else {
                steam.resolve('https://steamcommunity.com/id/'+steamName).then(id => {
                    console.log("STEAM ID: "+id)
                    steam.getUserRecentGames(id).then(games => {
                        var mostRecentlyPlayedGame = games[0]
                        console.log(mostRecentlyPlayedGame);
    
                        let minToHm = (m) => {
                            let h = Math.floor(m / 60);
                            h += (h < 0) ? 1 : 0;
                            let m2 = Math.abs(m % 60);
                            m2 = (m2 < 10) ? '0' + m2 : m2;
                            return (h < 0 ? '' : '') + h + ':' + m2;
                        }
    
    

                        steam.getUserSummary(id).then(summary => {
                            const embed = new MessageEmbed()
                            .setTitle('Recently Played for - ' + summary.nickname)
                            .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
                            .setThumbnail(mostRecentlyPlayedGame.iconURL)
                            .setDescription('Most Recently Played Game: ' + mostRecentlyPlayedGame.name + '\nPlay Time: ' + minToHm(mostRecentlyPlayedGame.playTime))
                            embed.setFooter({
                                text: "Eggium - Tanner Approved"
                            })
                            .setTimestamp();
                            //send embed
                            interaction.reply({ embeds: [embed] , ephemeral: true});
                        });
                    });
                });
            }
        }
    }
};