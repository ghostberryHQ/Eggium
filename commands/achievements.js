const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require("discord.js");
var myModule = require('../bot.js');

var con = myModule.con;

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
        con.query("SELECT * FROM Quests WHERE gameName = " + "'" + game_name + "'" + ";", function (err, result, fields) {
          if (err) throw err;
          if(result === undefined || result === null || result.length === 0) {
            const embed = new EmbedBuilder()
            .setTitle("Eggium Achievements - " + game_name)
            .setColor("#" +((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
            .setDescription("That game is not in the achievements beta. Feel free to request it!");
          embed
            .setFooter({text: "Eggium - Tanner Approved"})
            .setTimestamp();
          interaction.reply({ embeds: [embed], ephemeral: true });
          } else {
            var availableQuestTitles = []
            for (let i = 0; i < result.length; i++) {
              console.log(`${result[i].questName} - ${result[i].questDescription}`);
              availableQuestTitles.push(`${result[i].questName} - ${result[i].questDescription}`);
            }
            var description = availableQuestTitles.join('\r\n');
            const embed = new EmbedBuilder()
            .setTitle("Eggium Achievements - " + game_name)
            .setColor("#" +((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
            //.setThumbnail(image of the game?)
            .setDescription(description);
          embed
            .setFooter({text: "Eggium - Tanner Approved"})
            .setTimestamp();
          interaction.reply({ embeds: [embed], ephemeral: false });
          }
        });
    }
};