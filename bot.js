//setup Discord Js
const Discord = require('discord.js');
const play = require('play-dl');
const { Collection, EmbedBuilder, Client, GatewayIntentBits, Partials, InteractionType } = require('discord.js');
const client = new Client(({
    intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.MessageContent],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
}));
const config = require('./config.json')
const pjson = require('./package.json');
const token = config.token;
const guild_id = config.guild_id;
const fs = require('fs');
const {REST} = require('@discordjs/rest');
const {Routes} = require('discord-api-types/v9');
const songlink =  require('songlink-api');
const SteamAPI = require('steamapi');
const https = require('https');
const steam = new SteamAPI(config.steamAPIKey);
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const commands = [];
var mysql = require('mysql');

var conDetails = {
    host: config.SQL_ENDPOINT,
    user: config.SQL_USERNAME,
    password: config.SQL_PASSWORD,
    database: config.SQL_DB_NAME
};
var ghostConDetails = {
    host: config.SQL_ENDPOINT,
    user: config.SQL_USERNAME,
    password: config.SQL_PASSWORD,
    database: config.SQL_DB_NAME_GHOST
};
var con = mysql.createPool(conDetails);
var conGhost = mysql.createPool(ghostConDetails);

const getLinks = songlink.getClient({ apiKey: config.SONGLINK_API_KEY });
exports.con = con;
exports.conGhost = conGhost;
setInterval(function () {
    con.query('SELECT 1');
    conGhost.query('SELECT 1');
}, 5000);

function weight_random(arr, weight_field){
    
    if(arr == null || arr === undefined){
        return null;
    }
    const totals = [];
    let total = 0;
    for(let i=0;i<arr.length;i++){
        total += arr[i][weight_field];
        totals.push(total);
    }
    const rnd = Math.floor(Math.random() * total);
    let selected = arr[0];
    for(let i=0;i<totals.length;i++){
        if(totals[i] > rnd){
            selected = arr[i];
            break;
        }
    }
return selected;

}

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

    if (interaction.type === InteractionType.ModalSubmit) {
        // Get the data entered by the user
        console.log("Interaction Type " + interaction.customId)
        var dateObj = new Date();
        var month = dateObj.getUTCMonth() + 1; //months from 1-12
        var day = dateObj.getUTCDate();
        var year = dateObj.getUTCFullYear();

        if(interaction.customId == "profileCreation" || interaction.customId == "profileLinkingSteam"){
            const steamIdentifier = interaction.fields.getTextInputValue('steamIdentifier');
            console.log({ steamIdentifier });
            var finalSteamID;
            var finalSteamName;
    
            if(steamIdentifier === null || steamIdentifier.length === 0 || !steamIdentifier || steamIdentifier === "") {
                console.log("Not given")
                finalSteamID = 0;
                finalSteamName = "unknown";
            } else if(onlyNumbers(steamIdentifier)) {
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
                con.query(`SELECT * FROM Users WHERE discordID = ${interaction.user.id}`, function (err, result) {
                    console.log(finalSteamID + " | " + finalSteamName)
                    if(result.length === 0 || result[0] === undefined || result[0] === null) {
                        //doesnt have an account
                        console.log("doesnt have an account")
                        // var sql = "INSERT INTO Users (discordID, discordName, steamID, steamName, dateRegistered) VALUES ('"+String(interaction.user.id)+"','"+String(interaction.user.username)+"','"+String(finalSteamID)+"','"+String(finalSteamName)+"','"+String(year+"-"+month+"-"+day)+"')";
                        //var to remove the ' from the name
                        var discordName = interaction.user.username.replace(/'/g, "\\'");


                        var sql = `INSERT INTO Users (discordID, discordName, steamID, steamName, dateRegistered, placeCreated, xp) VALUES ('${String(interaction.user.id)}', '${String(discordName)}', '${String(finalSteamID)}', '${String(finalSteamName)}', '${String(year+"-"+month+"-"+day)}', 'discord', '0')`;
                        con.query(sql, function (err, result) {
                          if (err) throw err;
                          console.log(`1 record inserted for ${interaction.user.username}`);
                          interaction.reply({ content: 'Your shiny & new Eggium profile was created successfully!', ephemeral: true });
                        });
                    } else {
                        //has an account. Lets update it
                        console.log("has an account")
                        con.query(`UPDATE Users SET steamID = "${String(finalSteamID)}" WHERE discordID = "${String(interaction.user.id)}";`, function (err, result) {
                            if (err) throw err;
                            con.query(`UPDATE Users SET steamName = "${String(finalSteamName)}" WHERE discordID = "${String(interaction.user.id)}";`)
                            con.query(`UPDATE Users SET dateChanged = "${String(year+"-"+month+"-"+day)}" WHERE discordID = "${String(interaction.user.id)}";`)
                            console.log(`1 record updated for ${interaction.user.username}`);
                            interaction.reply({ content: 'Your Eggium profile has been updated successfully!', ephemeral: true });
                          });
                    }
                });
            }, 500)
        } else if(interaction.customId == "profileLinkingSchoology") {
            interaction.reply({ content: 'Schoology Linking is not yet supported!', ephemeral: true });
        }
        else if(interaction.customId == "profileLinkingGhost") {
            interaction.reply({ content: 'Linking your profile to a ghost is not yet supported!', ephemeral: true });
        } else if(interaction.customId == "petNaming") {

            const weighted_rarity =  [
                {"w" : 20, "name" : "uncommon"},
                {"w" : 80, "name" : "common"},
            ]

            var petRarity = weight_random(weighted_rarity, "w");
            const request = https.get(`https://api.persn.dev/eggium/getPetSeeds/${petRarity}`, (response) => {
                response.setEncoding('utf8');
                let body = '';
                response.on('data', (chunk) => {
                    body += chunk;
                });
                response.on('end', () => {
                    const data = JSON.parse(body);
                    const amount = data.seedsAvailable;

                    //random number between 1 and amount
                    var random = Math.floor(Math.random() * amount);
                    if(random === 0) random++;

                    const petName = interaction.fields.getTextInputValue('petname');
                    var today = new Date();
                    today.toLocaleString('en-US', { timeZone: 'America/New_York' });
                    var dateToSet = today.getFullYear() + '-' +
                        ('00' + (today.getMonth()+1)).slice(-2) + '-' +
                        ('00' + today.getDate()).slice(-2) + ' ' + 
                        ('00' + today.getHours()).slice(-2) + ':' + 
                        ('00' + today.getMinutes()).slice(-2) + ':' + 
                        ('00' + today.getSeconds()).slice(-2);
                    console.log(random)
                    con.query(`INSERT INTO Pets (ownerID, name, rarity, dateRecieved, originalOwner, seed) VALUES ("${String(interaction.user.id)}", "${String(petName)}", "${String(petRarity.name)}", "${dateToSet}", "${String(interaction.user.id)}", ${String(random)})`, function (err, result, fields) {
                        if( err ) throw err;
                        interaction.reply("You have successfully claimed your free beta pet! Check it out with `/pet view`");
                        console.log(`Pet added named ${petName}`)
                    });
                });
            });

        }else {
            console.log("Unknown interaction type");
            interaction.reply({ content: 'An Unknown error occured when trying this command. Please join the Eggium discord and report it', ephemeral: true });
        }
    }

    if (!interaction.type === InteractionType.ApplicationCommand) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
        await command.execute(interaction);
    } catch (error) {
        if (error) console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

process.on('exit', function(code) {
    var thingsToSay = [
        "I'm going to sleep now",
        "This is a massive L",
        "This wasnt supposed to happen",
        "This is an L honestly"
    ]
    //pick a random thing to say
    var randomThing = thingsToSay[Math.floor(Math.random() * thingsToSay.length)];
    //send a message to user
    client.users.fetch("202109343678726144").then(user => {
        const exampleEmbed = new EmbedBuilder()
        .setColor("#" +((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
        .setTitle(`${randomThing}`)
        .setDescription(`Eggium crashed! \n\nExited with Code: ${code}`)
        .setTimestamp()
        .setFooter({ text: 'Eggium Crash Alert' });
        user.send({ embeds: [exampleEmbed] });

    })
    return console.log(`${randomThing}\nExited with code: ${code}`);
});

client.on('messageReactionAdd', (reaction, user) => {
    if (reaction.emoji.name === '⭐') {
        const stars = reaction.count;
        const userWhoSend = reaction.message.author;
        if(stars === 5) {
            //make an embed
            const embed = new Discord.EmbedBuilder()
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
    if(message.channel.type === "DM") return;
    // if(message.content.includes("morb")) {
    //     message.channel.send("Its morbin' time!\nhttps://cdn.discordapp.com/attachments/848538050233237594/977839127682744330/full-1.webm");
    // }

    if(message.content === "$*&BurnOracleToTheGround" && message.author.id === "202109343678726144") {
        client.users.fetch("202109343678726144").then(user => {
            user.send(":fire: :fire: :fire: :fire: :fire_engine:");
            setTimeout(process.exit(1), 2000)
        });
    }

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

                var urlBlackList = [
                    "google.com",
                    "youtube.com",
                    "customuse.com",
                    "googleapis.com",
                    "arrests.org",
                    "discord.com",
                    "spotify.com",
                    "skribbl.io"
                ]

                if(doesWantURLShortened === 0) return;
                console.log(url.host)
                if(urlBlackList.includes(url.host)) return;

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
            try {
                if(result[0].welcomeRole != "(null)") member.roles.add(member.guild.roles.cache.find(i => i.name === result[0].welcomeRole));
            } catch {
                console.log(`Role "${result[0].welcomeRole}" not found for server "${member.guild.name}"`)
            }
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
    if (activity.type == 0 && activity.name != "Apple Music" && activity.name != "Cider") {
        if(newPresence.user.bot) return;
        if (theFireTwicePatch.includes(newPresence.user.id)){
            //console.log("user is on theFireTwicePatch cooldown")
            return;
        }
        theFireTwicePatcherGames(newPresence.user.id);
        if(activity.timestamps === null | activity.timestamps === undefined) {
            console.log("No defined start time | " + activity.name)
        } else {
            var activityTypeFixerUpper;
            if(activity.type === 0) activityTypeFixerUpper="PLAYING";
            if(activity.type === 1) activityTypeFixerUpper="STREAMING";
            if(activity.type === 2) activityTypeFixerUpper="LISTENING";
            if(activity.type === 3) activityTypeFixerUpper="WATCHING";
            if(activity.type === 4) activityTypeFixerUpper="CUSTOM";
            if(activity.type === 5) activityTypeFixerUpper="COMPETING";
            var timePlaying = timeAgo.format(new Date(activity.timestamps.start), 'mini');
            console.log(`${newPresence.user.tag} is ${activityTypeFixerUpper} ${activity.name}. They've been playing for ${timePlaying} | in ${newPresence.guild.name}`);
            lastPresenceMessage = `${newPresence.user.tag} is ${activityTypeFixerUpper} ${activity.name}. They've been playing for ${timePlaying}`
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
                                                                    const embed = new EmbedBuilder()
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
    } else if(activity.type == 2 || activity.name == "Apple Music" || activity.name == "Cider") {
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
                                con.query(`SELECT * FROM Songs WHERE songName = "${songname}" AND songArtist = "${songartist}";`, function (err, result, fields) {
                                    if(result === undefined || result === null || result.length === 0) {
                                        //it is not in the database
                                        console.log("Song is not in the database. Adding it")
                                        //insert song into database
                                        var date = new Date();
                                        date.toLocaleString('en-US', { timeZone: 'America/New_York' });
                                        var sql = `INSERT INTO Songs (songName, songArtist, dateAdded) VALUES ("${songname}","${songartist}", "${date.toISOString().slice(0, 19).replace('T', ' ')}");`;
                                        con.query(sql, function (err, result) {
                                            if (err) throw err;
                                            console.log(`new song recorded for ${songname} by ${songartist}`);
                                            //added!
                                            //Now it checks again to see if the song is in the database
                                            con.query(`SELECT * FROM Songs WHERE songName = "${songname}" AND songArtist = "${songartist}";`, function (err, result, fields) {
                                                //Chances are. It 100% will be now. So it adds it to your Listening History
                                                var datetimePre = new Date();
                                                var datetime = new Date(datetimePre.getTime() - (datetimePre.getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace('T', ' ')
                                                var sql = `INSERT INTO ListeningHistory (discordID, songID, listenedTime) VALUES ("${newPresence.user.id}","${result[0].songID}","${String(datetime)}");`;
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
                                        var sql = `INSERT INTO ListeningHistory (discordID, songID, listenedTime) VALUES ("${newPresence.user.id}","${result[0].songID}","${String(datetime)}");`;
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

function setEggiumsActivity(){
    client.user.setActivity(`with ${client.guilds.cache.size} different servers`)
    setTimeout(setEggiumsActivity, 5000);
}

// function handleAnyDisconnect() {
//     con = mysql.createPool(conDetails)
//     con.connect(function(err) {
//         if (err) {
//             setTimeout(handleAnyDisconnect, 2000)
//         } else {1
//             //get the current time
//             var datetimePre = new Date();
//             var datetime = new Date(datetimePre.getTime() - (datetimePre.getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace('T', ' ')

//             console.log(`Connected! at: ${datetime}`);
//         }
//     });

//     con.on('error', function(err) {
//         console.log('db error', err);
//         if(err.code === 'PROTOCOL_CONNECTION_LOST') {
//             setTimeout(handleAnyDisconnect, 2000)
//         } else {
//           throw err;
//         }
//     });
// }

client.once('ready', () => {
    console.log('The battle is now.');
    console.log(`Eggium Version: ${config.eggium_version} | Discord.js Version ${pjson.dependencies["discord.js"]}`)
    setEggiumsActivity();
    //handleAnyDisconnect();

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

play.setToken({ spotify : {
    client_id: config.SPOTIFY_CLIENT_ID,
    client_secret: config.SPOTIFY_CLIENT_SECRET,
    refresh_token: config.SPOTIFY_CLIENT_REFRESH,
    market: 'US'
} })
client.login(token);