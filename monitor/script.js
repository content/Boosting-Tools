import blessed from "blessed";

import Utils from './classes/Utils.js';
import Steam from "./classes/Steam.js";
import ConsoleManager from "./classes/ConsoleManager.js";


import MainMenu from './ui/Menu/Main.js';

const config = Utils.loadJson('./config.json');
const accounts = Utils.loadAccounts('./accounts.txt');

accounts.forEach(account => {
    new Steam(account.username, account.password);
});

const consoleManager = ConsoleManager.getInstance();
consoleManager.showMenu(MainMenu);