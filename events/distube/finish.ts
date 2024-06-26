import { DisTubeEvent } from "../..";
import { EmbedBuilder } from "discord.js";
import { Events, type Queue } from "distube";
import type { ColorResolvable } from "discord.js";
import Song, { type ISong } from '../../models/song.model';
var mongoUtil = require( '../../utils/mongoUtil' );
var db = mongoUtil.getDb();


export default class FinishEvent extends DisTubeEvent<Events.FINISH> {
  readonly name = Events.FINISH;
  run(queue: Queue) {

    const name = queue.songs[0].name;

    Song.findOneAndUpdate({
      title: name,
      server: queue.songs[0].member?.guild.id,
      status: "playing",
    }, { status: "played" }).exec().then(() => {
      console.log(`${name} updated to played in database`);
    });


    queue.textChannel?.send({
      embeds: [new EmbedBuilder().setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0') as ColorResolvable).setTitle("Eggium").setDescription(`Finished playing: \`${name}\``)],
    });
    queue.voice.leave();
  }
}
