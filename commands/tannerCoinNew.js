const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { con } = require('../bot');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tannercoin')
        .setDescription('Tannercoin based commands')
        .addSubcommand(subcommand =>
            subcommand
                .setName('claim')
                .setDescription('Claim your daily tannerCoins!'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('count')
                .setDescription('See how much tannerCoins you have or others have!')
                .addUserOption(option => option.setName('target').setDescription('The user')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('rob')
                .setDescription('Rob user for tannerCoins')
                .addUserOption(option => option.setName('robtarget').setDescription('The user')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('top')
                .setDescription('see the top 10 richest users in the server')),
        // .addSubcommand(subcommand =>
        //     subcommand
        //         .setName('bet')
        //         .setDescription('Make a bet with another user')
        //         .addIntegerOption(option =>
        //             option.setName('betamount')
        //                 .setDescription('The amount you want to bet')
        //                 .setRequired(true))
        //         .addUserOption(option =>
        //             option.setName('bettarget')
        //                 .setDescription('The user you want to bet against')
        //                 .setRequired(true))
                        //),
    async execute(interaction) {


        function muli(targetUsersCoins) {
            var base = 0.20;
            var deMultiplier = 0.02;

            // for every 1000 coins the user has, the base gets de-multiplied by 0.02 but dont let deMultipliedBase go below 0.02
            var deMultipliedBase = base - (Math.floor(targetUsersCoins / 1000) * deMultiplier);


            if (deMultipliedBase < 0.02) {
                deMultipliedBase = 0.02;
                return deMultipliedBase;
            } else {
                return deMultipliedBase;
            }
        }


        function claimCoins(userID, isUpdate, today) {

            var multiplier = 0.2;

            const random = Math.floor(Math.random() * 250);
            var dateToSet = today.getFullYear() + '-' +
                ('00' + (today.getMonth()+1)).slice(-2) + '-' +
                ('00' + today.getDate()).slice(-2) + ' ' + 
                ('00' + today.getHours()).slice(-2) + ':' + 
                ('00' + today.getMinutes()).slice(-2) + ':' + 
                ('00' + today.getSeconds()).slice(-2);

            con.query(`SELECT * FROM Islands WHERE ownerID = ${userID}`, function (err, result, fields) {
                var island = result[0];
                var islandTypesOwned = [

                ]
                //for loop for result.length
                for (let i = 0; i < result.length; i++) {
                    islandTypesOwned.push(result[i].islandType);
                }


                var islands = result.length;
                if (result.length == 0 || result[0].upForAuction == 1) {
                    if (isUpdate) {
                        con.query(`UPDATE Economy SET coinCount = coinCount + ${random} WHERE UserID = ${userID}`, function (err, result, fields) {
                            if (err) return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                            const embed = new EmbedBuilder()
                                .setTitle('Tannercoins - ' + interaction.user.username)
                                .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
                                .setDescription(`You claimed ${random} TannerCoins! Please come back in 24 hours for more!`)
                                .setFooter({ text: "Eggium - Tanner Approved" })
                                .setTimestamp();
                            interaction.reply({ embeds: [embed], ephemeral: true });
                            con.query(`UPDATE Economy SET dateClaimed = "${dateToSet}" WHERE UserID = ${userID}`);
                            con.query(`UPDATE Users SET xp = xp + 5 WHERE discordID = ${userID}`);
                        });
        
                    } else{
                        con.query(`INSERT INTO Economy VALUES (${userID}, ${random}, "${dateToSet}", ${null})`, function (err, result, fields) {
                            if (err) throw err;
                            const embed = new EmbedBuilder()
                                .setTitle('Tannercoins - ' + interaction.user.username)
                                .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
                                .setDescription(`You claimed ${random} TannerCoins! Please come back in 24 hours for more!`)
                                .setFooter({ text: "Eggium - Tanner Approved" })
                                .setTimestamp();
                            interaction.reply({ embeds: [embed], ephemeral: true });
                            con.query(`UPDATE Users SET xp = xp + 5 WHERE discordID = ${userID}`);
                        });  
                    }
                } else {
                setTimeout(function () {
                    var coinAmountExtra = Math.floor((islands * multiplier) * random);
                    //round up coinAmountExtra
                    coinAmountExtra = Math.ceil(coinAmountExtra);

                    const a = Math.floor(Math.random() * 11);
                    var reasoning;
                    console.log(a)
                    if(islandTypesOwned.includes("basura")) {
                        if (a >= (1.6 / (islands * multiplier))) { coinAmountExtra = coinAmountExtra + 0; reasoning = `got ${coinAmountExtra} because of your ${islands} Islands!` } else { coinAmountExtra = coinAmountExtra + 100; reasoning = `got ${coinAmountExtra} because of your ${islands} Islands! You also found a washed up bottle on the shore with 100 TannerCoins inside!` }
                    } else {
                        if (a >= (.18 / (islands * multiplier))) { coinAmountExtra = coinAmountExtra + 0; reasoning = `got ${coinAmountExtra} because of your ${islands} Islands!` } else { coinAmountExtra = coinAmountExtra + 100; reasoning = `got ${coinAmountExtra} because of your ${islands} Islands! You also found a washed up bottle on the shore with 100 TannerCoins inside!` }
                    }

                    setTimeout(function () {
                        if (isUpdate) {
                            con.query(`UPDATE Economy SET coinCount = coinCount + ${random} + ${coinAmountExtra} WHERE UserID = ${userID}`, function (err, result, fields) {
                                if (err) return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                                const embed = new EmbedBuilder()
                                    .setTitle('Tannercoins - ' + interaction.user.username)
                                    .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
                                    .setDescription(`You claimed ${random} TannerCoins and ${reasoning} Please come back in 24 hours for more!`)
                                    .setFooter({ text: "Eggium - Tanner Approved" })
                                    .setTimestamp();
                                interaction.reply({ embeds: [embed], ephemeral: true });
            
            
                                con.query(`UPDATE Economy SET dateClaimed = "${dateToSet}" WHERE UserID = ${userID}`);
                                con.query(`UPDATE Users SET xp = xp + 5 WHERE discordID = ${userID}`);
                            });
            
                        } else{
                            con.query(`INSERT INTO Economy VALUES (${userID}, ${random} + ${coinAmountExtra}, "${dateToSet}", ${null})`, function (err, result, fields) {
                                if (err) throw err;
                                const embed = new EmbedBuilder()
                                    .setTitle('Tannercoins - ' + interaction.user.username)
                                    .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
                                    .setDescription(`You claimed ${random} TannerCoins and ${reasoning} Please come back in 24 hours for more!`)
                                    .setFooter({ text: "Eggium - Tanner Approved" })
                                    .setTimestamp();
                                interaction.reply({ embeds: [embed], ephemeral: true });
                                con.query(`UPDATE Users SET xp = xp + 5 WHERE discordID = ${userID}`);
                            });  
                        }
                    }, 1000);
                }, 1000);
                }
            });
        }

        if (interaction.options.getSubcommand() === "claim") {
            con.query(`SELECT * FROM Economy WHERE UserID = ${interaction.user.id}`, function (err, result, fields) {
                if(result[0] === undefined || result[0] === null) {
                    var today = new Date();
                    today.toLocaleString('en-US', { timeZone: 'America/New_York' });
                    claimCoins(interaction.user.id, false, today);
                } else {
                    var today = new Date();
                    today.toLocaleString('en-US', { timeZone: 'America/New_York' });
                    var dateCoinsWereClaimed = new Date(result[0].dateClaimed);
                    console.log("Date Coins were claimed: "+dateCoinsWereClaimed);
                    console.log("Today: "+today);
                    var timeDifference = Math.abs(dateCoinsWereClaimed.getTime() - today.getTime());
                    console.log(timeDifference);

                    if(timeDifference > 86400000) {
                        claimCoins(interaction.user.id, true, today);
                    } else {
                        var finalDifferenceOfTime = 86400000 - timeDifference;
                        var h = Math.floor(finalDifferenceOfTime/1000/60/60);
                        var m = Math.floor(finalDifferenceOfTime/1000/60)%60;
                        var s = Math.floor(finalDifferenceOfTime/1000)%60;
                        const embed = new EmbedBuilder()
                            .setTitle('Tannercoins - ' + interaction.user.username)
                            .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
                            .setDescription(`You have already claimed your daily TannerCoins! Come back in ${h} hours and ${m} minutes!`)
                            .setFooter({ text: "Eggium - Tanner Approved" })
                            .setTimestamp();
                        interaction.reply({ embeds: [embed], ephemeral: true });
                    }
                }

            });
        } else if (interaction.options.getSubcommand() === "count"){
            var username = interaction.options.get("target")
            if(username === null) {
                con.query(`SELECT * FROM Economy WHERE UserID = ${interaction.user.id}`, function (err, result, fields) {
                    if(result[0] === undefined || result[0] === null) {
                        const embed = new EmbedBuilder()
                            .setTitle('Tannercoins - ' + interaction.user.username)
                            .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
                            .setDescription(`${interaction.user.username} has 0 TannerCoins`)
                            .setFooter({ text: "Eggium - Tanner Approved" })
                            .setTimestamp();
                        interaction.reply({ embeds: [embed], ephemeral: true });

                        // interaction.reply({ content: `${interaction.user.username} has 0 TannerCoins`, ephemeral: false });
                    } else {
                        const embed = new EmbedBuilder()
                            .setTitle('Tannercoins - ' + interaction.user.username)
                            .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
                            .setDescription(`${interaction.user.username} has ${result[0].coinCount} TannerCoins`)
                            .setFooter({ text: "Eggium - Tanner Approved" })
                            .setTimestamp();
                        interaction.reply({ embeds: [embed], ephemeral: true });
                    }
                });
            } else {
                con.query(`SELECT * FROM Economy WHERE UserID = ${username.value}`, function (err, result, fields) {
                    if(result[0] === undefined || result[0] === null) {
                        const embed = new EmbedBuilder()
                            .setTitle('Tannercoins - ' + username.user.username)
                            .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
                            .setDescription(`${username.user.username} has 0 TannerCoins`)
                            .setFooter({ text: "Eggium - Tanner Approved" })
                            .setTimestamp();
                        interaction.reply({ embeds: [embed] });
                    } else {
                        const embed = new EmbedBuilder()
                            .setTitle('Tannercoins - ' + username.user.username)
                            .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
                            .setDescription(`${username.user.username} has ${result[0].coinCount} TannerCoins`)
                            .setFooter({ text: "Eggium - Tanner Approved" })
                            .setTimestamp();
                        interaction.reply({ embeds: [embed] });
                    }
                });
            }
        } else if (interaction.options.getSubcommand() === "rob") {
            var username = interaction.options.get("robtarget")
            // interaction.reply({ content: "Robbing has not been implemented in the new TannerCoin command yet! Please try again later!" , ephemeral: false});
            con.query(`SELECT * FROM Economy WHERE UserID = ${interaction.user.id}`, function (err, result, fields) {
                if(result[0] === undefined || result[0] === null) {
                    //User has no tannerCoins
                    interaction.reply({ content: "You have no Tannercoins. Try running `/tannercoin claim` first" , ephemeral: true});

                } else {
                    //User has tannerCoins & in the system
                    var today = new Date();
                    today.toLocaleString('en-US', { timeZone: 'America/New_York' });
                    
                    var lastTimeUserCommitedCrime = new Date(result[0].lastTimeCommitedCrime);
                    var timeDifference = Math.abs(lastTimeUserCommitedCrime.getTime() - today.getTime());
                    if(timeDifference > 18000000) {
                        //user can commit crime
                        if(username === null) {
                            //User did not specify a target
                            interaction.reply({ content: "You did not specify a target to rob! Please try again!" , ephemeral: true});
                        } else {
                            //User specified a target
                            var randomChance = Math.random() < 0.5;
                            if(randomChance === false) {
                                con.query(`SELECT * FROM Economy WHERE UserID = ${interaction.user.id}`, function (err, result, fields) {
                                    const usersCoins = result[0].coinCount;
                                    // var moneyLost = Math.floor(Math.random() * usersCoins) + 1;
                                    var moneyLost = Math.floor(Math.random() * (muli(usersCoins) * usersCoins)) + 1;


                                    con.query(`UPDATE Economy SET coinCount = coinCount - ${moneyLost} WHERE UserID = ${interaction.user.id}`, function (err, result, fields) {
                                        var dateToSet = today.getFullYear() + '-' +
                                            ('00' + (today.getMonth()+1)).slice(-2) + '-' +
                                            ('00' + today.getDate()).slice(-2) + ' ' + 
                                            ('00' + today.getHours()).slice(-2) + ':' + 
                                            ('00' + today.getMinutes()).slice(-2) + ':' + 
                                            ('00' + today.getSeconds()).slice(-2);
                                        con.query(`UPDATE Economy SET lastTimeCommitedCrime = "${dateToSet}" WHERE UserID = ${interaction.user.id}`);
                                        const embed = new EmbedBuilder()
                                            .setTitle('Tannercoins - ' + interaction.user.username)
                                            .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
                                            .setDescription(`${interaction.user.username} was caught and lost ${moneyLost}!`)
                                            .setFooter({ text: "Eggium - Tanner Approved" })
                                            .setTimestamp();
                                        interaction.reply({ embeds: [embed], ephemeral: false });
                                        
                                    });
                                });
                            } else {
                                con.query(`SELECT * FROM Economy WHERE UserID = ${username.value}`, function (err, result, fields) {
                                    const targetUsersCoins = result[0].coinCount;
                                    var dateToSet = today.getFullYear() + '-' +
                                        ('00' + (today.getMonth()+1)).slice(-2) + '-' +
                                        ('00' + today.getDate()).slice(-2) + ' ' + 
                                        ('00' + today.getHours()).slice(-2) + ':' + 
                                        ('00' + today.getMinutes()).slice(-2) + ':' + 
                                        ('00' + today.getSeconds()).slice(-2);

                                    var moneyGained = Math.floor(Math.random() * (muli(targetUsersCoins) * targetUsersCoins)) + 1;

                                    con.query(`UPDATE Economy SET coinCount = coinCount + ${moneyGained} WHERE UserID = ${interaction.user.id}`);
                                    con.query(`UPDATE Economy SET coinCount = coinCount - ${moneyGained} WHERE UserID = ${username.value}`);
                                    con.query(`UPDATE Economy SET lastTimeCommitedCrime = "${dateToSet}" WHERE UserID = ${interaction.user.id}`);
                                    // interaction.reply({ content: `${interaction.user.username} was sneaky and stole ${moneyGained} from ${username.user.username}`, ephemeral: false});
                                    const embed = new EmbedBuilder()
                                        .setTitle('Tannercoins - ' + interaction.user.username)
                                        .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
                                        .setDescription(`${interaction.user.username} was sneaky and stole ${moneyGained} from ${username.user.username}`)
                                        .setFooter({ text: "Eggium - Tanner Approved" })
                                        .setTimestamp();
                                    interaction.reply({ embeds: [embed], ephemeral: false });
                                });
                            }
                        }

                    } else {
                        //user cannot commit crime
                        var finalDifferenceOfTime = 18000000 - timeDifference;
                        var h = Math.floor(finalDifferenceOfTime/1000/60/60);
                        var m = Math.floor(finalDifferenceOfTime/1000/60) - h*60;
                        // interaction.reply({content: `You need to wait ${h} hours before running that command again!`, ephemeral: true });
                        const embed = new EmbedBuilder()
                            .setTitle('Tannercoins - ' + interaction.user.username)
                            .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
                            .setDescription(`You need to wait ${h} hours and ${m} minutes before running that command again!`)
                            .setFooter({ text: "Eggium - Tanner Approved" })
                            .setTimestamp();
                        interaction.reply({ embeds: [embed], ephemeral: true });
                    }

                }
            });
        } else if (interaction.options.getSubcommand() === "top") {
            //for each user in server
            var coinList = [];
            for (const [key, value] of interaction.guild.members.cache) {
                if (value.user.bot != true) {
                //get their tannercoins
                    con.query(`SELECT * FROM Economy WHERE UserID = ${value.user.id}`, function (err, result, fields) {
                        if (result.length === 0) {
                            //User is not in the system
                        } else {
                            //User is in the system
                            console.log(value.user.id + " | " + value.user.username + " | " + result[0].coinCount);
                            if(coinList.length != 11) {
                                coinList.push({id: value.user.id, username: value.user.username, coins: result[0].coinCount});
                            }
                        }
                    });
                }
            }

            var assembledString = "";
            console.log(coinList);
            setTimeout(function() {
                //sort the list
                coinList.sort(function(a, b) {
                    return b.coins - a.coins;
                });

                for (var i = 0; i < coinList.length; i++) {
                    assembledString += `${i+1}. ${coinList[i].username} - ${coinList[i].coins} Tannercoins\n`
                }
            }, 1000);
            //embed
            setTimeout(function() {
                const embed = new EmbedBuilder()
                    .setTitle('Tannercoins - Top 10')
                    .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
                    .setDescription(assembledString)
                    .setFooter({ text: "Eggium - Tanner Approved" })
                    .setTimestamp();
                interaction.reply({ embeds: [embed], ephemeral: false });
            }, 2000);

        }else if (interaction.options.getSubcommand() === "bet") {
            if(interaction.user.id != "202109343678726144") return interaction.reply({content: "TannerCoin Betting is currently not available to your Eggium Account.", ephemeral: true});
            //bet
            const amount = interaction.options.get('betamount');
            const betTarget = interaction.options.get('bettarget');
            

            con.query(`SELECT * FROM Economy WHERE UserID = ${interaction.user.id}`, function (err, result, fields) {
                if(result.length === 0) {
                    var usersCoins = 0;
                } else {
                    var usersCoins = result[0].coinCount;
                    if (usersCoins < amount) {
                        //interaction.reply({content: `You don't have enough Tannercoins!`, ephemeral: true });
                        const embed = new EmbedBuilder()
                            .setTitle('Tannercoins - ' + interaction.user.username)
                            .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
                            .setDescription(`You don't have enough Tannercoins!`)
                            .setFooter({ text: "Eggium - Tanner Approved" })
                            .setTimestamp();
                        interaction.reply({ embeds: [embed], ephemeral: true });
                    } else {
                        //has enough coins
                        var today = new Date();
                        today.toLocaleString('en-US', { timeZone: 'America/New_York' });
                        var dateToSet = today.getFullYear() + '-' +
                            ('00' + (today.getMonth()+1)).slice(-2) + '-' +
                            ('00' + today.getDate()).slice(-2) + ' ' + 
                            ('00' + today.getHours()).slice(-2) + ':' + 
                            ('00' + today.getMinutes()).slice(-2) + ':' + 
                            ('00' + today.getSeconds()).slice(-2);
                        con.query(`INSERT INTO Bets (UserID1, UserID2, BetAmount, Date, Status) VALUES ("${interaction.user.id}", "${betTarget.value}", "${amount}", "${dateToSet}", "Pending");`);
                        //send message to other user

                        const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('accept')
                                .setLabel('Accept')
                                .setStyle(ButtonStyle.Primary),
                            new ButtonBuilder()
                                .setCustomId('decline')
                                .setLabel('Decline')
                                .setStyle(ButtonStyle.Danger),
                        );

                        const embed = new EmbedBuilder()
                            .setTitle('Tannercoins - ' + interaction.user.username)
                            .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
                            .setDescription(`${interaction.user.username} has challenged you to a bet!\nYou have 5 minutes to accept the bet`)
                            .setFooter({ text: "Eggium - Tanner Approved" })
                            .setTimestamp();
                        betTarget.user.send({ embeds: [embed], ephemeral: false, components: [row]});

                        const collector = betTarget.createMessageComponentCollector({
                            max: 1,
                        });
                        collector.on('end', (ButtonInteraction) => {
                            var buttonIdClicked = ButtonInteraction.first().customId;
                            console.log(buttonIdClicked);
                        });
                    }
                }

            });
        }
    }
};