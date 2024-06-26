import { Events } from "distube";
import { EmbedBuilder } from "discord.js";
import { DisTubeEvent, type Metadata } from "../..";
import type { Queue, Song } from "distube";
import type { ColorResolvable } from "discord.js";


export default class AddSongEvent extends DisTubeEvent<Events.ADD_SONG> {
  readonly name = Events.ADD_SONG;
  run(_queue: Queue, song: Song<Metadata>) {
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
