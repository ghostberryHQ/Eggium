const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { con } = require('../bot');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('Shows your inventory'),
    async execute(interaction) {
        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }
        con.query(`SELECT * FROM InventorySystem WHERE userID = ${interaction.user.id}`, function (err, result, fields) {

            if(result.length == 0) return interaction.reply({ content: 'You have no items in your inventory!', ephemeral: true});
            console.log(result)
            var finalDesc = "";
            for (let i = 0; i < result.length; i++) {
                console.log(result[i])
                var itemID = result[i].itemID;
                var amount = result[i].amount;
                con.query(`SELECT * FROM Items WHERE id = ${itemID}`, function (err, rows, fields) {
                    var itemName = rows[0].name;
                    finalDesc += `[**ITEM ID:** ${rows[0].id}] ${capitalizeFirstLetter(itemName)} - ${String(result[i].amount)}\n`;
                })
            }

            setTimeout(function () {
                const embed = new EmbedBuilder()
                    .setTitle(`${interaction.user.username}'s Inventory`)
                    .setDescription(finalDesc)
                    .setColor('#ff0000')
                    .setTimestamp()
                interaction.reply({ embeds: [embed] });
            }, 1000);

        });
    }
};