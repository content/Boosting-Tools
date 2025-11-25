

import SteamUser from 'steam-user';
import GlobalOffensive from 'globaloffensive';
import SteamID from 'steamid';
import Twilio from 'twilio';

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

const twilioClient = Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

async function callNumber() {
    if(hasCalled) return null;

    const call = await twilioClient.calls.create({
        url: "http://demo.twilio.com/docs/voice.xml",
        to: PHONE_NUMBER,
        from: TWILIO_NUMBER,
    });

    if(call) {
        console.log(`[INFO] Twilio call initiated due to inactivity.(Call SID: ${call.sid})`);
        hasCalled = true;
    }

    return call;
}

const client = new SteamUser();
const csgo = new GlobalOffensive(client);

const profileQueries = {}

client.logOn({
    accountName: STEAM_USERNAME,
    password: STEAM_PASSWORD,
});

client.on('loggedOn', () => {
  console.log('[INFO] Logged into Steam as', client.steamID.getSteam3RenderedID());
  client.gamesPlayed([730]);
});

csgo.on('connectedToGC', async () => {
    console.log(`[INFO] Connected to CS:GO Game Coordinator. Starting inactivity monitoring for ${TARGET_STEAMID}.`);

    setInterval(interval, INTERVAL_SECONDS * 1000);
});

async function getPlayerProfile(steamId, timeoutMs = 15000) {
    if(!csgo.haveGCSession) throw new Error('Not connected to GC');

    const steamId32 = new SteamID(steamId).getSteam3RenderedID();

    return new Promise((resolve, reject) => {
        profileQueries[steamId32] = resolve;

        try {
            csgo.requestPlayersProfile(steamId);
        } catch (err) {
            delete profileQueries[steamId32];
            return reject(err);
        }

        const timer = setTimeout(() => {
            if (profileQueries[steamId32]) {
                delete profileQueries[steamId32];
                reject(new Error(`GC request for ${steamId} timed out after ${timeoutMs}ms`));
            }
        }, timeoutMs);

        const originalResolve = profileQueries[steamId32];
        profileQueries[steamId32] = (data) => {
            clearTimeout(timer);
            originalResolve(data);
        };
    });
}

csgo.on('playersProfile', (data) => {
    const steamId = `[U:1:${data.account_id}]`;
    const callback = profileQueries[steamId];

    if (callback) {
        callback(data);
        delete profileQueries[steamId];
    }
});

let previousData = {
    lastPhoneCallAt: null,
    updated_at: null,
    xp: null
};

let isRunning = false; 
let totalXPGained = 0;
let hasCalled = false;

let skippedIntervalInARow = 0;
let errorsInARow = 0;

async function checkCallInactivity() {
    if(errorsInARow >= MAX_ALLOWED_ERRORS_IN_A_ROW || skippedIntervalInARow >= MAX_ALLOWED_SKIPPED_INTERVALS_IN_A_ROW) {
        console.log('[INFO] Max allowed errors or skipped intervals reached. Calling phone number due to potential inactivity.');
        await callNumber();
    }
}

async function interval() {
    if (isRunning) {
        console.log('[WARN] Previous interval is still running. Skipping this interval.');
        skippedIntervalInARow += 1;
        
        await checkCallInactivity();
        return;
    }

    isRunning = true;
    
    try {
        const profile = await getPlayerProfile(TARGET_STEAMID);
        const overallXp = profile.player_level * 5000 + (profile.player_cur_xp - 327680000);
        
        
        if(previousData.updated_at !== null && previousData.xp !== null) {
            const lastUpdate = previousData.updated_at;
            const now = new Date();
            const diffMinutes = (now - lastUpdate) / (60 * 1000);
            
            if(!hasCalled && diffMinutes >= INACTIVE_TRESHOLD_MINUTES) {
                console.log(`[INFO] Player has been inactive for ${Math.floor(diffMinutes)} minutes. `);
                await callNumber();
            }
        }
        
        if(overallXp !== previousData.xp) {
            const now = new Date();
            const xpGained = overallXp - (previousData.xp || 0);
            
            console.log(`[INFO] Detected XP change. (${previousData.xp} -> ${overallXp}) [${now.toISOString().replace(/T/, ' ').replace(/\..+/, '')}]`);
            
            if(previousData.xp !== null) {
                totalXPGained += xpGained;
            }
            
            previousData.updated_at = now;
            previousData.xp = overallXp;
            
            if(!hasCalled && profile.player_level == 40) {
                console.log(`[INFO] Player has reached max level 40. Calling phone number.`);
                await callNumber();
                return;
            }
            
            hasCalled = false;
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