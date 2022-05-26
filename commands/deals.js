const { SlashCommandBuilder } = require('@discordjs/builders');
const { DataSync } = require('aws-sdk');
const { MessageEmbed, MessageActionRow, MessageButton, Message } = require('discord.js');
const { IsThereAnyDealApi } = require('itad-api-client-ts');
const config = require('../config.json');
const itadApi = new IsThereAnyDealApi(config.itadApiKey);

//Later, port this to a Context Menu Interaction

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deals')
        .setDescription('Get available deals for a video game')
        .addStringOption(option =>
            option.setName('gamename')
                .setDescription('The game name you want to get deals for')
                .setRequired(true)),
    async execute(interaction) {
        //await interaction.reply('thinking...', { ephemeral: true });
        var game_name = interaction.options.getString('gamename');
        var game_name_id = interaction.options.getString('gameid');
        const shops = await itadApi.getShops();
        var shopslist = [];
        for(var i = 0; i < shops.length; i++) {
            shopslist.push(shops[i].id);
        }

        console.log(shopslist);

        const matchingDeals = await itadApi.searchDeals(game_name, {
            shops: shopslist
        });
        //var data = JSON.stringify(matchingDeals)
        console.log(matchingDeals.list.length)
        var games = [];
        for (var i = 0; i < matchingDeals.list.length; i++) {
            var title = matchingDeals.list[i].title;
            if(games.includes(title)) {
                console.log(title + " | already in array");
            } else { 
                console.log(title)
                games.push(title); 
            }
        }

        var thing;
        var allthings = [];


        if(matchingDeals.list.length == 0) {
            thing = new MessageButton()
                        .setCustomId('0')
                        .setLabel("No Game Found")
                        .setStyle('DANGER')
                        .setDisabled(true);
            allthings.push(thing);
        } else {
            for (var i = 0; i < games.length; i++) {
                thing = new MessageButton()
                        .setCustomId(String(i))
                        .setLabel(games[i])
                        .setStyle('PRIMARY')
                console.log("THING LABEL: "+thing.label)
                if(i > 4) {
                    console.log("not adding")
                } else {
                    if(thing.label.length > 79) {
                        console.log("ID: "+ i + " is too long")
                    } else {
                        allthings.push(thing);
                    }
                }
            }
        }

         var row = new MessageActionRow()
             .addComponents(allthings);
    
        
        const embed = new MessageEmbed()
            .setTitle('Game Deals - ' + game_name)
            .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
            //.setThumbnail('https://cdn.discordapp.com/avatars/'+username.value+'/'+avatar+'.jpeg')
            .setDescription(
            'THIS COMMAND IS IN HEAVY BETA! PLEASE DO NOT RELY ON IT UNTIL IT IS FULLY TESTED!\nALOT OF INFORMATION WITH THE BUTTONS TURNS UP INCORRECT. THE COMMAND WAS TESTED WITH THE GAME "Unpacking"')
            embed.setFooter({
                text: "Eggium - Tanner Approved"
            })
            .setTimestamp();
        interaction.reply({ embeds: [embed], components: [row]});

        const collector = interaction.channel.createMessageComponentCollector({
            max: 1,
        });

        collector.on('end', (ButtonInteraction) => {
            const deleteObj = (data, column, search) => {
                let result = data.filter(m => m[column] !== search);
              
                return result;
              }
            var buttonIdClicked = ButtonInteraction.first().customId;
            console.log(buttonIdClicked + " | " + games[buttonIdClicked]);
            console.log(games);

            var game;
            var gamesToRemove = [];
            for (var i = 0; i < matchingDeals.list.length; i++) {
                game = games[i];

                if(game == games[buttonIdClicked]) {
                    delete games[i]
                } else {
                    gamesToRemove.push(games[i])
                }
            }

            console.log("games to remove: " + gamesToRemove);
            console.log(gamesToRemove.length)

            console.log("0: " + JSON.stringify(matchingDeals.list[0]));

            const sd = matchingDeals.list;
            console.log(sd)

            console.log("Unpacking")
            console.log(gamesToRemove.toString())
            
            for (var i = 0; i < sd.length; i++) {
                if(sd[i].title == gamesToRemove.toString()) {
                    delete sd[i];
                }
            }
            
            var filtered = sd.filter(function (el) {
                return el != null;
              });
              
            console.log("Filtered: ");
            console.log(filtered);



            if(filtered.length == 1) {
                const embed = new MessageEmbed()
                    .setTitle('Game Deals - ' + filtered[0].title)
                    .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
                    //.setThumbnail('https://cdn.discordapp.com/avatars/'+username.value+'/'+avatar+'.jpeg')
                    .setDescription(
                    'Game Name: ' + filtered[0].title +
                    '\nOriginal Price: ' + filtered[0].price_old + 
                    '\nBest Price Right Now: ' + filtered[0].price_new +" (" + filtered[0].price_cut + "% Price Cut)" +
                    '\nStore: ' + filtered[0].shop.name +
                    '\nPlatform: ' + filtered[0].drm +
                    '\nLink: ' + filtered[0].urls.buy
                    )
                    embed.setFooter({
                        text: "Eggium - Tanner Approved"
                    })
                    .setTimestamp();
                interaction.editReply({ embeds: [embed]});
            } else {



                var prices = [];
                for (var i = 0; i < filtered.length; i++) {
                    console.log(filtered[i].price_new)
                    prices.push(filtered[i].price_new);
                }

                prices.sort();

                for (var i = 0; i < filtered.length; i++) {
                    if(filtered[i].price_new != prices[0]) {
                        delete filtered[i];
                    }
                }

                var filtered2 = filtered.filter(function (el) {
                    return el != null;
                });
                
                console.log(filtered2);

                const embed = new MessageEmbed()
                    .setTitle('Game Deals - ' + filtered2[0].title)
                    .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
                    //.setThumbnail('https://cdn.discordapp.com/avatars/'+username.value+'/'+avatar+'.jpeg')
                    .setDescription(
                    'Game Name: ' + filtered2[0].title +
                    '\nOriginal Price: ' + filtered2[0].price_old + 
                    '\nBest Price Right Now: ' + filtered2[0].price_new +" (" + filtered2[0].price_cut + "% Price Cut)" +
                    '\nStore: ' + filtered2[0].shop.name +
                    '\nPlatform: ' + filtered2[0].drm +
                    '\nLink: ' + filtered2[0].urls.buy
                    )
                    embed.setFooter({
                        text: "Eggium - Tanner Approved"
                    })
                    .setTimestamp();
                interaction.editReply({ embeds: [embed]});
            }
        });
    }
};