import config from './config.js';

import Utils from './classes/Utils.js';
import SteamUser from 'steam-user';

if(!config.friends.target) {
    throw new Error("The 'target' field in config.js is required. Please set it to the SteamID64 of the user you want to add as a friend.");
}

const accounts = Utils.loadAccounts();
if(accounts.length === 0) {
    console.log("[WARN] No accounts found in accounts.txt. Please add accounts in the format 'accountname:password'.");
    process.exit(0);
}

const clients = [];

for(const account of accounts) {
    const client = new SteamUser();

    client.logOn({
        accountName: account.username,
        password: account.password,
    });

    client.on('loggedOn', (result) => {
        console.log(`[INFO] Logged in as ${account.username}`);
        clients.push(client);

        if(!config.target) return;
        client.addFriend(config.target);
    });

    client.on('friendRelationship', (steamId, relationship) => {
        if (relationship !== SteamUser.EFriendRelationship.RequestInitiator) return;
        
        console.log(`[INFO] Added ${steamId.getSteamID64()} as a friend. (Account: ${account.username})`);
    });
}