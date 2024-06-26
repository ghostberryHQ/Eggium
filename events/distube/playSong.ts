import { Events } from "distube";
import { EmbedBuilder } from "discord.js";
import { DisTubeEvent, type Metadata, followUp } from "../..";
import type { Queue, Song } from "distube";
import type { ColorResolvable } from "discord.js";


export default class PlaySongEvent extends DisTubeEvent<Events.PLAY_SONG> {
  readonly name = Events.PLAY_SONG;
  run(queue: Queue, song: Song<Metadata>) {
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
