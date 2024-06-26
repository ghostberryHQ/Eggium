import { Events } from "distube";
import { EmbedBuilder } from "discord.js";
import { DisTubeEvent, type Metadata, followUp } from "../..";
import type { Queue, Song } from "distube";

export default class ErrorEvent extends DisTubeEvent<Events.ERROR> {
  readonly name = Events.ERROR;
  async run(error: Error, queue: Queue, song?: Song<Metadata>) {
    if (song) {
      await followUp(
        song.metadata.interaction,
        new EmbedBuilder().setColor("Blurple").setTitle("Eggium").setDescription(`Error: \`${error.message}\``),
        queue.textChannel!,
      );
    } else if (queue.textChannel) {
      await queue.textChannel.send({
        embeds: [
          new EmbedBuilder().setColor("Blurple").setTitle("Eggium").setDescription(`Error: \`${error.message}\``),
        ],
      });
    } else {
      console.error(error);
    }
  }
}
