const token = 'OTg1MjI0OTkzMzY3NTM1NjQ2.G6caES.A3tZmQz9PwMyjSFXOv4NEabF0bf4eiHFFdXs04';
const Discord = require('discord.js');
const client = new Discord.Client({
    intents: [ 'GUILDS', 'GUILD_MESSAGES'],
});

client.on('ready', () => {
    console.log('We have logged in as a bot!');
});

client.on("message", async (message) => {
    if(message.author.bot) return;
    if(message.channel.type === "dm") return;

    //console.log(message.content)

    if(message.content.includes("lick my foot")) {
        message.channel.send("ok bestie");
    }
    if(message.content.includes("!lick")) {
        message.channel.send("suck my ball sack");
    }
})


client.login(token);