const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');
let config = require('../config.json')
const fetch = require('node-fetch');
let cloud_config = "https://gist.githubusercontent.com/spjoes/ce745c5ebe201c005067472f5c8cf876/raw/eggium-update.json"
let cloud_config_settings = { method: "Get" };
let isUpdated;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('update')
        .setDescription('Will attempt to update Eggium'),
    async execute(interaction) {

        config = require('../config.json')

        fetch(cloud_config, cloud_config_settings)
            .then(res => res.json())
            .then((json) => {
                console.log(json)
                console.log("EGGIUM VERSION: " + config.eggium_version)

                if (json.eggium_version == config.eggium_version) {
                    isUpdated = "Yes. You are up to date!";
                } else {
                    isUpdated = "No. Downloading the new version...";
                        fetch("https://raw.githubusercontent.com/spjoes/Eggium/main/bot.js", cloud_config_settings)
                        .then(res => res.text())
                        .then((text) => {
                            //console.log(text)
                            try {
                                fs.writeFileSync('bot.js', text);
                                console.log("success")

                                // read file and make object
                                let content = JSON.parse(fs.readFileSync('config.json', 'utf8'));
                                // edit or add property
                                content.eggium_version = json.eggium_version;
                                //write file
                                fs.writeFileSync('config.json', JSON.stringify(content, null, 2));

                            } catch (err) {
                                console.error(err);
                            }
                        });
                }

                const embed = new MessageEmbed()
                .setTitle('UPDATE REQUEST')
                .setColor('#0099ff')
                .setImage("https://cdn.discordapp.com/avatars/972256916506025984/72ff17748793214ecf21e02e4d0dc4f0.png")
                .setDescription(
                    "Current Version " + config.eggium_version +
                    "\nNewest Version: " + json.eggium_version +
                    "\nIs updated? " + String(isUpdated))
                embed.setFooter({
                    text: "Eggium - Tanner Approved"
                })
                .setTimestamp();
                //send embed
                interaction.reply({ embeds: [embed] , ephemeral: true});
        });
    }
};