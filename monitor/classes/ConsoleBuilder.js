import blessed from 'blessed';

import title from '../ui/title.js';
import { on } from 'events';

const defaultOptions = {
    top: 0,
    left: 0,
    width: '100%',
    border: {
        type: 'line'
    },
    tags: true,
}

const defaultBoxOptions = {
    ...defaultOptions,
    style: {
        fg: 'white',
        border: {
            fg: 'cyan'
        }
    }
}

const defaultTextBoxOptions = {
    ...defaultOptions,
    keys: true,
    mouse: true,
    inputOnFocus: true,
    style: {
        fg: 'white',
        border: {
            fg: 'dimgray'
        }
    },
    focused: true
};

const defaultListOptions = {
    ...defaultOptions,
    keys: true,
    mouse: true,
    vi: true,
    style: {
        selected: {
            bg: 'cyan',
            fg: 'white',
            bold: true
        },
        item: {
            fg: 'white'
        }
    },
    focused: true
}


export default class ConsoleBuilder {
    constructor(menu) {
        this.menu = menu;
    }

    buildNode(rawNode) {
        const {type, onSelect, ...userOptions} = rawNode;
        let options = {};

        switch(type) {
            case blessed.box:
                options = {...defaultBoxOptions, ...userOptions};
                break;
            case blessed.textbox:
                options = {...defaultTextBoxOptions, ...userOptions};
                break;
            case blessed.list:
                options = {...defaultListOptions, ...userOptions};
                break;
        }

        if(!options.height) {
            const contentLines = options.content?.split('\n').length || 0;
            const itemCount = options.items?.length || 0;
            const calculatedHeight = Math.max(contentLines, itemCount) + 2;
            options.height = calculatedHeight;
        }

        const node = type(options);

        console.log(onSelect);
        console.log(options );

        if(onSelect) {
            node.on('select', onSelect);
        }

        return node;
    }

    build() {
        let currentTop = title[1].height || 0;

        const boxes = this.menu.map(rawNode => {
            const node = this.buildNode(rawNode);

            node.top = currentTop;
            currentTop += (node.height || 1);

            return node;
        });

        return boxes;
    }
}