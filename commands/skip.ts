import { Command } from "..";
import { EmbedBuilder, SlashCommandBuilder, Colors } from "discord.js";
import type { ChatInputCommandInteraction, ColorResolvable } from "discord.js";

export default class SkipCommand extends Command {
  readonly name = "forceskip";
  override readonly inVoiceChannel = true;
  override readonly playing = true;
  readonly slashBuilder = new SlashCommandBuilder().setName("forceskip").setDescription("Force skip the current song");
  async onChatInput(interaction: ChatInputCommandInteraction<"cached">) {
    const queue = this.distube.getQueue(interaction);
    if (!queue) {
      return;
    }

    try {

      if(queue.songs.length === 1){
        //no song next so just stop
        await this.distube.stop(interaction);
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0') as ColorResolvable)
              .setTitle("Eggium")
              .setDescription("Theres no songs left in the queue, stopping the music!"),
            ],
        });
      } else {
        const song = await this.distube.skip(interaction);
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0') as ColorResolvable)
              .setTitle("Eggium")
              .setDescription(`Skipped to \`${song.name || song.url}\``),
          ],
        });
      }
    } catch (e) {
      console.error(e);
      interaction.reply({
        embeds: [new EmbedBuilder().setColor(Colors.Red).setTitle("Eggium").setDescription(`Error: \`${e}\``)],
      });
    }
  }
}
