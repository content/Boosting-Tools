import fs from 'fs';

export default class Utils {
    static loadJson(filePath='./config.json') {
        try {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error loading JSON:', error);
            return null;
        }
    }

    static saveJson(filePath='./config.json', jsonData) {
        try {
            const data = JSON.stringify(jsonData, null, 4);
            fs.writeFileSync(filePath, data, 'utf8');
        } catch (error) {
            console.error('Error saving JSON:', error);
        }   
    }

    static loadAccounts(filePath="./accounts.txt") {
        try {
            const data = fs.readFileSync(filePath, 'utf-8');
            const lines = data.split('\n');
            
            return lines.map(line => {
                if(line.startsWith("//") || !line.trim()) return null;

                const [username, password] = line.trim().split(':');
                return { username, password };
            }).filter(Boolean);
        } catch (err) {
            console.error('Error reading accounts file:', err);
            return [];
        }
    }

    static async getModules(modulesDir='./modules') {
        try {
            const moduleFiles = fs.readdirSync(modulesDir).filter(file => file.endsWith('.js'));
            const modules = moduleFiles.map(file => {
                const modulePath = new URL(`../${modulesDir}/${file}`, import.meta.url).href;
                return import(modulePath);
            });
            return Promise.all(modules);
        } catch (error) {
            console.error('Error loading modules:', error);
            return [];
        }
    }
}