import { Events } from "distube";
import { DisTubeEvent } from "../..";
import { Colors, EmbedBuilder } from "discord.js";
import type { DisTubeError, Queue } from "distube";

export default class NoRelatedEvent extends DisTubeEvent<Events.NO_RELATED> {
  readonly name = Events.NO_RELATED;
  run(queue: Queue, error: DisTubeError) {
    queue.textChannel?.send({
      embeds: [new EmbedBuilder().setColor(Colors.Red).setTitle("Eggium").setDescription(error.message)],
    });
  }
}
