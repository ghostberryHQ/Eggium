const { SlashCommandBuilder } = require('@discordjs/builders');
const https = require('https');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pet')
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
            const request = https.get('https://some-random-api.ml/img/dog', (response) => {
                response.setEncoding('utf8');
                let body = '';
                response.on('data', (chunk) => {
                    body += chunk;
                });
                response.on('end', () => {
                    const data = JSON.parse(body);
                    interaction.reply({content: data.link});
                });
            });
        } else if(animal == 'cat') {
            const request = https.get('https://some-random-api.ml/img/cat', (response) => {
                response.setEncoding('utf8');
                let body = '';
                response.on('data', (chunk) => {
                    body += chunk;
                });
                response.on('end', () => {
                    const data = JSON.parse(body);
                    interaction.reply({content: data.link});
                });
            });
        } else if(animal == 'panda') {
            const request = https.get('https://some-random-api.ml/img/panda', (response) => {
                response.setEncoding('utf8');
                let body = '';
                response.on('data', (chunk) => {
                    body += chunk;
                });
                response.on('end', () => {
                    const data = JSON.parse(body);
                    interaction.reply({content: data.link});
                });
            });
        } else if(animal == 'koala') {
            const request = https.get('https://some-random-api.ml/img/koala', (response) => {
                response.setEncoding('utf8');
                let body = '';
                response.on('data', (chunk) => {
                    body += chunk;
                });
                response.on('end', () => {
                    const data = JSON.parse(body);
                    interaction.reply({content: data.link});
                });
            });
        } else if(animal == 'bird') {
            const request = https.get('https://some-random-api.ml/img/birb', (response) => {
                response.setEncoding('utf8');
                let body = '';
                response.on('data', (chunk) => {
                    body += chunk;
                });
                response.on('end', () => {
                    const data = JSON.parse(body);
                    interaction.reply({content: data.link});
                });
            });
        } else if(animal == 'fox') {
            const request = https.get('https://some-random-api.ml/img/fox', (response) => {
                response.setEncoding('utf8');
                let body = '';
                response.on('data', (chunk) => {
                    body += chunk;
                });
                response.on('end', () => {
                    const data = JSON.parse(body);
                    interaction.reply({content: data.link});
                });
            });
        } else if(animal == 'kangaroo') {
            const request = https.get('https://some-random-api.ml/img/kangaroo', (response) => {
                response.setEncoding('utf8');
                let body = '';
                response.on('data', (chunk) => {
                    body += chunk;
                });
                response.on('end', () => {
                    const data = JSON.parse(body);
                    interaction.reply({content: data.link});
                });
            });
        }
    }
};