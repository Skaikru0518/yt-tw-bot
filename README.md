# Discord Bot: YouTube and Twitch Notifications

A Discord bot that notifies a specific channel about:
- New YouTube videos from specified channels.
- Live streams on Twitch from specified channels.

The bot uses the YouTube Data API and Twitch API to fetch content and posts updates in Discord with embeds for rich formatting.

---

## Features
- 🟥 Fetches new YouTube videos and sends a notification to a Discord channel.
- 🟪 Detects when Twitch channels go live and sends a notification.
- ✅ Caches notifications to prevent duplicate messages.
- 🔧 Command-based management for adding/removing channels.
- 🎨 Richly formatted Discord embeds with icons, thumbnails, and links.

---

## Setup and Installation

### Prerequisites
1. [Node.js](https://nodejs.org/) (v16 or higher).
2. A [Discord Bot Token](https://discord.com/developers/applications).
3. API keys:
   - **YouTube API Key**: Get one from the [Google Cloud Console](https://console.cloud.google.com/).
   - **Twitch API Credentials**:
     - `client_id` and `client_secret` from the [Twitch Developer Portal](https://dev.twitch.tv/console).

---

### Installation
1. Clone the repository and install:
   ```bash
   npm install
2. generate a .env file in the root dir:
   ```bash
    DISCORD_BOT_TOKEN=your_discord_bot_token
    YOUTUBE_API_KEY=your_youtube_api_key
    TWITCH_CLIENT_ID=your_twitch_client_id
    TWITCH_CLIENT_SECRET=your_twitch_client_secret
3. Generate a channels.json file:
    ```json
    {
    "youtubeChannels": [
        { "id": "UC_x5XG1OV2P6uZZ5FSM9Ttw" },
        { "id": "UCabcd1234efgh5678ijkl" }
      ],
    "twitchChannels": [
        { "name": "twitch_channel_1" },
        { "name": "twitch_channel_2" }
      ],
    }    

4. Generate a config.json file:
      ```json
      {
          "clientId": "",
          "guildId": "",
          "token": ""
      }

5. Run with
      ```bash
      node bot.js


### Commands
- `/checknow`
  - Instantly checks for new YouTube videos or Twitch streams and posts updates.
- `/managechannels add`
  - Add a new YouTube or Twitch channel for tracking.
- `/managechannels remove`
  - Remove an existing YouTube or Twitch channel from tracking.
 


---

### Project Structure
      ├── bot.js              # Main bot logic
      ├── commands/           # Slash command files
      │   ├── checknow.js     # Check YouTube/Twitch manually
      │   ├── managechannels/ # Commands for managing channels
      ├── channels.json       # List of YouTube and Twitch channels to track
      ├── config.json         # Discord server and channel config
      ├── .env                # Environment variables
      ├── package.json        # Node.js dependencies and scripts


## Acknowledgements
- Discord.js for the Discord bot framework.
- YouTube Data API for fetching video data.
- Twitch API for live stream detection.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

