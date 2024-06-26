import { ClientEvent } from "../..";
import type { Interaction } from "discord.js";

export default class InteractionCreateEvent extends ClientEvent<"interactionCreate"> {
  readonly name = "interactionCreate";
  async run(interaction: Interaction) {
    if (!interaction.inCachedGuild()) return;
    if (interaction.isChatInputCommand()) {
      const cmd = this.client.commands.get(interaction.commandName);
      if (!cmd) return;
      if (cmd.inVoiceChannel && !interaction.member.voice.channel) {
        interaction.reply("You must be in a voice channel to use this command!");
        return;
      }
      if (cmd.playing && !this.distube.getQueue(interaction)) {
        interaction.reply("You must play something before using this command!");
        return;
      }
      await cmd.onChatInput(interaction);
    }
  }
}
