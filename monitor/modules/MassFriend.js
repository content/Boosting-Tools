import ConsoleManager from "../classes/ConsoleManager.js";
import Module from "../classes/Module.js";
import Steam from "../classes/Steam.js";

import MassFriendMenu from "../ui/Menu/MassFriend.js";

import description from "../ui/MassFriend/description.js";
import question from "../ui/MassFriend/question.js";

export default class MassFriend extends Module {
    steamId = null;

    constructor() {
        super();
    }

    metadata() {
        return {
            name: "MassFriend",
            description: "Sends a friend request from all loaded bot accounts to a single Steam profile."
        }
    }

    async init() {
        return new Promise(resolve => {
            const consoleManager = ConsoleManager.getInstance();
            const elements = consoleManager.showMenu(MassFriendMenu);

            const questionBox = elements[1];
            questionBox.focus();

            questionBox.on('submit', (value) => {
                const targetSteamId = value.trim();
                this.steamId = targetSteamId;
                consoleManager.scene([]);
                resolve();
            });
        });
    }

    async run() {
        if(!this.steamId) throw new Error("Target Steam ID is not set.");

        const consoleManager = ConsoleManager.getInstance();
        consoleManager.scene([
            description
        ])

        const clients = Steam.getClients();
        for(const client of clients) {
            if(!client.loggedIn) continue;

            try {
                const result = await client.addFriend(this.steamId);

                consoleManager.append()
            } catch (err) {
                // Ignore errors
            }
        }
    }
}