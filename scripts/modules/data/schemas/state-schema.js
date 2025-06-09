import { QuestType, QuestStatus } from '../../quests/index.js';
import { ItemType, ItemRarity } from '../../loot.js';
import { LocationType } from '../../locations/constants/location-constants.js';
import { PlayerClass } from '../../players/index.js';
import { GuildActivityType, GuildResourceType } from '../../guild/index.js';

export const STATE_SCHEMA = {
    quests: {
        type: 'array',
        items: {
            type: 'object',
            required: ['id', 'title', 'description', 'type', 'status'],
            properties: {
                id: { type: 'string' },
                title: { type: 'string' },
                description: { type: 'string' },
                type: { enum: Object.values(QuestType) },
                status: { enum: Object.values(QuestStatus) },
                journalEntries: { type: 'array' },
                relatedItems: { type: 'array' },
                relatedLocations: { type: 'array' },
                relatedCharacters: { type: 'array' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
            }
        }
    },
    // Other schema definitions remain the same as in the original file
    // ...
};

export const INITIAL_STATE = {
    quests: [],
    notes: [],
    loot: [],
    locations: [],
    players: [],
    guildLogs: {
        activities: [],
        resources: []
    }
};
