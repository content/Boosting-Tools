import blessed from 'blessed';

import Utils from '../classes/Utils.js';

const modulesDir = './modules';
const moduleImports = await Utils.getModules(modulesDir);

const modules = moduleImports.map(mod => {
    const ModuleClass = mod.default;
    const instance = new ModuleClass();
    return instance.metadata();
});

const method = blessed.list;
const options = {
    top: 0,
    left: 0,
    width: '100%',
    height: modules.length + 5,
    keys: true,
    mouse: true,
    vi: true,
    items: modules.map(mod => `${mod.name} - ${mod.description}`),
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
    border: {
        type: 'line'
    },
    label: ' Select a Module (↑/↓ to navigate, Enter to select) ',
    tags: true,
    focused: true,
    
    onSelect: function(item, index) {
        const selectedModule = moduleImports[index];
        const ModuleClass = selectedModule.default;
        const instance = new ModuleClass();
        instance.start();
    }
}

export { modules, moduleImports };
export default [method, options];