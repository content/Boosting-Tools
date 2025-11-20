import blessed from 'blessed';
import Utils from '../../classes/Utils.js';

const modulesDir = './modules';
const moduleImports = await Utils.getModules(modulesDir);

const modules = moduleImports.map(mod => {
    const ModuleClass = mod.default;
    const instance = new ModuleClass();
    return instance.metadata();
});

const Menu = {
    previous: null,
    elements: [
        {
            type: blessed.list,
            label: ' Select a Module (↑/↓ to navigate, Enter to select) ',
            items: modules.map(mod => `${mod.name} - ${mod.description}`),
            onSelect: function(item, index) {
                const selectedModule = moduleImports[index];
                const ModuleClass = selectedModule.default;
                const instance = new ModuleClass();
                instance.start();
            }
        }
    ]
}

export default Menu;