const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder } = require("discord.js");
const { con } = require('../bot');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pet')
        .setDescription('dont even worry about it')
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View your pets'))
        .addSubcommand(subcommand =>
                subcommand
                    .setName('purchase')
                    .setDescription('Purchase a pet'))
        .addSubcommand(subcommand =>
                subcommand
                    .setName('rename')
                    .setDescription('Rename a pet')
                    .addStringOption(option =>
                        option.setName('petid')
                            .setDescription("the pet ID to nickname")
                            .setRequired(true))
                    .addStringOption(option =>
                        option.setName('name')
                            .setDescription("the new name for the pet")
                            .setRequired(true))),
    async execute(interaction) {
        if (interaction.options.getSubcommand() === "view") {

            con.query(`SELECT * FROM Pets WHERE ownerID = '${interaction.user.id}'`, function (err, result, fields) {

                if (err) throw err;

                if (result.length == 0) {
                    interaction.reply("You don't have any pets yet!");
                } else {
                    if(result.length > 1) {
                        //user has more than one pet
                        interaction.reply("You have more than one pet! Honestly, I'm not sure how you managed that, but I'm not going to question it. Just wait for me to add support for multiple pets, okay?");
                    } else{
                        //user has one pet
                        //embed
                        //get mm/dd/yyyy from result[0].dateRecieved
                        var dateObj = new Date(result[0].dateRecieved);
                        var month = dateObj.getUTCMonth() + 1; //months from 1-12
                        var day = dateObj.getUTCDate();
                        var year = dateObj.getUTCFullYear();
                        var newdate = month + "/" + day + "/" + year;

                        const embed = new EmbedBuilder()
                            .setTitle(`${result[0].name}`)
                            .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
                            .setDescription(`Rarity: ${result[0].rarity}\nDate of Birth: ${newdate}\nOriginal Owner: ${result[0].originalOwner}`)
                            .setThumbnail(`https://api.persn.dev/eggium/getPetPic/${result[0].rarity}/${result[0].seed}`)
                            .setFooter({ text: `ID: ${result[0].id}` })
                            .setTimestamp();
                        interaction.reply({ embeds: [embed] });
                    }
                }

            });

        }else if (interaction.options.getSubcommand() === "purchase") {

            var maxPetCap = 1;

            con.query(`SELECT * FROM Pets WHERE ownerID = ${interaction.user.id}`, function (err, result, fields) {
                if( err ) throw err;
                if( result.length >= maxPetCap ) {
                    interaction.reply("Since pets are in beta, you can only have one pet at this time. Sorry!");
                } else {
                    const modal = new ModalBuilder()
                        .setCustomId('petNaming')
                        .setTitle('Pet Info');
                    const petNameInput = new TextInputBuilder()
                        .setCustomId('petname')
                        .setLabel("Pet Name")
                        .setPlaceholder("Please enter the name you would like to give your pet.")
                        .setRequired(true)
                        .setStyle('Short');
                    const firstActionRow = new ActionRowBuilder().addComponents(petNameInput);
                    modal.addComponents(firstActionRow);
                    interaction.showModal(modal);
                }
            });

        } else if (interaction.options.getSubcommand() === "rename") {
            var petID = interaction.options.getString('petid');
            var newName = interaction.options.getString('name');
            con.query(`SELECT * FROM Pets WHERE id = ${petID} AND ownerID = ${interaction.user.id}`, function (err, result, fields) {
                if(err) throw err;
                if(result.length == 0) {
                    interaction.reply("You don't have a pet with that ID!");
                } else {
                    con.query(`UPDATE Pets SET name = '${newName}' WHERE id = ${petID}`);
                    interaction.reply(`Successfully renamed pet with ID #${petID} to ${newName}!`);
                }
            });
        }
    }
};