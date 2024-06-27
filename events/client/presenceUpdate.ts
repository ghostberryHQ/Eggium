import { ClientEvent } from "../..";
import type { Interaction, Presence } from "discord.js";

export default class presenceUpdateEvent extends ClientEvent<"presenceUpdate"> {
  readonly name = "presenceUpdate";
  async run(oldPresence: Presence | null, newPresence: Presence) {
    if (!newPresence.activities) return false;
    for (let i = 0; i < newPresence.activities.length; i++) {
        if(newPresence.activities[i] != undefined && newPresence.activities[i].details != undefined && newPresence.activities[i].details != null && newPresence.activities[i].details!.toLowerCase() === "idling") return;
        if(newPresence.activities[i] != undefined && newPresence.activities[i].state != undefined && newPresence.activities[i].state != null && newPresence.activities[i].state!.toLowerCase() === "idling") return;
    }
    newPresence.activities.forEach(activity => {
        if (activity.type = 2) {
            if(newPresence.member!.user.bot) return; // user is a bot. ignore
            if(activity.details == null) return;
            var songName = activity.details.replace(/['"]+/g, '');
            var songArtist = activity.state!.replace(/['"]+/g, '');
            console.log(newPresence.member!.user.id)
            console.log("NAME: "+songName)
            console.log("ARTIST: "+songArtist)

        } else {
            console.log(activity)
        }
    });



  }
}
