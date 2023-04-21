const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { con } = require('../bot');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('island')
        .setDescription('Edit your Island')
        .addSubcommand(subcommand =>
            subcommand
                .setName('start')
                .setDescription('Start your island'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View an island')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription("The user's island to view")
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('auctions')
                .setDescription('View islands that are up for auction'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('buy')
                .setDescription('Buy an island')
                .addStringOption(option =>
                    option.setName('islandid')
                        .setDescription("The island ID to bid on")
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('sell')
                .setDescription('Put an island up on the auction')
                .addStringOption(option =>
                    option.setName('islandidsell')
                        .setDescription("The island ID to sell")
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('pricesell')
                        .setDescription("The price to sell the island for")
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('delist')
                .setDescription('Delist an island from the auction')
                .addStringOption(option =>
                    option.setName('islanddelistid')
                        .setDescription("The island ID to delist")
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('harvest')
                .setDescription('Harvest the fruits from your island'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('nickname')
                .setDescription('Nickname your island')
                .addStringOption(option =>
                    option.setName('islandnickname')
                        .setDescription("The nickname to give your island")
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('islandid')
                        .setDescription("the island ID to nickname")
                        .setRequired(true))),
    async execute(interaction) {

        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

        function intToBool(int){
            if(int == 1){
                return true;
            } else {
                return false;
            }
        }
        function weight_random(arr, weight_field){
    
            if(arr == null || arr === undefined){
                return null;
            }
            const totals = [];
            let total = 0;
            for(let i=0;i<arr.length;i++){
                total += arr[i][weight_field];
                totals.push(total);
            }
            const rnd = Math.floor(Math.random() * total);
            let selected = arr[0];
            for(let i=0;i<totals.length;i++){
                if(totals[i] > rnd){
                    selected = arr[i];
                    break;
                }
            }
        return selected;
        
        } 
        
        function msToHMS( ms ) {
            // 1- Convert to seconds:
            let seconds = ms / 1000;
            // 2- Extract hours:
            const hours = parseInt( seconds / 3600 ); // 3,600 seconds in 1 hour
            seconds = seconds % 3600; // seconds remaining after extracting hours
            // 3- Extract minutes:
            const minutes = parseInt( seconds / 60 ); // 60 seconds in 1 minute
            // 4- Keep only seconds not extracted to minutes:
            seconds = seconds % 60;
            return `${hours}:${minutes}:${seconds}`;
        }

        if (interaction.options.getSubcommand() === "start") {

            var possibleIslandFruits = [
                "apple",
                "orange",
                "pear",
                "peach",
                "cherry",
                "coconut",
                "banana",
                "papaya",
                "pomegranate",
                "avocado",
                "mango",
            ]

            const weighted_climate =  [
                {"w" : 1, "name" : "cloud"},
                {"w" : 5, "name" : "basura"},
                {"w" : 30, "name" : "tropical"},
                {"w" : 30, "name" : "desert"},
                {"w" : 30, "name" : "temperate"},
                {"w" : 33, "name" : "arctic"},
            ]   

            //get random fruit
            var islandFruit = possibleIslandFruits[Math.floor(Math.random() * possibleIslandFruits.length)];
            var islandClimate = weight_random(weighted_climate, "w");
            islandClimate = islandClimate.name;
            // var islandClimate = climates[Math.floor(Math.random() * climates.length)];

            con.query(`SELECT * FROM Islands WHERE ownerID = ${interaction.user.id}`, function (err, result, fields) {
                console.log(result)
                if (result.length == 0) {
                    //user has no island
                    con.query(`SELECT * FROM Islands WHERE originalCreator = ${interaction.user.id}`, function (err, result, fields) {
                        if(result.length == 0){
                            //user has never had an island
                            var today = new Date();
                            today.toLocaleString('en-US', { timeZone: 'America/New_York' });
                            var dateToSet = today.getFullYear() + '-' +
                                ('00' + (today.getMonth()+1)).slice(-2) + '-' +
                                ('00' + today.getDate()).slice(-2) + ' ' + 
                                ('00' + today.getHours()).slice(-2) + ':' + 
                                ('00' + today.getMinutes()).slice(-2) + ':' + 
                                ('00' + today.getSeconds()).slice(-2);
                            con.query(`INSERT INTO Islands (ownerID, fruit, climate, obtainedBy, originalCreator, dateMade) VALUES ('${interaction.user.id}', '${islandFruit}', '${islandClimate}', 'creation','${interaction.user.id}', '${dateToSet}')`, function (err, result, fields) {
                                interaction.reply(`Your island has been created! Your island's native fruit is ${islandFruit} and your island's climate is ${islandClimate}.`);
                            });
                        } else {
                            interaction.reply("You have already created an island in your past. You can't create another one. Consider buying another");
                        }
                    })
                } else {
                    interaction.reply("You already have an island! Consider buying another.");
                }

            });

        } else if (interaction.options.getSubcommand() === "view") {
            var username = interaction.options.getUser('user');
            con.query(`SELECT * FROM Islands WHERE ownerID = ${username.id}`, function (err, result, fields) {
                if (result.length == 0) {
                    interaction.reply("This user does not have an island.");
                } else {
                    //embed
                    if(result.length > 1) {
                        //user has multiple islands
                        var islandList = []
                        for (var i = 0; i < result.length; i++) {
                            var island = result[i];
                            if(island.nickname == null || island.nickname == undefined){ 
                                islandList.push({
                                    number: i + 1,
                                    id: island.id,
                                    fruit: island.fruit,
                                    climate: island.climate,
                                    obtainedBy: island.obtainedBy,
                                    auctioned: intToBool(island.upForAuction),
                                    nickname: `${username.username}'s Island`,
                                })
                            } else{
                                islandList.push({
                                    number: i + 1,
                                    id: island.id,
                                    fruit: island.fruit,
                                    climate: island.climate,
                                    obtainedBy: island.obtainedBy,
                                    auctioned: intToBool(island.upForAuction),
                                    nickname: island.nickname,
                                })
                            }
                        }
                        const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('prev')
                                .setLabel('Previous')
                                .setStyle(ButtonStyle.Primary),
                            new ButtonBuilder()
                                .setCustomId('next')
                                .setLabel('Next')
                                .setStyle(ButtonStyle.Primary),
                        );

                        setTimeout(() => {
                            var current = 0;
                            var finalDesc = `**Owner:** ${username.username}#${username.discriminator}\n**ID:** ${String(islandList[current].id)}\n**Fruit:** ${capitalizeFirstLetter(islandList[current].fruit)}\n**Climate:** ${capitalizeFirstLetter(islandList[current].climate)}\n**Obtained By:** ${capitalizeFirstLetter(islandList[current].obtainedBy)}\n**Is on Auction:** ${String(islandList[current].auctioned)}`;
                            const embed = new EmbedBuilder()
                                .setTitle(`Eggium Islands - ${islandList[current].nickname}`)
                                .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
                                .setThumbnail('https://play-lh.googleusercontent.com/Ffjfxxdo2l3Dm3IrenlC4pWW4LUHQsmH3f1OzR0YZocp8zo87I7ytXQ5iRqeK0us7w')
                                .setDescription(finalDesc)
                                .setFooter({ text: "Eggium - Tanner Approved" })
                                .setTimestamp();
                            interaction.reply({ embeds: [embed], components: [row] });

                            const collector = interaction.channel.createMessageComponentCollector({
                                max: 10,
                            });

                            collector.on('collect', async i => {
                                if (i.customId === 'prev') {
                                    if(current == 0){
                                        current = islandList.length - 1;
                                        var finalDesc = `**Owner:** ${username.username}#${username.discriminator}\n**ID:** ${String(islandList[current].id)}\n**Fruit:** ${capitalizeFirstLetter(islandList[current].fruit)}\n**Climate:** ${capitalizeFirstLetter(islandList[current].climate)}\n**Obtained By:** ${capitalizeFirstLetter(islandList[current].obtainedBy)}\n**Is on Auction:** ${String(islandList[current].auctioned)}`;
                                        const embed = new EmbedBuilder()
                                            .setTitle(`Eggium Islands - ${islandList[current].nickname}`)
                                            .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
                                            .setThumbnail('https://play-lh.googleusercontent.com/Ffjfxxdo2l3Dm3IrenlC4pWW4LUHQsmH3f1OzR0YZocp8zo87I7ytXQ5iRqeK0us7w')
                                            .setDescription(finalDesc)
                                            .setFooter({ text: "Eggium - Tanner Approved" })
                                            .setTimestamp();
                                        await interaction.editReply({ embeds: [embed], components: [row] });
                                    } else {
                                        current--;
                                        var finalDesc = `**Owner:** ${username.username}#${username.discriminator}\n**ID:** ${String(islandList[current].id)}\n**Fruit:** ${capitalizeFirstLetter(islandList[current].fruit)}\n**Climate:** ${capitalizeFirstLetter(islandList[current].climate)}\n**Obtained By:** ${capitalizeFirstLetter(islandList[current].obtainedBy)}\n**Is on Auction:** ${String(islandList[current].auctioned)}`;
                                        const embed = new EmbedBuilder()
                                            .setTitle(`Eggium Islands - ${islandList[current].nickname}`)
                                            .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
                                            .setThumbnail('https://play-lh.googleusercontent.com/Ffjfxxdo2l3Dm3IrenlC4pWW4LUHQsmH3f1OzR0YZocp8zo87I7ytXQ5iRqeK0us7w')
                                            .setDescription(finalDesc)
                                            .setFooter({ text: "Eggium - Tanner Approved" })
                                            .setTimestamp();
                                        await interaction.editReply({ embeds: [embed], components: [row] });
                                    }
                                } else if(i.customId === 'next') {
                                    if(current == islandList.length - 1){
                                        current = 0;
                                        var finalDesc = `**Owner:** ${username.username}#${username.discriminator}\n**ID:** ${String(islandList[current].id)}\n**Fruit:** ${capitalizeFirstLetter(islandList[current].fruit)}\n**Climate:** ${capitalizeFirstLetter(islandList[current].climate)}\n**Obtained By:** ${capitalizeFirstLetter(islandList[current].obtainedBy)}\n**Is on Auction:** ${String(islandList[current].auctioned)}`;
                                        const embed = new EmbedBuilder()
                                            .setTitle(`Eggium Islands - ${islandList[current].nickname}`)
                                            .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
                                            .setThumbnail('https://play-lh.googleusercontent.com/Ffjfxxdo2l3Dm3IrenlC4pWW4LUHQsmH3f1OzR0YZocp8zo87I7ytXQ5iRqeK0us7w')
                                            .setDescription(finalDesc)
                                            .setFooter({ text: "Eggium - Tanner Approved" })
                                            .setTimestamp();
                                        await interaction.editReply({ embeds: [embed], components: [row] });
                                    } else {
                                        current++;
                                        var finalDesc = `**Owner:** ${username.username}#${username.discriminator}\n**ID:** ${String(islandList[current].id)}\n**Fruit:** ${capitalizeFirstLetter(islandList[current].fruit)}\n**Climate:** ${capitalizeFirstLetter(islandList[current].climate)}\n**Obtained By:** ${capitalizeFirstLetter(islandList[current].obtainedBy)}\n**Is on Auction:** ${String(islandList[current].auctioned)}`;
                                        const embed = new EmbedBuilder()
                                            .setTitle(`Eggium Islands - ${islandList[current].nickname}`)
                                            .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
                                            .setThumbnail('https://play-lh.googleusercontent.com/Ffjfxxdo2l3Dm3IrenlC4pWW4LUHQsmH3f1OzR0YZocp8zo87I7ytXQ5iRqeK0us7w')
                                            .setDescription(finalDesc)
                                            .setFooter({ text: "Eggium - Tanner Approved" })
                                            .setTimestamp();
                                        await interaction.editReply({ embeds: [embed], components: [row] });
                                    }

                                }
                            });

                        }, 1000);


                    } else {
                        var finalDesc = `**Owner:** ${username.username}#${username.discriminator}\n**ID:** ${String(result[0].id)}\n**Fruit:** ${capitalizeFirstLetter(result[0].fruit)}\n**Climate:** ${capitalizeFirstLetter(result[0].climate)}\n**Obtained By:** ${capitalizeFirstLetter(result[0].obtainedBy)}\n**Is on Auction:** ${String(intToBool(result[0].auctioned))}`;
                        if(result[0].nickname == null || result[0].nickname == undefined){
                            const embed = new EmbedBuilder()
                                .setTitle(`Eggium Islands - ${username.username}'s Island`)
                                .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
                                .setThumbnail('https://play-lh.googleusercontent.com/Ffjfxxdo2l3Dm3IrenlC4pWW4LUHQsmH3f1OzR0YZocp8zo87I7ytXQ5iRqeK0us7w')
                                .setDescription(finalDesc)
                                .setFooter({ text: "Eggium - Tanner Approved" })
                                .setTimestamp();
                            interaction.reply({ embeds: [embed] });
                        } else {
                            const embed = new EmbedBuilder()
                                .setTitle(`Eggium Islands - ${result[0].nickname}`)
                                .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
                                .setThumbnail('https://play-lh.googleusercontent.com/Ffjfxxdo2l3Dm3IrenlC4pWW4LUHQsmH3f1OzR0YZocp8zo87I7ytXQ5iRqeK0us7w')
                                .setDescription(finalDesc)
                                .setFooter({ text: "Eggium - Tanner Approved" })
                                .setTimestamp();
                            interaction.reply({ embeds: [embed] });
                        }
                    }
                }
            });
        } else if (interaction.options.getSubcommand() === "auctions") {

            con.query(`SELECT * FROM Auction WHERE active = 1`, function (err, result, fields) {
                if(result.length == 0) {
                    interaction.reply("There are no islands up for auction right now.");
                } else {
                    var finalDesc;
                    for (var i = 0; i < result.length; i++) {
                        // var username = result[i].auctionStarterID;
                        var island = result[i].islandID;
                        var bid = result[i].bid;
                        var ends = new Date(result[i].dateEnd);
                        //get mm/dd/yyyy hh:mm:ss
                        var date = ends.getMonth() + "/" + ends.getDate() + "/" + ends.getFullYear() + " " + ends.getHours() + ":" + ends.getMinutes() + ":" + ends.getSeconds();

                        con.query(`SELECT * FROM Islands WHERE id = ${island}`, function (err, result, fields) {
                            finalDesc = `[ID: ${island}][Island]: ${capitalizeFirstLetter(result[0].fruit)} - ${capitalizeFirstLetter(result[0].climate)} | Price: ${bid} (Buy It Now)`;
                        });
                    }
                    setTimeout(function() {
                        const embed = new EmbedBuilder()
                            .setTitle(`Eggium Islands - Auctions`)
                            .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
                            .setDescription(finalDesc)
                            .setFooter({ text: "Eggium - Tanner Approved" })
                            .setTimestamp();
                        interaction.reply({ embeds: [embed] });
                    }, 1000);
                }
            });

        } else if (interaction.options.getSubcommand() === "buy") {
            var islandID = interaction.options.get('islandid').value;
            console.log(islandID)

            if(interaction.user.id === "1020110347073486929") return interaction.reply("There has been a temporary auction suspension on your account. During this time you cannot buy islands.");

            con.query(`SELECT * FROM Auction WHERE islandID = ${islandID} AND active = 1`, function (err, result, fields) {
                console.log(result);

                if(result.length == 0) {
                    interaction.reply("This island is not up for auction.");
                } else {
                    var auctionStarterID = result[0].auctionStarterID;
                    var bid = result[0].bid;
                    var island = result[0].islandID;

                    con.query(`SELECT * FROM Economy WHERE UserID = ${interaction.user.id}`, function (err, result, fields) {
                        var bal = result[0].coinCount;
                        if(result.length == 0 || bal < bid) {
                            interaction.reply("You do not have enough coins to bid on this island.");
                        } else {
                            con.query(`UPDATE Islands SET ownerID = ${interaction.user.id} WHERE id = ${island}`)
                            con.query(`UPDATE Islands SET obtainedBy = 'purchase' WHERE id = ${island}`)
                            con.query(`UPDATE Islands SET upForAuction = 0 WHERE id = ${island}`)
                            con.query(`UPDATE Economy SET coinCount = coinCount - ${bid} WHERE UserID = ${interaction.user.id}`)
                            console.log(auctionStarterID)
                            con.query(`UPDATE Economy SET coinCount = coinCount + ${bid} WHERE UserID = ${auctionStarterID}`)
                            con.query(`UPDATE Auction SET active = 0 WHERE islandID = ${islandID}`);
                            var today = new Date();
                            today.toLocaleString('en-US', { timeZone: 'America/New_York' });
                            var dateToSet = today.getFullYear() + '-' +
                                ('00' + (today.getMonth()+1)).slice(-2) + '-' +
                                ('00' + today.getDate()).slice(-2) + ' ' + 
                                ('00' + today.getHours()).slice(-2) + ':' + 
                                ('00' + today.getMinutes()).slice(-2) + ':' + 
                                ('00' + today.getSeconds()).slice(-2);
                            con.query(`UPDATE Auction SET dateEnd = ${dateToSet} WHERE islandID = ${islandID}`)
                            interaction.reply(`You have successfully purchased island #${islandID}!`);
                        }
                    });
                }
            });
        } else if (interaction.options.getSubcommand() === "sell") {
            var islandID = interaction.options.get('islandidsell').value;
            var price = interaction.options.get('pricesell').value;

            con.query(`SELECT * FROM Islands WHERE id = ${islandID}`, function (err, result, fields) {

                //check if its been 24 hours since result[0].dateMade
                var dateMade = new Date(result[0].dateMade);
                var today = new Date();
                today.toLocaleString('en-US', { timeZone: 'America/New_York' });
                var diff = Math.abs(today - dateMade);
                var diffHours = Math.ceil(diff / (1000 * 60 * 60));
                console.log(diffHours);

                if(result.length == 0) {
                    interaction.reply("This island does not exist.");
                } else if (result[0].ownerID != interaction.user.id) {
                    interaction.reply("You do not own this island.");
                } else if(result[0].upForAuction == 1) {
                    interaction.reply("This island is already up for auction.");
                } else if(diffHours < 24) {
                    interaction.reply(":warning: This island is on temporary auction hold. You must wait 24 hours after creating an island to put it up for auction.");
                } else {
                    con.query(`UPDATE Islands SET upForAuction = 1 WHERE id = ${islandID}`)
                    //we set the island to be up for auction
                    con.query(`INSERT INTO Auction (auctionStarterID, islandID, dateStarted, bid, active) VALUES (${interaction.user.id}, ${islandID}, NOW(), ${price}, 1)`)
                    interaction.reply(`You have successfully put island #${islandID} up for auction! During this time, your island will not be used for the Tannercoin claim multiplier.`);
                }
            });
        } else if (interaction.options.getSubcommand() === "delist") {
            var islandID = interaction.options.get('islanddelistid').value;

            con.query(`SELECT * FROM Islands WHERE id = ${islandID}`, function (err, result, fields) {
                if(result[0].ownerID != interaction.user.id) {
                    interaction.reply("You do not own this island.");
                } else if (result.length == 0) {
                    interaction.reply("This island does not exist.");
                } else if(result[0].upForAuction == 0) {
                    interaction.reply("This island is not up for auction.");
                } else if(result[0].upForAuction == 1) {
                    con.query(`UPDATE Islands SET upForAuction = 0 WHERE id = ${islandID}`)
                    con.query(`UPDATE Auction SET active = 0 WHERE islandID = ${islandID}`)
                    var today = new Date();
                    today.toLocaleString('en-US', { timeZone: 'America/New_York' });
                    var dateToSet = today.getFullYear() + '-' +
                        ('00' + (today.getMonth()+1)).slice(-2) + '-' +
                        ('00' + today.getDate()).slice(-2) + ' ' + 
                        ('00' + today.getHours()).slice(-2) + ':' + 
                        ('00' + today.getMinutes()).slice(-2) + ':' + 
                        ('00' + today.getSeconds()).slice(-2);
                    con.query(`UPDATE Auction SET dateEnd = ${dateToSet} WHERE islandID = ${islandID}`)
                    interaction.reply(`You have successfully delisted island #${islandID} from the auction house.`);
                }
            });
        } else if (interaction.options.getSubcommand() === "harvest") {

            con.query(`SELECT * FROM Islands WHERE ownerID = ${interaction.user.id}`, function (err, result, fields) {
                console.log(result);
                if(result.length == 0) {
                    interaction.reply("You do not own any islands.");
                } else {
                    var islandsToHarvestFrom = [];
                    var everyIslandData = [];
                    for (i = 0; i < result.length; i++) {
                        if(result[i].upForAuction == 0) {
                            //not up for auction
                            //check if its been 24 hours since result[i].dateHarvested
                            var dateHarvested = new Date(result[i].dateHarvested);
                            var today = new Date();
                            today.toLocaleString('en-US', { timeZone: 'America/New_York' });
                            var diff = Math.abs(today - dateHarvested);
                            var diffHours = Math.ceil(diff / (1000 * 60 * 60));
                            console.log(diffHours);

                            if(result[i].dateHarvested == undefined || diffHours >= 24) {
                                //add to array
                                islandsToHarvestFrom.push({id: result[i].id, fruit: result[i].fruit});
                            }  else {
                                //not ready to harvest
                                everyIslandData.push({id: result[i].id, dateHarvested: result[i].dateHarvested});
                            }
                        }
                    }

                    interaction.deferReply();
                    setTimeout(function() {
                        console.log(islandsToHarvestFrom);
                        if(islandsToHarvestFrom.length == 0) {
                            var fullDesc = '';
                            for (i = 0; i < everyIslandData.length; i++) {
                                var dateHarvested = new Date(everyIslandData[i].dateHarvested);
                                var today = new Date();
                                today.toLocaleString('en-US', { timeZone: 'America/New_York' });
                                //get the difference
                                var diff = Math.abs(today - dateHarvested);
                                var finalDifferenceOfTime = 86400000 - diff;
                                var h = Math.floor(finalDifferenceOfTime/1000/60/60);
                                var m = Math.floor(finalDifferenceOfTime/1000/60)%60;
                                var s = Math.floor(finalDifferenceOfTime/1000)%60;
                                fullDesc += `[Island #${everyIslandData[i].id}] | ${h} hours, ${m} minutes, and ${s} seconds until next harvest.\n`;
                            }
                            setTimeout(function() {
                                console.log(fullDesc);
                                const embed = new EmbedBuilder()
                                    .setTitle(`Eggium Islands - Harvest`)
                                    .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
                                    .setDescription(fullDesc)
                                    .setFooter({ text: "Eggium - Tanner Approved" })
                                    .setTimestamp();
                                interaction.editReply({ embeds: [embed] });
                            }, 1000);
                        } else {
                            for (i = 0; i < islandsToHarvestFrom.length; i++) {

                                var islandID = islandsToHarvestFrom[i].id;
                                var fruit = islandsToHarvestFrom[i].fruit;

                                var today = new Date();
                                today.toLocaleString('en-US', { timeZone: 'America/New_York' });
                                var dateToSet = today.getFullYear() + '-' +
                                    ('00' + (today.getMonth()+1)).slice(-2) + '-' +
                                    ('00' + today.getDate()).slice(-2) + ' ' + 
                                    ('00' + today.getHours()).slice(-2) + ':' + 
                                    ('00' + today.getMinutes()).slice(-2) + ':' + 
                                    ('00' + today.getSeconds()).slice(-2);

                                con.query(`UPDATE Islands SET dateHarvested = "${dateToSet}" WHERE id = "${islandID}"`);
                                    con.query(`SELECT * FROM Items WHERE name = "${fruit}"`, function(err, result, fields) {
                                        console.log(result);
                                        var itemID = result[0].id;
                                        con.query(`SELECT * FROM InventorySystem WHERE userID = "${interaction.user.id}" AND itemID = "${itemID}"`, function(err, result, fields) {
                                            if(result.length == 0) {
                                                con.query(`INSERT INTO InventorySystem (userID, itemID, dateObtained, amount) VALUES ("${interaction.user.id}", "${itemID}", "${dateToSet}", 1)`);
                                            } else {
                                                con.query(`UPDATE InventorySystem SET amount = amount + 1 WHERE userID = "${interaction.user.id}" AND itemID = "${itemID}"`);
                                            }
                                        });
                                    });
                            }
                            interaction.editReply(`You have successfully harvested from ${islandsToHarvestFrom.length} your islands.`);
                        }
                    }, 2000);
                }
            });
        } else if (interaction.options.getSubcommand() === "nickname") {
            var nickname = interaction.options.getString("islandnickname");
            var islandID = interaction.options.getString("islandid");

            con.query(`SELECT * FROM Islands WHERE id = "${islandID}" AND ownerID = "${interaction.user.id}" AND upForAuction = 0`, function(err, result, fields) {
                if(result.length == 0) {
                    interaction.reply("You either do not own this island, or it is up for auction.");
                } else {
                    con.query(`UPDATE Islands SET nickname = "${nickname}" WHERE id = "${islandID}" AND ownerID = "${interaction.user.id}"`);
                    interaction.reply(`You have successfully set the nickname of island #${islandID} to ${nickname}.`);
                }
            });
        }
    }
};