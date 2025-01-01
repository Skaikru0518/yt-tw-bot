const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const channelsPath = path.join(__dirname, '../../channels.json');
const channels = require(channelsPath);

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

const YOUTUBE_ICON_URL = 'https://upload.wikimedia.org/wikipedia/commons/4/42/YouTube_icon_%282013-2017%29.png';
const TWITCH_ICON_URL = 'https://static.twitchcdn.net/assets/favicon-32-e29e246c157142c94346.png';

// Function to check YouTube videos
async function checkYoutube(channelID) {
    const url = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${channelID}&part=snippet&order=date&type=video&maxResults=1`;

    const response = await axios.get(url);
    const video = response.data.items[0];
    if (video) {
        const embed = new EmbedBuilder()
            .setColor(0xff0000) // YouTube Red
            .setAuthor({ name: 'YouTube', iconURL: YOUTUBE_ICON_URL })
            .setTitle(`New video from ${video.snippet.channelTitle}`)
            .setDescription(`**Title:** ${video.snippet.title}\n**Description:** ${video.snippet.description}\n**Published at:** ${new Date(video.snippet.publishedAt).toLocaleString()}`)
            .setURL(`https://www.youtube.com/watch?v=${video.id.videoId}`)
            .setThumbnail(video.snippet.thumbnails.default.url);
        return { embeds: [embed] };
    }
}

// Function to check Twitch streams
async function checkTwitch(channelName) {
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
        params: {
            user_login: channelName,
        }
    });

    const stream = response.data.data[0];
    if (stream) {
        const thumbnailUrl = stream.thumbnail_url.replace('{width}', '320').replace('{height}', '180');
        const embed = new EmbedBuilder()
            .setColor(0x9146ff) // Twitch Purple
            .setAuthor({ name: 'Twitch', iconURL: TWITCH_ICON_URL })
            .setTitle(`Live now on Twitch!`)
            .setDescription(`${channelName} **went live**\n**Title:** ${stream.title}\n**Game:** ${stream.game_name}\n**Started at:** ${new Date(stream.started_at).toLocaleString()}\n[Watch Now](https://www.twitch.tv/${channelName})`)
            .setURL(`https://www.twitch.tv/${channelName}`)
            .setThumbnail(thumbnailUrl);
        return { embeds: [embed] };
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('checknow')
        .setDescription('Instantly check and post streams and new YouTube videos'),
    async execute(interaction) {
        await interaction.deferReply();

        const channel = interaction.channel;

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
            await interaction.editReply('Checked and posted new YouTube videos and Twitch streams.');
        } catch (error) {
            console.error('Error during instant check:', error.message);
            await interaction.editReply(`There was an error while checking for new content: ${error.message}`);
        }
        setTimeout(() => interaction.deleteReply(), 5000);
    },
};
