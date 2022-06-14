const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require("discord.js");

//require fs
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('achievements')
        .setDescription('View the possible achievements for a game')
        .addStringOption(option =>
            option.setName('game')
                .setDescription('The game you want to view achievements for')
                .setRequired(true)),
    async execute(interaction) {
        var game_name = interaction.options.getString('game');

        var quests = fs.readFileSync('./quests.json','utf8');
        var quests_json = JSON.parse(quests);

        if(quests_json.quests[game_name] != undefined || quests_json.quests[game_name] != null) {

            var availableQuestTitles = []
            //for each quest in the quest json
            for (var i = 0; i < quests_json.quests[game_name].length; i++) {
                currentQuestTitle = quests_json.quests[game_name][i].Title
                currentQuestDescription = quests_json.quests[game_name][i].Description
                availableQuestTitles.push(`${currentQuestTitle} - ${currentQuestDescription}`);
            }
    
            var description = availableQuestTitles.join('\r\n');
    
            const embed = new MessageEmbed()
            .setTitle("Eggium Achievements - " + game_name)
            .setColor("#" +((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
            //   .setThumbnail(mostRecentlyPlayedGame.iconURL)
            .setDescription(description);
          embed
            .setFooter({
              text: "Eggium - Tanner Approved",
            })
            .setTimestamp();
          //send embed
          interaction.reply({ embeds: [embed], ephemeral: false });

        } else {


            const embed = new MessageEmbed()
            .setTitle("Eggium Achievements - " + game_name)
            .setColor("#" +((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
            //   .setThumbnail(mostRecentlyPlayedGame.iconURL)
            .setDescription("That game is not in the achievements beta. Feel free to request it!");
          embed
            .setFooter({
              text: "Eggium - Tanner Approved",
            })
            .setTimestamp();
          //send embed
          interaction.reply({ embeds: [embed], ephemeral: true });

        }
    }
};