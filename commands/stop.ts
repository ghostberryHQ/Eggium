import { Command } from "..";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import type { ChatInputCommandInteraction, ColorResolvable } from "discord.js";

export default class StopCommand extends Command {
  readonly name = "stop";
  override readonly inVoiceChannel = true;
  override readonly playing = true;
  readonly slashBuilder = new SlashCommandBuilder().setName("stop").setDescription("Stop the playing queue");
  async onChatInput(interaction: ChatInputCommandInteraction<"cached">) {
    try {
      await this.distube.stop(interaction);
      interaction.reply({
        embeds: [new EmbedBuilder().setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0') as ColorResolvable).setTitle("Eggium").setDescription("Stopped!")],
      });
    } catch (e) {
      console.error(e);
      interaction.reply({
        embeds: [new EmbedBuilder().setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0') as ColorResolvable).setTitle("Eggium").setDescription(`Error: \`${e}\``)],
      });
    }
  }
}
