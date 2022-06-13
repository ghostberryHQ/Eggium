const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { Collection, MessageActionRow, Modal, TextInputComponent } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("Commands relating to Eggium Profiles")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("view")
        .setDescription("View an Eggium Profile")
        .addUserOption((option) =>
          option.setName("profile").setDescription("The user")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("create").setDescription("Create an Eggium Profile")
    ),
  async execute(interaction) {
    if (interaction.options.getSubcommand() === "view") {
      const user = interaction.options.getUser("profile");
      console.log(user);
      if (user) {
        //check if user is in user.json
        var userDatabasePRE = fs.readFileSync('./user.json','utf8');
        var userDatabase = JSON.parse(userDatabasePRE);
        var count = Object.keys(userDatabase.users).length;
        console.log(count);
        var userExists = false;
        var steamID;
        var steamName;
        var dateRegistered;

        for (var i = 0; i < count; i++) {
          var up = Object.keys(userDatabase.users)[i];
          const Database = userDatabase.users[up];
          if (up === user.id) {
            userExists = true;
            steamID = Database.steamID;
            steamName = Database.steamName;
            dateRegistered = Database.dateRegistered;
          }
        }

        if (userExists === true) {
          console.log("found " + user.username);

          const embed = new MessageEmbed()
            .setTitle("Eggium Profile - " + user.username)
            .setColor(
              "#" +
                ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0")
            )
            //   .setThumbnail(mostRecentlyPlayedGame.iconURL)
            .setDescription(
              "Steam ID: " +
                steamID +
                "\nSteam Name: " +
                steamName +
                "\nDate Registered: " +
                dateRegistered
            );
          embed
            .setFooter({
              text: "Eggium - Tanner Approved",
            })
            .setTimestamp();
          //send embed
          interaction.reply({ embeds: [embed], ephemeral: true });
        } else if (userExists === false) {
          console.log("not found " + user.username);

          const embed = new MessageEmbed()
            .setTitle("Eggium Profile - " + user.username)
            .setColor("#" +((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
            //.setThumbnail(mostRecentlyPlayedGame.iconURL)
            .setDescription("This user has not created an Eggium Profile yet.");
            embed.setFooter({
              text: "Eggium - Tanner Approved",
            })
            .setTimestamp();
          //send embed
          interaction.reply({ embeds: [embed], ephemeral: true });
        }
      }
    } else if (interaction.options.getSubcommand() === "create") {

        var user = interaction.user;
        if(user) {
          var userDatabasePRE = fs.readFileSync('./user.json','utf8');
          var userDatabase = JSON.parse(userDatabasePRE);
          var count = Object.keys(userDatabase.users).length;
            for (var i = 0; i < count; i++) {
              var up = Object.keys(userDatabase.users)[i];
                if (up === user.id) {
                  userExists = true;
                }
            }


            if (userExists === true) {
                console.log("found " + user.id);
      
                const embed = new MessageEmbed()
                  .setTitle("Eggium Profile - " + user.username)
                  .setColor("#" +((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))
                  //   .setThumbnail(mostRecentlyPlayedGame.iconURL)
                  .setDescription("You already have an Eggium Profile. View it with /profile view");
                embed.setFooter({
                    text: "Eggium - Tanner Approved",
                })
                  .setTimestamp();
                //send embed
                interaction.reply({ embeds: [embed], ephemeral: true });
              } else {
                console.log("user not found");
                  const modal = new Modal()
                      .setCustomId('profileCreation')
                      .setTitle('Eggium Profile Creation');
                  const steamIdentifierInput = new TextInputComponent()
                      .setCustomId('steamIdentifier')
                      .setLabel("Please enter your Steam Identifier")
                      .setStyle('SHORT');
                  const firstActionRow = new MessageActionRow().addComponents(steamIdentifierInput);
                  modal.addComponents(firstActionRow);
                  await interaction.showModal(modal);
            }
        }
    }
  },
};
