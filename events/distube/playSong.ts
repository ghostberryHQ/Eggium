import { Events } from "distube";
import { EmbedBuilder } from "discord.js";
import { DisTubeEvent, type Metadata, followUp } from "../..";
import type { Queue, Song as Song2 } from "distube";
import type { ColorResolvable } from "discord.js";
import Song, { type ISong } from '../../models/song.model';
var mongoUtil = require( '../../utils/mongoUtil' );
var db = mongoUtil.getDb();


export default class PlaySongEvent extends DisTubeEvent<Events.PLAY_SONG> {
  readonly name = Events.PLAY_SONG;
  run(queue: Queue, song: Song2<Metadata>) {


    Song.findOneAndUpdate({
      title: song.name,
      server: song.metadata.interaction.guildId,
      status: "queued",
    }, { status: "playing" }).exec().then(() => {
      console.log(`${song.name} updated to playing in database`);
    });
    followUp(
      song.metadata.interaction,
      new EmbedBuilder()
        .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0') as ColorResolvable)
        .setTitle("Eggium")
        .setDescription(`Playing: \`${song.name}\``),
      queue.textChannel!,
    ).catch(console.error);
  }
}
