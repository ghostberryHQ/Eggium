const { SlashCommandBuilder } = require('@discordjs/builders');
const {EmbedBuilder} = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, NoSubscriberBehavior, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const play = require('play-dl');
const fs = require('fs');
const config = require('../config.json');
const m3u8stream = require('m3u8stream')
var playing;

async function getInfoFromURL(interaction, track, voice_channel){
    let queue = JSON.parse(fs.readFileSync('./musicQueueSystem.json', 'utf8'));
    if(queue[interaction.guild.id] === undefined) {
        console.log("Server not in json")
        addition = {[interaction.guild.id]: {}}
        queue = Object.assign(queue, addition)
        console.log(queue)
        fs.writeFileSync('./musicQueueSystem.json', JSON.stringify(queue), 'utf8');
        getInfoFromURL(interaction, track, voice_channel);
    } else if (queue[interaction.guild.id][voice_channel.channelId] === undefined) {
        console.log("VC not in json")
        addition = {
            [voice_channel.channelId]: {
                "queue": [],
                "info":{"name": voice_channel.channel.name},
                "playing": true
            }
        }
        queue[interaction.guild.id] = Object.assign(queue[interaction.guild.id], addition);
        console.log(queue[interaction.guild.id])
        fs.writeFileSync('./musicQueueSystem.json', JSON.stringify(queue), (err) => {console.log(err)});
        getInfoFromURL(interaction, track, voice_channel);
    } else {
        playing = queue[interaction.guild.id][voice_channel.channelId].playing;
        console.log(playing);
        if(playing == false){
            if(track.includes("youtube.com")) {
                JoinChanNew(voice_channel, track, 0.25, interaction, voice_channel);
                let yt_info = await play.video_info(track).then(info => {
                    const embed = new EmbedBuilder()
                        .setTitle("Eggium Music - Play")
                        .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                        .setDescription(`Now Playing "${info.video_details.title.replaceAll(`"`, "").replaceAll(`'`, "")}" in ${voice_channel.channel.name}!` + `\nRequested by: <@${interaction.member.user.id}>`)
                        .setFooter({text: "Eggium - Tanner Approved"})
                        .setTimestamp();
                    interaction.reply({ embeds: [embed], ephemeral: false });
                })
            } else if(track.includes("soundcloud.com")) {
                play.setToken({ soundcloud : { client_id : config.SOUNDCLOUD_CLIENT_ID } })
                let so_info = await play.soundcloud(track)
                JoinChanNew(voice_channel, track, 0.25, interaction, voice_channel);
                const embed = new EmbedBuilder()
                    .setTitle("Eggium Music - Play")
                    .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                    .setDescription(`Now Playing "${so_info.name.replaceAll(`"`, "").replaceAll(`'`, "")}" in ${voice_channel.channel.name}!` + `\nRequested by: <@${interaction.member.user.id}>`)
                    .setFooter({text: "Eggium - Tanner Approved"})
                    .setTimestamp();
                interaction.reply({ embeds: [embed], ephemeral: false });
            }else if(track.includes("spotify.com")) {
                if (play.is_expired()) {
                    console.log("Token expired")
                    await play.refreshToken() // This will check if access token has expired or not. If yes, then refresh the token.
                }
                console.log(track)
                let sp_data = await play.spotify(track)
                let searched = await play.search(`${sp_data.name}`, {
                    limit: 1
                })
                JoinChanNew(voice_channel, searched[0].url, 0.25, interaction, voice_channel);
                const embed = new EmbedBuilder()
                    .setTitle("Eggium Music - Play")
                    .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                    .setDescription(`Now Playing "${searched[0].title.replaceAll(`"`, "").replaceAll(`'`, "")}" in ${voice_channel.channel.name}!` + `\nRequested by: <@${interaction.member.user.id}>`)
                    .setFooter({text: "Eggium - Tanner Approved"})
                    .setTimestamp();
                interaction.reply({ embeds: [embed], ephemeral: false });
            }else {
                let yt_info = await play.search(track, {
                    limit: 1
                })
                console.log(yt_info[0])
                JoinChanNew(voice_channel, yt_info[0].url, 0.25, interaction, voice_channel);
                const embed = new EmbedBuilder()
                    .setTitle("Eggium Music - Play")
                    .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                    .setDescription(`Now Playing "${yt_info[0].title.replaceAll(`"`, "").replaceAll(`'`, "")}" in ${voice_channel.channel.name}!` + `\nRequested by: <@${interaction.member.user.id}>`)
                    .setFooter({text: "Eggium - Tanner Approved"})
                    .setTimestamp();
                interaction.reply({ embeds: [embed], ephemeral: false });
            }
        } else {
            if(track.includes("youtube.com")) {
                let yt_info = await play.video_info(track).then(info => {
                    var songAddition = {
                        "link": track,
                        "title": info.video_details.title.replaceAll(`"`, "").replaceAll(`'`, ""),
                        "requester": interaction.member.user.id,
                    }
                    //add song to queue
                    queue[interaction.guild.id][voice_channel.channelId].queue.push(songAddition);
                    console.log(queue)
                    fs.writeFileSync('./musicQueueSystem.json', JSON.stringify(queue));
                    const embed = new EmbedBuilder()
                        .setTitle("Eggium Music - Added to Queue")
                        .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                        .setDescription(`Added ${info.video_details.title.replaceAll(`"`, "").replaceAll(`'`, "")} to queue!` + `\nRequested by: <@${interaction.member.user.id}>`)
                        .setFooter({text: "Eggium - Tanner Approved"})
                        .setTimestamp();
                    interaction.reply({ embeds: [embed], ephemeral: false });
                });
            } else if(track.includes("spotify.com")){
                if (play.is_expired()) {
                    console.log("Token expired")
                    await play.refreshToken() // This will check if access token has expired or not. If yes, then refresh the token.
                }
                let sp_data = await play.spotify(track)
                let searched = await play.search(`${sp_data.name}`, {
                    limit: 1
                })
                var songAddition = {
                    "link": searched[0].url,
                    "title": searched[0].title.replaceAll(`"`, "").replaceAll(`'`, ""),
                    "requester": interaction.member.user.id,
                }
                //add song to queue
                queue[interaction.guild.id][voice_channel.channelId].queue.push(songAddition);
                console.log(queue)
                fs.writeFileSync('./musicQueueSystem.json', JSON.stringify(queue));
                const embed = new EmbedBuilder()
                    .setTitle("Eggium Music - Added to Queue")
                    .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                    .setDescription(`Added ${searched[0].title.replaceAll(`"`, "").replaceAll(`'`, "")} to queue!` + `\nRequested by: <@${interaction.member.user.id}>`)
                    .setFooter({text: "Eggium - Tanner Approved"})
                    .setTimestamp();
                interaction.reply({ embeds: [embed], ephemeral: false });
            }else if(track.includes("soundcloud.com")){
                play.setToken({ soundcloud : { client_id : config.SOUNDCLOUD_CLIENT_ID } })
                let so_info = await play.soundcloud(track)
                console.log(so_info)
                var songAddition = {
                    "link": so_info.permalink,
                    "title": so_info.name,
                    "requester": interaction.member.user.id,
                }
                queue[interaction.guild.id][voice_channel.channelId].queue.push(songAddition);
                console.log(queue)
                fs.writeFileSync('./musicQueueSystem.json', JSON.stringify(queue));
                const embed = new EmbedBuilder()
                    .setTitle("Eggium Music - Added to Queue")
                    .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                    .setDescription(`Added ${so_info.name.replaceAll(`"`, "").replaceAll(`'`, "")} to queue!` + `\nRequested by: <@${interaction.member.user.id}>`)
                    .setFooter({text: "Eggium - Tanner Approved"})
                    .setTimestamp();
                interaction.reply({ embeds: [embed], ephemeral: false });
            }else {
                let yt_info = await play.search(track, {
                    limit: 1
                })
                var songAddition = {
                    "link": yt_info[0].url,
                    "title": yt_info[0].title.replaceAll(`"`, "").replaceAll(`'`, ""),
                    "requester": interaction.member.user.id,
                }
                //add song to queue
                queue[interaction.guild.id][voice_channel.channelId].queue.push(songAddition);
                console.log(queue)
                fs.writeFileSync('./musicQueueSystem.json', JSON.stringify(queue));
                const embed = new EmbedBuilder()
                    .setTitle("Eggium Music - Added to Queue")
                    .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                    .setDescription(`Added ${yt_info[0].title.replaceAll(`"`, "").replaceAll(`'`, "")} to queue!` + `\nRequested by: <@${interaction.member.user.id}>`)
                    .setFooter({text: "Eggium - Tanner Approved"})
                    .setTimestamp();
                interaction.reply({ embeds: [embed], ephemeral: false });
            }
        }
    }
}

let player;

async function JoinChanNew(channel, track, volume, interaction, voice_channel){
    const connection = joinVoiceChannel({
        channelId: channel.channelId,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    })
    let stream = await play.stream(track)
    let resource = createAudioResource(stream.stream, { inputType: stream.type, inlineVolume: true })
    resource.volume.setVolume(volume);
    player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Play } })
    player.play(resource);
    connection.subscribe(player)
    player.on('error', error => { console.error(`Error: ${error.message}`); });
    player.on(AudioPlayerStatus.Playing, () => {
        console.log('The audio player has started playing!');
        let queue = JSON.parse(fs.readFileSync('./musicQueueSystem.json', 'utf8'));
        queue[interaction.guild.id][voice_channel.channelId].playing = true;
        fs.writeFileSync('./musicQueueSystem.json', JSON.stringify(queue), 'utf8');
    }); 
    player.on('buffering', () => { console.log('The audio player is buffering!'); });
    player.on('idle', () => {
        console.log('idled')
        var queue = JSON.parse(fs.readFileSync('./musicQueueSystem.json', 'utf8'));
        console.log(queue[interaction.guild.id][voice_channel.channelId])
        if(queue[interaction.guild.id][voice_channel.channelId].queue.length == 0) {
                console.log("done!")
                connection.destroy();
                queue[interaction.guild.id][voice_channel.channelId].playing = false;
                fs.writeFileSync('./musicQueueSystem.json', JSON.stringify(queue), 'utf8');
        }
        else {
            console.log(queue[interaction.guild.id][voice_channel.channelId].queue[0].link)
            JoinChanNew(channel, queue[interaction.guild.id][voice_channel.channelId].queue[0].link, volume, interaction, voice_channel)
            console.log(`Requested By: ${queue[interaction.guild.id][voice_channel.channelId].queue[0].requester}`)
            //TODO: add what was requested to Eggium Music Profiles
            queue[interaction.guild.id][voice_channel.channelId].queue.shift();
            fs.writeFileSync('./musicQueueSystem.json', JSON.stringify(queue));
        }
    })
}

function JoinChannel(channel, track, volume) {
    const connection = joinVoiceChannel({
        channelId: channel.channelId,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });
    player = createAudioPlayer();
	resource = createAudioResource(track, {inlineVolume: true})
    resource.volume.setVolume(volume);
    connection.subscribe(player); 
    connection.on(VoiceConnectionStatus.Ready, () => {console.log("ready"); player.play(resource);})
    connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
        try {
            console.log("Disconnected.")
            await Promise.race([
                entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
            ]);
        } catch (error) {
            connection.destroy();
        }
    });
    player.on('error', error => {
        console.error(`Error: ${error.message} with resource ${error.resource.metadata.title}`);
        player.play(getNextResource());
    });
    player.on(AudioPlayerStatus.Playing, () => {
        console.log('The audio player has started playing!');
        //set playing in json to true
        let queue = JSON.parse(fs.readFileSync('./musicQueueSystem.json', 'utf8'));
        queue[channel.guild.id][channel.channelId].playing = true;
        fs.writeFileSync('./musicQueueSystem.json', JSON.stringify(queue), 'utf8');
    }); 
    player.on('idle', () => {
        connection.destroy();
        //set playing to false in json
        let queue = JSON.parse(fs.readFileSync('./musicQueueSystem.json', 'utf8'));
        queue[channel.guild.id][channel.channelId].playing = false;
        fs.writeFileSync('./musicQueueSystem.json', JSON.stringify(queue), 'utf8');
    })
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('music')
        .setDescription('Starts playing music')
        .addSubcommand((subcommand) =>
            subcommand.setName("play").setDescription("Play music from link")
            .addStringOption(option =>
                option.setName('link')
                    .setDescription('url')
                    .setRequired(true)))
        .addSubcommand((subcommand) =>
            subcommand.setName("queue").setDescription("View queue"))
        .addSubcommand((subcommand) =>
            subcommand.setName("skip").setDescription("Skip the current song")),
    async execute(interaction) {
        if(interaction.options.getSubcommand() === "play") {
            var stream = interaction.options.getString('link');
            const voice_channel = interaction.guild.members.cache.get(interaction.member.user.id).voice
            if(voice_channel.channelId === null) {
                const embed = new EmbedBuilder()
                    .setTitle("Eggium Music - Error!")
                    .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                    .setDescription('Please be in a VC to use Eggium Music commands')
                    .setFooter({text: "Eggium - Tanner Approved"})
                    .setTimestamp();
                interaction.reply({ embeds: [embed], ephemeral: true });
            } else if(stream.includes('.mp3') || stream.includes('.ogg') || stream.includes('.m3u') || stream.includes('.m3u8')) {
                //get playing from json
                let queue = JSON.parse(fs.readFileSync('./musicQueueSystem.json', 'utf8'));
                console.log(queue[interaction.guild.id][voice_channel.channelId].playing)
                if(queue[interaction.guild.id][voice_channel.channelId].playing === false) {
                    if(stream.includes('.m3u') || stream.includes('.m3u8')) {
                        console.log("ready for m3u")
                        JoinChannel(voice_channel, m3u8stream(stream), 0.25);
                        const embed = new EmbedBuilder()
                            .setTitle("Eggium Music - Play")
                            .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                            .setDescription(`Playing a **radio** stream in ${voice_channel.channel.name}!` + `\nRequested by: <@${interaction.member.user.id}>`)
                            .setFooter({text: "Eggium - Tanner Approved"})
                            .setTimestamp();
                        interaction.reply({ embeds: [embed], ephemeral: false });
                    } else {
                        JoinChannel(voice_channel, stream, 0.25);
                        const embed = new EmbedBuilder()
                            .setTitle("Eggium Music - Play")
                            .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                            .setDescription(`Playing file in ${voice_channel.channel.name}!` + `\nRequested by: <@${interaction.member.user.id}>`)
                            .setFooter({text: "Eggium - Tanner Approved"})
                            .setTimestamp();
                        interaction.reply({ embeds: [embed], ephemeral: false });
                    }
                } else {
                    const embed = new EmbedBuilder()
                        .setTitle("Eggium Music - Error!")
                        .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                        .setDescription('A song is already playing! At this time, queueing is not supported for file streams.')
                        .setFooter({text: "Eggium - Tanner Approved"})
                        .setTimestamp();
                    interaction.reply({ embeds: [embed], ephemeral: true });
                }
            }else {
                getInfoFromURL(interaction, stream, voice_channel);
            }
        } else if(interaction.options.getSubcommand() === "queue") {
            doQueue();
            function doQueue() {
                 // read json file
                var queue = JSON.parse(fs.readFileSync('./musicQueueSystem.json', 'utf8'));
                const voice_channel = interaction.guild.members.cache.get(interaction.member.user.id).voice
                if(voice_channel.channelId === null) {
                    const embed = new EmbedBuilder()
                        .setTitle("Eggium Music - Queue")
                        .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                        .setDescription('Please join a voice channel to view the queue for that voice channel')
                        .setFooter({text: "Eggium - Tanner Approved"})
                        .setTimestamp();
                    interaction.reply({ embeds: [embed], ephemeral: true });
                } else {
                    if(queue[interaction.guild.id] === undefined) {
                        console.log("Server not in json")
                        console.log(queue)
                        addition = {[interaction.guild.id]: {}}
                        queue = Object.assign(queue, addition)
                        console.log(queue)
                        fs.writeFileSync('./musicQueueSystem.json', JSON.stringify(queue), 'utf8');
                        doQueue();
                    } else if (queue[interaction.guild.id][voice_channel.channelId] === undefined) {
                        console.log("VC not in json")
                        console.log(queue[interaction.guild.id])
                        addition = {
                            [voice_channel.channelId]: {
                                "queue": [],
                                "info":{"name": voice_channel.channel.name}
                            }
                        }
                        queue[interaction.guild.id] = Object.assign(queue[interaction.guild.id], addition);
                        console.log(queue[interaction.guild.id])
                        fs.writeFileSync('./musicQueueSystem.json', JSON.stringify(queue), (err) => {console.log(err)});
                        doQueue();
                    } else {
                        var queueArray = queue[interaction.guild.id][voice_channel.channelId].queue;
                        var queueString = '';
                        for (let i = 0; i < queueArray.length; i++) {
                            queueString += `${i + 1}. ${queueArray[i].title}\n`;
                        }
                        setTimeout(function() {
                            if(queueString === '') {
                                queueString = 'No songs in queue'
                                    const embed = new EmbedBuilder()
                                    .setTitle("Eggium Music - Queue")
                                    .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                                    .setDescription(queueString)
                                    .setFooter({text: "Eggium - Tanner Approved"})
                                    .setTimestamp();
                                interaction.reply({ embeds: [embed], ephemeral: true });
                            } else {
                                const embed = new EmbedBuilder()
                                    .setTitle("Eggium Music - Queue")
                                    .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                                    .setDescription(queueString)
                                    .setFooter({text: "Eggium - Tanner Approved"})
                                    .setTimestamp();
                                interaction.reply({ embeds: [embed], ephemeral: true });
                            }
                        }, 1000);
                    }
                }
            }
        } else if(interaction.options.getSubcommand() === "skip") {
            const voice_channel = interaction.guild.members.cache.get(interaction.member.user.id).voice
            if(voice_channel.channelId === null) {
                const embed = new EmbedBuilder()
                    .setTitle("Eggium Music - Error!")
                    .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                    .setDescription('Please be in a VC to use Eggium Music commands')
                    .setFooter({text: "Eggium - Tanner Approved"})
                    .setTimestamp();
                interaction.reply({ embeds: [embed], ephemeral: true });
            } else {
                doThis();
                function doThis() {
                    var queue = JSON.parse(fs.readFileSync('./musicQueueSystem.json', 'utf8'));
                    if(queue[interaction.guild.id] === undefined) {
                        console.log("Server not in json")
                        console.log(queue)
                        addition = {[interaction.guild.id]: {}}
                        queue = Object.assign(queue, addition)
                        console.log(queue)
                        fs.writeFileSync('./musicQueueSystem.json', JSON.stringify(queue), 'utf8');
                        doThis();
                    } else if (queue[interaction.guild.id][voice_channel.channelId] === undefined) {
                        console.log("VC not in json")
                        console.log(queue[interaction.guild.id])
                        addition = {
                            [voice_channel.channelId]: {
                                "queue": [],
                                "info":{"name": voice_channel.channel.name}
                            }
                        }
                        queue[interaction.guild.id] = Object.assign(queue[interaction.guild.id], addition);
                        console.log(queue[interaction.guild.id])
                        fs.writeFileSync('./musicQueueSystem.json', JSON.stringify(queue), (err) => {console.log(err)});
                        doThis();
                    } else if (queue[interaction.guild.id][voice_channel.channelId].playing === false) {
                        const embed = new EmbedBuilder()
                            .setTitle("Eggium Music - Error!")
                            .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                            .setDescription('No song is playing in this VC')
                            .setFooter({text: "Eggium - Tanner Approved"})
                            .setTimestamp();
                        interaction.reply({ embeds: [embed], ephemeral: true });
                    } else if (queue[interaction.guild.id][voice_channel.channelId].queue.length === 0){
                        player.stop();
                        const embed = new EmbedBuilder()
                            .setTitle("Eggium Music - Skipped!")
                            .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                            .setDescription('Stopped playing because there are no songs left in the queue')
                            .setFooter({text: "Eggium - Tanner Approved"})
                            .setTimestamp();
                        interaction.reply({ embeds: [embed], ephemeral: true });
                    } else if (queue[interaction.guild.id][voice_channel.channelId].queue.length > 0){
                        console.log(queue[interaction.guild.id][voice_channel.channelId].queue[0])
                        JoinChanNew(voice_channel, queue[interaction.guild.id][voice_channel.channelId].queue[0].link, 0.25, interaction, voice_channel);
                        const embed = new EmbedBuilder()
                            .setTitle("Eggium Music - Skipped!")
                            .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                            .setDescription(`Skipped the song! Now playing: ${queue[interaction.guild.id][voice_channel.channelId].queue[0].title}\nRequested by: <@${queue[interaction.guild.id][voice_channel.channelId].queue[0].requester}>`)
                            .setFooter({text: "Eggium - Tanner Approved"})
                            .setTimestamp();
                        interaction.reply({ embeds: [embed], ephemeral: true });
                        queue[interaction.guild.id][voice_channel.channelId].queue.shift();
                        fs.writeFileSync('./musicQueueSystem.json', JSON.stringify(queue), 'utf8');
                    }
                }

            }
        }
    }
};