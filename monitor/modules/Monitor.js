import Module from "../classes/Module.js";

export default class Monitor extends Module {
    constructor() {
        super();

        this.init();
        this.run();
    }
    
    metadata() {
        return {
            name: "Monitor",
            description: "Monitors the statuses of all loaded bot accounts and a targeted Steam profile."
        }
    }

    init() {
        
    }

    run() {
        
    }
}