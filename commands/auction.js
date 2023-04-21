const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { con } = require('../bot');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('auction')
        .setDescription('General Auction Commadnds')
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View the auction house'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('buy')
                .setDescription('Buy an item from the auction house')
                .addStringOption(option =>
                    option.setName('id')
                        .setDescription("ID of the item you want to buy")
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('sell')
                .setDescription('List an item on the auction house')
                .addStringOption(option =>
                    option.setName('id')
                        .setDescription("ID of the item you want to sell")
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('amount')
                        .setDescription("How much of the item you want to sell")
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('price')
                        .setDescription("Price of the item you want to sell")
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('delist')
                .setDescription('Delist an item from the auction house')
                .addStringOption(option =>
                    option.setName('id')
                        .setDescription("ID of the item you want to delist")
                        .setRequired(true))),
    async execute(interaction) {
        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }
        if (interaction.options.getSubcommand() === "view") {
            con.query(`SELECT * FROM ItemAuctions WHERE active = 1`, function (err, result, fields) {
                if (err) throw err;
                if (result.length > 0) {
                    var auctionList = "";
                    for (let i = 0; i < result.length; i++) {
                        var auctionID = result[i].auctionID;
                        var amount = result[i].amount;
                        var price = result[i].price;
                        con.query(`SELECT * FROM Items WHERE id = "${result[i].itemID}"`, function (err, result, fields) {
                            auctionList += `[ID: ${auctionID}]  ${capitalizeFirstLetter(result[0].name)} - **Quantity:** ${amount} - $${price}\n`;
                        });
                    }
                    setTimeout(function () {
                        //embed
                        const embed = new EmbedBuilder()
                                .setTitle(`Eggium Auction House`)
                                .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
                                .setDescription(auctionList)
                                .setFooter({ text: "Eggium - Tanner Approved" })
                                .setTimestamp();
                        interaction.reply({ embeds: [embed]});
                    }, 1000);
                } else {
                    interaction.reply("No items in the auction house");
                }
            });
        } else if (interaction.options.getSubcommand() === "buy") {
            //get auction id
            var auctionID = interaction.options.get('id').value;
            //get auction info
            console.log(auctionID);
            con.query(`SELECT * FROM ItemAuctions WHERE auctionID = "${auctionID}" AND active = "1"`, function (err, result, fields) {
                console.log(result);
                var price = result[0].price;
                var itemID = result[0].itemID;
                var amount = result[0].amount;
                var sellerID = result[0].auctionStarterID;

                if(result.length === 0) {
                    interaction.reply("Invalid Auction ID\n this auction may have already been bought or does not exist");
                } else {
                    con.query(`SELECT * FROM Economy WHERE UserID = "${interaction.user.id}"`, function (err, result, fields) {
                        var userMoney = result[0].coinCount;
                        if(result.length === 0 || userMoney < price) return interaction.reply("You do not have have enough money to purchase this item");
                        //user has enough money
                        //remove money from user
                        con.query(`UPDATE Economy SET coinCount = coinCount - ${price} WHERE UserID = "${interaction.user.id}"`);
                        //add money to seller
                        con.query(`UPDATE Economy SET coinCount = coinCount + ${price} WHERE UserID = "${sellerID}"`);
                        //add item to user
                        //check if user has item
                        con.query(`SELECT * FROM InventorySystem WHERE userID = "${interaction.user.id}" AND itemID = "${itemID}"`, function (err, result, fields) {
                            var today = new Date();
                            today.toLocaleString('en-US', { timeZone: 'America/New_York' });
                            var dateToSet = today.getFullYear() + '-' +
                                ('00' + (today.getMonth()+1)).slice(-2) + '-' +
                                ('00' + today.getDate()).slice(-2) + ' ' + 
                                ('00' + today.getHours()).slice(-2) + ':' + 
                                ('00' + today.getMinutes()).slice(-2) + ':' + 
                                ('00' + today.getSeconds()).slice(-2);
                            if(result.length === 0) {
                                //user does not have item
                                con.query(`INSERT INTO InventorySystem (userID, itemID, dateObtained, amount) VALUES ("${interaction.user.id}", "${itemID}", "${dateToSet}", "${amount}")`);
                                con.query(`UPDATE ItemAuctions SET active = 0 WHERE auctionID = "${auctionID}"`);

                                const embed = new EmbedBuilder()
                                    .setTitle(`Eggium Auction House - Purchase`)
                                    .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
                                    .setDescription(`You have successfully bought this item`)
                                    .setFooter({ text: "Eggium - Tanner Approved" })
                                    .setTimestamp();
                                interaction.reply({ embeds: [embed]});
                            } else {
                                //user has item
                                con.query(`UPDATE InventorySystem SET amount = amount + ${amount} WHERE userID = "${interaction.user.id}" AND itemID = "${itemID}"`);
                                con.query(`UPDATE InventorySystem SET dateObtained = "${dateToSet}" WHERE userID = "${interaction.user.id}" AND itemID = "${itemID}"`);
                                con.query(`UPDATE ItemAuctions SET active = 0 WHERE auctionID = "${auctionID}"`);

                                const embed = new EmbedBuilder()
                                    .setTitle(`Eggium Auction House - Purchase`)
                                    .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
                                    .setDescription(`You have successfully bought this item`)
                                    .setFooter({ text: "Eggium - Tanner Approved" })
                                    .setTimestamp();
                                interaction.reply({ embeds: [embed]});
                            }
                        });
                    });
                }

            });
        } else if (interaction.options.getSubcommand() === "sell") {
            var auctionID = interaction.options.get('id').value;
            var auctionAmount = interaction.options.get('amount').value;
            var auctionPrice = interaction.options.get('price').value;

            //check if user has item
            con.query(`SELECT * FROM InventorySystem WHERE userID = "${interaction.user.id}" AND itemID = "${auctionID}"`, function (err, result, fields) {
                if(result.length === 0) return interaction.reply("You do not have this item");
                if(result[0].amount < auctionAmount) return interaction.reply(`You do not have enough of this item to list. You only have ${result[0].amount}.`);
                //user has item
                //remove item from user
                con.query(`UPDATE InventorySystem SET amount = amount - ${auctionAmount} WHERE userID = "${interaction.user.id}" AND itemID = "${auctionID}"`);
                //add auction to database
                var today = new Date();
                today.toLocaleString('en-US', { timeZone: 'America/New_York' });
                var dateToSet = today.getFullYear() + '-' +
                    ('00' + (today.getMonth()+1)).slice(-2) + '-' +
                    ('00' + today.getDate()).slice(-2) + ' ' + 
                    ('00' + today.getHours()).slice(-2) + ':' + 
                    ('00' + today.getMinutes()).slice(-2) + ':' + 
                    ('00' + today.getSeconds()).slice(-2);
                con.query(`INSERT INTO ItemAuctions (auctionStarterID, itemID, amount, dateStarted, price, active) VALUES ("${interaction.user.id}", "${auctionID}", "${auctionAmount}", "${dateToSet}", "${auctionPrice}", "1")`);
                interaction.reply(`You have successfully listed ${auctionAmount} of this item in the auction house`);
            });
        }else if (interaction.options.getSubcommand() === "delist") {
            //get auction id
            var auctionID = interaction.options.get('id').value;

            //check if auction exists
            con.query(`SELECT * FROM ItemAuctions WHERE auctionID = "${auctionID}" AND active = "1"`, function (err, result, fields) {
                if(result.length === 0) return interaction.reply("This auction does not exist or has already been delisted");
                //auction exists
                //check if user is auction starter
                if(result[0].auctionStarterID != interaction.user.id) return interaction.reply("You are not the auction starter");
                //user is auction starter
                //check auction startDate
                var startDate = new Date(result[0].dateStarted);
                var today = new Date();
                today.toLocaleString('en-US', { timeZone: 'America/New_York' });

                //check if it has been over 30 minutes
                if(today - startDate > 1800000) return interaction.reply("You cannot delist an auction after 30 minutes");

                //remove auction from database
                con.query(`UPDATE ItemAuctions SET active = 0 WHERE auctionID = "${auctionID}"`);
                //add item back to user
                con.query(`UPDATE InventorySystem SET amount = amount + ${result[0].amount} WHERE userID = "${interaction.user.id}" AND itemID = "${result[0].itemID}"`);
                interaction.reply("You have successfully delisted this auction");
            });
        }
    }
};