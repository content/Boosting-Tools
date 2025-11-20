import blessed from 'blessed';

import Steam from '../classes/Steam.js';

const clients = Steam.getClients();

const method = blessed.box;
const settings = {
    top: 0,
    width: '100%',
    align: 'center',
    height: 8,
    tags: false,
    content: `     ____                   __  _                ______            __    
    / __ )____  ____  _____/ /_(_)___  ____ _   /_  __/___  ____  / /____
    / __  / __ \\/ __ \\/ ___/ __/ / __ \\/ __ \`/    / / / __ \\/ __ \\/ / ___/
    / /_/ / /_/ / /_/ (__  ) /_/ / / / / /_/ /    / / / /_/ / /_/ / (__  ) 
    /_____/\\____/\\____/____/\\__/_/_/ /_/\\__, /    /_/  \\____/\\____/_/____/  
                /____/        

    Loaded Steam Clients: ${clients.length}
    `
}

export default [method, settings];