import TwilioClient from '../classes/TwilioClient.js';
import SteamCSClient from '../classes/SteamCSClient.js';
import Config from '../classes/Config.js';

let previousData = {
    updated_at: null,
    xp: null,
};

let isRunning = false;
let skippedIntervalInARow = 0;
let errorsInARow = 0;

async function checkCallInactivity() {
    const twilioClient = TwilioClient.client;

    if (twilioClient && twilioClient.hasCalled) return;

    const tooManyErrors = errorsInARow >= Config.INTERVAL.MAX_ALLOWED_ERRORS_CONSECUTIVE;
    const tooManySkips = skippedIntervalInARow >= Config.INTERVAL.MAX_ALLOWED_SKIPPED_INTERVALS_CONSECUTIVE;

    if (tooManyErrors || tooManySkips) {
        console.log('[INFO] Max allowed errors or skipped intervals reached. Calling phone number due to potential inactivity.');
        return await twilioClient.call(phoneNumber, '[INFO] Called due to potential inactivity (max errors/skips reached).');
    }
}

export default async function mainInterval() {
    if (isRunning) {
        console.log('[WARN] Previous interval is still running. Skipping this interval.');
        skippedIntervalInARow += 1;

        await checkCallInactivity();
        return;
    }

    isRunning = true;

    const phoneNumber = Config.TWILIO.TARGET_PHONE_NUMBER;

    try {
        const twilioClient = TwilioClient.client;
        const steamCSClient = SteamCSClient.client;

        if(!twilioClient || !steamCSClient) {
            throw new Error('Clients have not been initialized yet.');
        }

        const profile = await steamCSClient.getPlayerProfile(steamCSClient.targetSteamId);
        const overallXP = profile.player_level * 5000 + (profile.player_cur_xp - 327680000);

        const hasUpdated = previousData.updated_at !== null && previousData.xp !== null;
        const isXPChanged = overallXP !== previousData.xp;
        
        if (hasUpdated) {
            const lastUpdate = previousData.updated_at;
            const now = new Date();
            const diffMinutes = (now - lastUpdate) / (60 * 1000);

            const isInactive = diffMinutes >= Config.INTERVAL.INACTIVE_THRESHOLD_MINUTES;
            if (!twilioClient.hasCalled && isInactive) {
                console.log(`[INFO] Player has been inactive for ${Math.floor(diffMinutes)} minutes.`);
                return await twilioClient.call(phoneNumber, '[INFO] Called due to potential inactivity (inactive threshold reached).');
            }
        }

        if (isXPChanged) {
            const now = new Date();

            console.log(`[INFO] Detected XP change. (${previousData.xp} -> ${overallXP}) [${now.toISOString().replace(/T/, ' ').replace(/\..+/, '')}]`);

            previousData.updated_at = now;
            previousData.xp = overallXP;

            if (!twilioClient.hasCalled && profile.player_level === 40) {
                console.log('[INFO] Player has reached max level 40. Calling phone number.');
                return await twilioClient.call(phoneNumber, '[INFO] Account has reached max level (40).');
            }

            twilioClient.hasCalled = false;
        }

        skippedIntervalInARow = 0;
        errorsInARow = 0;
    } catch (error) {
        console.error('[ERROR] An error occurred during the interval:', error);
        errorsInARow += 1;

        await checkCallInactivity();
    } finally {
        isRunning = false;
    }
}