import SteamUser from 'steam-user';
import GlobalOffensive from 'globaloffensive';
import SteamID from 'steamid';

import mainInterval from '../intervals/main.js';
import IntervalManager from './IntervalManager.js';
import Config from './Config.js';

export default class SteamCSClient {
    static client = null;
    
    constructor(accountName, password) {
        this.accountName = accountName;
        this.password = password;

        this.client = new SteamUser();
        this.csgo = new GlobalOffensive(this.client);

        this.profileQueries = {};
        this.mainIntervalStarted = false;

        this.csgo.on('playersProfile', (data) => {
            const steamId = `[U:1:${data.account_id}]`;
            const callback = this.profileQueries[steamId];

            if (callback) {
                callback(data);
                delete this.profileQueries[steamId];
            }
        });

        SteamCSClient.client = this;
    }

    static async create(accountName, password) {
        const instance = new SteamCSClient(accountName, password);
        
        await instance.initialize();
        return instance;
    }

    async initialize() {
        return new Promise((resolve, reject) => {
            this.client.logOn({
                accountName: this.accountName,
                password: this.password,
            });

            this.client.on('loggedOn', () => {
                console.log('[INFO] Logged into Steam as', this.client.steamID.getSteam3RenderedID());
                this.client.gamesPlayed([730]);
                resolve();
            });

            this.client.on('disconnected', (eresult, msg) => {
                console.log(`[WARN] Disconnected from Steam: ${eresult} - ${msg}`);
            });

            this.client.on('error', (error) => {
                reject(error);
            });

            this.csgo.on('connectedToGC', () => {
                console.log(`[INFO] Connected to CS:GO Game Coordinator. Starting inactivity monitoring for ${this.targetSteamId}.`);
                IntervalManager.add(mainInterval, Config.INTERVAL.CHECK_INTERVAL_SECONDS * 1000);
            });
        });
    }

    async getPlayerProfile(steamId, timeoutMs = 15000) {
        if (!this.csgo.haveGCSession) throw new Error('Not connected to GC');

        const steamId32 = new SteamID(steamId).getSteam3RenderedID();

        return new Promise((resolve, reject) => {
            this.profileQueries[steamId32] = resolve;

            try {
                this.csgo.requestPlayersProfile(steamId);
            } catch (error) {
                delete this.profileQueries[steamId32];
                return reject(error);
            }

            const timer = setTimeout(() => {
                if (this.profileQueries[steamId32]) {
                    delete this.profileQueries[steamId32];
                    reject(new Error(`GC request for ${steamId} timed out after ${timeoutMs}ms`));
                }
            }, timeoutMs);

            const originalResolve = this.profileQueries[steamId32];
            this.profileQueries[steamId32] = (data) => {
                clearTimeout(timer);
                originalResolve(data);
            };
        });
    }
}