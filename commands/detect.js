const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const imageToBase64 = require('image-to-base64');
const config = require('../config.json');
var AWS = require('aws-sdk');

//declare AWS region and keys
AWS.config.update({
    region: 'us-east-1',
    accessKeyId: config.AWS_KEY,
    secretAccessKey: config.AWS_SECRET_KEY
});

function getBinary(base64Image) {
    var binaryImg = atob(base64Image);
    var length = binaryImg.length;
    var ab = new ArrayBuffer(length);
    var ua = new Uint8Array(ab);
    for (var i = 0; i < length; i++) {
      ua[i] = binaryImg.charCodeAt(i);
    }
    return ab;
  }

module.exports = {
    data: new SlashCommandBuilder()
        .setName('detect')
        .setDescription('Uses AI to detect what is in an image')
        .addAttachmentOption(option =>
            option.setName('image')
                .setDescription('Image to detect')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('imageurl')
                .setDescription('Image Url')
                .setRequired(false)),
    async execute(interaction) {
        await interaction.reply('Calculating...', { ephemeral: true });
        var imageUrl = interaction.options.getString("imageurl")
        var image = interaction.options.get("image")

        if(!image == "") {
            console.log("Its an attachment");
            console.log(image)
            console.log(image.type)
            console.log(image.value)
            interaction.editReply('Attachments are currently unsupported. Please try again later', { ephemeral: true });
            return;

            if(Attachment.length > 0) {
                imageUrl = Attachment[0].url;
                var rekognition = new AWS.Rekognition();
                imageToBase64(imageUrl)
                    .then(
                        (response) => {
                            var params = {
                                Image: {
                                    //set bytes to response to string
                                    "Bytes": getBinary(response)
                                },
                                MaxLabels: 10,
                                MinConfidence: 70
                            };
                            //detect labels
                            rekognition.detectLabels(params, function(err, data) {
                                if (err) {
                                    console.log(err, err.stack);
                                } else {
                                    //get labels
                                    //create array of labels
                                    var labels = [];
                                    //loop for length of data.Labels
                                    for (var i = 0; i < data.Labels.length; i++) {
                                        //get label
                                        var label = data.Labels[i].Name;
                                        //get confidence
                                        var confidence = data.Labels[i].Confidence;
                                        //add label to array
                                        labels.push(label + ': ' + confidence);
                                    }
                                    //create embed
                                    const embed = new EmbedBuilder()
    
                                    .setTitle('Detect')
                                    .setColor('#0099ff')
                                    //set description to labels
                                    .setDescription(labels.join('\n'))
                                    embed.setFooter({
                                        text: "Eggium - Tanner Approved"
                                    })
                                    .setThumbnail(imageUrl)
                                    .setTimestamp();
                                //send embed
                                interaction.editReply('Calculated!', { ephemeral: false });
                                interaction.editReply({ embeds: [embed] }, { ephemeral: false });
                                }
                            });
                        }
                    )
                    .catch(
                        (error) => {
                            console.log(error); // Logs an error if there was one
                            const embed = new EmbedBuilder()
    
                            .setTitle('Detection Failed')
                            .setColor('#FA113D')
                            //set description to labels
                            .setDescription("Something went wrong. I wouldnt try that image again if I were you but hey--what do I know? Im just a fake element.")
                            embed.setFooter({
                                text: "Eggium - Tanner Approved"
                            })
                            .setThumbnail(imageUrl)
                            .setTimestamp();
                        //send embed
                        interaction.editReply('Calculated!', { ephemeral: false });
                        interaction.editReply({ embeds: [embed] }, { ephemeral: false });
                        }
                    )
            } else {
                interaction.editReply('Calculated!', { ephemeral: false });
                interaction.editReply({ content: 'Please provide an image.' , ephemeral: true});
            }
        } else if(!imageUrl == "") {
            var rekognition = new AWS.Rekognition();
            imageToBase64(imageUrl)
                .then(
                    (response) => {
                        var params = {
                            Image: {
                                //set bytes to response to string
                                "Bytes": getBinary(response)
                            },
                            MaxLabels: 10,
                            MinConfidence: 70
                        };
                        //detect labels
                        rekognition.detectLabels(params, function(err, data) {
                            if (err) {
                                console.log(err, err.stack);
                            } else {
                                //get labels
                                //create array of labels
                                var labels = [];
                                //loop for length of data.Labels
                                for (var i = 0; i < data.Labels.length; i++) {
                                    //get label
                                    var label = data.Labels[i].Name;
                                    //get confidence
                                    var confidence = data.Labels[i].Confidence;
                                    //add label to array
                                    labels.push(label + ': ' + confidence);
                                }
                                //create embed
                                const embed = new EmbedBuilder()

                                .setTitle('Detect')
                                .setColor('#0099ff')
                                //set description to labels
                                .setDescription(labels.join('\n'))
                                embed.setFooter({
                                    text: "Eggium - Tanner Approved"
                                })
                                .setThumbnail(imageUrl)
                                .setTimestamp();
                            //send embed
                            interaction.editReply('Calculated!', { ephemeral: false });
                            interaction.editReply({ embeds: [embed] }, { ephemeral: false });
                            }
                        });
                    }
                )
                .catch(
                    (error) => {
                        console.log(error); // Logs an error if there was one
                    }
                )
        }
    }
};