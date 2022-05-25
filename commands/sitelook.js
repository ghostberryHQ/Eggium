const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const http = require('http');
const https = require('https');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sitelook')
        .setDescription('Sends eggium on an adventure to a site and return a screenshot of the page')
        .addStringOption(option =>
            option.setName('site')
                .setDescription('The site you would like Eggium to explore')
                .setRequired(true)),
    async execute(interaction) {
        interaction.reply('Adventuring...')
        var searchTerm = interaction.options.getString("site");
            //get screenshot api key
            var apiKey = 'NXN4MNA-3P7461V-MXNM38J-GEPQK1P';
            //get screenshot url
            var url = 'https://shot.screenshotapi.net/screenshot?token=' + apiKey + '&url=' + searchTerm;
            //get screenshot response
            var response = https.get(url, function(response) {
                //set response to variable
                var body = '';
                //get response
                response.on('data', function(d) {
                    body += d;
                });
                //when response is done
                response.on('end', function() {
                    //set response to json
                    var json = JSON.parse(body);
                    //get screenshot url
                    var screenshot = json.screenshot;
                    var created_at = json.created_at;
                    //create embed
                    const embed = new MessageEmbed()
                        .setTitle('Screenshot')
                        .setColor('#0099ff')
                        .setImage(screenshot)
                        .setDescription('\nURL: ' + searchTerm + '\nDate Taken: ' + created_at)
                        embed.setFooter({
                            text: "Eggium - Tanner Approved"
                        })
                        .setTimestamp();
                    //send embed
                    if(searchTerm.includes('porn')) {
                        interaction.editReply('YOU TRIED LOOKING AT PORN?!?!?! fair.');
                        interaction.editReply({ embeds: [embed] });
                    } else {
                        interaction.editReply('Adventure Completed!');
                        interaction.editReply({ embeds: [embed] });
                    }
                });
            });
    }
};