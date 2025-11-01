import config from './config.js';

import Utils from './classes/Utils.js';
import SteamUser from 'steam-user';

const accounts = Utils.loadAccounts();
if(accounts.length === 0) {
    console.log("[WARN] No accounts found in accounts.txt. Please add accounts in the format 'accountname:password'.");
    process.exit(0);
}

const clients = [];

for(const accountId in accounts) {
    const account = accounts[accountId];
    const client = new SteamUser();

    client.logOn({
        accountName: account.username,
        password: account.password,
    });

    client.on('loggedOn', (result) => {
        console.log(`[INFO] Logged in as ${account.username}`);
        clients.push(client);
        
        if(!config.rename.name) return;
        const newName = config.rename.name.replace("%INDEX%", +accountId + 1);

        client.setPersona(SteamUser.EPersonaState.Offline, newName);
        console.log(`[INFO] Changed display name to ${newName} for account ${account.username}`);
    });
}