//setup Discord Js
const Discord = require('discord.js');
const client = new Discord.Client(({
    intents: [ 'GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS', 'GUILD_MESSAGE_REACTIONS', 'GUILD_PRESENCES', 'GUILD_VOICE_STATES'],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
}));
const config = require('./config.json')
const users = require('./user.json')
const quests = require('./quests.json')
const token = config.token;
const guild_id = config.guild_id;
const { Collection } = require('discord.js');
const fs = require('fs');
const {REST} = require('@discordjs/rest');
const {Routes} = require('discord-api-types/v9');
const songlink =  require('songlink-api');
const SteamAPI = require('steamapi');
const steam = new SteamAPI(config.steamAPIKey);
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const commands = [];

const myApiKey = config.SONGLINK_API_KEY
const getLinks = songlink.getClient({ apiKey: myApiKey });

module.exports = client


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
        console.log(users.users);
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
                beforeSteamName=summary.url;
                finalSteamName = beforeSteamName.slice(30, -1);
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
            fs.readFile('user.json','utf8',function (err, data) {
                if(err) console.log(err);
                var test1 = JSON.parse(data);
                test1.users[interaction.user.id] = {
                    "discordUsername": interaction.user.username,
                    "steamID": finalSteamID,
                    "steamName": finalSteamName,
                    "dateRegistered": month + "/" + day + "/" + year
                }
                //console.log(test1);
                fs.writeFileSync('user.json',JSON.stringify(test1))
                console.log(JSON.stringify(test1))
            });
            //users.users.push(userData)
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
        //console.log(userWhoSend);
        //console.log(userWhoSend.id);
        //console.log(userWhoSend.avatar);
        if(stars === 5) {
            //make an embed
            const embed = new Discord.MessageEmbed()
            .setTitle('⭐ Starboard Message ⭐')
            .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
            .setThumbnail('https://cdn.discordapp.com/avatars/'+userWhoSend.id+'/'+userWhoSend.avatar+'.jpeg')
            .setDescription(String(reaction.message.content) + " -"+userWhoSend.username)
            embed.setFooter({
                text: "Eggium - Tanner Approved"
            });
            client.channels.cache.get(config.starboard_id).send({ embeds: [embed] });
        }
        console.log('#' + stars + ' ⭐ reactions have been added');
    } else {
        console.log('a non-⭐ reaction has been added');
    }
});

client.on("messageCreate", async (message) => {
    if(message.author.bot) return;
    if(message.channel.type === "dm") return;

    //console.log(message.content)

    if(message.content.includes("morb")) {
        message.channel.send("Its morbin' time!\nhttps://cdn.discordapp.com/attachments/848538050233237594/977839127682744330/full-1.webm");
    }

    if(message.content.includes("http")) {

        let initUrl = message.content
        
        const matches = initUrl.match(/\bhttps?:\/\/\S+/gi);
        if(matches === null || matches === undefined) return;
        console.log(matches)
        var urlToShorten = matches[0];
        let url = new URL(matches);

        if(urlToShorten.includes("spotify.com") && urlToShorten.includes("track")) {
                console.log("Spotify link detected")
                getLinks({ url: urlToShorten })
                .then(response => {
                    Object.entries(response.linksByPlatform)
                message.channel.send("Your Spotify link is pretty limiting. Think about others.\nUniversal Link: "+response.pageUrl);
            })
        } else if(urlToShorten.includes("music.apple.com") && urlToShorten.includes("album")) {
                console.log("Apple Music link detected")
                getLinks({ url: urlToShorten })
                .then(response => {
                    Object.entries(response.linksByPlatform)
                message.channel.send("Your Apple Music link is pretty limiting. Think about others.\nUniversal Link: "+response.pageUrl);
            })
        } else if(urlToShorten.includes("music.amazon.com") && urlToShorten.includes("albums")) {
                console.log("Amazon Music link detected")
                getLinks({ url: urlToShorten })
                .then(response => {
                    Object.entries(response.linksByPlatform)
                message.channel.send("Your Amazon Music link is pretty limiting. Think about others.\nUniversal Link: "+response.pageUrl);
            })
        } else if(urlToShorten.includes("music.youtube.com") && urlToShorten.includes("watch")) {
                console.log("Youtube Music link detected")
                getLinks({ url: urlToShorten })
                .then(response => {
                    Object.entries(response.linksByPlatform)
                message.channel.send("Your Youtube Music link is pretty limiting. Think about others.\nUniversal Link: "+response.pageUrl);
            })
        } else {
            if(url.search == "") {
                console.log("no need to shorten link")
            } else {
                var shortenedLink = urlToShorten.replace(url.search,"");
                message.channel.send("I attempted to shorten your link. Here you go!\n"+shortenedLink);
            }
        }

    }
})

client.on('guildMemberAdd', member => {
    member.roles.add(member.guild.roles.cache.find(i => i.name === 'movers'))
    console.log(member)
    client.channels.cache.get('962888183362764861').send("Welcome to the resistance, " + member.user.username + ". Glad you could join us.");
});

const TimeAgo =  require('javascript-time-ago');
const en =  require('javascript-time-ago/locale/en');
const { builtinModules } = require('module');

TimeAgo.addDefaultLocale(en)

const timeAgo = new TimeAgo('en-US')

client.on('presenceUpdate', (oldPresence, newPresence) => {
    if (!newPresence.activities) return false;
    newPresence.activities.forEach((activity) => {
        if (activity.type == 'PLAYING') {
            if(activity.timestamps === null | activity.timestamps === undefined) {
                console.log("No defined start time | " + activity.name)
            } else {
                var timePlaying = timeAgo.format(new Date(activity.timestamps.start), 'mini');
                //console.log(quests.quests[activity.name])
                console.log(`${newPresence.user.tag} is ${activity.type} ${activity.name}. They've playing for ${timePlaying}`);
                if(quests.quests[activity.name] === undefined || quests.quests[activity.name] === null) {
                    console.log("No quest found for this activity")
                } else {
                    for (let i = 0; i < quests.quests[activity.name].length; i++) {
                        if(quests.quests[activity.name][i].RequirementType == 'time') {
                            if(timePlaying.includes("mo")) {
                                console.log("We suspect cheating.")
                            } else {
                                //if has been playing for hours AND the quest requires hours
                                if(timePlaying.includes("h") && quests.quests[activity.name][i].fufillment.includes("h")) {
                                    var checkerTimePlaying = parseInt(timePlaying.slice(0,-1));
                                    var checkerFufillment = parseInt((quests.quests[activity.name][i].fufillment).slice(0,-1));
                                    console.log(checkerTimePlaying + " | " + checkerFufillment)
                                    if(checkerTimePlaying >= checkerFufillment) {
                                        console.log(`${newPresence.user.tag} met requirements for ${quests.quests[activity.name][i].Title}`)
                                        var userDatabasePRE = fs.readFileSync('./user.json','utf8');
                                        var userDatabase = JSON.parse(userDatabasePRE);
                                        var count = Object.keys(userDatabase.users).length;
                                        for (let p = 0; p < count; p++) {
                                            var up = Object.keys(userDatabase.users)[p];
                                            if(up === newPresence.user.id) {
                                                console.log(newPresence.user.username + " has an Eggium Profile & Has completed a quest! at: " + p)
                                                var dateObj = new Date();
                                                var month = dateObj.getUTCMonth() + 1; //months from 1-12
                                                var day = dateObj.getUTCDate();
                                                var year = dateObj.getUTCFullYear();
                                                var achievement = {
                                                        "achievementName": quests.quests[activity.name][i].Title,
                                                        "achievementDescription": quests.quests[activity.name][i].Description,
                                                        "achievementDate": `${month}/${day}/${year}`
                                                }
                                                console.log(userDatabase.users[p].achievements)
                                                console.log(achievement)
                                                //SEND USER DM
                                                console.log(newPresence.userId)
                                                client.users.fetch(newPresence.userId).then(user => {
                                                    user.send(`You have completed the quest: ${quests.quests[activity.name][i].Title}`)
                                                });
                                                userDatabase.users[up].achievements.push(achievement)
                                                console.log(userDatabase.users[up].achievements)
                                                fs.writeFileSync('user.json',JSON.stringify(userDatabase))
                                                console.log(JSON.stringify(userDatabase))
                                                // newPresence.guild.members.cache.get
                                            } else {
                                                console.log(newPresence.user.username + " doesnt have an Eggium Profile at: " + p)
                                            }
                                            
                                        }
                                    } else {
                                        console.log(`${newPresence.user.tag} did not meet requirements for ${quests.quests[activity.name][i].Title} | Looking for hours`)
                                    }
                                }
                                //if has been playing for hours AND the quest requires hours
                                if(timePlaying.includes("m") && quests.quests[activity.name][i].fufillment.includes("m")) {
                                    var checkerTimePlaying = parseInt(timePlaying.slice(0,-1));
                                    var checkerFufillment = parseInt((quests.quests[activity.name][i].fufillment).slice(0,-1));
                                    console.log(checkerTimePlaying + " | " + checkerFufillment)
                                    if(checkerTimePlaying >= checkerFufillment) {
                                        console.log(`${newPresence.user.tag} met requirements for ${quests.quests[activity.name][i].Title}`)
                                        var userDatabasePRE = fs.readFileSync('./user.json','utf8');
                                        var userDatabase = JSON.parse(userDatabasePRE);
                                        var count = Object.keys(userDatabase.users).length;
                                        for (let p = 0; p < count; p++) {
                                            var up = Object.keys(userDatabase.users)[p];
                                            if(up === newPresence.user.id) {
                                                console.log(newPresence.user.username + " has an Eggium Profile & Has completed a quest! at: " + p)
                                                //console.log(userDatabase.users[up].achievements)
                                                console.log(userDatabase.users[up].achievements.length)
                                                if(userDatabase.users[up].achievements.some(e => e.achievementName === quests.quests[activity.name][i].Title)) {
                                                    console.log(`${newPresence.user.tag} already has ${quests.quests[activity.name][i].Title}. They completed this quest on ${userDatabase.users[up].achievements[userDatabase.users[up].achievements.findIndex(e => e.achievementName === quests.quests[activity.name][i].Title)].achievementDate}`)
                                                } else {
                                                    var dateObj = new Date();
                                                    var month = dateObj.getUTCMonth() + 1; //months from 1-12
                                                    var day = dateObj.getUTCDate();
                                                    var year = dateObj.getUTCFullYear();
                                                    var achievement = {
                                                        "achievementName": quests.quests[activity.name][i].Title,
                                                        "achievementDescription": quests.quests[activity.name][i].Description,
                                                        "achievementDate": `${month}/${day}/${year}`
                                                    }
                                                    console.log(achievement)
                                                    console.log(newPresence.userId)
                                                    client.users.fetch(newPresence.userId).then(user => {
                                                        user.send(`You have completed the quest: ${quests.quests[activity.name][i].Title}`)
                                                    });
                                                    userDatabase.users[up].achievements.push(achievement)
                                                    console.log(userDatabase.users[up].achievements)
                                                    fs.writeFileSync('user.json',JSON.stringify(userDatabase))
                                                    console.log(JSON.stringify(userDatabase))
                                                }
                                            } else {
                                                console.log(newPresence.user.username + " doesnt have an Eggium Profile at: " + p)
                                            }
                                            
                                        }
                                    } else {
                                        console.log(`${newPresence.user.tag} did not meet requirements for ${quests.quests[activity.name][i].Title} | Looking for minutes`)
                                    }
                                }
                            }
                        }
                    }
                }
            }
      } else if(activity.type == 'LISTENING' || activity.name == "Apple Music") {
        if(activity.details == null) {

        } else {
            console.log(`${newPresence.user.tag} is ${activity.type} to ${activity.details}.`);
        }
      }
    });
});

client.once('ready', () => {
    console.log('The battle is now. Eggium Version: ' + config.eggium_version);
    // Registering the commands in the client
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