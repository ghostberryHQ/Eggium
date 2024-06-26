import { Events } from "distube";
import { EmbedBuilder } from "discord.js";
import { DisTubeEvent, type Metadata } from "../..";
import type { Playlist, Queue } from "distube";
import type { ColorResolvable } from "discord.js";


export default class AddListEvent extends DisTubeEvent<Events.ADD_LIST> {
  readonly name = Events.ADD_LIST;
  run(_queue: Queue, playlist: Playlist<Metadata>) {
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
