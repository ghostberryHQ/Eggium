import { Command } from "..";
import { EmbedBuilder, SlashCommandBuilder, Colors } from "discord.js";
import type { Metadata } from "..";
import type { ChatInputCommandInteraction, ColorResolvable } from "discord.js";

export default class SourceCommand extends Command {
  readonly name = "source";
  override readonly inVoiceChannel = false;
  readonly slashBuilder = new SlashCommandBuilder()
    .setName("source")
    .setDescription("Replies with Eggium's source code!");
  async onChatInput(interaction: ChatInputCommandInteraction<"cached">) {
    interaction.reply({ content: 'https://github.com/ghostberryHQ/Eggium/tree/v2' , ephemeral: true});
  }
}
