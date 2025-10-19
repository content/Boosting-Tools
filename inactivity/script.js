

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
    updated_at: null,
    xp: null
};

let isRunning = false; 
let hasCalled = false;

async function interval() {
    if (isRunning) {
        console.log('[WARN] Previous interval is still running. Skipping this interval.');
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

                const call = await twilioClient.calls.create({
                    url: "http://demo.twilio.com/docs/voice.xml",
                    to: PHONE_NUMBER,
                    from: TWILIO_NUMBER,
                });

                if(call) {
                    console.log(`[INFO] Twilio call initiated due to inactivity.(Call SID: ${call.sid})`);
                    hasCalled = true;
                }
            }

        }

        if(overallXp !== previousData.xp) {
            const now = new Date();
            console.log(`[INFO] Detected XP change. (${previousData.xp} -> ${overallXp}) [${now.toISOString().replace(/T/, ' ').replace(/\..+/, '')}]`);
            
            previousData.updated_at = now;
            previousData.xp = overallXp;
            hasCalled = false;
            
        }
    } catch (error) {
        console.error('[ERROR] An error occurred during the interval:', error);
    } finally {
        isRunning = false;
    }
}