const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const https = require('https');

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pokedex')
        .setDescription('Replies with a pokedex entry')
        .addStringOption(option =>
            option.setName('pokemon')
                .setDescription('The pokemon you want to look up')
                .setRequired(true)),
    async execute(interaction) {

        var pokemon = interaction.options.getString("pokemon")
        const request = https.get('https://some-random-api.ml/pokedex?pokemon=' + pokemon, (response) => {
            response.setEncoding('utf8');
            let body = '';
            response.on('data', (chunk) => {
                body += chunk;
            });
            response.on('end', () => {
                const data = JSON.parse(body);

                if(data.error == "Sorry, I could not find that pokemon") {
                    interaction.reply({ content: 'That Pokemon could not be found!' , ephemeral: true});
                } else {
                    var evoLine;

                    if(data.family.evolutionLine === null || data.family.evolutionLine === undefined || data.family.evolutionLine.length === 0) {
                        evoLine = capitalizeFirstLetter(data.name)
                    } else {
                        evoLine = data.family.evolutionLine.join(' -> ')
                    }

                    const embed = new EmbedBuilder()
                        .setTitle('Pokedex Entry - #' + `${data.id} | ${capitalizeFirstLetter(data.name)}`)
                        .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
                        .setThumbnail(data.sprites.animated)
                        .setDescription(data.description)
                        .addFields(
                            { name: 'Type', value: data.type.join(' | '), inline: true },
                            { name: 'Gender Ratio', value: data.gender.join(' | ').replace("male", "♂").replace("female", "♀"), inline: true },
                            { name: 'Generation', value: data.generation, inline: true },
                            { name: 'Abilities', value: data.abilities.join(' | '), inline: false },
                            { name: 'Evolution Line', value: evoLine, inline: false },
                        )
                        embed.setFooter({
                            text: "Eggium - Tanner Approved"
                        })
                        .setTimestamp();
                    //send embed
                    interaction.reply({ embeds: [embed] });
                }
            });
        });
    }
};