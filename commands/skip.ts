import { Command } from "..";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import type { ChatInputCommandInteraction, ColorResolvable } from "discord.js";

export default class SkipCommand extends Command {
  readonly name = "skip";
  override readonly inVoiceChannel = true;
  override readonly playing = true;
  readonly slashBuilder = new SlashCommandBuilder().setName("skip").setDescription("Skip the current song");
  async onChatInput(interaction: ChatInputCommandInteraction<"cached">) {
    try {
      const song = await this.distube.skip(interaction);
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0') as ColorResolvable)
            .setTitle("Eggium")
            .setDescription(`Skipped to \`${song.name || song.url}\``),
        ],
      });
    } catch (e) {
      console.error(e);
      interaction.reply({
        embeds: [new EmbedBuilder().setColor("Blurple").setTitle("Eggium").setDescription(`Error: \`${e}\``)],
      });
    }
  }
}
