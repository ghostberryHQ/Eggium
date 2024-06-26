import { Command } from "..";
import { EmbedBuilder, SlashCommandBuilder, AttachmentBuilder, Colors } from "discord.js";
import type { Metadata } from "..";
import type { ChatInputCommandInteraction, ColorResolvable } from "discord.js";
import { toDataURL } from 'qrcode';

export default class PlayCommand extends Command {
  readonly name = "remote";
  override readonly inVoiceChannel = true;
  readonly slashBuilder = new SlashCommandBuilder()
    .setName("remote")
    .setDescription("Take control of the music with a web remote");
  async onChatInput(interaction: ChatInputCommandInteraction<"cached">) {
    const vc = interaction.member?.voice?.channel;
    if (!vc) return; // Handled by inVoiceChannel property

    const base64 = await toDataURL(`https://persn.dev/eggium/musicRemote.html?controlId=${interaction.guildId}.${vc.id}`, { type: 'image/jpeg', rendererOpts: { quality: 1 } });
    const buffer = Buffer.from(base64.replace(/^data:image\/png;base64,/, '').toString(), 'base64');
    const attachment = new AttachmentBuilder(buffer, { name: 'chart.png' });


    const embed = new EmbedBuilder()
        .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0') as ColorResolvable)
        .setTitle(`Eggium Music - Remote`)
        .setURL(`https://persn.dev/eggium/musicRemote.html?controlId=${interaction.guildId}.${vc.id}`)
        .setImage("attachment://chart.png")
        .setDescription(`Scan the QR code below to control the music player from your phone!`)
    interaction.reply({ embeds: [embed], files: [attachment], ephemeral: true });

  }
}
