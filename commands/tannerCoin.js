const { SlashCommandBuilder } = require('@discordjs/builders');
const {CommandCooldown, msToMinutes} = require('discord-command-cooldown');
const ms = require('ms');
const Economy = require('discord-economy-super');
const eco = new Economy();

const earnDailyTannerCoinCommandCooldown = new CommandCooldown('earnTannerCoin', ms('24h')) // You can use the function ms('24h') to do a cooldown for 24 hours! This function makes it easier so you dont have to do tons of 0's.
const robCommandCooldown = new CommandCooldown('robTannerCoin', ms('5h')); // You can use the function ms('5h') to do a cooldown for 5 hours! This function makes it easier so you dont have to do tons of 0's.

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tannercoin')
        .setDescription('Replies with pong')
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
                .addUserOption(option => option.setName('robtarget').setDescription('The user'))),
    async execute(interaction) {

        if (interaction.options.getSubcommand() === "claim") {

            const userCooldowned = await earnDailyTannerCoinCommandCooldown.getUser(interaction.user.id); // Check if user need to be cooldowned
            if(userCooldowned){
                const timeLeft = msToMinutes(userCooldowned.msLeft, false); // False for excluding '0' characters for each number < 10
                interaction.reply({content: `You need to wait ${timeLeft.hours + ' hours, ' + timeLeft.minutes + ' minutes, ' + timeLeft.seconds + ' seconds'} before running that command again!`, ephemeral: true });
            }else{
                const random = Math.floor(Math.random() * 250);
                interaction.reply({ content: 'You claimed ' + random + ' TannerCoins today! Come back in 24 hours for more TannerCoins!' , ephemeral: true});
                eco.balance.add(random, interaction.user.id, interaction.guild.id)
                await earnDailyTannerCoinCommandCooldown.addUser(interaction.user.id); // Cooldown user again
            }
        } else if (interaction.options.getSubcommand() === "count"){
            var username = interaction.options.get("target")
            if(username === null) {
                const usersTannerCoinCount = eco.balance.fetch(interaction.user.id, interaction.guild.id);
                interaction.reply({ content: interaction.user.username + " has " + usersTannerCoinCount + " TannerCoins." , ephemeral: false});
            } else {
                const usersTannerCoinCount = eco.balance.fetch(username.value, interaction.guild.id);
                interaction.reply({ content: username.user.username + " has " + usersTannerCoinCount + " TannerCoins." , ephemeral: false});
            }
        } else if (interaction.options.getSubcommand() === "rob") {
            var username = interaction.options.get("robtarget")
            const robCooldowned = await robCommandCooldown.getUser(interaction.user.id);

            if(robCooldowned){
                const timeLeft = msToMinutes(robCooldowned.msLeft, false); // False for excluding '0' characters for each number < 10
                interaction.reply({content: `You need to wait ${ timeLeft.hours + ' hours, ' + timeLeft.minutes + ' minutes, ' + timeLeft.seconds + ' seconds'} before running that command again!`, ephemeral: true });
            } else {
                if (username === null) {
                    interaction.reply({ content: "Please select a user to rob" , ephemeral: true});
                } else {
                    var randomChance = Math.random() < 0.5;
                    console.log(randomChance + " | " + username.user.username);
                    if(randomChance === false) {
                        const usersTannerCoins = eco.balance.fetch(interaction.user.id, interaction.guild.id);
                        var moneyLost = Math.floor(Math.random() * usersTannerCoins) + 1;
                        eco.balance.subtract(moneyLost, interaction.user.id, interaction.guild.id)
                        interaction.reply({ content: interaction.user.username + " was caught and lost " + moneyLost + "!" , ephemeral: false});
                        await robCommandCooldown.addUser(interaction.user.id); // Cooldown user again
                    } else if(randomChance === true) {
                        const otherUsersTannerCoins = eco.balance.fetch(username.value, interaction.guild.id);
                        var moneyGained = Math.floor(Math.random() * otherUsersTannerCoins) + 1;
                        eco.balance.subtract(moneyGained, username.value, interaction.guild.id)
                        eco.balance.add(moneyGained, interaction.user.id, interaction.guild.id)
                        interaction.reply({ content: interaction.user.username + " was sneaky! They stole " + moneyGained + " from " + username.user.username, ephemeral: false});
                        await robCommandCooldown.addUser(interaction.user.id); // Cooldown user again
                    }
                    
                }

            }
        }

    }
};