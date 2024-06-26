import { Command } from "..";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import type { Metadata } from "..";
import type { ChatInputCommandInteraction, ColorResolvable } from "discord.js";

export default class PlayCommand extends Command {
  readonly name = "play";
  override readonly inVoiceChannel = true;
  readonly slashBuilder = new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play music from a supported URL (all provider) or search a query")
    .addStringOption(opt => opt.setName("input").setDescription("A supported URL or a search query").setRequired(true))
    .addBooleanOption(opt =>
      opt.setName("skip").setDescription("Skip the current song").setRequired(false),
    )
    .addIntegerOption(opt =>
      opt.setName("position").setDescription("Position will be added to the queue").setRequired(false),
    );
  async onChatInput(interaction: ChatInputCommandInteraction<"cached">) {
    const input = interaction.options.getString("input", true);
    const skip = interaction.options.getBoolean("skip", false) ?? false;
    const position = interaction.options.getInteger("position", false) ?? undefined;
    const vc = interaction.member?.voice?.channel;
    if (!vc) return; // Handled by inVoiceChannel property
    await interaction.deferReply();
    this.client.distube
      .play<Metadata>(vc, input, {
        skip,
        position,
        textChannel: interaction.channel ?? undefined,
        member: interaction.member,
        metadata: { interaction },
      })
      .catch(e => {
        console.error(e);
        interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0') as ColorResolvable)
              .setTitle("Eggium")
              .setDescription(`Error: \`${e.message}\``),
          ],
        });
      });
  }
}
