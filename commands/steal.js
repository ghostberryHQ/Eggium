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
        console.log(emoji)
        var arr = emoji.match(/<a:.+?:\d+>|<:.+?:\d+>/g);
        if(arr.length > 1) {
            interaction.reply({content: 'Look man. One emoji at a time. Dont want to be caught by the police now. Do ya?', ephemeral: true});
        } else {
            var emoteIDToSteal = arr[0].match(/\d+/g)[0];
            var emoteNameToSteal = arr[0].match(/(?<=:)[a-zA-Z1-9]+(?=:)/g)[0];
            if(emoji.toString().includes('<a:')) {
                //check if user has permission to add emojis
                if(interaction.member.permissions.has('MANAGE_EMOJIS_AND_STICKERS')) {
                    console.log("gif" + `https://cdn.discordapp.com/emojis/${emoteIDToSteal}.gif?size=44&quality=lossless`);
                    interaction.guild.emojis.create({attachment: `https://cdn.discordapp.com/emojis/${emoteIDToSteal}.gif?size=44&quality=lossless`, name: emoteNameToSteal}).then(emote => {
                        interaction.reply({ content: `<a:${emote.name}:${emote.id}> | Stole "${emote.name}"` , ephemeral: true});
                    }).catch(console.error);
                } else {
                    interaction.reply({content: 'You do not have permission to add emojis to this server', ephemeral: true});
                }
            } else {
                if(interaction.member.permissions.has('MANAGE_EMOJIS_AND_STICKERS')) {
                    console.log("non-gif " + `https://cdn.discordapp.com/emojis/${emoteIDToSteal}.webp?size=44&quality=lossless`);
                    interaction.guild.emojis.create({attachment: `https://cdn.discordapp.com/emojis/${emoteIDToSteal}.webp?size=44&quality=lossless`, name: emoteNameToSteal}).then(emote => {
                        interaction.reply({ content: `<:${emote.name}:${emote.id}> | Stole "${emote.name}"` , ephemeral: true});
                    }).catch(console.error);
                } else {
                    interaction.reply({content: 'You do not have permission to add emojis to this server', ephemeral: true});
                }
            }
        }
    }
};