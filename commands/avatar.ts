import { Command } from "..";
import { EmbedBuilder, SlashCommandBuilder, Colors } from "discord.js";
import type { Metadata } from "..";
import type { ChatInputCommandInteraction, ColorResolvable } from "discord.js";

export default class AvatarCommand extends Command {
  readonly name = "avatar";
  override readonly inVoiceChannel = false;
  readonly slashBuilder = new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Get a users avatar")
    .addMentionableOption(option =>
      option.setName('username').setDescription('The user you want to get the avatar of').setRequired(false));
  async onChatInput(interaction: ChatInputCommandInteraction<"cached">) {
    var username: any;
    var id: any;
    if(interaction.options.get("username") === undefined || interaction.options.get("username") === null) {
      username = interaction;
      id = username.user.id;
    } else {
      username = interaction.options.get("username");
      id = username?.value;
    }

    setTimeout(function() {
      console.log(username.user.username)
      const embed = new EmbedBuilder()
          .setTitle('Avatar - ' + username.user.username)
          .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0') as ColorResolvable)
          .setThumbnail('https://cdn.discordapp.com/avatars/'+id+'/'+username.user.avatar+'.png')
          .setDescription('https://cdn.discordapp.com/avatars/'+id+'/'+username.user.avatar+'.png')
          .setFooter({ text: "Eggium - Tanner Approved" })
          .setTimestamp();
      interaction.reply({ embeds: [embed] });
  }, 1000);
  }
}
