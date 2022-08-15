const { SlashCommandBuilder } = require('@discordjs/builders');
const {EmbedBuilder} = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, NoSubscriberBehavior, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const { join } = require('path');
const play = require('play-dl');
const fs = require('fs');
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
        } else {
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
        }
    }
}

async function JoinChanNew(channel, track, volume, interaction, voice_channel){
    const connection = joinVoiceChannel({
        channelId: channel.channelId,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    })
    let stream = await play.stream(track)

    let resource = createAudioResource(stream.stream, {
        inputType: stream.type,
        inlineVolume: true
    })
    resource.volume.setVolume(volume);
    let player = createAudioPlayer({
        behaviors: {
            noSubscriber: NoSubscriberBehavior.Play
        }
    })
    player.play(resource);
    connection.subscribe(player)
    player.on('error', error => {
        console.error(`Error: ${error.message}`);
        player.play(getNextResource());
    });
    player.on(AudioPlayerStatus.Playing, () => {
        console.log('The audio player has started playing!');
        //set playing in json to true
        let queue = JSON.parse(fs.readFileSync('./musicQueueSystem.json', 'utf8'));
        queue[interaction.guild.id][voice_channel.channelId].playing = true;
        fs.writeFileSync('./musicQueueSystem.json', JSON.stringify(queue), 'utf8');
    }); 
    player.on('idle', () => {
        var queue = JSON.parse(fs.readFileSync('./musicQueueSystem.json', 'utf8'));
        console.log(queue[interaction.guild.id][voice_channel.channelId])
        if(queue[interaction.guild.id][voice_channel.channelId].queue.length == 0 && playing==true) {
            connection.destroy();
            queue[interaction.guild.id][voice_channel.channelId].playing = false;
            fs.writeFileSync('./musicQueueSystem.json', JSON.stringify(queue), 'utf8');
        } else{
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
    const player = createAudioPlayer();
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
            subcommand.setName("queue").setDescription("View queue")),
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
            }
            else if(stream.includes('.mp3')){
                if(playing == false) {
                    JoinChannel(voice_channel, stream, 0.025);
                    const embed = new EmbedBuilder()
                        .setTitle("Eggium Music - Play")
                        .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                        .setDescription(`Playing mp3 stream file in ${voice_channel.channel.name}!` + `\nRequested by: <@${interaction.member.user.id}>`)
                        .setFooter({text: "Eggium - Tanner Approved"})
                        .setTimestamp();
                    interaction.reply({ embeds: [embed], ephemeral: false });
                } else {
                    const embed = new EmbedBuilder()
                        .setTitle("Eggium Music - Error!")
                        .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                        .setDescription('A song is already playing! At this time, queueing is not supported for mp3 streams.')
                        .setFooter({text: "Eggium - Tanner Approved"})
                        .setTimestamp();
                    interaction.reply({ embeds: [embed], ephemeral: true });
                }
            } else if(stream.includes('youtube.com')){
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
        }
    }
};