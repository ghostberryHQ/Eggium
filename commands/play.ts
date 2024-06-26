import { Command } from "..";
import { EmbedBuilder, SlashCommandBuilder, Colors } from "discord.js";
import type { Metadata } from "..";
import type { ChatInputCommandInteraction, ColorResolvable } from "discord.js";

export default class PlayCommand extends Command {
  readonly name = "play";
  override readonly inVoiceChannel = true;
  readonly slashBuilder = new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play music from a supported URL (all provider) or search a query")
    .addStringOption(opt => opt.setName("input").setDescription("A supported URL or a search query").setRequired(true));
  async onChatInput(interaction: ChatInputCommandInteraction<"cached">) {
    const input = interaction.options.getString("input", true);
    const vc = interaction.member?.voice?.channel;
    if (!vc) return; // Handled by inVoiceChannel property
    await interaction.deferReply();
    this.client.distube
      .play<Metadata>(vc, input, {
        textChannel: interaction.channel ?? undefined,
        member: interaction.member,
        metadata: { interaction },
      })
      .catch(e => {
        console.error(e);
        interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(Colors.Red)
              .setTitle("Eggium")
              .setDescription(`Error: \`${e.message}\``),
          ],
        });
      });
  }
}
