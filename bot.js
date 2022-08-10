//setup Discord Js
const Discord = require('discord.js');
const client = new Discord.Client(({
    intents: [ 'GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS', 'GUILD_MESSAGE_REACTIONS', 'GUILD_PRESENCES', 'GUILD_VOICE_STATES'],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
}));
const config = require('./dev.json')
const token = config.token;
const guild_id = config.guild_id;
const { Collection, MessageEmbed } = require('discord.js');
const fs = require('fs');
const {REST} = require('@discordjs/rest');
const {Routes} = require('discord-api-types/v9');
const songlink =  require('songlink-api');
const SteamAPI = require('steamapi');
const steam = new SteamAPI(config.steamAPIKey);
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const commands = [];
var mysql = require('mysql');
var con = mysql.createConnection({
    host: config.AWS_RDS_ENDPOINT,
    user: config.AWS_RDS_USERNAME,
    password: config.AWS_RDS_PASSWORD,
    database: config.AWS_RDS_DB_NAME
});

const myApiKey = config.SONGLINK_API_KEY
const getLinks = songlink.getClient({ apiKey: myApiKey });
const { diff, addedDiff, deletedDiff, updatedDiff, detailedDiff } =  require('deep-object-diff');

exports.con = con;
setInterval(function () {
    con.query('SELECT 1');
}, 5000);


// Creating a collection for commands in client
client.commands = new Collection();

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
    client.commands.set(command.data.name, command);
}
client.on('interactionCreate', async interaction => {
    function onlyNumbers(str) {
        return /^[0-9]+$/.test(str);
    }

    if (interaction.isModalSubmit()) {
        console.log()
        // Get the data entered by the user
        const steamIdentifier = interaction.fields.getTextInputValue('steamIdentifier');
        console.log({ steamIdentifier });
        var dateObj = new Date();
        var month = dateObj.getUTCMonth() + 1; //months from 1-12
        var day = dateObj.getUTCDate();
        var year = dateObj.getUTCFullYear();
        var finalSteamID;
        var finalSteamName;

        if(onlyNumbers(steamIdentifier)) {
            console.log("only numbers")
            finalSteamID = steamIdentifier;
            steam.getUserSummary(steamIdentifier).then(summary => {
                console.log(summary);
                finalSteamName = summary.nickname;
            }).catch((reason) => {
                console.log(reason)
            });
        } else {
            console.log("not")
            steam.resolve('https://steamcommunity.com/id/'+steamIdentifier).then(id => {
                console.log(id)
                finalSteamID = id;
                finalSteamName = steamIdentifier;
            });
        }
        
        setTimeout(function () {
                var sql = "INSERT INTO Users (discordID, discordName, steamID, steamName, dateRegistered) VALUES ('"+String(interaction.user.id)+"','"+String(interaction.user.username)+"','"+String(finalSteamID)+"','"+String(finalSteamName)+"','"+String(year+"-"+month+"-"+day)+"')";
                con.query(sql, function (err, result) {
                  if (err) throw err;
                  console.log(`1 record inserted for ${interaction.user.username}`);
                  interaction.reply({ content: 'Your shiny & new Eggium profile was created successfully!', ephemeral: true });
                });
        }, 500)
    }

    if (!interaction.isCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
        await command.execute(interaction);
    } catch (error) {
        if (error) console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.on('messageReactionAdd', (reaction, user) => {
    if (reaction.emoji.name === '⭐') {
        const stars = reaction.count;
        const userWhoSend = reaction.message.author;
        if(stars === 5) {
            //make an embed
            const embed = new Discord.MessageEmbed()
            .setTitle('⭐ Starboard Message ⭐')
            .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
            .setThumbnail('https://cdn.discordapp.com/avatars/'+userWhoSend.id+'/'+userWhoSend.avatar+'.jpeg')
            .setDescription(`"${String(reaction.message.content)}" - ${userWhoSend.username}`)
            embed.setFooter({
                text: "Eggium - Tanner Approved"
            });
            con.query('select CAST(starboardChannel as CHAR) from Servers WHERE serverID = "'+reaction.message.guildId+'";', function (err, result, fields) {
                if(err) throw err;
                if(result === undefined || result === null || result.length === 0 || result[0]["CAST(starboardChannel as CHAR)"] === 0 || result[0]["CAST(starboardChannel as CHAR)"] === "0") {
                    console.log("no starboard channel set")
                } else {
                    client.channels.cache.get(result[0]["CAST(starboardChannel as CHAR)"]).send({ embeds: [embed] });
                }
            });
        }
        console.log('#' + stars + ' ⭐ reactions have been added');
    } else {
        console.log('a non-⭐ reaction has been added');
    }
});

client.on("messageCreate", async (message) => {
    if(message.author.bot) return;
    if(message.channel.type === "dm") return;
    // if(message.content.includes("morb")) {
    //     message.channel.send("Its morbin' time!\nhttps://cdn.discordapp.com/attachments/848538050233237594/977839127682744330/full-1.webm");
    // }

    if(message.content.includes("http")) {
        var doesWantURLShortened
        var doesWantUniversalMusicLinks
        let initUrl = message.content
        const matches = initUrl.match(/\bhttps?:\/\/\S+/gi);
        if(matches === null || matches === undefined) return;
        console.log(matches)
        var urlToShorten = matches[0];
        let url = new URL(matches);
        con.query('select * from Servers WHERE serverID = "'+message.guildId+'";', function (err, result, fields) {
            console.log(message.guildId)
            console.log(result[0])
            if(result === undefined || result === null || result.length === 0) return;
            doesWantURLShortened = result[0].shortenLinks;
            doesWantUniversalMusicLinks = result[0].convertSongLinks;
            console.log("set")
        });
        setTimeout(function() {
            if(urlToShorten.includes("spotify.com") && urlToShorten.includes("track")) {
                    console.log("Spotify link detected")
                    if(doesWantUniversalMusicLinks === 0) return;
                    getLinks({ url: urlToShorten })
                    .then(response => {
                        Object.entries(response.linksByPlatform)
                    message.channel.send("Your Spotify link is pretty limiting. Think about others.\nUniversal Link: "+response.pageUrl);
                })
            } else if(urlToShorten.includes("music.apple.com") && urlToShorten.includes("album")) {
                    console.log("Apple Music link detected")
                    if(doesWantUniversalMusicLinks === 0) return;
                    getLinks({ url: urlToShorten })
                    .then(response => {
                        Object.entries(response.linksByPlatform)
                    message.channel.send("Your Apple Music link is pretty limiting. Think about others.\nUniversal Link: "+response.pageUrl);
                })
            } else if(urlToShorten.includes("music.amazon.com") && urlToShorten.includes("albums")) {
                    console.log("Amazon Music link detected")
                    if(doesWantUniversalMusicLinks === 0) return;
                    getLinks({ url: urlToShorten })
                    .then(response => {
                        Object.entries(response.linksByPlatform)
                    message.channel.send("Your Amazon Music link is pretty limiting. Think about others.\nUniversal Link: "+response.pageUrl);
                })
            } else if(urlToShorten.includes("music.youtube.com") && urlToShorten.includes("watch")) {
                    console.log("Youtube Music link detected")
                    if(doesWantUniversalMusicLinks === 0) return;
                    getLinks({ url: urlToShorten })
                    .then(response => {
                        Object.entries(response.linksByPlatform)
                    message.channel.send("Your Youtube Music link is pretty limiting. Think about others.\nUniversal Link: "+response.pageUrl);
                })
            } else {
                if(doesWantURLShortened === 0) return;
                if(url.search == "") {
                    console.log("no need to shorten link")
                } else {
                    var shortenedLink = urlToShorten.replace(url.search,"");
                    message.channel.send("I attempted to shorten your link. Here you go!\n"+shortenedLink);
                    console.log("shortened")
                }
            }
        }, 300);

    }
})

client.on('guildMemberAdd', member => {
    con.query('select CAST(serverID as CHAR),CAST(welcomeChannel as CHAR),welcomeRole,welcomeMessage from Servers WHERE serverID = "'+member.guild.id+'";', function (err, result, fields) {
        if (err) throw err;
        if(result === undefined || result === null || result.length === 0) {
            console.log(`${member.guild.name} is not yet in the database`)
        } else {
            if(result[0].welcomeRole != "(null)") member.roles.add(member.guild.roles.cache.find(i => i.name === result[0].welcomeRole));
            if(result[0].welcomeMessage != "(null)") var constructWelcomeMessage = (result[0].welcomeMessage).replace("%user%", member.user.username);
            if(result[0]["CAST(welcomeChannel as CHAR)"] != "0" && result[0].welcomeMessage != "(null)") client.channels.cache.get(result[0]["CAST(welcomeChannel as CHAR)"]).send(constructWelcomeMessage.toString());
        }
    });
});

const TimeAgo =  require('javascript-time-ago');
const en =  require('javascript-time-ago/locale/en');

TimeAgo.addDefaultLocale(en)

const timeAgo = new TimeAgo('en-US')

var theFireTwicePatch = [];
var theFireTwicePatchMusic = [];


function theFireTwicePatcherGames(userID) {
    theFireTwicePatch.push(userID);
    setTimeout(function() {
        theFireTwicePatch = theFireTwicePatch.filter(item => item !== userID)
        //console.log("removed user from theFireTwicePatch")
    }, 1000);
}
function theFireTwicePatcherMusic(userID) {
    theFireTwicePatchMusic.push(userID);
    setTimeout(function() {
        theFireTwicePatchMusic = theFireTwicePatchMusic.filter(item => item !== userID)
        //console.log("removed user from theFireTwicePatchMusic")
    }, 1000);
}

client.on('presenceUpdate', (oldPresence, newPresence) => {
    if (!newPresence.activities) return false;
    for (let i = 0; i < newPresence.activities.length; i++) {
        if(newPresence.activities[i] != undefined && newPresence.activities[i].details != undefined && newPresence.activities[i].details != null && newPresence.activities[i].details.toLowerCase() === "idling") return;
        if(newPresence.activities[i] != undefined && newPresence.activities[i].state != undefined && newPresence.activities[i].state != null && newPresence.activities[i].state.toLowerCase() === "idling") return;
    }
    newPresence.activities.forEach((activity) => {
    if (activity.type == 'PLAYING' && activity.name != "Apple Music" && activity.name != "Cider") {
        if(newPresence.user.bot) return;
        if (theFireTwicePatch.includes(newPresence.user.id)){
            //console.log("user is on theFireTwicePatch cooldown")
            return;
        }
        theFireTwicePatcherGames(newPresence.user.id);
        if(activity.timestamps === null | activity.timestamps === undefined) {
            console.log("No defined start time | " + activity.name)
        } else {
            var timePlaying = timeAgo.format(new Date(activity.timestamps.start), 'mini');
            console.log(`${newPresence.user.tag} is ${activity.type} ${activity.name}. They've been playing for ${timePlaying} | in ${newPresence.guild.name}`);
            lastPresenceMessage = `${newPresence.user.tag} is ${activity.type} ${activity.name}. They've been playing for ${timePlaying}`
            con.query('select * from Quests WHERE gameName = '+"'"+activity.name+"'"+';', function (err, result, fields) {
                if(result === undefined || result === null || result.length === 0) {
                    console.log("No quest found for this activity")
                } else{
                    for (let i = 0; i < result.length; i++) {
                        if(result[i].requirementType === "time") {
                            if(timePlaying.includes("mo")) {
                                console.log("We suspect cheating")
                            } else {
                                if((timePlaying.includes("h") && result[i].fufillment.includes("h")) || (timePlaying.includes("m") && result[i].fufillment.includes("m")) || (timePlaying.includes("d") && result[i].fufillment.includes("d"))) {
                                    var checkerTimePlaying = parseInt(timePlaying.slice(0,-1));
                                    var checkerFufillment = parseInt((result[i].fufillment).slice(0,-1));
                                    if(checkerTimePlaying >= checkerFufillment) {
                                        var questinfo = result[i];
                                        con.query('select * from Users WHERE discordID = '+"'"+newPresence.user.id+"'"+';', function (err, result, fields) {
                                            if(result === undefined || result === null || result.length === 0) {
                                                console.log(`${newPresence.user.username} has completed a quest but doesnt have an Eggium profile`)
                                            } else {
                                                setTimeout(function() {
                                                    con.query('SELECT * FROM QuestHistory WHERE questID = '+'"'+questinfo.questID+'"'+' AND discordID = "'+newPresence.user.id+'";', function (err, result, fields) {
                                                        if(result === undefined || result === null || result.length === 0) {
                                                            console.log(`${newPresence.user.tag} has completed a new quest | ${questinfo.questName}`)
                                                            var dateObj = new Date();
                                                            var month = dateObj.getUTCMonth() + 1; //months from 1-12
                                                            var day = dateObj.getUTCDate();
                                                            var year = dateObj.getUTCFullYear();
                                                            var insertToQuestHistory = 'insert into QuestHistory(discordID,questID,dateRecieved) values ("'+newPresence.user.id+'","'+questinfo.questID+'","'+`${year}/${month}/${day}`+'");';
                                                            con.query(insertToQuestHistory, function (err, result) {
                                                                if (err) throw err;
                                                                console.log(`1 Quest inserted for ${newPresence.user.username}`);
                                                                client.users.fetch(newPresence.userId).then(user => {
                                                                    const embed = new MessageEmbed()
                                                                    .setTitle("Eggium Achievements - " + activity.name)
                                                                    .setColor("#" +((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                                                                    .setDescription(`You have completed the quest: ${questinfo.questName}`);
                                                                  embed
                                                                    .setFooter({text: "Eggium - Tanner Approved"})
                                                                    .setTimestamp();
                                                                    user.send({ embeds: [embed]})
                                                                });
                                                            });
                                                        } else {
                                                            //THEY ALREADY HAVE
                                                        }
                                                    });
                                                },1000)
                                            }
                                        });
                                    } else{
                                        //Didnt meet requirements
                                    }
                                }
                            }
                        }
                    }
                }
            });
        }
    } else if(activity.type == 'LISTENING' || activity.name == "Apple Music") {
        if(newPresence.user.bot) return;
        if (theFireTwicePatchMusic.includes(newPresence.user.id)) return;
        theFireTwicePatcherMusic(newPresence.user.id);
        //Checks if you are listening to Music
        if(activity.details == null) {} 
        else {
            //You are listening to music
            var songartist;
            var songname;
            if(activity.name == "Apple Music" || activity.name == "Cider") {
                songname = activity.details;
                songartist = activity.state.slice(3);
            } else {
                songname = activity.details;
                songartist = activity.state;
            }
            songname = songname.replaceAll('"', '')
            songartist = songartist.replaceAll('"', '')
            //Checks if you have an Eggium Profile
            con.query('select * from Users WHERE discordID = '+"'"+newPresence.user.id+"'"+';', function (err, result, fields) {
                if(result === undefined || result === null || result.length === 0) {
                    console.log(`${newPresence.user.tag} is listening to ${songname} by ${songartist} but has no Eggium Profile. They should opt in!`)
                } else {
                    //You have an Eggium Profile
                    console.log(`${newPresence.user.tag} is listening to ${songname} by ${songartist}`)
                    //Checks your listening History and [0] is your last song
                    con.query('SELECT * FROM ListeningHistory WHERE discordID = "'+newPresence.user.id+'" ORDER BY listenedTime DESC;', function (err, result, fields) {
                        var wasThisUsersLastSong;
                        //checks if you've listened before
                        if(result === undefined || result === null || result.length === 0) {
                            //you have not
                            console.log("User's first song ever")
                            wasThisUsersLastSong = false;
                        } else {
                            //you have! It checks the last song you listened to
                            con.query('SELECT * FROM Songs WHERE songID = '+ result[0].songID.toString()+';', function (err, result, fields) {
                                console.log(`${newPresence.user.tag} listened to ${result[0].songName} by ${result[0].songArtist} last`)
                                //checks if you're listening to the same song
                                if(result[0].songName == songname && result[0].songArtist == songartist) {
                                    //you are
                                    wasThisUsersLastSong = true;
                                } else{
                                    //you are not
                                    wasThisUsersLastSong = false;
                                }
                            });
                        }
                        //checks if this should log a new song
                        setTimeout(function() {
                            if(wasThisUsersLastSong === true) {
                                //nah. It's the same song. Probably just a presense update
                                console.log("This is a presence update. Likely not a new song.")
                            } else {
                                //it's a new song!
                                console.log("This is a viable song")
                                //Checks if the song is already in the database
                                con.query('SELECT * FROM Songs WHERE songName = "'+songname+'" AND songArtist = "'+songartist+'";', function (err, result, fields) {
                                    if(result === undefined || result === null || result.length === 0) {
                                        //it is not in the database
                                        console.log("Song is not in the database. Adding it")
                                        //insert song into database
                                        var sql = 'INSERT INTO Songs (songName, songArtist) VALUES ("'+songname+'","'+songartist+'");';
                                        con.query(sql, function (err, result) {
                                            if (err) throw err;
                                            console.log(`new song recorded for ${songname} by ${songartist}`);
                                            //added!
                                            //Now it checks again to see if the song is in the database
                                            con.query('SELECT * FROM Songs WHERE songName = "'+songname+'" AND songArtist = "'+songartist+'";', function (err, result, fields) {
                                                //Chances are. It 100% will be now. So it adds it to your Listening History
                                                var datetimePre = new Date();
                                                var datetime = new Date(datetimePre.getTime() - (datetimePre.getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace('T', ' ')
                                                var sql = 'INSERT INTO ListeningHistory (discordID, songID, listenedTime) VALUES ("'+String(newPresence.user.id)+'","'+String(result[0].songID)+'","'+String(datetime)+'");'
                                                con.query(sql, function (err, result) {
                                                if (err) throw err;
                                                //added!
                                                    console.log(`1 songHistory inserted for ${newPresence.user.username}`);
                                                });
                                            });
                                        });
                                    } else {
                                        console.log(`Song is in the database at ${result[0].songID}`)
                                        //It is in the database. And we know the ID!

                                        //So we'll just insert it into your listening history
                                        var datetimePre = new Date();
                                        var datetime = new Date(datetimePre.getTime() - (datetimePre.getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace('T', ' ')
                                        var sql = 'INSERT INTO ListeningHistory (discordID, songID, listenedTime) VALUES ("'+String(newPresence.user.id)+'","'+String(result[0].songID)+'","'+String(datetime)+'");'
                                        con.query(sql, function (err, result) {
                                        if (err) throw err;
                                        //did it!
                                        console.log(`1 songHistory inserted for ${newPresence.user.username}`);
                                        });
                                    }
                                });
                            }
                        }, 300);
                    });
                }
            });

        }
      }
    });
});

function handleDisconnect() {
    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
    });
    con.on("error", function(err) {
        console.log("db error", err);
        if (err.code === "PROTOCOL_CONNECTION_LOST") {
          handleDisconnect();
        } else {
          throw err;
        }
      });
}

client.once('ready', () => {
    console.log('The battle is now. Eggium Version: ' + config.eggium_version);
    // Registering the commands in the client

    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
    });
    con.on("error", function(err) {
        console.log("db error", err);
        if (err.code === "PROTOCOL_CONNECTION_LOST") {
          handleDisconnect();
        } else {
          throw err;
        }
      });

    const CLIENT_ID = client.user.id;
    const rest = new REST({
        version: '9'
    }).setToken(token);
    (async () => {
        try {
            if (!guild_id) {
                await rest.put(
                    Routes.applicationCommands(CLIENT_ID), {
                        body: commands
                    },
                );
                console.log('Successfully registered application commands globally');
            } else {
                await rest.put(
                    Routes.applicationGuildCommands(CLIENT_ID, guild_id), {
                        body: commands
                    },
                );
                console.log('Successfully registered application commands for development guild');
            }
        } catch (error) {
            if (error) console.error(error);
        }
    })();
});

client.login(token);