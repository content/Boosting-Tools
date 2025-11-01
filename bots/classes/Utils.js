import fs from 'fs';

export default class Utils {
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
}