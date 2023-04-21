const { SlashCommandBuilder } = require('@discordjs/builders');
const {EmbedBuilder, AttachmentBuilder} = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, NoSubscriberBehavior, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const play = require('play-dl');
const config = require('../config.json');
const m3u8stream = require('m3u8stream');
const twitch = require("twitch-m3u8");
var myModule = require('../bot.js');
var con = myModule.con;
var player;
const { toDataURL } =  require('qrcode');

async function playPlaylist(interaction, link, voice_channel){
    con.query(`SELECT * FROM MusicSystem WHERE serverID = ${interaction.guild.id} AND voiceChannelID = ${voice_channel.channelId} AND songStatus = "playing"`, async function (err, result, fields) {
        if(result[0] === undefined || result[0] === null){
            //no songs in queue
            if(link.includes("youtube.com")){
                let yt_playlist_info = await play.playlist_info(link, { incomplete : true }).then(info => {
                    console.log(info.videos)
                    JoinChanNew(voice_channel, info.videos[0].url, info.videos[0].title, 0.25, interaction);
                    for (let i = 1; i < info.videos.length; i++) {
                        console.log(info.videos[i].title)
                        var date = new Date();
                        date.toLocaleString('en-US', { timeZone: 'America/New_York' });
                        con.query(`INSERT INTO MusicSystem (songLink, songName, songRequester, songStatus, serverID, voiceChannelID, dateAdded) VALUES ("${info.videos[i].url}", "${info.videos[i].title.replaceAll(`"`, "").replaceAll(`'`, "")}", ${String(interaction.member.user.id)}, "queued", ${String(voice_channel.guild.id)}, ${String(voice_channel.channelId)}, "${date.toISOString().slice(0, 19).replace('T', ' ')}")`);
                    }
                    const embed = new EmbedBuilder()
                        .setTitle("Eggium Music - Play")
                        .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                        .setDescription(`Now Playing "${info.videos[0].title.replaceAll(`"`, "").replaceAll(`'`, "")}" in ${voice_channel.channel.name}!` + `\nAdded ${info.videos.length - 1} songs from playlist to queue`+ `\nRequested by: <@${interaction.member.user.id}>`)
                        .setFooter({text: "Eggium - Tanner Approved"})
                        .setTimestamp();
                    interaction.reply({ embeds: [embed], ephemeral: false });
                }).catch(err => {
                    console.log(err)
                    console.log("There was an error getting the playlist info. Details above.")
                    const embed = new EmbedBuilder()
                        .setTitle("Eggium Music - Play Error")
                        .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                        .setDescription(`There was an error playing your song. This is most commonly caused by an age restricted video.`)
                        .setFooter({text: "Eggium - Tanner Approved"})
                        .setTimestamp();
                    interaction.reply({ embeds: [embed], ephemeral: true });

                });
            } else if(link.includes("soundcloud.com")){
                let soundcloud_info = await play.soundcloud(link, { incomplete : true }).then(info => {
                    console.log(info.tracks)
                    JoinChanNew(voice_channel, info.tracks[0].permalink, info.tracks[0].name, 0.25, interaction);
                    for (let i = 1; i < info.tracks.length; i++) {
                        console.log(info.tracks[i].name)
                        var date = new Date();
                        date.toLocaleString('en-US', { timeZone: 'America/New_York' });
                        con.query(`INSERT INTO MusicSystem (songLink, songName, songRequester, songStatus, serverID, voiceChannelID, dateAdded) VALUES ("${info.tracks[i].permalink}", "${info.tracks[i].name.replaceAll(`"`, "").replaceAll(`'`, "")}", ${String(interaction.member.user.id)}, "queued", ${String(voice_channel.guild.id)}, ${String(voice_channel.channelId)}, "${date.toISOString().slice(0, 19).replace('T', ' ')}")`);
                    }
                    const embed = new EmbedBuilder()
                        .setTitle("Eggium Music - Play")
                        .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                        .setDescription(`Now Playing "${info.tracks[0].name.replaceAll(`"`, "").replaceAll(`'`, "")}" in ${voice_channel.channel.name}!` + `\nAdded ${info.tracks.length - 1} songs from playlist to queue`+ `\nRequested by: <@${interaction.member.user.id}>`)
                        .setFooter({text: "Eggium - Tanner Approved"})
                        .setTimestamp();
                    interaction.reply({ embeds: [embed], ephemeral: false });
                }).catch(err => console.log(err))
            }
        } else {
            //songs in queue
            if(link.includes("youtube.com")){
                let yt_playlist_info = await play.playlist_info(link, { incomplete : true }).then(info => {
                    console.log(info.videos)
                    for (let i = 0; i < info.videos.length; i++) {
                        console.log(info.videos[i].title)
                        var date = new Date();
                        date.toLocaleString('en-US', { timeZone: 'America/New_York' });
                        con.query(`INSERT INTO MusicSystem (songLink, songName, songRequester, songStatus, serverID, voiceChannelID, dateAdded) VALUES ("${info.videos[i].url}", "${info.videos[i].title.replaceAll(`"`, "").replaceAll(`'`, "")}", ${String(interaction.member.user.id)}, "queued", ${String(voice_channel.guild.id)}, ${String(voice_channel.channelId)}, "${date.toISOString().slice(0, 19).replace('T', ' ')}")`);
                    }
                    const embed = new EmbedBuilder()
                        .setTitle("Eggium Music - Queue")
                        .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                        .setDescription(`Added ${info.videos.length} songs from playlist to queue`+ `\nRequested by: <@${interaction.member.user.id}>`)
                        .setFooter({text: "Eggium - Tanner Approved"})
                        .setTimestamp();
                    interaction.reply({ embeds: [embed], ephemeral: false });
                })
            } else if(link.includes("soundcloud.com")) {
                let soundcloud_info = await play.soundcloud(link, { incomplete : true }).then(info => {
                    console.log(info.tracks)
                    for (let i = 0; i < info.tracks.length; i++) {
                        console.log(info.tracks[i].name)
                        var date = new Date();
                        date.toLocaleString('en-US', { timeZone: 'America/New_York' });
                        con.query(`INSERT INTO MusicSystem (songLink, songName, songRequester, songStatus, serverID, voiceChannelID, dateAdded) VALUES ("${info.tracks[i].permalink}", "${info.tracks[i].name.replaceAll(`"`, "").replaceAll(`'`, "")}", ${String(interaction.member.user.id)}, "queued", ${String(voice_channel.guild.id)}, ${String(voice_channel.channelId)}, "${date.toISOString().slice(0, 19).replace('T', ' ')}")`);
                    }
                    const embed = new EmbedBuilder()
                        .setTitle("Eggium Music - Queue")
                        .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                        .setDescription(`Added ${info.tracks.length} songs from playlist to queue`+ `\nRequested by: <@${interaction.member.user.id}>`)
                        .setFooter({text: "Eggium - Tanner Approved"})
                        .setTimestamp();
                    interaction.reply({ embeds: [embed], ephemeral: false });
                }).catch(err => console.log(err))
            }
        }
    })
}

async function getInfoFromURL(interaction, link, voice_channel){
    if(link.includes("google.com/url")) return interaction.reply({ content: 'The link provided is not a song link. It seems you copied from google search' , ephemeral: true});
    con.query(`SELECT * FROM MusicSystem WHERE serverID = ${interaction.guild.id} AND voiceChannelID = ${voice_channel.channelId} AND songStatus = "playing"`, async function (err, result, fields) {
        if(result[0] === undefined || result[0] === null){
            if(link.includes("youtube.com")) {
                if(link.includes("playlist?list=")) {
                    playPlaylist(interaction, link, voice_channel);
                } else {
                    let yt_info = await play.video_info(link).then(info => {
                        JoinChanNew(voice_channel, link, info.video_details.title, 0.25, interaction);
                        const embed = new EmbedBuilder()
                            .setTitle("Eggium Music - Play")
                            .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                            .setDescription(`Now Playing "${info.video_details.title.replaceAll(`"`, "").replaceAll(`'`, "")}" in ${voice_channel.channel.name}!` + `\nRequested by: <@${interaction.member.user.id}>`)
                            .setFooter({text: "Eggium - Tanner Approved"})
                            .setTimestamp();
                        interaction.reply({ embeds: [embed], ephemeral: false });
                    }).catch(err => {
                        console.log(err)
                        console.log("There was an error getting the playlist info. Details above.")
                        const embed = new EmbedBuilder()
                            .setTitle("Eggium Music - Play Error")
                            .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                            .setDescription(`There was an error playing your song. This is most commonly caused by an age restricted video.`)
                            .setFooter({text: "Eggium - Tanner Approved"})
                            .setTimestamp();
                        interaction.reply({ embeds: [embed], ephemeral: true });
                    });
                }
            } else if(link.includes("soundcloud.com")) {
                play.setToken({ soundcloud : { client_id : config.SOUNDCLOUD_CLIENT_ID } })
                if(link.includes("/sets/")) {
                    playPlaylist(interaction, link, voice_channel);
                } else {
                    let so_info = await play.soundcloud(link)
                    JoinChanNew(voice_channel, link, so_info.name, 0.25, interaction);
                    const embed = new EmbedBuilder()
                        .setTitle("Eggium Music - Play")
                        .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                        .setDescription(`Now Playing "${so_info.name.replaceAll(`"`, "").replaceAll(`'`, "")}" in ${voice_channel.channel.name}!` + `\nRequested by: <@${interaction.member.user.id}>`)
                        .setFooter({text: "Eggium - Tanner Approved"})
                        .setTimestamp();
                    interaction.reply({ embeds: [embed], ephemeral: false });
                }
            } else if(link.includes("spotify.com")) {
                if(link.includes("/playlist/")) return interaction.reply("Spotify playlists are not supported yet! Please try either Soundcloud or Youtube.", { ephemeral: true });
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
            }
        } else {
            //song is playing.
            if(link.includes("youtube.com")) {
                if(link.includes("playlist?list=")) {
                    playPlaylist(interaction, link, voice_channel);
                } else {
                    let yt_info = await play.video_info(link).then(info => {
                        var date = new Date();
                        date.toLocaleString('en-US', { timeZone: 'America/New_York' });
                        console.log(`Added song to queue! | ${date.toISOString().slice(0, 19).replace('T', ' ')}`);
                        console.log(info.video_details.thumbnails)
                        con.query(`INSERT INTO MusicSystem (songLink, songName, songRequester, songStatus, serverID, voiceChannelID, dateAdded) VALUES ("${link}", "${info.video_details.title.replaceAll(`"`, "").replaceAll(`'`, "")}", ${String(interaction.member.user.id)}, "queued", ${String(voice_channel.guild.id)}, ${String(voice_channel.channelId)}, "${date.toISOString().slice(0, 19).replace('T', ' ')}")`);
                        const embed = new EmbedBuilder()
                            .setTitle("Eggium Music - Added to Queue")
                            .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                            .setDescription(`Added ${info.video_details.title.replaceAll(`"`, "").replaceAll(`'`, "")} to queue!` + `\nRequested by: <@${interaction.member.user.id}>`)
                            .setFooter({text: "Eggium - Tanner Approved"})
                            .setTimestamp();
                        interaction.reply({ embeds: [embed], ephemeral: false });
                    }).catch(err => {
                        console.log(err)
                        console.log("There was an error getting the playlist info. Details above.")
                        const embed = new EmbedBuilder()
                            .setTitle("Eggium Music - Play Error")
                            .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                            .setDescription(`There was an error playing your song. This is most commonly caused by an age restricted video.`)
                            .setFooter({text: "Eggium - Tanner Approved"})
                            .setTimestamp();
                        interaction.reply({ embeds: [embed], ephemeral: true });
                    });
                }
            } else if(link.includes("soundcloud.com")) {
                play.setToken({ soundcloud : { client_id : config.SOUNDCLOUD_CLIENT_ID } })
                if(link.includes("/sets/")) {
                    playPlaylist(interaction, link, voice_channel);
                } else {
                    let so_info = await play.soundcloud(link)
                    var date = new Date();
                    date.toLocaleString('en-US', { timeZone: 'America/New_York' });
                    console.log(`Added song to queue! | ${date.toISOString().slice(0, 19).replace('T', ' ')}`);
                    console.log(so_info.thumbnail)
                    con.query(`INSERT INTO MusicSystem (songLink, songName, songRequester, songStatus, serverID, voiceChannelID, dateAdded) VALUES ("${so_info.permalink}", "${so_info.name.replaceAll(`"`, "").replaceAll(`'`, "")}", ${String(interaction.member.user.id)}, "queued", ${String(voice_channel.guild.id)}, ${String(voice_channel.channelId)}, "${date.toISOString().slice(0, 19).replace('T', ' ')}")`);
                    const embed = new EmbedBuilder()
                        .setTitle("Eggium Music - Added to Queue")
                        .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                        .setDescription(`Added ${so_info.name.replaceAll(`"`, "").replaceAll(`'`, "")} to queue!` + `\nRequested by: <@${interaction.member.user.id}>`)
                        .setFooter({text: "Eggium - Tanner Approved"})
                        .setTimestamp();
                    interaction.reply({ embeds: [embed], ephemeral: false });
                }
            } else if(link.includes("spotify.com")) {
                if(link.includes("/playlist/")) return interaction.reply("Spotify playlists are not supported yet! Please try either Soundcloud or Youtube.", { ephemeral: true });
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
                console.log(searched[0].thumbnails)
                con.query(`INSERT INTO MusicSystem (songLink, songName, songRequester, songStatus, serverID, voiceChannelID, dateAdded) VALUES ("${searched[0].url}", "${searched[0].title.replaceAll(`"`, "").replaceAll(`'`, "")}", ${String(interaction.member.user.id)}, "queued", ${String(voice_channel.guild.id)}, ${String(voice_channel.channelId)}, "${date.toISOString().slice(0, 19).replace('T', ' ')}")`);
                const embed = new EmbedBuilder()
                    .setTitle("Eggium Music - Added to Queue")
                    .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                    .setDescription(`Added ${searched[0].title.replaceAll(`"`, "").replaceAll(`'`, "")} to queue!` + `\nRequested by: <@${interaction.member.user.id}>`)
                    .setFooter({text: "Eggium - Tanner Approved"})
                    .setTimestamp();
                interaction.reply({ embeds: [embed], ephemeral: false });
            } else {
                let yt_info = await play.search(link, {
                    limit: 1
                })
                //add song to queue
                var date = new Date();
                date.toLocaleString('en-US', { timeZone: 'America/New_York' });
                console.log(yt_info[0])
                console.log(yt_info)
                console.log(yt_info[0].url)
                con.query(`INSERT INTO MusicSystem (songLink, songName, songRequester, songStatus, serverID, voiceChannelID, dateAdded) VALUES ("${yt_info[0].url}", "${yt_info[0].title.replaceAll(`"`, "").replaceAll(`'`, "")}", ${String(interaction.member.user.id)}, "queued", ${String(voice_channel.guild.id)}, ${String(voice_channel.channelId)}, "${date.toISOString().slice(0, 19).replace('T', ' ')}")`);
                const embed = new EmbedBuilder()
                    .setTitle("Eggium Music - Added to Queue")
                    .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                    .setDescription(`Added ${yt_info[0].title.replaceAll(`"`, "").replaceAll(`'`, "")} to queue!` + `\nRequested by: <@${interaction.member.user.id}>`)
                    .setFooter({text: "Eggium - Tanner Approved"})
                    .setTimestamp();
                interaction.reply({ embeds: [embed], ephemeral: false });
            }
        }
    })
}


async function JoinChanNew(channel, link, name, volume, interaction, shouldInsertNew = true, shouldReuse = false){
    const connection = joinVoiceChannel({
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
    connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
        try {
            console.log("Disconnected Try.")
            await Promise.race([
                entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
            ]);
        } catch (error) {
            console.log("Disconnected Catch.")
            connection.destroy();
            con.query(`UPDATE MusicSystem SET songStatus = "played" WHERE serverID = ${String(channel.guild.id)};`);
            console.log(`killed current queue for ${String(channel.guild.id)}`)
        }
    });
    var date = new Date();
    date.toLocaleString('en-US', { timeZone: 'America/New_York' });
    if(shouldInsertNew === true) {
        con.query(`INSERT INTO MusicSystem (songLink, songName, songRequester, songStatus, serverID, voiceChannelID, dateAdded) VALUES ("${link}", "${name.replaceAll(`"`, "").replaceAll(`'`, "")}", ${String(interaction.member.user.id)}, "playing", ${String(channel.guild.id)}, ${String(channel.channelId)}, "${date.toISOString().slice(0, 19).replace('T', ' ')}")`);
        console.log("added to queue")
    }
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
                console.log('no songs in queue');
                try {
                    connection.destroy();
                    console.log('Successfully destroyed connection. From JoinChanNew')
                    con.query(`UPDATE MusicSystem SET songStatus = "played" WHERE songStatus = "playing" AND serverID = ${String(channel.guild.id)} AND voiceChannelID = "${String(channel.channelId)}";`);
                    console.log(`killed current queue for ${String(channel.guild.id)} from JoinChanNew`)
                } catch {
                    console.log('Failed to destroy connection. From JoinChanNew (DID NOT KILL CURRENT QUEUE)')
                }
            } else{
                console.log('songs in queue')
                con.query(`UPDATE MusicSystem SET songStatus = "played" WHERE songStatus = "playing" AND serverID = ${String(channel.guild.id)} AND voiceChannelID = "${String(channel.channelId)}";`);
                con.query(`SELECT * FROM MusicSystem WHERE songStatus = "queued" ORDER BY dateAdded ASC;`, function (err, result, fields) {
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
    } else if(track.includes('twitch.tv')){
        link = track;
        var twitchLink = new URL(track);
        if(twitchLink.pathname.includes("/videos/")) {
            twitch.getVod(twitchLink.pathname.split('videos/')[1], false)
            .then(data => { track = m3u8stream(data.filter(item => item.quality === "Audio Only")[0].url) })
            .catch(err => console.error(err));
        } else {
            //Stream
            twitch.getStream(twitchLink.pathname.substring(1), false)
                .then(data => {
                    console.log(data)
                    console.log(data.filter(item => item.quality === "audio_only")[0].url)
                    track = m3u8stream(data.filter(item => item.quality === "audio_only")[0].url);
                }).catch(err => console.error(err));
        }
    }
    setTimeout(function(){
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
                console.log("Disconnected Try.")
                await Promise.race([
                    entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                    entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                ]);
            } catch (error) {
                console.log("Disconnected Catch.")
                connection.destroy();
                con.query(`UPDATE MusicSystem SET songStatus = "played" WHERE serverID = ${String(channel.guild.id)};`);
                console.log(`killed current queue for ${String(channel.guild.id)}`)
            }
        });
        player.on('error', error => {
            console.error(`Error: ${error.message}`);
        });
        player.on(AudioPlayerStatus.Playing, () => {
            var date = new Date();
            date.toLocaleString('en-US', { timeZone: 'America/New_York' });
            console.log(`The audio player has started playing! | ${date.toISOString().slice(0, 19).replace('T', ' ')}`);
            console.log(link)
            if(link.includes('twitch.tv')){
                var twitchLinkFinal = new URL(link);
                console.log(twitchLinkFinal.pathname.substring(1))
                if(channel.channelId === null) return interaction.reply("ERROR: No voice channel found. This is a really weird error. Please try again. If that doesnt work try reporting the error in [the Eggium support server.](https://discord.gg/invite/YdaBd7xmuD)");
                con.query(`INSERT INTO MusicSystem (songLink, songName, songRequester, songStatus, serverID, voiceChannelID, dateAdded) VALUES ("${link}", "${link}", ${String(interaction.member.user.id)}, "playing", ${String(channel.guild.id)}, ${String(channel.channelId)}, "${date.toISOString().slice(0, 19).replace('T', ' ')}")`);
            } else{
                console.log(link.match(/[^/\\&\?]+\.\w{3,4}(?=([\?&].*$|$))/)[0])
                if(channel.channelId === null) return interaction.reply("ERROR: No voice channel found. This is a really weird error. Please try again. If that doesnt work try reporting the error in [the Eggium support server.](https://discord.gg/invite/YdaBd7xmuD)");
                con.query(`INSERT INTO MusicSystem (songLink, songName, songRequester, songStatus, serverID, voiceChannelID, dateAdded) VALUES ("${link.match(/[^/\\&\?]+\.\w{3,4}(?=([\?&].*$|$))/)[0]}", "${link.match(/[^/\\&\?]+\.\w{3,4}(?=([\?&].*$|$))/)[0]}", ${String(interaction.member.user.id)}, "playing", ${String(channel.guild.id)}, ${String(channel.channelId)}, "${date.toISOString().slice(0, 19).replace('T', ' ')}")`);
            }
        }); 
        player.on('idle', () => {
            connection.destroy();
            con.query(`UPDATE MusicSystem SET songStatus = "played" WHERE songStatus = "playing" AND serverID = ${String(channel.guild.id)} AND voiceChannelID = "${String(channel.channelId)}";`);
        })
    },700)
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
            } else if(link.includes('.mp3') || link.includes('.ogg') || link.includes('.m3u') || link.includes('.m3u8') || link.includes('twitch.tv')){
                con.query(`SELECT * FROM MusicSystem WHERE serverID = ${interaction.guild.id} AND voiceChannelID = ${voice_channel.channelId} AND songStatus = "playing"`, function (err, result, fields) {
                    if(result[0] === undefined || result[0] === null) {
                        if(link.includes('twitch.tv')){ JoinChannel(voice_channel, link, 0.50, interaction); } else {JoinChannel(voice_channel, link, 0.25, interaction);}
                        const embed = new EmbedBuilder()
                            .setTitle("Eggium Music - Play")
                            .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                            .setDescription(`Playing file in ${voice_channel.channel.name}!` + `\nRequested by: <@${interaction.member.user.id}>`)
                            .setFooter({text: "Eggium - Tanner Approved"})
                            .setTimestamp();
                        interaction.reply({ embeds: [embed], ephemeral: false });
                    } else {
                        const embed = new EmbedBuilder()
                            .setTitle("Eggium Music - Error!")
                            .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                            .setDescription('A song is already playing! At this time, queueing is not supported for direct file streams.')
                            .setFooter({text: "Eggium - Tanner Approved"})
                            .setTimestamp();
                        interaction.reply({ embeds: [embed], ephemeral: true });
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
                    } else {
                        con.query(`SELECT * FROM MusicSystem WHERE serverID = ${interaction.guild.id} AND voiceChannelID = ${voice_channel.channelId} AND songStatus = "queued" ORDER BY dateAdded ASC;`, async function (err, result, fields) {
                            if(result[0] === undefined || result[0] === null) {
                                //no songs in queue. Safe to disconnect
                                const embed = new EmbedBuilder()
                                    .setTitle("Eggium Music - Skip")
                                    .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                                    .setDescription(`Stopped playing because there are no songs left in the queue!`)
                                    .setFooter({text: "Eggium - Tanner Approved"})
                                    .setTimestamp();
                                interaction.reply({ embeds: [embed], ephemeral: true });
                                con.query(`UPDATE MusicSystem SET songStatus = "played" WHERE songStatus = "playing" AND serverID = ${interaction.guild.id} AND voiceChannelID = ${voice_channel.channelId}`);
                                player.stop();
                            } else{
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