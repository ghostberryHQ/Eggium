import { Events } from "distube";
import { EmbedBuilder } from "discord.js";
import { DisTubeEvent, type Metadata } from "../..";
import type { Playlist, Queue } from "distube";

export default class AddListEvent extends DisTubeEvent<Events.ADD_LIST> {
  readonly name = Events.ADD_LIST;
  run(_queue: Queue, playlist: Playlist<Metadata>) {
    playlist.metadata.interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor("Blurple")
          .setTitle("Eggium")
          .setDescription(`Added \`${playlist.name}\` (${playlist.songs.length} songs) to the queue`),
      ],
    });
  }
}
