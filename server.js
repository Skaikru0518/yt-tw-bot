const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('frontend'));

app.post('/start-bot', (req, res) => {
    const { youtubeChannelId, twitchChannelName } = req.body;

    console.log('Received YouTube Channel ID:', youtubeChannelId);
    console.log('Received Twitch Channel Name:', twitchChannelName);

    // Start the bot with the provided channel IDs
    const command = `node bot.js ${youtubeChannelId} ${twitchChannelName}`;
    console.log('Executing command:', command);

    const botProcess = exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return res.status(500).send('Failed to start the bot.');
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
            return res.status(500).send('Failed to start the bot.');
        }
        console.log(`Stdout: ${stdout}`);
        res.send('Bot started successfully!');
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
