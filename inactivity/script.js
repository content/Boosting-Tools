import TwilioClient from './classes/TwilioClient.js';
import DiscordClient from './classes/Discord.js';
import SteamCSClient from './classes/SteamCSClient.js';

import Config from './classes/Config.js';

Config.validate();

process.on('unhandledRejection', (reason, promise) => {
    console.error('[ERROR] Unhandled Rejection at:', promise, 'reason:', reason);
});

new TwilioClient(Config.TWILIO.ACCOUNT_SID, Config.TWILIO.AUTH_TOKEN, Config.TWILIO.TWILIO_NUMBER);

if (Config.DISCORD.TOKEN && Config.DISCORD.CLIENT_ID) {
    await DiscordClient.create(Config.DISCORD.TOKEN, Config.DISCORD.CLIENT_ID, Config.TWILIO.TARGET_PHONE_NUMBER);
}

await SteamCSClient.create(Config.STEAM.STEAM_USERNAME, Config.STEAM.STEAM_PASSWORD);