export default class Module {
    constructor() {
        if(this.constructor === Module) {
            throw new Error("Abstract classes can't be instantiated.");
        }
    }

    metadata() {
        throw new Error("Method 'metadata()' must be implemented.");
    }

    async init() {
        throw new Error("Method 'init()' must be implemented.");
    }

    async run() {
        throw new Error("Method 'run()' must be implemented.");
    }

    async start() {
        await this.init();
        await this.run();
    }

}