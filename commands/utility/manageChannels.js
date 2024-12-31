const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const path = require('path');
const channelsPath = path.join(__dirname, '../../channels.json');

module.exports = {
    data: (() => {
        const channels = require(channelsPath);

        // Define the builder
        const builder = new SlashCommandBuilder()
            .setName('managechannels')
            .setDescription('Add or remove YouTube or Twitch channels')
            .addSubcommand(subcommand =>
                subcommand
                    .setName('add')
                    .setDescription('Add a YouTube or Twitch channel')
                    .addStringOption(option =>
                        option.setName('platform')
                            .setDescription('The platform of the channel')
                            .setRequired(true)
                            .addChoices(
                                { name: 'YouTube', value: 'youtube' },
                                { name: 'Twitch', value: 'twitch' }
                            ))
                    .addStringOption(option =>
                        option.setName('id')
                            .setDescription('The ID of the YouTube channel or the name of the Twitch channel')
                            .setRequired(true))
                    .addStringOption(option =>
                        option.setName('name')
                            .setDescription('The name of the channel')
                            .setRequired(true)))
            .addSubcommand(subcommand =>
                subcommand
                    .setName('remove')
                    .setDescription('Remove a YouTube or Twitch channel')
                    .addStringOption(option =>
                        option.setName('platform')
                            .setDescription('The platform of the channel')
                            .setRequired(true)
                            .addChoices(
                                { name: 'YouTube', value: 'youtube' },
                                { name: 'Twitch', value: 'twitch' }
                            ))
                    .addStringOption(option => {
                        const youtubeChoices = channels.youtubeChannels.map(channel => ({
                            name: `${channel.name} (YouTube)`,
                            value: channel.id,
                        }));
                        const twitchChoices = channels.twitchChannels.map(channel => ({
                            name: `${channel.name} (Twitch)`,
                            value: channel.name,
                        }));

                        youtubeChoices.forEach(choice => option.addChoices(choice));
                        twitchChoices.forEach(choice => option.addChoices(choice));

                        return option
                            .setName('id')
                            .setDescription('The ID of the YouTube channel or the name of the Twitch channel')
                            .setRequired(true);
                    }));

        return builder;
    })(),
    async execute(interaction) {
        const platform = interaction.options.getString('platform');
        const id = interaction.options.getString('id');
        const name = interaction.options.getString('name');
        const subcommand = interaction.options.getSubcommand();

        let channels = JSON.parse(fs.readFileSync(channelsPath, 'utf8'));

        if (subcommand === 'add') {
            if (platform === 'youtube') {
                channels.youtubeChannels.push({ id, name });
            } else if (platform === 'twitch') {
                channels.twitchChannels.push({ name });
            }
            fs.writeFileSync(channelsPath, JSON.stringify(channels, null, 2));
            await interaction.reply(`Added ${platform} channel: ${name}`);
        } else if (subcommand === 'remove') {
            if (platform === 'youtube') {
                channels.youtubeChannels = channels.youtubeChannels.filter(channel => channel.id !== id);
            } else if (platform === 'twitch') {
                channels.twitchChannels = channels.twitchChannels.filter(channel => channel.name !== id);
            }
            fs.writeFileSync(channelsPath, JSON.stringify(channels, null, 2));
            await interaction.reply(`Removed ${platform} channel with ID: ${id}`);
        }

        // Delete the interaction reply after 5 seconds
        setTimeout(() => interaction.deleteReply(), 5000);
    },
};
