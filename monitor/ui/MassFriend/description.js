import blessed from 'blessed';

const method = blessed.box;
const options = {
    top: 0,
    left: 0,
    width: '100%',
    height: 3,
    label: " Mass Friend Module Description:",
    content: ' This module allows you to send friend requests to a specific Steam profile from all loaded bot accounts.',
    tags: true,
    border: {
        type: 'line'
    },
    style: {
        fg: 'white',
        border: {
            fg: 'cyan'
        }
    }
}

export default [method, options];