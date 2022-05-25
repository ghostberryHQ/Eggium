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
                })
                .setRequired(true)),
    async execute(interaction) {

        var animal = interaction.options.getString('animal');

        if(animal == 'dog') {
            const request = https.get('https://random.dog/woof.json', (response) => {
                response.setEncoding('utf8');
                let body = '';
                response.on('data', (chunk) => {
                    body += chunk;
                });
                response.on('end', () => {
                    const data = JSON.parse(body);
                    interaction.reply(data.url);
                });
            });
        } else if(animal == 'cat') {
            const request = https.get('https://api.thecatapi.com/v1/images/search?format=json', (response) => {
                response.setEncoding('utf8');
                let body = '';
                response.on('data', (chunk) => {
                    body += chunk;
                });
                response.on('end', () => {
                    const data = JSON.parse(body);
                    interaction.reply(data[0].url);
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
                    interaction.reply(data.link);
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
                    interaction.reply(data.link);
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
                    interaction.reply(data.link);
                });
            });
        }
    }
};