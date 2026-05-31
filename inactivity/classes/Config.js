import dotenv from 'dotenv';
dotenv.config();

const env = process.env;

export default class Config {
    static STEAM = {
        STEAM_USERNAME: env.STEAM_USERNAME,
        STEAM_PASSWORD: env.STEAM_PASSWORD,
        TARGET_STEAMID: env.TARGET_STEAMID
    };

    static TWILIO = {
        ACCOUNT_SID: env.TWILIO_ACCOUNT_SID,
        AUTH_TOKEN: env.TWILIO_AUTH_TOKEN,
        TWILIO_NUMBER: env.TWILIO_NUMBER,
        TARGET_PHONE_NUMBER: env.TARGET_PHONE_NUMBER,
    };

    static DISCORD = {
        TOKEN: env.DISCORD_TOKEN,
        CLIENT_ID: env.DISCORD_CLIENT_ID,
    };
    
    static INTERVAL = {
        SECONDS: env.INTERVAL_SECONDS || 30,
        INACTIVE_THRESHOLD_MINUTES: env.INACTIVE_TRESHOLD_MINUTES || 30,
        MAX_ALLOWED_SKIPPED_INTERVALS_CONSECUTIVE: env.MAX_ALLOWED_SKIPPED_INTERVALS_CONSECUTIVE || 10,
        MAX_ALLOWED_ERRORS_CONSECUTIVE: env.MAX_ALLOWED_ERRORS_CONSECUTIVE || 5,
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