import TwilioClient from './classes/TwilioClient.js';
import DiscordClient from './classes/Discord.js';
import SteamCSClient from './classes/SteamCSClient.js';

import config from './config.json' with { type: "json" };

const STEAM_USERNAME = config.account_name;
const STEAM_PASSWORD = config.password;
const TARGET_STEAMID = config.target_steamid;

const INTERVAL_SECONDS = config.interval_seconds || 30;
const INACTIVE_TRESHOLD_MINUTES = config.inactive_treshold_minutes ?? 30;

const MAX_ALLOWED_SKIPPED_INTERVALS_IN_A_ROW = config.max_allowed_skipped_intervals_in_a_row || 10;
const MAX_ALLOWED_ERRORS_IN_A_ROW = config.max_allowed_errors_in_a_row || 5;

const TWILIO_ACCOUNT_SID = config.twilio.account_sid || '';
const TWILIO_AUTH_TOKEN = config.twilio.auth_token || '';
const TWILIO_NUMBER = config.twilio.twilio_number || '';
const PHONE_NUMBER = config.twilio.phone_number || '';

const DISCORD_TOKEN = config.discord?.token || '';
const DISCORD_CLIENT_ID = config.discord?.client_id || '';

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_NUMBER || !PHONE_NUMBER) {
    console.error('[ERROR] Twilio configuration is incomplete. Please check your config.json file.');
    process.exit(1);
}

if(!STEAM_USERNAME || !STEAM_PASSWORD || !TARGET_STEAMID) {
    console.error('[ERROR] Steam configuration is incomplete. Please check your config.json file.');
    process.exit(1);
}

process.on('unhandledRejection', (reason, promise) => {
    console.error('[ERROR] Unhandled Rejection at:', promise, 'reason:', reason);
});

new TwilioClient(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_NUMBER);

if (DISCORD_TOKEN && DISCORD_CLIENT_ID) {
    await DiscordClient.create(DISCORD_TOKEN, DISCORD_CLIENT_ID, PHONE_NUMBER);
}

await SteamCSClient.create(STEAM_USERNAME, STEAM_PASSWORD);