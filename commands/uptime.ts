import { Command } from "..";
import { EmbedBuilder, SlashCommandBuilder, Colors } from "discord.js";
import type { Metadata } from "..";
import type { ChatInputCommandInteraction, ColorResolvable } from "discord.js";

export default class UptimeCommand extends Command {
  readonly name = "uptime";
  override readonly inVoiceChannel = false;
  readonly slashBuilder = new SlashCommandBuilder()
    .setName("uptime")
    .setDescription("Shows the bot's uptime");
  async onChatInput(interaction: ChatInputCommandInteraction<"cached">) {
    var uptime = process.uptime();
    var seconds = uptime % 60;
    var minutes = Math.floor(uptime / 60) % 60;
    var hours = Math.floor(uptime / 3600) % 24;
    var days = Math.floor(uptime / 86400);
    interaction.reply({ content: `Uptime: ${days}d ${hours}h ${minutes}m ${seconds}s` , ephemeral: true});
  }
}
