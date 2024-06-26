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
        //Example response:
        //[
        //   {
        //     quality: '720p (source)',
        //     resolution: '1280x720',
        //     url: 'https://video-weaver.ord56.hls.ttvnw.net/v1/playlist/CtwEOD3BjjOutdBMB26_t-qO8-AVbCdpQn3naSxgiVlhARyjoRep0e9lBcjw27lcqNRfXcJxb8XL4tx-O0llkNpS15TdVxg3Tlq6xJBtwIVBARZxqeqziRNywUwIZpX7GUau3LcHnbMnBhkNs_pJKHZaPxNmOnVlbeDlXYT9B3TUEMi9RBcsoduw7jaoc5CD2W3_p5zq9O3Z2SOifo9k5BqkZKf5-WVH0Hrrlmx6u7zp9dnQO0-Pn3Od5TjpJjaid8JFmodgDIiCCxWuTCh4Xepi8KX8NiQhyuZIDIqa_3ue8Un1VOCLF3vW67DICjWCax3JPRUAFShpX1JEXTlbkLB1eUUaak5VoF7qRwxOyJAuF44-ztSAXmvXIeKaeCv3xpjkpTY2kjr5TN6Lt3d6pM-V_mIElUeJxomfHFgrSrZwZIiu6t8H7ksqJlSGrPtrrKHVRfYzB4UDlemdtbVvlein-OxBVxEEP-PjaKwZQ113_mvASU9yEA1hiEqVcEiGC0qLmuOOT5h2iaOX-yv5PYuiPZgFtr89UTVlvGLTfUDDR2X9clqc0ds9w6ivdaItvUoDK4zEWb--AYGLOPWuXE4rQusEdmp21HLTf71qEPCtlsry0Pe30WAWcFyjM4gwxzxLeskiEjg4btssxzO5bj0LRaGjAENvKEsWFPwOdIN_ZQqc0AVE3XJzioBqWKPHD_z81TZeGRBcyrCSdRC83ThIW0TaiJYzEYnnFwyxmZYHeP2KJkYnkjpsp-cjyfTsX-F8vj7dDs0E1usTp6PouToW0aXrEAruYGm8Sb1lZhoMttZCHA76-XrdEuLMIAEqCXVzLWVhc3QtMjDgCQ.m3u8'
        //   },
        //   {
        //     quality: 'audio_only',
        //     resolution: null,
        //     url: 'https://video-weaver.ord56.hls.ttvnw.net/v1/playlist/CrAEHMYLoKqNUy3XWfMbRbbCNmiIOSQMgX_OjM_GMiRaLTkoXpHBpa9LMUEeUD9KPPvg4prlnv04xSfBo4VCjtxaJJzcB5t1qk2EX3t2Ok3B_g7axmQUbGqGHbiUZGpdzAUuAGEKkRv193UoWM7Med9As4oiL-3If_-gxFiY6VceczF4wkTOCVbYt93lNfDfuuhqFFDry9l8zTkFt8uv85ppOGmR8_GuFl85vZT16zLvbs8ckK7KTLLWgawF8ZcVGR5lIWVijEzwdLPWj_yQdsiQEKyK-99cGeOvVhUu4JRPUlY7Lz5lkGdIwbehR3NFCrhoiUiUcT-8c_B4g2jbRTAQ5DX6bDVMdYkxX91HswF6ZOA8wOREl--e6Lr2opiIhYbAgzgJav8cOEBqnRChGOBymiaVTqnXi8BY6-Mbf6ieUBIs2t3f4oAFBl0SpiZ20D6vWnDIypjRBIAQcc3cx0n5VOPy5gqZL-ZtPZGHmVMk5FVf4UOUIuqCSa78fBmbwpsoVZLqjGPWSJBrqKp8Yz4xR8aS61ahCEZLmN9FeJYMn0-6iocmx_gr-QaWhf-w62SD2HRI9OzcCod34b3N445i_p6-YCxHiVeyhAceBCBJV-gn4hfLJkhihKlMlIdrMm60hH4WteWEYr-5Njmtt6Mo7xpZ_KNTt2JZzREDYewRgyqA1IK4DKCUnTP_MSAf6-D61n64oLp8V238_nH08go0TEE7Xxw_rIOf_ib2OqWS8f8aDEwllE4zD9BkpzDhuSABKgl1cy1lYXN0LTIw4Ak.m3u8'        
        //   }
        // ]

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
