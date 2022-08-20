const { SlashCommandBuilder } = require('@discordjs/builders');
const {EmbedBuilder, AttachmentBuilder} = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, NoSubscriberBehavior, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const play = require('play-dl');
const config = require('../config.json');
const m3u8stream = require('m3u8stream');
var myModule = require('../bot.js');
var con = myModule.con;
var player;
const { toDataURL } =  require('qrcode');


async function getInfoFromURL(interaction, link, voice_channel){
    con.query(`SELECT * FROM MusicSystem WHERE serverID = ${interaction.guild.id} AND voiceChannelID = ${voice_channel.channelId} AND songStatus = "playing"`, async function (err, result, fields) {
        if(result[0] === undefined || result[0] === null){
            if(link.includes("youtube.com")) {
                let yt_info = await play.video_info(link).then(info => {
                    JoinChanNew(voice_channel, link, info.video_details.title, 0.25, interaction);
                    const embed = new EmbedBuilder()
                        .setTitle("Eggium Music - Play")
                        .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                        .setDescription(`Now Playing "${info.video_details.title.replaceAll(`"`, "").replaceAll(`'`, "")}" in ${voice_channel.channel.name}!` + `\nRequested by: <@${interaction.member.user.id}>`)
                        .setFooter({text: "Eggium - Tanner Approved"})
                        .setTimestamp();
                    interaction.reply({ embeds: [embed], ephemeral: false });
                    console.log("Sent reply 1")
                })
            } else if(link.includes("soundcloud.com")) {
                play.setToken({ soundcloud : { client_id : config.SOUNDCLOUD_CLIENT_ID } })
                let so_info = await play.soundcloud(link)
                JoinChanNew(voice_channel, link, so_info.name, 0.25, interaction);
                const embed = new EmbedBuilder()
                    .setTitle("Eggium Music - Play")
                    .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                    .setDescription(`Now Playing "${so_info.name.replaceAll(`"`, "").replaceAll(`'`, "")}" in ${voice_channel.channel.name}!` + `\nRequested by: <@${interaction.member.user.id}>`)
                    .setFooter({text: "Eggium - Tanner Approved"})
                    .setTimestamp();
                interaction.reply({ embeds: [embed], ephemeral: false });
                console.log("Sent reply 2")
            } else if(link.includes("spotify.com")) {
                if (play.is_expired()) {
                    console.log("Token expired")
                    await play.refreshToken() // This will check if access token has expired or not. If yes, then refresh the token.
                }
                let sp_data = await play.spotify(link)
                let searched = await play.search(`${sp_data.name}`, {
                    limit: 1
                })
                JoinChanNew(voice_channel, searched[0].url, searched[0].title, 0.25, interaction);
                const embed = new EmbedBuilder()
                    .setTitle("Eggium Music - Play")
                    .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                    .setDescription(`Now Playing "${searched[0].title.replaceAll(`"`, "").replaceAll(`'`, "")}" in ${voice_channel.channel.name}!` + `\nRequested by: <@${interaction.member.user.id}>`)
                    .setFooter({text: "Eggium - Tanner Approved"})
                    .setTimestamp();
                interaction.reply({ embeds: [embed], ephemeral: false });
                console.log("Sent reply 3")
            } else {
                let yt_info = await play.search(link, {
                    limit: 1
                })
                console.log(yt_info[0])
                JoinChanNew(voice_channel, yt_info[0].url, yt_info[0].title, 0.25, interaction);
                const embed = new EmbedBuilder()
                    .setTitle("Eggium Music - Play")
                    .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                    .setDescription(`Now Playing "${yt_info[0].title.replaceAll(`"`, "").replaceAll(`'`, "")}" in ${voice_channel.channel.name}!` + `\nRequested by: <@${interaction.member.user.id}>`)
                    .setFooter({text: "Eggium - Tanner Approved"})
                    .setTimestamp();
                interaction.reply({ embeds: [embed], ephemeral: false });
                console.log("Sent reply 4")
            }
        } else {
            //song is playing.
            if(link.includes("youtube.com")) {
                let yt_info = await play.video_info(link).then(info => {
                    var date = new Date();
                    date.toLocaleString('en-US', { timeZone: 'America/New_York' });
                    console.log(`Added song to queue! | ${date.toISOString().slice(0, 19).replace('T', ' ')}`);
                    con.query(`INSERT INTO MusicSystem (songLink, songName, songRequester, songStatus, serverID, voiceChannelID, dateAdded) VALUES ("${link}", "${info.video_details.title.replaceAll(`"`, "").replaceAll(`'`, "")}", ${String(interaction.member.user.id)}, "queued", ${String(voice_channel.guild.id)}, ${String(voice_channel.channelId)}, "${date.toISOString().slice(0, 19).replace('T', ' ')}")`);
                    const embed = new EmbedBuilder()
                        .setTitle("Eggium Music - Added to Queue")
                        .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                        .setDescription(`Added ${info.video_details.title.replaceAll(`"`, "").replaceAll(`'`, "")} to queue!` + `\nRequested by: <@${interaction.member.user.id}>`)
                        .setFooter({text: "Eggium - Tanner Approved"})
                        .setTimestamp();
                    interaction.reply({ embeds: [embed], ephemeral: false });
                    console.log("Sent reply 5")
                });

            } else if(link.includes("soundcloud.com")) {

                play.setToken({ soundcloud : { client_id : config.SOUNDCLOUD_CLIENT_ID } })
                let so_info = await play.soundcloud(link)
                var date = new Date();
                date.toLocaleString('en-US', { timeZone: 'America/New_York' });
                console.log(`Added song to queue! | ${date.toISOString().slice(0, 19).replace('T', ' ')}`);
                con.query(`INSERT INTO MusicSystem (songLink, songName, songRequester, songStatus, serverID, voiceChannelID, dateAdded) VALUES ("${so_info.permalink}", "${so_info.name.replaceAll(`"`, "").replaceAll(`'`, "")}", ${String(interaction.member.user.id)}, "queued", ${String(voice_channel.guild.id)}, ${String(voice_channel.channelId)}, "${date.toISOString().slice(0, 19).replace('T', ' ')}")`);
                const embed = new EmbedBuilder()
                    .setTitle("Eggium Music - Added to Queue")
                    .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                    .setDescription(`Added ${so_info.name} to queue!` + `\nRequested by: <@${interaction.member.user.id}>`)
                    .setFooter({text: "Eggium - Tanner Approved"})
                    .setTimestamp();
                interaction.reply({ embeds: [embed], ephemeral: false });
                console.log("Sent reply 6")


            } else if(link.includes("spotify.com")) {
                if (play.is_expired()) {
                    console.log("Token expired")
                    await play.refreshToken()
                }
                let sp_data = await play.spotify(link)
                let searched = await play.search(`${sp_data.name}`, {
                    limit: 1
                })
                var date = new Date();
                date.toLocaleString('en-US', { timeZone: 'America/New_York' });
                console.log(`Added song to queue! | ${date.toISOString().slice(0, 19).replace('T', ' ')}`);
                con.query(`INSERT INTO MusicSystem (songLink, songName, songRequester, songStatus, serverID, voiceChannelID, dateAdded) VALUES ("${searched[0].url}", "${searched[0].title.replaceAll(`"`, "").replaceAll(`'`, "")}", ${String(interaction.member.user.id)}, "queued", ${String(voice_channel.guild.id)}, ${String(voice_channel.channelId)}, "${date.toISOString().slice(0, 19).replace('T', ' ')}")`);
                const embed = new EmbedBuilder()
                    .setTitle("Eggium Music - Added to Queue")
                    .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                    .setDescription(`Added ${searched[0].title.replaceAll(`"`, "").replaceAll(`'`, "")} to queue!` + `\nRequested by: <@${interaction.member.user.id}>`)
                    .setFooter({text: "Eggium - Tanner Approved"})
                    .setTimestamp();
                interaction.reply({ embeds: [embed], ephemeral: false });
                console.log("Sent reply 7")
            } else {
                let yt_info = await play.search(link, {
                    limit: 1
                })
                //add song to queue
                var date = new Date();
                date.toLocaleString('en-US', { timeZone: 'America/New_York' });
                con.query(`INSERT INTO MusicSystem (songLink, songName, songRequester, songStatus, serverID, voiceChannelID, dateAdded) VALUES ("${yt_info[0].url}", "${yt_info[0].title.replaceAll(`"`, "").replaceAll(`'`, "")}", ${String(interaction.member.user.id)}, "queued", ${String(voice_channel.guild.id)}, ${String(voice_channel.channelId)}, "${date.toISOString().slice(0, 19).replace('T', ' ')}")`);
                const embed = new EmbedBuilder()
                    .setTitle("Eggium Music - Added to Queue")
                    .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                    .setDescription(`Added ${yt_info[0].title.replaceAll(`"`, "").replaceAll(`'`, "")} to queue!` + `\nRequested by: <@${interaction.member.user.id}>`)
                    .setFooter({text: "Eggium - Tanner Approved"})
                    .setTimestamp();
                interaction.reply({ embeds: [embed], ephemeral: false });
                console.log("Sent reply 8")
            }
        }
    })
}


async function JoinChanNew(channel, link, name, volume, interaction, shouldInsertNew = true, shouldReuse = false){
    var connection;
    connection = joinVoiceChannel({
        channelId: channel.channelId,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    })

    let stream = await play.stream(link)
    let resource = createAudioResource(stream.stream, { inputType: stream.type, inlineVolume: true })
    resource.volume.setVolume(volume);
    player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Play } })
    player.play(resource);
    connection.subscribe(player)
    var date = new Date();
    date.toLocaleString('en-US', { timeZone: 'America/New_York' });
    con.query(`INSERT INTO MusicSystem (songLink, songName, songRequester, songStatus, serverID, voiceChannelID, dateAdded) VALUES ("${link}", "${name.replaceAll(`"`, "").replaceAll(`'`, "")}", ${String(interaction.member.user.id)}, "playing", ${String(channel.guild.id)}, ${String(channel.channelId)}, "${date.toISOString().slice(0, 19).replace('T', ' ')}")`);
    console.log("added to queue")
    player.on('error', error => { console.error(`Error: ${error.message}`); });
    player.on(AudioPlayerStatus.Playing, () => {
        console.log(`The audio player has started playing! | ${date.toISOString().slice(0, 19).replace('T', ' ')}`);
        console.log(`${link} | ${name.replaceAll(`"`, "").replaceAll(`'`, "")}`)
    }); 
    player.on('buffering', () => { console.log('The audio player is buffering!'); });
    player.on('idle', () => {
        console.log('idled')
        con.query(`SELECT * FROM MusicSystem WHERE songStatus = "queued" ORDER BY dateAdded ASC;`, function (err, result, fields) {
            if(result[0] === undefined || result[0] === null){
                console.log('no songs in queue')
                connection.destroy();
                con.query(`UPDATE MusicSystem SET songStatus = "played" WHERE songStatus = "playing" AND serverID = ${String(channel.guild.id)} AND voiceChannelID = "${String(channel.channelId)}";`);
            } else{
                console.log('songs in queue')
                con.query(`UPDATE MusicSystem SET songStatus = "played" WHERE songStatus = "playing" AND serverID = ${String(channel.guild.id)} AND voiceChannelID = "${String(channel.channelId)}";`);
                con.query(`SELECT * FROM MusicSystem WHERE songStatus = "queued" ORDER BY dateAdded ASC;`, function (err, result, fields) {
                    console.log(result)
                    console.log(result[0])
                    con.query(`UPDATE MusicSystem SET songStatus = "playing" WHERE songStatus = "queued" AND serverID = ${String(channel.guild.id)} AND voiceChannelID = "${String(channel.channelId)}" AND id = "${result[0].id}";`);
                });
                // player.stop()
                // let stream = await play.stream(result[0].songLink)
                // let resource = createAudioResource(stream.stream, { inputType: stream.type, inlineVolume: true })
                // player.play(resource)
                JoinChanNew(channel, result[0].songLink, result[0].songName, volume, interaction, false, true);
            }
        });
    })
}


function JoinChannel(channel, track, volume, interaction) {
    var link;
    if(track.includes('.m3u') || track.includes('.m3u8')){
        link = track;
        track = m3u8stream(track);
    }
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
        var date = new Date();
        date.toLocaleString('en-US', { timeZone: 'America/New_York' });
        console.log(`The audio player has started playing! | ${date.toISOString().slice(0, 19).replace('T', ' ')}`);
        console.log(link)
        console.log(link.match(/[^/\\&\?]+\.\w{3,4}(?=([\?&].*$|$))/)[0])
        con.query(`INSERT INTO MusicSystem (songLink, songName, songRequester, songStatus, serverID, voiceChannelID, dateAdded) VALUES ("${link.match(/[^/\\&\?]+\.\w{3,4}(?=([\?&].*$|$))/)[0]}", "${link.match(/[^/\\&\?]+\.\w{3,4}(?=([\?&].*$|$))/)[0]}", ${String(interaction.member.user.id)}, "playing", ${String(channel.guild.id)}, ${String(channel.channelId)}, "${date.toISOString().slice(0, 19).replace('T', ' ')}")`);
    }); 
    player.on('idle', () => {
        connection.destroy();
        con.query(`UPDATE MusicSystem SET songStatus = "played" WHERE songStatus = "playing" AND serverID = ${String(channel.guild.id)} AND voiceChannelID = "${String(channel.channelId)}";`);
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
            subcommand.setName("skip").setDescription("Skip the current song"))
        .addSubcommand((subcommand) =>
            subcommand.setName("remote").setDescription("Take control of the music with a web remote"))
        .addSubcommand((subcommand) =>
            subcommand.setName("queue").setDescription("View the current queue")),
    async execute(interaction) {
        const voice_channel = interaction.guild.members.cache.get(interaction.member.user.id).voice;
        if(interaction.options.getSubcommand() === "play") {
            var link = interaction.options.getString('link');
            if(voice_channel.channelId === null) {
                const embed = new EmbedBuilder()
                    .setTitle("Eggium Music - Error!")
                    .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                    .setDescription('Please be in a VC to use Eggium Music commands')
                    .setFooter({text: "Eggium - Tanner Approved"})
                    .setTimestamp();
                interaction.reply({ embeds: [embed], ephemeral: true });
                console.log("Sent reply 10")
            } else if(link.includes('.mp3') || link.includes('.ogg') || link.includes('.m3u') || link.includes('.m3u8')){
                con.query(`SELECT * FROM MusicSystem WHERE serverID = ${interaction.guild.id} AND voiceChannelID = ${voice_channel.channelId} AND songStatus = "playing"`, function (err, result, fields) {
                    if(result[0] === undefined || result[0] === null) {
                        JoinChannel(voice_channel, link, 0.25, interaction);
                        const embed = new EmbedBuilder()
                            .setTitle("Eggium Music - Play")
                            .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                            .setDescription(`Playing file in ${voice_channel.channel.name}!` + `\nRequested by: <@${interaction.member.user.id}>`)
                            .setFooter({text: "Eggium - Tanner Approved"})
                            .setTimestamp();
                        interaction.reply({ embeds: [embed], ephemeral: false });
                        console.log("Sent reply 11")
                    } else {
                        const embed = new EmbedBuilder()
                            .setTitle("Eggium Music - Error!")
                            .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                            .setDescription('A song is already playing! At this time, queueing is not supported for direct file streams.')
                            .setFooter({text: "Eggium - Tanner Approved"})
                            .setTimestamp();
                        interaction.reply({ embeds: [embed], ephemeral: true });
                        console.log("Sent reply 12")
                    }
                });
            } else {
                getInfoFromURL(interaction, link, voice_channel);
            }
        } else if(interaction.options.getSubcommand() === "skip") {
            if(voice_channel.channelId === null) {
                const embed = new EmbedBuilder()
                    .setTitle("Eggium Music - Error!")
                    .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                    .setDescription('Please be in a VC to use Eggium Music commands')
                    .setFooter({text: "Eggium - Tanner Approved"})
                    .setTimestamp();
                interaction.reply({ embeds: [embed], ephemeral: true });
                console.log("Sent reply 13")
            } else {
                con.query(`SELECT * FROM MusicSystem WHERE serverID = ${interaction.guild.id} AND voiceChannelID = ${voice_channel.channelId} AND songStatus = "playing"`, function (err, result, fields) {
                    if(result[0] === undefined || result[0] === null) {
                        const embed = new EmbedBuilder()
                            .setTitle("Eggium Music - Error!")
                            .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                            .setDescription('No song is currently playing!')
                            .setFooter({text: "Eggium - Tanner Approved"})
                            .setTimestamp();
                        interaction.reply({ embeds: [embed], ephemeral: true });
                        console.log("Sent reply 14")
                    } else {
                        con.query(`SELECT * FROM MusicSystem WHERE serverID = ${interaction.guild.id} AND voiceChannelID = ${voice_channel.channelId} AND songStatus = "queued" ORDER BY dateAdded ASC;`, async function (err, result, fields) {
                            if(result[0] === undefined || result[0] === null) {
                                console.log("here")
                                //no songs in queue. Safe to disconnect
                                const embed = new EmbedBuilder()
                                    .setTitle("Eggium Music - Skip")
                                    .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                                    .setDescription(`Stopped playing because there are no songs left in the queue!`)
                                    .setFooter({text: "Eggium - Tanner Approved"})
                                    .setTimestamp();
                                interaction.reply({ embeds: [embed], ephemeral: true });
                                console.log("Sent reply 15")
                                con.query(`UPDATE MusicSystem SET songStatus = "played" WHERE songStatus = "playing" AND serverID = ${interaction.guild.id} AND voiceChannelID = ${voice_channel.channelId}`);
                                player.stop();
                            } else{
                                console.log("no, here.")
                                con.query(`UPDATE MusicSystem SET songStatus = "played" WHERE songStatus = "playing" AND serverID = ${interaction.guild.id} AND voiceChannelID = ${voice_channel.channelId}`);
                                console.log(result[0])
                                con.query(`UPDATE MusicSystem SET songStatus = "playing" WHERE serverID = ${interaction.guild.id} AND voiceChannelID = ${voice_channel.channelId} AND id = "${result[0].id}";`)
                                
                                let stream = await play.stream(result[0].songLink)
                                let resource = createAudioResource(stream.stream, { inputType: stream.type, inlineVolume: true })
                                resource.volume.setVolume(0.25);
                                player.play(resource)
                                // JoinChanNew(voice_channel, result[0].songLink, result[0].songName, 0.25, interaction, false, true);

                                const embed = new EmbedBuilder()
                                    .setTitle("Eggium Music - Skipped!")
                                    .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                                    .setDescription(`Skipped the song! Now playing: ${result[0].songName}\nRequested by: <@${result[0].songRequester}>`)
                                    .setFooter({text: "Eggium - Tanner Approved"})
                                    .setTimestamp();
                                interaction.reply({ embeds: [embed], ephemeral: true });
                                console.log("Sent reply 16")
                            }
                        });
                    }
                });
            }
        } else if(interaction.options.getSubcommand() === "remote") {
            if(voice_channel.channelId === null) {
                const embed = new EmbedBuilder()
                    .setTitle("Eggium Music - Error!")
                    .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                    .setDescription('Please be in a VC to use Eggium Music commands')
                    .setFooter({text: "Eggium - Tanner Approved"})
                    .setTimestamp();
                interaction.reply({ embeds: [embed], ephemeral: true });
            } else {
                const base64 = await toDataURL(`http://persn.dev/eggium/eggiumMusicRemote.php?controlId=${interaction.guild.id}.${voice_channel.channelId}`, { type: 'image/jpeg', rendererOpts: { quality: 1 } });
                const buffer = Buffer.from(base64.replace(/^data:image\/png;base64,/, '').toString(), 'base64');
                const x = new AttachmentBuilder(buffer, { name: 'QRCode.png' })
                interaction.reply({ files: [x], ephemeral: true });
            }
        } else if(interaction.options.getSubcommand() === "queue") {
            if(voice_channel.channelId === null) {
                const embed = new EmbedBuilder()
                    .setTitle("Eggium Music - Queue")
                    .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                    .setDescription('Please join a voice channel to view the queue for that voice channel')
                    .setFooter({text: "Eggium - Tanner Approved"})
                    .setTimestamp();
                interaction.reply({ embeds: [embed], ephemeral: true });
            } else {
                con.query(`SELECT * FROM MusicSystem WHERE serverID = ${interaction.guild.id} AND voiceChannelID = ${voice_channel.channelId} AND songStatus = "queued" ORDER BY dateAdded ASC;`, function (err, result, fields) {
                    if(result[0] === undefined || result[0] === null) {
                        const embed = new EmbedBuilder()
                            .setTitle("Eggium Music - Queue")
                            .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                            .setDescription('The queue is empty!')
                            .setFooter({text: "Eggium - Tanner Approved"})
                            .setTimestamp();
                        interaction.reply({ embeds: [embed], ephemeral: true });
                    } else {
                        let queue = "";
                        for(let i = 0; i < result.length; i++) {
                            queue += `${i + 1}. ${result[i].songName} - Requested by <@${result[i].songRequester}>\n`;
                        }
                        const embed = new EmbedBuilder()
                            .setTitle("Eggium Music - Queue")
                            .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                            .setDescription(queue)
                            .setFooter({text: "Eggium - Tanner Approved"})
                            .setTimestamp();
                        interaction.reply({ embeds: [embed], ephemeral: true });
                    }
                });
            }

        }
    }
}