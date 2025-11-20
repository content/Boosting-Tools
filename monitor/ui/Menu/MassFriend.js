import blessed from 'blessed';

import MainMenu from './Main.js';

const MassFriendMenu = {
    previous: MainMenu,
    elements: [
        {
            type: blessed.box,
            label: "Mass Friend Module Description:",
            content: " This module allows you to send friend requests to a specific Steam profile from all loaded bot accounts. ",
        },
        {
            type: blessed.textbox,
            label: ' Which Steam profile would you like to send friend requests to? ',
            keys: true,
            mouse: true,
            inputOnFocus: true,
            focused: true
        }
    ]
}

export default MassFriendMenu;