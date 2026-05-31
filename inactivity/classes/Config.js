import config from '../config.json' with { type: "json" };

export default class Config {
    static STEAM = {
        STEAM_USERNAME: config.account_name,
        STEAM_PASSWORD: config.password,
        TARGET_STEAMID: config.target_steamid
    };

    static TWILIO = {
        ACCOUNT_SID: config.twilio.account_sid,
        AUTH_TOKEN: config.twilio.auth_token,
        TWILIO_NUMBER: config.twilio.twilio_number,
        TARGET_PHONE_NUMBER: config.twilio.phone_number,
    };

    static DISCORD = {
        TOKEN: config.discord.token,
        CLIENT_ID: config.discord.client_id,
    };
    
    static INTERVAL = {
        SECONDS: config.interval_seconds || 30,
        INACTIVE_THRESHOLD_MINUTES: config.inactive_treshold_minutes || 30,
        MAX_ALLOWED_SKIPPED_INTERVALS_CONSECUTIVE: config.max_allowed_skipped_intervals_in_a_row || 10,
        MAX_ALLOWED_ERRORS_CONSECUTIVE: config.max_allowed_errors_in_a_row || 5,
    }

    static validate() {
        const { STEAM, TWILIO, DISCORD } = Config;

        if (!TWILIO.ACCOUNT_SID || !TWILIO.AUTH_TOKEN || !TWILIO.TWILIO_NUMBER || !TWILIO.TARGET_PHONE_NUMBER) {
            throw new Error('Twilio configuration is incomplete. Please check your config.json file.');
        }

        if (!STEAM.STEAM_USERNAME || !STEAM.STEAM_PASSWORD || !STEAM.TARGET_STEAMID) {
            throw new Error('Steam configuration is incomplete. Please check your config.json file.');
        }

        if (!DISCORD.TOKEN || !DISCORD.CLIENT_ID) {
            throw new Error('Discord configuration is incomplete. Please check your config.json file.');
        }
    }
}