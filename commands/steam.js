const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const SteamAPI = require('steamapi');
const config = require('../config.json');
const steam = new SteamAPI(config.steamAPIKey);
var myModule = require('../bot.js');

var con = myModule.con;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('steam')
        .setDescription('Links you to the source code for Eggium')
        .addStringOption(option =>
            option.setName('data')
                .setDescription('The type of data you would like to recieve')
                .addChoices({name: 'Recently Played',  value: 'recentlyplayed'}, {name: 'User Info',  value: 'userinfo'})
                .setRequired(true))
        .addUserOption((option) =>
            option.setName("username")
            .setDescription("The user (Must have Eggium Profile)").setRequired(true)),
    async execute(interaction) {
        var dataType = interaction.options.getString("data");
        var user = interaction.options.getUser("username");
        if(dataType == 'recentlyplayed') {
                //Input is a steam id
            con.query("SELECT CAST(steamID as CHAR) FROM Users WHERE discordID = " + user.id + ";", function (err, result, fields) {
                if(result === undefined || result === null || result.length === 0) {
                    const embed = new MessageEmbed()
                    .setTitle('Recently Played for - ' + user.username)
                    .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
                    .setDescription('It looks like the user you are looking for does not have an Eggium Profile. Please encourage them to make one!');
                    embed.setFooter({text: "Eggium - Tanner Approved"})
                    .setTimestamp();
                    interaction.reply({ embeds: [embed] , ephemeral: true});
                } else {
                    console.log("STEAM ID: "+ result[0]["CAST(steamID as CHAR)"]);
                    steam.getUserRecentGames(result[0]["CAST(steamID as CHAR)"]).then(games => {
                        var mostRecentlyPlayedGame = games[0]
                        console.log(mostRecentlyPlayedGame);
                        let minToHm = (m) => {
                            let h = Math.floor(m / 60);
                            h += (h < 0) ? 1 : 0;
                            let m2 = Math.abs(m % 60);
                            m2 = (m2 < 10) ? '0' + m2 : m2;
                            return (h < 0 ? '' : '') + h + ':' + m2;
                        }
                        steam.getUserSummary(result[0]["CAST(steamID as CHAR)"]).then(summary => {
                            console.log(games)
                            const embed = new MessageEmbed()
                            .setTitle('Recently Played for - ' + summary.nickname)
                            .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
                            .setThumbnail(mostRecentlyPlayedGame.iconURL)
                            .setDescription('Most Recently Played Game: ' + mostRecentlyPlayedGame.name + '\nPlay Time: ' + minToHm(mostRecentlyPlayedGame.playTime))
                            embed.setFooter({text: "Eggium - Tanner Approved"})
                            .setTimestamp();
                            //send embed
                            interaction.reply({ embeds: [embed] , ephemeral: true});
                        }).catch((reason) => {
                            console.log(reason)
                        });
    
                    }).catch((reason) => {
                        console.log(reason)
                    });

                }
            });
        } else if (dataType == 'userinfo') {
            con.query("SELECT CAST(steamID as CHAR) FROM Users WHERE discordID = " + user.id + ";", function (err, result, fields) {
                if(result === undefined || result === null || result.length === 0) {
                    const embed = new MessageEmbed()
                    .setTitle('Recently Played for - ' + user.username)
                    .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
                    .setDescription('It looks like the user you are looking for does not have an Eggium Profile. Please encourage them to make one!');
                    embed.setFooter({text: "Eggium - Tanner Approved"})
                    .setTimestamp();
                    interaction.reply({ embeds: [embed] , ephemeral: true});
                } else {
                    var steamLevel;
                    var steamBans;
                    var steamGames;
                    var steamSummary;
                    steam.getUserLevel(result[0]["CAST(steamID as CHAR)"]).then(level => { steamLevel = level;});
                    steam.getUserBans(result[0]["CAST(steamID as CHAR)"]).then(bans => {steamBans = bans;});
                    steam.getUserOwnedGames(result[0]["CAST(steamID as CHAR)"]).then(games => {steamGames = games});
                    steam.getUserSummary(result[0]["CAST(steamID as CHAR)"]).then(summary => {steamSummary = summary;});
                    setTimeout(function() {
                        const embed = new MessageEmbed()
                            .setTitle(`Recently Played for - ${steamSummary.nickname}`)
                            .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
                            .setDescription(`Level: ${steamLevel}\nVAC Bans: ${steamBans.vacBans} | Game Bans: ${steamBans.gameBans}\nGames Owned: ${steamGames.length}`)
                            .setFooter({text: "Eggium - Tanner Approved"})
                            .setTimestamp();
                        //send embed
                        interaction.reply({ embeds: [embed] , ephemeral: true});
                    }, 300);
                }
            });
        }
    }
};