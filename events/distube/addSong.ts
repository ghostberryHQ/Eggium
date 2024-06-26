import { Events } from "distube";
import { EmbedBuilder } from "discord.js";
import { DisTubeEvent, type Metadata } from "../..";
import type { Queue, Song as Song2 } from "distube";
import type { ColorResolvable } from "discord.js";
// import Song from '../../models/song.model';
import Song, { type ISong } from '../../models/song.model';
var mongoUtil = require( '../../utils/mongoUtil' );
var db = mongoUtil.getDb();

console.log(db)





export default class AddSongEvent extends DisTubeEvent<Events.ADD_SONG> {
  
  readonly name = Events.ADD_SONG;
  run(_queue: Queue, song: Song2<Metadata>) {



    const songData = new Song({
      title: song.name!,
      url: song.url!,
      status: "queued",
      server: song.metadata.interaction.guildId!,
      requester: song.member?.user.id!,
      skipVotes: [],
    }).save().then(() => {
      console.log('Song saved to database');
    });


    song.metadata.interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0') as ColorResolvable)
          .setTitle("Eggium")
          .setDescription(`Added \`${song.name}\` to the queue`),
      ],
    });
  }
}
