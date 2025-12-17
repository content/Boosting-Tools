import config from './config.js';
import Utils from './classes/Utils.js';

import SteamUser from 'steam-user';

const accounts = Utils.loadAccounts();
if(accounts.length === 0) {
    console.log("[WARN] No accounts found in accounts.txt. Please add accounts in the format 'accountname:password'.");
    process.exit(0);
}


const clients = [];

async function getAllBannedAccounts() {
    const accountsData = [];
    for(const index in accounts) {
        const account = accounts[index];
        const client = new SteamUser();

        await new Promise((resolve, reject) => {
            const data = { nickname: null, vacBans: null, appids: [] };

            client.logOn({
                accountName: account.username,
                password: account.password,
            });

            client.on('loggedOn', (result) => {
                console.log(`[INFO] Logged in as ${account.username} (${((parseInt(index) + 1) / accounts.length * 100).toFixed(2)}%)`);
                clients.push(client);
            });

            client.on('vacBans', (numBans, appids) => {
                if(numBans < 1) return resolve();
                
                data.vacBans = numBans;
                data.appids = appids;

                if(data.nickname !== null) {
                    accountsData.push({ username: account.username, data });
                    resolve();
                }
            });

            client.on("accountInfo", (name) => {
                data.nickname = name;
                

                if(data.vacBans !== null) {
                    accountsData.push({ username: account.username, data });
                    resolve();
                }
            });
        });
    }

    return accountsData.filter(acc => acc.data.vacBans !== null && acc.data.vacBans > 0);
}

(async () => {
    const bannedAccounts = await getAllBannedAccounts();
    console.log("")
    if (bannedAccounts.length === 0) {
        console.log("[INFO] No banned accounts found.");
        return;
    }

    console.log(`[INFO] Banned accounts found (${bannedAccounts.length}):`);
    for (const bannedAccount of bannedAccounts) {
        const nickname = bannedAccount.data.nickname || "Unknown";
        const bans = bannedAccount.data.vacBans;
        const apps = bannedAccount.data.appids.join(', ');

        console.log(`- ${bannedAccount.username} (${nickname}): ${bans} VAC bans on apps: ${apps}`);
    }

    console.log("")
    await Utils.sleep(1000);
    process.exit(0);
})();