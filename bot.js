const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const { EmbedBuilder } = require('@discordjs/builders'); // Add this line
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const channels = require('./channels.json');
const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Bot is running!');
});

app.listen(3000, () => {
    console.log('Web server is running on port 3000');
});


// Basic Bot Setup
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const DISCORD_CHANNEL_ID = '1323637412123119698';

// URLs of online icons
const YOUTUBE_ICON_URL = 'https://upload.wikimedia.org/wikipedia/commons/4/42/YouTube_icon_%282013-2017%29.png';
const TWITCH_ICON_URL = 'https://static.twitchcdn.net/assets/favicon-32-e29e246c157142c94346.png';

// Cache to track last notified content
let lastNotified = {
    youtube: {},
    twitch: {}
};

// Fetch YouTube Videos with Embeds
async function checkYoutube(channelID) {
    try {
        const url = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${channelID}&part=snippet&order=date&type=video&maxResults=1`;
        const response = await axios.get(url);

        const video = response.data.items[0];
        if (video && video.id.videoId !== lastNotified.youtube[channelID]) {
            lastNotified.youtube[channelID] = video.id.videoId;

            const embed = new EmbedBuilder()
                .setColor(0xff0000) // YouTube Red
                .setAuthor({ name: 'YouTube', iconURL: YOUTUBE_ICON_URL })
                .setTitle(`New video from ${video.snippet.channelTitle}`)
                .setDescription(`**Title:** ${video.snippet.title}\n**Description:** ${video.snippet.description}\n**Published at:** ${new Date(video.snippet.publishedAt).toLocaleString()}`)
                .setURL(`https://www.youtube.com/watch?v=${video.id.videoId}`)
                .setThumbnail(video.snippet.thumbnails.default.url);
            return { embeds: [embed] };
        }
    } catch (error) {
        if (error.response && error.response.status === 403) {
            console.error(`Error fetching YouTube videos for channel ${channelID}: Request failed with status code 403. Please check your API key and quota.`);
        } else {
            console.error(`Error fetching YouTube videos for channel ${channelID}:`, error.message);
        }
        return null;
    }
}

// Fetch Twitch Streams with Embeds
async function checkTwitch(channelName) {
    try {
        const tokenResponse = await axios.post('https://id.twitch.tv/oauth2/token', null, {
            params: {
                client_id: TWITCH_CLIENT_ID,
                client_secret: TWITCH_CLIENT_SECRET,
                grant_type: 'client_credentials',
            },
        });

        const accessToken = tokenResponse.data.access_token;
        const response = await axios.get(`https://api.twitch.tv/helix/streams`, {
            headers: {
                'Client-ID': TWITCH_CLIENT_ID,
                Authorization: `Bearer ${accessToken}`,
            },
            params: { user_login: channelName },
        });

        const stream = response.data.data[0];
        if (stream && stream.id !== lastNotified.twitch[channelName]) {
            lastNotified.twitch[channelName] = stream.id;

            const thumbnailUrl = stream.thumbnail_url.replace('{width}', '320').replace('{height}', '180');
            const embed = new EmbedBuilder()
                .setColor(0x9146ff) // Twitch Purple
                .setAuthor({ name: 'Twitch', iconURL: TWITCH_ICON_URL })
                .setTitle(`Live now on Twitch!`)
                .setDescription(`**${channelName}** **went live**\n\n**Title:** ${stream.title}\n**Game:** ${stream.game_name}\n**Started at:** ${new Date(stream.started_at).toLocaleString()}\n[Watch Now](https://www.twitch.tv/${channelName})`)
                .setURL(`https://www.twitch.tv/${channelName}`)
                .setThumbnail(thumbnailUrl);
            return { embeds: [embed] };
        }
    } catch (error) {
        console.error(`Error fetching Twitch streams for channel ${channelName}:`, error.message);
        return null;
    }
}

// Function to check and post new content
async function checkAndPostContent(channel) {
    try {
        for (const ytChannel of channels.youtubeChannels) {
            const youtubeMessage = await checkYoutube(ytChannel.id);
            if (youtubeMessage) await channel.send(youtubeMessage);
        }
        for (const twitchChannel of channels.twitchChannels) {
            const twitchMessage = await checkTwitch(twitchChannel.name);
            if (twitchMessage) await channel.send(twitchMessage);
        }
        console.log('Checked and posted new content.');
    } catch (error) {
        console.error('Error during content check:', error.message);
    }
}

// Bot Ready Event
client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    try {
        const channel = await client.channels.fetch(DISCORD_CHANNEL_ID);
        if (!channel) {
            console.error('Channel not found. Ensure the DISCORD_CHANNEL_ID is correct.');
            return;
        }

        // Poll APIs every 15 minutes
        setInterval(async () => {
            try {
                await checkAndPostContent(channel);
            } catch (error) {
                console.error('Error during API polling:', error.message);
            }
        }, 900000); // 15 minutes
    } catch (error) {
        console.error('Error fetching the Discord channel:', error.message);
    }
});

// Slash Command Handling
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`Error executing ${interaction.commandName}:`, error.message);
        await interaction.reply({ content: 'There was an error while executing this command.', ephemeral: true });
    }
});

// Command Handler
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

const commands = [];
for (const folder of commandFolders) {
    const folderPath = path.join(foldersPath, folder); // Change variable name to folderPath
    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(folderPath, file); // Use folderPath here
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            commands.push(command.data.toJSON());
        } else {
            console.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

// Deploy Commands
const { clientId, guildId, token } = require('./config.json');
const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands }
        );
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('Error deploying commands:', error.message);
    }
})();

client.login(process.env.DISCORD_BOT_TOKEN);