import { Command } from "..";
import { EmbedBuilder, SlashCommandBuilder, Colors } from "discord.js";
import type { Metadata } from "..";
import type { ChatInputCommandInteraction, ColorResolvable } from "discord.js";
const twitch = require("twitch-m3u8");
const m3u8stream = require('m3u8stream')

// import twitch from "twitch-m3u8";

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

    if(input.toLowerCase().includes('twitch.tv')) {
      //get "leekbeats" from https://www.twitch.tv/leekbeats using this regex
      //^(?:(?:https?)?(?:\:\/\/)?)?(?:\w*\.)?(?:\w+)?.(?:\w+)\/(\w+)$
      const channel = input.match(/^(?:(?:https?)?(?:\:\/\/)?)?(?:\w*\.)?(?:\w+)?.(?:\w+)\/(\w+)$/)![1];
      console.log(channel);
      twitch.getStream(channel).then((stream: any) => {
        console.log(stream);

        //get the audio_only stream
        const audio = stream.find((s: any) => s.quality === 'audio_only');
        console.log(audio.url);
        this.client.distube.play<Metadata>(vc, audio.url, {
          textChannel: interaction.channel ?? undefined,
          member: interaction.member,
          metadata: { interaction },
        }).catch(e => {
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


      }).catch((err: any) => {
        console.error(err);
      });

    } else {
      this.client.distube.play<Metadata>(vc, input, {
        textChannel: interaction.channel ?? undefined,
        member: interaction.member,
        metadata: { interaction },
      }).catch(e => {
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
}
