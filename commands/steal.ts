import { Command } from "..";
import { EmbedBuilder, SlashCommandBuilder, Colors, PermissionFlagsBits } from "discord.js";
import type { Metadata } from "..";
import type { ChatInputCommandInteraction, ColorResolvable, PermissionResolvable } from "discord.js";
import type { Permission } from "puppeteer";

export default class StealCommand extends Command {
  readonly name = "steal";
  override readonly inVoiceChannel = false;
  readonly slashBuilder = new SlashCommandBuilder()
    .setName("steal")
    .setDescription("Steals any emoji from any server you are in")
    .addStringOption(option =>
      option.setName('emoji')
          .setDescription('The emoji/emote you would like to steal')
          .setRequired(true));
  async onChatInput(interaction: ChatInputCommandInteraction<"cached">) {
    var emoji = interaction.options.getString("emoji");
    var arr = emoji?.match(/<a:.+?:\d+>|<:.+?:\d+>/g);
    if(arr!.length > 1) {
      interaction.reply({content: 'Look man. One emoji at a time. Dont want to be caught by the police now. Do ya?', ephemeral: true});
    } else {
      var emoteIDToSteal = arr![0].match(/\d+/g)![0];
      var emoteNameToSteal = arr![0].match(/(?<=:)[a-zA-Z1-9]+(?=:)/g)![0];
      if(emoji?.toString().includes('<a:')) {
          //check if user has permission to add emojis
          if(interaction.member.permissions.has(PermissionFlagsBits.ManageGuildExpressions)) {
              console.log("gif " + `https://cdn.discordapp.com/emojis/${emoteIDToSteal}.gif?size=44&quality=lossless`);
              
              let fimg = await fetch(`https://cdn.discordapp.com/emojis/${emoteIDToSteal}.gif?size=44&quality=lossless`)
              let fimgb = Buffer.from(await fimg.arrayBuffer())
              interaction.guild.emojis.create({attachment: fimgb, name: emoteNameToSteal}).then(emote => {
                  interaction.reply({ content: `<a:${emote.name}:${emote.id}> | Stole "${emote.name}"` , ephemeral: true});
              }).catch(console.error);
          } else {
              interaction.reply({content: 'You do not have permission to add emojis to this server', ephemeral: true});
          }
      } else {
          if(interaction.member.permissions.has(PermissionFlagsBits.ManageGuildExpressions)) {
              console.log("non-gif " + `https://cdn.discordapp.com/emojis/${emoteIDToSteal}.webp?size=44&quality=lossless`);
              let fimg = await fetch(`https://cdn.discordapp.com/emojis/${emoteIDToSteal}.webp?size=44&quality=lossless`)
              let fimgb = Buffer.from(await fimg.arrayBuffer())

              interaction.guild.emojis.create({attachment: fimgb, name: emoteNameToSteal}).then(emote => {
                  interaction.reply({ content: `<:${emote.name}:${emote.id}> | Stole "${emote.name}"` , ephemeral: true});
              }).catch(console.error);
          } else {
              interaction.reply({content: 'You do not have permission to add emojis to this server', ephemeral: true});
          }
      }
  }
  }
}
