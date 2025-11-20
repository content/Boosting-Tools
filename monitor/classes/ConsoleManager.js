import blessed from 'blessed';
import ConsoleBuilder from './ConsoleBuilder.js';

import title from '../ui/title.js';

export default class ConsoleManager {
    static instance = null;
    currentMenu = null;

    constructor() {
        this.screen = blessed.screen({
            smartCSR: true,
            title: "Boosting Tools - Bots"
        });

        this.screen.key(['escape', 'C-c'], function(ch, key) {
            if(this.screen.children.filter(c => c.focused).length > 0) {
                return;
            }

            if(this.currentMenu && this.currentMenu.previous) {
                this.showMenu(this.currentMenu.previous);
                return;
            }

            return process.exit(0);
        });

        this.title = title[0](title[1]);
        this.screen.append(this.title);

        this.screen.render();
    }

    updateTitle() {
        import('../ui/title.js?' + Date.now()).then(module => {
            const [method, settings] = module.default;
            
            this.title.setContent(settings.content);
            this.screen.render();
        });
    }

    static getInstance() {
        if(!ConsoleManager.instance) {
            ConsoleManager.instance = new ConsoleManager();
        }

        return ConsoleManager.instance;
    }

    append(method, options) {
        const element = method(options);
        
        this.screen.append(element);
        this.screen.render();

        return element;
    }

    clear() {
        this.screen.children.slice().forEach(child => {
            if(child !== this.title) {
                child.detach();
            }
        });
    }

    

    showMenu(menu) {
        if(menu.length == 0) return;

        this.updateTitle();
        this.clear();

        const consoleBuilder = new ConsoleBuilder(menu.elements);
        const boxes = consoleBuilder.build();
        
        boxes.forEach(box => {
            this.screen.append(box);
        });

        this.screen.render();
        this.currentMenu = menu;

        return boxes;
    }
}