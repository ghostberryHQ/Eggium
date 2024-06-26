import { Events } from "distube";
import { EmbedBuilder } from "discord.js";
import { DisTubeEvent, type Metadata } from "../..";
import type { Playlist, Queue } from "distube";
import type { ColorResolvable } from "discord.js";
import Song, { type ISong } from '../../models/song.model';
var mongoUtil = require( '../../utils/mongoUtil' );
var db = mongoUtil.getDb();

export default class AddListEvent extends DisTubeEvent<Events.ADD_LIST> {
  readonly name = Events.ADD_LIST;
  run(_queue: Queue, playlist: Playlist<Metadata>) {

    //for each song in the playlist, add it to the database
    playlist.songs.forEach(song => {
      const songData = new Song({
        title: song.name!,
        url: song.url!,
        status: "queued",
        server: song.member?.guild.id!,
        requester: song.member?.user.id!,
        skipVotes: [],
      }).save().then(() => {
        console.log('Song saved to database');
      });
    });


    playlist.metadata.interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0') as ColorResolvable)
          .setTitle("Eggium")
          .setDescription(`Added \`${playlist.name}\` (${playlist.songs.length} songs) to the queue`),
      ],
    });
  }
}
