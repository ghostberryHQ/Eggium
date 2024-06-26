import { Command } from "..";
import { EmbedBuilder, SlashCommandBuilder, AttachmentBuilder, Colors } from "discord.js";
import type { Metadata } from "..";
import type { ChatInputCommandInteraction, ColorResolvable } from "discord.js";


export default class AnimalCommand extends Command {
  readonly name = "animal";
  override readonly inVoiceChannel = false;
  readonly slashBuilder = new SlashCommandBuilder()
    .setName("animal")
    .setDescription("Choose a pet to recieve a cute picture of it")
    .addStringOption(opt => 
      opt.setName("pet")
      .setDescription("Choose a pet to recieve a cute picture of it")
      .addChoices([
        {
          name: 'bunny', 
          value: 'bunny',
        },
        {
          name: 'duck',
          value: 'duck',
        },
        {
          name: 'dog',
          value: 'dog',
        },
        {
          name: 'cat',
          value: 'cat',
        },
      ])
      .setRequired(true));
    ;
  async onChatInput(interaction: ChatInputCommandInteraction<"cached">) {
    const animal = interaction.options.getString("pet", true);
    console.log(animal)

    if(animal === 'bunny'){
      const response = await fetch(`https://api.bunnies.io/v2/loop/random/?media=mp4,av1`)
      const data: any = await response.json()
      console.log(data.media.poster)
      let fimg = await fetch(data.media.poster)
      let fimgb = Buffer.from(await fimg.arrayBuffer())
      const msgAttach = new AttachmentBuilder(fimgb, { name: 'animal.png' })
      interaction.reply({content: `You just got bunny'd`, files: [msgAttach]});
    } else if(animal === 'duck'){
      let fimg = await fetch("https://random-d.uk/api/randomimg")
      let fimgb = Buffer.from(await fimg.arrayBuffer())
      const msgAttach = new AttachmentBuilder(fimgb, { name: 'animal.png' })
      interaction.reply({content: `WATCH OUT! DUCK!`, files: [msgAttach]});
    } else if (animal === 'dog'){
      let fimg = await fetch("https://place.dog/1920/1080")
      let fimgb = Buffer.from(await fimg.arrayBuffer())
      const msgAttach = new AttachmentBuilder(fimgb, { name: 'animal.png' })
      interaction.reply({content: `Doggo!`, files: [msgAttach]});
    } else if (animal === 'cat'){
      let fimg = await fetch("https://cataas.com/cat")
      let fimgb = Buffer.from(await fimg.arrayBuffer())
      const msgAttach = new AttachmentBuilder(fimgb, { name: 'animal.png' })
      interaction.reply({content: `Hes just a lil' silly`, files: [msgAttach]});
    }

    else {
      interaction.reply({content: `I'm sorry, I don't have that pet in my database.`, ephemeral: true});
    }
  }
}
