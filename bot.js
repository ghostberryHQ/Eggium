//setup Discord Js
const Discord = require('discord.js');
const client = new Discord.Client(({
    intents: [ 'GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS', 'GUILD_MESSAGE_REACTIONS'],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
}));
const config = require('./config.json')
const token = config.token;
const guild_id = config.guild_id;
const { Collection } = require('discord.js');
const { url } = require('inspector');
const fs = require('fs');
const {REST} = require('@discordjs/rest');
const {Routes} = require('discord-api-types/v9');
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const commands = [];

// Creating a collection for commands in client
client.commands = new Collection();

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
    client.commands.set(command.data.name, command);
}
client.on('interactionCreate', async interaction => {
    if(interaction.isButton()) {
        // if(interaction.customId === '0') {
        //     interaction.reply({ content: 'you selected 0', ephemeral: true });
        // }
        // if(interaction.customId === '1') {
        //     interaction.reply({ content: 'you selected 1', ephemeral: true });
        // }
        // if(interaction.customId === '2') {
        //     interaction.reply({ content: 'you selected 2', ephemeral: true });
        // }
        // if(interaction.customId === '3') {
        //     interaction.reply({ content: 'you selected 3', ephemeral: true });
        // }
        // if(interaction.customId === '4') {
        //     interaction.reply({ content: 'you selected 4', ephemeral: true });
        // }
    }
    if (!interaction.isCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
        await command.execute(interaction);
    } catch (error) {
        if (error) console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }

});

client.on('messageReactionAdd', (reaction, user) => {
    if (reaction.emoji.name === '⭐') {
        const stars = reaction.count;
        const userWhoSend = reaction.message.author;
        console.log(userWhoSend);
        console.log(userWhoSend.id);
        console.log(userWhoSend.avatar);
        if(stars === 5) {
            //make an embed
            const embed = new Discord.MessageEmbed()
            .setTitle('⭐ Starboard Message ⭐')
            .setColor('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'))
            .setThumbnail('https://cdn.discordapp.com/avatars/'+userWhoSend.id+'/'+userWhoSend.avatar+'.jpeg')
            .setDescription(String(reaction.message.content))
            embed.setFooter({
                text: "Eggium - Tanner Approved"
            });
            client.channels.get(config.starboard_id).send(embed);
        }
        console.log('#' + stars + ' ⭐ reactions have been added');
    } else {
        console.log('a non-⭐ reaction has been added');
    }
});

const { Webhook } = require('discord-webhook-node');

const channel_2_hook = new Webhook(config.channel_2_url);

const channel_1_id = config.channel_1_id;

client.on('ready', () => {
  console.log("Chat link is online")
})

client.on("message", async (message) => {
    if(message.author.bot) return;
    if(message.channel.type === "dm") return;

    // Channel 1 -> Channel 2
    if(message.channel.id == channel_1_id) {
        if(message.content.length == 0) {
            message.channel.send("There was an error sending your message.\nKeep in mind that attachments can't be bridged at this point.")
            return;
        } else {
            channel_2_hook.setUsername(message.author.tag + " | Streamies");
            channel_2_hook.setAvatar(message.author.displayAvatarURL());
            channel_2_hook.send(message.content);
        }
    }
})

client.on('guildMemberAdd', member => {
    member.roles.add(member.guild.roles.cache.find(i => i.name === 'movers'))
    member.guild.channels.cache.get('962888183362764861').send("Welcome to the resistance, " + member.user.username + ". Glad you could join us.");
});

client.once('ready', () => {
    console.log('The battle is now. Eggium Version: ' + config.eggium_version);
    // Registering the commands in the client
    const CLIENT_ID = client.user.id;
    const rest = new REST({
        version: '9'
    }).setToken(token);
    (async () => {
        try {
            if (!guild_id) {
                await rest.put(
                    Routes.applicationCommands(CLIENT_ID), {
                        body: commands
                    },
                );
                console.log('Successfully registered application commands globally');
            } else {
                await rest.put(
                    Routes.applicationGuildCommands(CLIENT_ID, guild_id), {
                        body: commands
                    },
                );
                console.log('Successfully registered application commands for development guild');
            }
        } catch (error) {
            if (error) console.error(error);
        }
    })();
});

client.login(token);