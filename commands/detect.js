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
            option.setName('attachment')
                .setDescription('Image Attachment')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('imageurl')
                .setDescription('Image Url')
                .setRequired(false)),
    async execute(interaction) {
        await interaction.reply('Calculating...', { ephemeral: true });
        var imageUrl = interaction.options.getString("imageurl")
        var image = interaction.options.get("attachment")
        var finalimageURL;

        if(!image == "") {
            console.log("Its an attachment");
            finalimageURL = image.attachment.url
        } else if(!imageUrl == "") {
            console.log("Its a url");
            finalimageURL = imageUrl;
        }
        setTimeout(function() {
            var rekognition = new AWS.Rekognition();
            imageToBase64(finalimageURL).then(
                (response) => {
                    var params = {
                        Image: { "Bytes": getBinary(response) },
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
                            var finalDescrip;
                            if(labels.length == 0) finalDescrip = "Error processing this image. This could be due to a number of reasons. Please report this in the Eggium Support Discord Server.";
                            else finalDescrip = labels.join('\n');
                            const embed = new EmbedBuilder()
                            .setTitle('Detect')
                            .setColor('#0099ff')
                            .setDescription(finalDescrip)
                            .setFooter({ text: "Eggium - Tanner Approved" })
                            .setThumbnail(finalimageURL)
                            .setTimestamp();
                        //send embed
                        interaction.editReply('Calculated!', { ephemeral: false });
                        interaction.editReply({ embeds: [embed] }, { ephemeral: false });
                        }
                    });
                }).catch(
                    (error) => {
                        console.log(error); // Logs an error if there was one
                    }
                )
        }, 1000);
    }
};