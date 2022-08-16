const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const { EmbedBuilder, ActionRowBuilder, ButtonStyle, ButtonBuilder } = require('discord.js');
const { IsThereAnyDealApi } = require('itad-api-client-ts');
const config = require('../config.json');
const itadApi = new IsThereAnyDealApi(config.itadApiKey);
module.exports = {
    data: new SlashCommandBuilder()
        .setName('deals')
        .setDescription('Get available deals for a video game')
        .addStringOption(option =>
            option.setName('gamename')
                .setDescription('The game name you want to get deals for')
                .setRequired(true)),
    async execute(interaction) {
        var game_name = interaction.options.getString('gamename');
        const shops = await itadApi.getShops();
        var shopslist = [];
        for(var i = 0; i < shops.length; i++) {
            shopslist.push(shops[i].id);
        }

        console.log("Available Shops" + shopslist);

        const matchingDeals = await itadApi.searchDeals(game_name, {
            shops: shopslist
        });
        var gamesFound = [];
        for (var i = 0; i < matchingDeals.list.length; i++) {
            var title = matchingDeals.list[i].title;
            if(gamesFound.includes(title)) {
                console.log(title + " | already in array");
            } else { 
                console.log(title)
                gamesFound.push(title); 
            }
        }

        var buttons;
        var allButtons = [];
        var gamesavailableToSearch =[];


        if(matchingDeals.list.length == 0) {
            buttons = new ButtonBuilder()
                        .setCustomId('0')
                        .setLabel("No Game Found")
                        .setStyle(ButtonStyle.Danger)
                        .setDisabled(true);
                    allButtons.push(buttons);
        } else {
            for (var i = 0; i < gamesFound.length; i++) {
                buttons = new ButtonBuilder()
                        .setCustomId(String(i))
                        .setLabel(gamesFound[i])
                        .setStyle(ButtonStyle.Primary)
                console.log("BUTTON LABEL: "+buttons.label)
                if(i > 4) {
                    console.log("not adding")
                } else {
                    if(buttons.label.length > 79) {
                        console.log("ID: "+ i + " is too long")
                    } else {
                        allButtons.push(buttons);
                        gamesavailableToSearch.push(buttons.label);
                    }
                }
            }
        }

         var row = new ActionRowBuilder()
             .addComponents(allButtons);
    
        
        const embed = new EmbedBuilder()
            .setTitle('Game Deals - ' + game_name)
            .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
            //.setThumbnail('https://cdn.discordapp.com/avatars/'+username.value+'/'+avatar+'.jpeg')
            .setDescription(
            'This command is in beta. If you find any bug please report them.\nCurrently, This only scans official retailers and not sites like eneba and pckeys.')
            embed.setFooter({
                text: "Eggium - Tanner Approved"
            })
            .setTimestamp();
            interaction.reply({ embeds: [embed], components: [row], ephemeral: false});

        const collector = interaction.channel.createMessageComponentCollector({
            max: 1,
        });

        collector.on('end', (ButtonInteraction) => {
            var buttonIdClicked = ButtonInteraction.first().customId;
            console.log(buttonIdClicked + " | " + gamesFound[buttonIdClicked]);
            console.log(gamesavailableToSearch);

            var game;
            var gamesToRemove = [];
            for (var i = 0; i < matchingDeals.list.length; i++) {
                game = gamesFound[i];

                if(game == gamesFound[buttonIdClicked]) {
                    delete gamesFound[i]
                } else {
                    gamesToRemove.push(gamesFound[i])
                }
            }

            console.log("games to remove: " + gamesToRemove);
            console.log(gamesToRemove.length)

            const sd = matchingDeals.list;
            //console.log(sd)

            try {
                fs.writeFileSync('./unfiltered.json', JSON.stringify(sd));
                // file written successfully
              } catch (err) {
                console.error(err);
              }

              console.log("SD LENGTH: " + sd.length);
            
            for (var i = 0; i < sd.length; i++) {
                console.log(sd[i].title)
                if(gamesToRemove.includes(sd[i].title)) {
                    delete sd[i];
                }
            }
            
            var filtered = sd.filter(function (el) {
                return el != null;
              });
              
            console.log("Filtered: ");
            var ids = [];
            try {
                fs.writeFileSync('./filtered.json', JSON.stringify(filtered));
                // file written successfully
              } catch (err) {
                console.error(err);
              }


            // var xboxGamePassConsoleGames = []

            // async function myfunction() {
            //     return await fetch("https://catalog.gamepass.com/sigls/v2?id=f6f1f99f-9b49-4ccd-b3bf-4d9767a77f5e&language=en-us&market=US", { method: "Get" })
            //         .then(res => res.json())
            //         .then((json) => {
            //         //console.log(text)
            //           try {
            //             console.log(json.length)
            //           for (var i = 1; i < json.length; i++) {
            //             ids.push(json[i].id);
            //           }
            //             console.log("success")
            //           } catch (err) {
            //             console.error(err);
            //           }
            //     }).then (() => {
            //         for (var i = 0; i < ids.length; i++) {
            //             // console.log(ids[i])
        
            //          return await fetch("https://displaycatalog.mp.microsoft.com/v7.0/products?bigIds="+ids[i]+"&market=US&languages=en-us&MS-CV=DGU1mcuYo0WMMp+F.1", { method: "Get" })
            //             .then(res => res.json())
            //             .then((json) => {
            //                 //console.log(text)
            //                 try {
            //                     var titleOfCurrentXboxGamePassGame = json.Products[0].LocalizedProperties[0].ProductTitle
            //                     console.log(titleOfCurrentXboxGamePassGame)
            //                     xboxGamePassConsoleGames.push(titleOfCurrentXboxGamePassGame);
            //                     //   fs.writeFileSync('gmpass.json', xboxGamePassConsoleGames);
            //                 } catch (err) {
            //                     console.error(err);
            //                 }
            //             });
        
            //         }
            //     });
            //   }
              
            // function start() {
            //     return myfunction();
            // }

            // // Call start
            // (async() => {
            //     console.log('before start');
  
            //     await start();
            //     console.log(ids)

            //     console.log('roger roger')
            //     console.log(xboxGamePassConsoleGames);

            // })();


            if(filtered.length == 1) {
                const embed = new EmbedBuilder()
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
                    //"\nIs This Game On Gamepass? " + "false"
                    )
                    embed.setFooter({
                        text: "Eggium - Tanner Approved"
                    })
                    .setTimestamp();
                interaction.editReply({ embeds: [embed], components: []});
            } else {



                var prices = [];
                for (var i = 0; i < filtered.length; i++) {
                    //console.log(filtered[i].price_new)
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
                
                //console.log(filtered2);

                const embed = new EmbedBuilder()
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
                    //"\nIs This Game On Gamepass? " + "false"
                    )
                    embed.setFooter({
                        text: "Eggium - Tanner Approved"
                    })
                    .setTimestamp();
                interaction.editReply({ embeds: [embed], components: []});
            }
        });
    }
};