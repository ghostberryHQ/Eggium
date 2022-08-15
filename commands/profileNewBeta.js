const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, Collection, ActionRowBuilder, ModalBuilder, TextInputBuilder  } = require("discord.js");
var mysql = require('mysql');
const config = require('../config.json')
var myModule = require('../bot.js');

var con = myModule.con;
  
module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Pulls profile from Eggium profile V2 server (limited access)')
        .addSubcommand((subcommand) =>
          subcommand.setName("view").setDescription("View an Eggium Profile").addUserOption((option) => option.setName("profile").setDescription("The user")))
        .addSubcommand((subcommand) =>
          subcommand.setName("create").setDescription("Create an Eggium V2 Profile"))
        .addSubcommand((subcommand) =>
          subcommand.setName("link").setDescription("Link an app to your Eggium Profile").addStringOption(option =>
            option.setName('services')
                .setDescription("The service you'd like to connect your Eggium account to")
                .addChoices({
                    name: 'Steam', 
                    value: 'steam',
                })
                .setRequired(true)),),
    async execute(interaction) {
      if (interaction.options.getSubcommand() === "view") {
        var user;
        if(interaction.options.getUser("profile") === undefined || interaction.options.getUser("profile") === null) {
          user = interaction.user;
        } else {
          user = interaction.options.getUser("profile");
        }
          con.query("SELECT * FROM Users WHERE discordID = " + user.id + ";", function (err, result, fields) {
            if (err) throw err;
            console.log(result[0]);
            if(result[0] === undefined || result[0] === null) {

              const embed = new EmbedBuilder()
                .setTitle("Eggium Profile - " + user.username)
                .setColor("#" +((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                .setDescription("User does not have an Eggium V2 profile.");
              embed
                .setFooter({text: "Eggium - Tanner Approved"})
                .setTimestamp();
              //send embed
              interaction.reply({ embeds: [embed], ephemeral: true });
            } else {
              var discordName = result[0].discordName;
              var steamID;
              con.query("SELECT CAST(steamID as CHAR) FROM Users WHERE discordID = " + user.id + ";", function (err, result, fields) {
                console.log(result[0]['CAST(steamID as CHAR)'])
                steamID = result[0]['CAST(steamID as CHAR)']
              })
              var steamName = result[0].steamName;
              var dateObj = new Date(result[0].dateRegistered);
              con.query("SELECT * FROM ListeningHistory WHERE discordID = "+ user.id.toString() + " ORDER BY listenedTime DESC"+ ";", function (err, result, fields) {
                if (err) throw err;
                //console.log(result);
                con.query('SELECT songID, COUNT(songID) AS songCount FROM ListeningHistory where discordID = '+user.id.toString()+' GROUP BY songID ORDER BY songCount DESC LIMIT 1;', function (err, result, fields) {
                  if (err) throw err;
                  var mostListenedToSong;
                  if(result[0] === undefined || result[0] === null) {
                    mostListenedToSong = "No songs have been listened to yet.";
                  } else {
                    var timesListened = result[0].songCount;
                    con.query("SELECT * FROM Songs WHERE songID = " + result[0].songID.toString()+";", function (err, result, fields) {
                      mostListenedToSong = `${result[0].songName} by ${result[0].songArtist} | listened ${timesListened} times.`;
                    });
                  }
                  var achievementsAmount;
                  con.query('SELECT discordID, COUNT(discordID) AS questCount FROM QuestHistory where discordID = "'+user.id+'" GROUP BY discordID ORDER BY questCount DESC LIMIT 1;', function (err, result, fields) {
                    if(result === undefined || result === null || result.length === 0) {
                      achievementsAmount = "0";
                    } else {
                      achievementsAmount = result[0].questCount;
                    }
                  });
                  var month = dateObj.getUTCMonth() + 1; //months from 1-12
                  var day = dateObj.getUTCDate();
                  var year = dateObj.getUTCFullYear();
                  //var dateRegistered = `${month}/${day}/${year}`;
                  var dateRegistered = `<t:${dateObj.getTime() / 1000}:D>`;
                  setTimeout(function() {
                    const embed = new EmbedBuilder()
                    .setTitle("Eggium Profile - " + discordName)
                    .setColor("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                    .setDescription(
                      "Steam ID: " + steamID +
                      "\nSteam Name: " + steamName +
                      "\nDate Registered: " + dateRegistered +
                      "\nAchievements Obtained: " + achievementsAmount +
                      "\nMost Listened To Song: " + mostListenedToSong
                    );
                  embed
                    .setFooter({text: "Eggium - Tanner Approved"})
                    .setTimestamp();
                  interaction.reply({ embeds: [embed], ephemeral: true });
                  }, 300);
                });
              });
            }
          });

      } else if (interaction.options.getSubcommand() === "create") {
        var user = interaction.user;
          con.query("SELECT * FROM Users WHERE discordID = " + user.id + ";", function (err, result, fields) {
            if (err) throw err;
            if(result[0] === undefined || result[0] === null) {
              console.log("User not found");
              const modal = new ModalBuilder()
                  .setCustomId('profileCreation')
                  .setTitle('Eggium Profile Creation');
              const steamIdentifierInput = new TextInputBuilder()
                  .setCustomId('steamIdentifier')
                  .setLabel("Please enter your Steam Identifier")
                  .setPlaceholder("ID found in the URL of your Steam Profile (not required)")
                  .setRequired(false)
                  .setStyle('Short');
              const firstActionRow = new ActionRowBuilder().addComponents(steamIdentifierInput);
              modal.addComponents(firstActionRow);
              interaction.showModal(modal);
            } else {
              //user exists
            const embed = new EmbedBuilder()
              .setTitle("Eggium Profile - " + user.username)
              .setColor("#" +((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
              .setDescription("You already have an Eggium V2 Profile. View it with /profile view");
            embed.setFooter({text: "Eggium - Tanner Approved",})
              .setTimestamp();
            //send embed
            interaction.reply({ embeds: [embed], ephemeral: true });
            }
          });
      }else if (interaction.options.getSubcommand() === "link") {
        var user = interaction.user;
        var service = interaction.options.getString('services');
        const embed = new EmbedBuilder()
          .setTitle(`Eggium Profile Linking - ${user.username}`)
          .setColor("#" +((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
          .setDescription(`Linking for ${service} is coming soon!`)
          .setFooter({text: "Eggium - Tanner Approved"})
          .setTimestamp();
        //send embed
        interaction.reply({ embeds: [embed], ephemeral: true });
      }
    }
};