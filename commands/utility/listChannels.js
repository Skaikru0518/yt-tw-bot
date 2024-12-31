const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const path = require('path');
const channelsPath = path.join(__dirname, '../../channels.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('listchannels')
        .setDescription('Lists all YouTube and Twitch channels'),
    async execute(interaction) {
        const channels = require(channelsPath);

        let response = '**YouTube Channels:**\n';
        channels.youtubeChannels.forEach(channel => {
            response += `- ${channel.name} (ID: ${channel.id})\n`;
        });

        response += '\n**Twitch Channels:**\n';
        channels.twitchChannels.forEach(channel => {
            response += `- ${channel.name}\n`;
        });

        await interaction.reply(response);
        setTimeout(() => interaction.deleteReply(), 5000);
    },

};