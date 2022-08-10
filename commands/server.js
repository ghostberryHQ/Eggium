const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu } = require('discord.js');
var myModule = require('../bot.js');
var con = myModule.con;
var selectType;
module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Replies with pong')
        .addSubcommand((subcommand) =>
            subcommand.setName("settings") 
            .setDescription("View and make changes to your Eggium based server settings")
            .addStringOption(option =>
                option.setName('type')
                    .setDescription('The type')
                    .addChoices({name: 'View', value: 'view'},{name: 'Change', value: 'change'},{name: 'Setup', value: 'setup'})
                    .setRequired(true))),
    async execute(interaction) {
        if(!interaction.member.permissions.has("ADMINISTRATOR")) return interaction.reply({content: "You do not have permission to use this command!", ephemeral: true});
        var channelsArr = [];
        const guild = interaction.guild
        let channels = await guild.channels.fetch()
        var channelRows;
        channels = channels.map((c) => {
            if(c.type === "GUILD_TEXT") {
                if(channelsArr.length != 25) {
                    var make;
                        console.log(`${(c.name).length} | ${c.name}`)
                        make = {label: `#${c.name}`,value: c.id}; 
                        channelsArr.push(make);
                }
            }
        })
        setTimeout(function() {
            channelRows = new MessageActionRow().addComponents(
                new MessageSelectMenu()
                    .setCustomId('selectChannel')
                    .setPlaceholder('Nothing selected')
                    .addOptions(channelsArr));
        }, 100)      
        if (interaction.options.getSubcommand() === "settings") {
            var option = interaction.options.getString('type');
            if(option === "view") {
                con.query("SELECT * FROM Servers WHERE serverID = '"+interaction.guild.id+"';", function (err, result, fields) {
                    if(result[0] === undefined || result[0] === null) return interaction.reply({content: "This server is not setup with Eggium Servers!", ephemeral: true});

                    var welcomeChannelIDInEmbed
                    var starboardChannelIDInEmbed
                    var welcomeRoleInEmbed
                    var welcomeMessageInEmbed
                    var shortenLinksInEmbed
                    var convertSongLinksInEmbed
                    if(result[0].welcomeChannel === 0) { welcomeChannelIDInEmbed = "Not setup" } else { welcomeChannelIDInEmbed = result[0].welcomeChannel };
                    if(result[0].welcomeRole === "(null)") { welcomeRoleInEmbed = "Not setup" } else { welcomeRoleInEmbed = result[0].welcomeRole };
                    if(result[0].starboardChannel === 0) { starboardChannelIDInEmbed = "Not setup" } else { starboardChannelIDInEmbed = result[0].starboardChannel };
                    if(result[0].welcomeMessage === "(null)") { welcomeMessageInEmbed = "Not setup" } else { welcomeMessageInEmbed = '"'+result[0].welcomeMessage+'"' };
                    if(result[0].shortenLinks === 0) { shortenLinksInEmbed = "Off" } else { shortenLinksInEmbed = "On" };
                    if(result[0].convertSongLinks === 0) { convertSongLinksInEmbed = "Off" } else { convertSongLinksInEmbed = "On" };


                    const embed = new MessageEmbed()
                    .setTitle(`Eggium Server Settings - ${interaction.guild.name}`)
                    .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                    .setDescription(
                      "Server ID: " + result[0].serverID +
                      "\nWelcome Channel ID: " + welcomeChannelIDInEmbed +
                      "\nWelcome Role: " + welcomeRoleInEmbed +
                      "\nWelcome Message: " + welcomeMessageInEmbed +
                      "\nStarboard Channel ID: " + starboardChannelIDInEmbed +
                      "\nShorten Links: " + shortenLinksInEmbed +
                      "\nConvert Song Links: " + convertSongLinksInEmbed
                    );
                  embed.setFooter({text: "Eggium - Tanner Approved"}).setTimestamp();
                  interaction.reply({ embeds: [embed], ephemeral: true });
                });
            }
            else if(option === "setup") {
                    con.query("SELECT * FROM Servers WHERE serverID = '"+interaction.guild.id+"';", function (err, result, fields) {
                        if(result[0] === undefined || result[0] === null) {
                            con.query('INSERT INTO Servers VALUES ("'+interaction.guild.id+'", "0", "(null)", "(null)", "0", "1", "1");');
                            const embed = new MessageEmbed()
                            .setTitle(`Eggium Server Settings - ${interaction.guild.name}`)
                            .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                            .setDescription('Congrats! Your server is now setup in Eggium Servers. Use "/server settings change" to change the settings!');
                          embed.setFooter({text: "Eggium - Tanner Approved"}).setTimestamp();
                          interaction.reply({ embeds: [embed], ephemeral: true });
                        }
                    });
            } else if(option === "change") {
                con.query("SELECT * FROM Servers WHERE serverID = '"+interaction.guild.id+"';", function (err, result, fields) {
                    if(result[0] === undefined || result[0] === null) return interaction.reply({content: "This server is not setup with Eggium Servers!", ephemeral: true});
                    var buttonTypeShortenLinks;
                    var buttonTypeUniversalSongLinks;
                    var buttonTypeStarboardChannel;
                    var buttonTypeWelcomeChannel;
                    if(result[0].shortenLinks === 0) {
                        buttonTypeShortenLinks = 'DANGER'
                    } else if(result[0].shortenLinks === 1) {
                        buttonTypeShortenLinks = 'SUCCESS'
                    }
                    if(result[0].convertSongLinks === 0) {
                        buttonTypeUniversalSongLinks = 'DANGER'
                    } else if(result[0].convertSongLinks === 1) {
                        buttonTypeUniversalSongLinks = 'SUCCESS'
                    }
                    if(result[0].starboardChannel === 0 || result[0].starboardChannel === "(null)" || result[0].starboardChannel === "0") {
                        buttonTypeStarboardChannel = 'DANGER'
                    } else {
                        buttonTypeStarboardChannel = 'SUCCESS'
                    }
                    if(result[0].welcomeChannel === 0 || result[0].welcomeChannel === "(null)" || result[0].welcomeChannel === "0") {
                        buttonTypeWelcomeChannel = 'DANGER'
                    } else {
                        buttonTypeWelcomeChannel = 'SUCCESS'
                    }
                    setTimeout(function() {
                        const row = new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setCustomId('shortenlinks')
                                .setLabel('Shorten Links')
                                .setStyle(buttonTypeShortenLinks),
                            new MessageButton()
                                .setCustomId('universalsonglinks')
                                .setLabel('Universal Song Links')
                                .setStyle(buttonTypeUniversalSongLinks),
                            new MessageButton()
                                .setCustomId('welcomeChannelButton')
                                .setLabel('Welcome Channel')
                                .setStyle(buttonTypeWelcomeChannel),
                            new MessageButton()
                                .setCustomId('starboardChannelButton')
                                .setLabel('Starboard Channel')
                                .setStyle(buttonTypeStarboardChannel),
                        );
                        interaction.reply({ content: 'Your server settings (if a setting is red, that means it is toggled off. Green indicates the setting is on. (some buttons may lead to more options))', components: [row], ephemeral: true });
                        const collector = interaction.channel.createMessageComponentCollector({
                            time: 20000,
                        });
                        collector.on('collect', async i => {
                            var buttonIdClicked = i.customId;
                            if(i.values != undefined) {
                                if(onlyNumbers(i.values[0]) && selectType === "welcome") {
                                    console.log(`Set welcome channel to ${i.values[0]}`)
                                    con.query('UPDATE Servers SET welcomeChannel = "'+i.values[0]+'" where serverID = "'+interaction.guild.id+'";');
                                    i.update({ content: `Set "Welcome Channel" to ${i.values[0]}`, components: [], ephemeral: true });
                                } else if(onlyNumbers(i.values[0]) && selectType === "starboard") {
                                    console.log(`Set starboard channel to ${i.values[0]}`)
                                    con.query('UPDATE Servers SET starboardChannel = "'+i.values[0]+'" where serverID = "'+interaction.guild.id+'";');
                                    i.update({ content: `Set "Starboard Channel" to ${i.values[0]}`, components: [], ephemeral: true });
                                }
                            }
                            if(buttonIdClicked === "universalsonglinks" && buttonTypeUniversalSongLinks === "SUCCESS") {
                                con.query('UPDATE Servers SET convertSongLinks = "0" where serverID = "'+interaction.guild.id+'";');
                                i.update({ content: `Set "Universal Song Links" to False`, components: [], ephemeral: true })
                            } else if(buttonIdClicked === "universalsonglinks" && buttonTypeUniversalSongLinks === "DANGER") {
                                con.query('UPDATE Servers SET convertSongLinks = "1" where serverID = "'+interaction.guild.id+'";');
                                i.update({ content: `Set "Universal Song Links" to True`, components: [], ephemeral: true })
                            }
                            if(buttonIdClicked === "shortenlinks" && buttonTypeShortenLinks === "SUCCESS") {
                                con.query('UPDATE Servers SET shortenLinks = "0" where serverID = "'+interaction.guild.id+'";');
                                i.update({ content: `Set "Shorten Links" to False`, components: [], ephemeral: true });
                            } else if(buttonIdClicked === "shortenlinks" && buttonTypeShortenLinks === "DANGER") {
                                con.query('UPDATE Servers SET shortenLinks = "1" where serverID = "'+interaction.guild.id+'";');
                                i.update({ content: `Set "Shorten Links" to True`, components: [], ephemeral: true });
                            } else if(buttonIdClicked === "welcomeChannelButton") {
                                selectType = "welcome";
                                console.log(channelsArr)
                                i.update({ content: `Please select the channel you'd like to set as your welcome channel`, components: [channelRows], ephemeral: true });
                            } else if(buttonIdClicked === "starboardChannelButton") {
                                selectType = "starboard";
                                i.update({ content: `Please select the channel you'd like to set as your starboard channel`, components: [channelRows], ephemeral: true });
                            }
                        });
                        collector.on('end', collected => console.log(`Collected ${collected.size} items`));
                    }, 100)
                });
            }
        } else {
            interaction.reply({ content: 'Error' , ephemeral: true});
        }
    }
}
function onlyNumbers(str) {
    return /^[0-9]+$/.test(str);
}