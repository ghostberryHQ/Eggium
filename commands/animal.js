const { SlashCommandBuilder } = require('@discordjs/builders');
const { AttachmentBuilder } = require('discord.js');
const https = require('https');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('animal')
        .setDescription('Choose a pet to recieve a cute picture of them')
        .addStringOption(option =>
            option.setName('animal')
                .setDescription('The animal pic you would like to recieve')
                .addChoices({
                    name: 'dog', 
                    value: 'dog',
                },
                {
                    name: 'cat', 
                    value: 'cat',
                },
                {
                    name: 'bird', 
                    value: 'bird',
                },
                {
                    name: 'koala', 
                    value: 'koala',
                },
                {
                    name: 'panda', 
                    value: 'panda',
                },
                {
                    name: 'fox', 
                    value: 'fox',
                },
                {
                    name: 'kangaroo', 
                    value: 'kangaroo',
                })
                .setRequired(true)),
    async execute(interaction) {
        var animal = interaction.options.getString('animal');
        if(animal == 'dog') {
            const request = https.get('https://some-random-api.ml/animal/dog', (response) => {
                response.setEncoding('utf8');
                let body = '';
                response.on('data', (chunk) => {
                    body += chunk;
                });
                response.on('end', () => {
                    const data = JSON.parse(body);
                    const msgAttach = new AttachmentBuilder(data.image, { name: 'animal.png' })
                    interaction.reply({content: `Fun Fact: ${data.fact}`, files: [msgAttach]});
                });
            });
        } else if(animal == 'cat') {
            const request = https.get('https://some-random-api.ml/animal/cat', (response) => {
                response.setEncoding('utf8');
                let body = '';
                response.on('data', (chunk) => {
                    body += chunk;
                });
                response.on('end', () => {
                    const data = JSON.parse(body);
                    const msgAttach = new AttachmentBuilder(data.image, { name: 'animal.png' })
                    interaction.reply({content: `Fun Fact: ${data.fact}`, files: [msgAttach]});
                });
            });
        } else if(animal == 'panda') {
            const request = https.get('https://some-random-api.ml/animal/panda', (response) => {
                response.setEncoding('utf8');
                let body = '';
                response.on('data', (chunk) => {
                    body += chunk;
                });
                response.on('end', () => {
                    const data = JSON.parse(body);
                    const msgAttach = new AttachmentBuilder(data.image, { name: 'animal.png' })
                    interaction.reply({content: `Fun Fact: ${data.fact}`, files: [msgAttach]});
                });
            });
        } else if(animal == 'koala') {
            const request = https.get('https://some-random-api.ml/animal/koala', (response) => {
                response.setEncoding('utf8');
                let body = '';
                response.on('data', (chunk) => {
                    body += chunk;
                });
                response.on('end', () => {
                    const data = JSON.parse(body);
                    const msgAttach = new AttachmentBuilder(data.image, { name: 'animal.png' })
                    interaction.reply({content: `Fun Fact: ${data.fact}`, files: [msgAttach]});
                });
            });
        } else if(animal == 'bird') {
            const request = https.get('https://some-random-api.ml/animal/birb', (response) => {
                response.setEncoding('utf8');
                let body = '';
                response.on('data', (chunk) => {
                    body += chunk;
                });
                response.on('end', () => {
                    const data = JSON.parse(body);
                    const msgAttach = new AttachmentBuilder(data.image, { name: 'animal.png' })
                    interaction.reply({content: `Fun Fact: ${data.fact}`, files: [msgAttach]});
                });
            });
        } else if(animal == 'fox') {
            const request = https.get('https://some-random-api.ml/animal/fox', (response) => {
                response.setEncoding('utf8');
                let body = '';
                response.on('data', (chunk) => {
                    body += chunk;
                });
                response.on('end', () => {
                    const data = JSON.parse(body);
                    const msgAttach = new AttachmentBuilder(data.image, { name: 'animal.png' })
                    interaction.reply({content: `Fun Fact: ${data.fact}`, files: [msgAttach]});
                });
            });
        } else if(animal == 'kangaroo') {
            const request = https.get('https://some-random-api.ml/animal/kangaroo', (response) => {
                response.setEncoding('utf8');
                let body = '';
                response.on('data', (chunk) => {
                    body += chunk;
                });
                response.on('end', () => {
                    const data = JSON.parse(body);
                    const msgAttach = new AttachmentBuilder(data.image, { name: 'animal.png' })
                    interaction.reply({content: `Fun Fact: ${data.fact}`, files: [msgAttach]});
                });
            });
        }
    }
};