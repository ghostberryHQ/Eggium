import { Command } from "..";
import { EmbedBuilder, SlashCommandBuilder, Colors } from "discord.js";
import type { Metadata } from "..";
import type { ChatInputCommandInteraction, ColorResolvable } from "discord.js";

export default class HeatPatCommand extends Command {
  readonly name = "headpat";
  override readonly inVoiceChannel = false;
  readonly slashBuilder = new SlashCommandBuilder()
    .setName("headpat")
    .setDescription("Congratulate Eggium on his hard work");
  async onChatInput(interaction: ChatInputCommandInteraction<"cached">) {
    interaction.reply({ content: '*pat pat* 😊' , ephemeral: false});
  }
}
