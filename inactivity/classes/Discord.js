import { REST, Routes } from 'discord.js';
import { Client, Events, GatewayIntentBits } from 'discord.js';

import TwilioClient from './Twilio.js';

const commands = [
    {
        "name": "call",
        "description": "Manually trigger a call."
    }
]

export default class DiscordClient {
    constructor(token, clientId, phoneNumber) {
        this.token = token;
        this.clientId = clientId;
        this.phoneNumber = phoneNumber;
    
        this.client = new Client({ intents: [GatewayIntentBits.Guilds] });

        this.client.on(Events.ClientReady, readyClient => {
            console.log(`[INFO] Logged in as ${readyClient.user.tag}!`);
        });

        this.client.on(Events.InteractionCreate, async interaction => {
            if (!interaction.isChatInputCommand()) return;

            if (interaction.commandName === 'call') {
                if(!this.phoneNumber) {
                    await interaction.reply('Phone number not configured.');
                    return;
                }
                
                await TwilioClient.client.call(this.phoneNumber, '[INFO] Manually triggered call.', false);
                await interaction.reply('Call has been triggered successfully.');
            }
        });

        this.client.login(this.token).catch(error => {
            console.error('[ERROR] Failed to login to Discord:', error);
            throw error;
        });
    }

    static async create(token, clientId, phoneNumber) {
        const rest = new REST({ version: '10' }).setToken(token);
        
        try {
            console.log('[INFO] Started refreshing application (/) commands.');
            await rest.put(Routes.applicationCommands(clientId), { body: commands });
            console.log("[INFO] Successfully reloaded application (/) commands.");
        } catch (error) {
            console.error("[ERROR] Failed to register Discord slash commands:", error);
            throw error;
        }
    
        const client = new DiscordClient(token, clientId, phoneNumber);
        return client;
    }
}