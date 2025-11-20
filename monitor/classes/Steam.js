import steamUser from 'steam-user';

export default class Steam {
    static clients = [];
    friendRequests = {};

    constructor(accountName, password) {
        if(!accountName || !password) {
            throw new Error("Account name and password are required to create a SteamClient.");
        }

        this.accountName = accountName;
        this.password = password;
        
        this.loggedIn = false;
        this.client = new steamUser();

        this.client.logOn({
            accountName: this.accountName,
            password: this.password
        });

        this.client.on('loggedOn', () => {
            this.loggedIn = true;
        });

        Steam.clients.push(this.client);
    }

    static getClients() {
        return [...Steam.clients];
    }

    async addFriend(steamId) {
        return new Promise((resolve, reject) => {
            this.client.addFriend(steamId, (err) => {
                if(err) {
                    return reject(err);
                }
                resolve();
            });
        });
    }
}