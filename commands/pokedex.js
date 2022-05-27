const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const https = require('https');

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
                    const embed = new MessageEmbed()
                        .setTitle('Pokedex Entry - ' + data.id)
                        .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
                        .setThumbnail(data.sprites.animated)
                        .setDescription(
                            "Name: " + data.name +
                            "\nGeneration: " + data.generation +
                            "\nDescription: " + data.description)
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