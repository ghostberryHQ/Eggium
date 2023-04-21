const { SlashCommandBuilder } = require('@discordjs/builders');
var myModule = require('../bot.js');
var con = myModule.con;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mysterygift')
        .setDescription('Claim a mystery gift!')
        .addStringOption(option => option.setName('code').setDescription('The code for the mystery gift.').setRequired(true)),
    async execute(interaction) {
        const code = interaction.options.getString('code');
        con.query(`SELECT * FROM MysteryCodes WHERE code = '${code}'`, async (err, rows) => {
            if (err) throw err;
            if (rows.length < 1) {
                interaction.reply({ content: 'That code is invalid! Codes can be found in the GhostBerry/Eggium Discord', ephemeral: true });
            } else {
                if(rows[0].expires < Date.now()) {
                    interaction.reply({ content: 'That code has expired!', ephemeral: true });
                } else {
                    con.query(`SELECT * FROM MysteryCodesLogging WHERE discordID = ${interaction.user.id} AND codeID = ${rows[0].codeID}`, async (err, rows2) => {
                        if (err) throw err;
                        if (rows2.length < 1) {
                            if(rows[0].active == 1) {
                                if(rows[0].grants == "item") {
                                    con.query(`SELECT * FROM Items WHERE type = '${rows[0].dataType}'`, async (err, rows2) => {
                                        if (err) throw err;
                                        var item = rows2[Math.floor(Math.random() * rows2.length)];
                                        con.query(`SELECT * FROM InventorySystem WHERE userID = '${interaction.user.id}' AND itemID = '${item.id}'`, async (err, rows3) => {
                                            if (err) throw err;
                                            if (rows3.length < 1) {
                                                //user doesnt have item
                                                var date = new Date();
                                                date.toLocaleString('en-US', { timeZone: 'America/New_York' });
                                                con.query(`INSERT INTO InventorySystem (userID, itemID, dateObtained, amount) VALUES ('${interaction.user.id}', '${item.id}', '${date.toISOString().slice(0, 19).replace('T', ' ')}','3')`);
                                                con.query(`INSERT INTO MysteryCodesLogging (discordID, codeID) VALUES ('${interaction.user.id}', '${rows[0].codeID}')`);
                                            } else {
                                                //user has item
                                                con.query(`UPDATE InventorySystem SET amount = amount + 3 WHERE userID = '${interaction.user.id}' AND itemID = '${item.id}'`);
                                                con.query(`INSERT INTO MysteryCodesLogging (discordID, codeID) VALUES ('${interaction.user.id}', '${rows[0].codeID}')`);
                                            }
                                            interaction.reply({ content: `You have received ${item.name}'s!`, ephemeral: true });
                                        });
                                    });
                                } else if(rows[0].grants == "xp") {
                                    interaction.reply({ content: 'There was an error with that code!', ephemeral: true });
                                }
                                else {
                                    interaction.reply({ content: 'There was an error with that code!', ephemeral: true });
                                }
                            } else {
                                interaction.reply({ content: 'That code isnt active!', ephemeral: true });
                            }
                        } else {
                            interaction.reply({ content: 'You have already claimed this code!', ephemeral: true });
                        }
                    });
                }
            }
        });
    }
};