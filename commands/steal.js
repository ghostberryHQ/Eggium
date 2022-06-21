const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('steal')
        .setDescription('Steals any emoji from any server you are in')
        .addStringOption(option =>
            option.setName('emoji')
                .setDescription('The emoji/emote you would like to steal')
                .setRequired(true)),
    async execute(interaction) {
        var emoji = interaction.options.getString("emoji");
        var arr = emoji.match(/<a:.+?:\d+>|<:.+?:\d+>/g);
        if(arr.length > 1) {
            interaction.reply({content: 'Look man. One emoji at a time. Dont want to be caught by the police now. Do ya?', ephemeral: true});
        } else {
            var emoteIDToSteal = arr[0].match(/\d+/g)[0];
            var emoteNameToSteal = arr[0].match(/(?<=:)[a-zA-Z1-9]+(?=:)/g)[0];
            if(emoji.toString().includes('<a:')) {
                interaction.guild.emojis.create(`https://cdn.discordapp.com/emojis/${emoteIDToSteal}.gif?size=44&quality=lossless`, emoteNameToSteal).then(emote => {
                    //console.log(emote)
                    console.log("gif");
                    interaction.reply({ content: `<a:${emote.name}:${emote.id}> | Stole "${emote.name}"` , ephemeral: true});
                });
            } else {
                interaction.guild.emojis.create(`https://cdn.discordapp.com/emojis/${emoteIDToSteal}.webp?size=44&quality=lossless`, emoteNameToSteal).then(emote => {
                    //console.log(emote)
                    console.log("non-gif");
                    interaction.reply({ content: `<:${emote.name}:${emote.id}> | Stole "${emote.name}"` , ephemeral: true});
                });
            }

            //const ayy = client.emojis.cache.find(emoji => emoji.name === "ayy");
            // console.log(interaction.guild.emojis.cache)
            // var emojiFromSteal = interaction.guild.emojis.cache.find(emoji => emoji.name === 'froogyLove')
            // console.log(emoteIDToSteal);
            // console.log(emoteNameToSteal);
            // console.log(emojiFromSteal);
        }
    }
};