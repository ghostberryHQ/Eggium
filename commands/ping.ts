import { Command } from "..";
import { EmbedBuilder, SlashCommandBuilder, Colors } from "discord.js";
import type { Metadata } from "..";
import type { ChatInputCommandInteraction, ColorResolvable } from "discord.js";

export default class PingCommand extends Command {
  readonly name = "ping";
  override readonly inVoiceChannel = false;
  readonly slashBuilder = new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with pong!");
  async onChatInput(interaction: ChatInputCommandInteraction<"cached">) {
    const delay = Math.abs(Date.now() - interaction.createdTimestamp);
    interaction.reply({ content: '🏓 Pong! ' + delay +'ms' , ephemeral: true});
  }
}
