import blessed from 'blessed';

const method = blessed.textbox;
const options = {
    top: 0,
    left: 0,
    width: '100%',
    height: 3,
    label: ' Which Steam profile would you like to send friend requests to? ',
    tags: true,
    keys: true,
    mouse: true,
    inputOnFocus: true,
    border: {
        type: 'line'
    },
    style: {
        fg: 'white',
        border: {
            fg: 'dimgray'
        }
    },
    focused: true
}

export default [method, options];