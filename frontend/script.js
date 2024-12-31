document.getElementById('botForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const youtubeChannelId = document.getElementById('youtubeChannelId').value;
    const twitchChannelName = document.getElementById('twitchChannelName').value;

    try {
        const response = await fetch('/start-bot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ youtubeChannelId, twitchChannelName }),
        });

        if (response.ok) {
            alert('Bot started successfully!');
        } else {
            alert('Failed to start the bot.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while starting the bot.');
    }
});
