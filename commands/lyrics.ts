import { Command } from "..";
import { EmbedBuilder, SlashCommandBuilder, Colors } from "discord.js";
import type { ChatInputCommandInteraction, ColorResolvable } from "discord.js";
import Song, { type ISong } from '../models/song.model';
var mongoUtil = require( '../utils/mongoUtil' );
var db = mongoUtil.getDb();

export default class LyricsCommand extends Command {
  readonly name = "lyrics";
  override readonly inVoiceChannel = true;
  override readonly playing = true;
  readonly slashBuilder = new SlashCommandBuilder().setName("lyrics").setDescription("Get lyrics for currently playing song");
  async onChatInput(interaction: ChatInputCommandInteraction<"cached">) {
    const queue = this.distube.getQueue(interaction);
    if (!queue) {
      return;
    }

    const currentSong = queue.songs[0];

    try {

      const currentSongName = currentSong.name!.replace(/ /g, "%20");
      const currentSongArtist = currentSong.uploader!.name!.replace(/ /g, "%20");
      let lyrics = await fetch(`https://lrclib.net/api/search?track_name=${currentSongName}&artist_name=${currentSongArtist}`)
      let data: any = await lyrics.json();
      let plainLyrics = data[0].plainLyrics;
      let formattedLyrics = plainLyrics.replace(/\n/g, "\n\n");

      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0') as ColorResolvable)
            .setTitle("Lyrics for " + currentSong.name)
            .setDescription(formattedLyrics)
          ],
          ephemeral: true
      });
    } catch (e) {
      console.error(e);
      interaction.reply({
        embeds: [new EmbedBuilder().setColor(Colors.Red).setTitle("Eggium").setDescription(`Error: \`${e}\``)],
      });
    }
  }
}
