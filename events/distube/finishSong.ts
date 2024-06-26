import { DisTubeEvent, type Metadata } from "../..";
import { EmbedBuilder } from "discord.js";
import { Events } from "distube";
import type { Queue, Song as Song2 } from "distube";
import type { ColorResolvable } from "discord.js";
import Song, { type ISong } from '../../models/song.model';
var mongoUtil = require( '../../utils/mongoUtil' );
var db = mongoUtil.getDb();


export default class FinishSongEvent extends DisTubeEvent<Events.FINISH_SONG> {
  readonly name = Events.FINISH_SONG;
  run(queue: Queue, song: Song2<Metadata>) {
    Song.findOneAndUpdate({
      title: song.name,
      server: song.metadata.interaction.guildId,
      status: "playing",
    }, { status: "played" }).exec().then(() => {
      console.log(`${song.name} updated to played in database`);
    });
  }
}
