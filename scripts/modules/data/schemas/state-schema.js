import { QuestType, QuestStatus } from '../../quests/index.js';
import { ItemType, ItemRarity } from '../../loot.js';
import { LocationType } from '../../locations/constants/location-constants.js';
import { PlayerClass } from '../../players/index.js';
import { GuildActivityType, GuildResourceType } from '../../guild/index.js';

// UI State Schema
export const UI_STATE_SCHEMA = {
    type: 'object',
    properties: {
        activeSection: {
            type: 'string',
            enum: [
                'dashboard', 'quests', 'players', 'characters', 'locations',
                'loot', 'npcs', 'factions', 'session-notes', 'guild-logs',
                'settings'
            ]
        },
        selectedItem: {
            type: ['object', 'null'],
            properties: {
                id: { type: 'string' },
                type: { 
                    type: 'string',
                    enum: ['quest', 'player', 'location', 'item', 'npc', 'faction', 'session-note', 'guild-activity', 'guild-resource']
                }
            }
        },
        searchQuery: { type: 'string' },
        filters: {
            type: 'object',
            additionalProperties: {
                type: 'object'
            }
        },
        sortOptions: {
            type: 'object',
            additionalProperties: {
                type: 'object'
            }
        }
    },
    required: ['activeSection', 'selectedItem', 'searchQuery', 'filters', 'sortOptions']
};

// Settings State Schema
export const SETTINGS_SCHEMA = {
    type: 'object',
    properties: {
        theme: { 
            type: 'string',
            enum: ['light', 'dark', 'system'],
            default: 'dark'
        },
        notifications: { 
            type: 'boolean',
            default: true 
        },
        autoSave: { 
            type: 'boolean',
            default: true 
        },
        lastSaved: { 
            type: ['string', 'null'],
            format: 'date-time'
        },
        version: { 
            type: 'string',
            default: '1.0.0'
        },
        dataVersion: { 
            type: 'number',
            default: 1
        }
    },
    required: ['theme', 'notifications', 'autoSave', 'version', 'dataVersion']
};

export const STATE_SCHEMA = {
    // Characters
    characters: {
        type: 'array',
        items: {
            type: 'object',
            required: ['id', 'name', 'playerId', 'race', 'class', 'level'],
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                playerId: { type: 'string' }, // Reference to the player who owns this character
                race: { type: 'string' },
                class: { type: 'string' },
                level: { type: 'number', minimum: 1 },
                background: { type: 'string' },
                alignment: { type: 'string' },
                experience: { type: 'number', minimum: 0, default: 0 },
                hitPoints: {
                    type: 'object',
                    required: ['current', 'maximum', 'temporary'],
                    properties: {
                        current: { type: 'number', minimum: 0 },
                        maximum: { type: 'number', minimum: 1 },
                        temporary: { type: 'number', minimum: 0, default: 0 }
                    }
                },
                abilityScores: {
                    type: 'object',
                    required: ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'],
                    properties: {
                        strength: { type: 'number', minimum: 1, maximum: 30 },
                        dexterity: { type: 'number', minimum: 1, maximum: 30 },
                        constitution: { type: 'number', minimum: 1, maximum: 30 },
                        intelligence: { type: 'number', minimum: 1, maximum: 30 },
                        wisdom: { type: 'number', minimum: 1, maximum: 30 },
                        charisma: { type: 'number', minimum: 1, maximum: 30 }
                    }
                },
                skills: {
                    type: 'object',
                    additionalProperties: { type: 'number', minimum: 0, maximum: 99 }
                },
                inventory: {
                    type: 'array',
                    items: {
                        type: 'object',
                        required: ['itemId', 'quantity'],
                        properties: {
                            itemId: { type: 'string' },
                            quantity: { type: 'number', minimum: 1 },
                            equipped: { type: 'boolean', default: false },
                            notes: { type: 'string' }
                        }
                    }
                },
                features: {
                    type: 'array',
                    items: {
                        type: 'object',
                        required: ['name', 'description'],
                        properties: {
                            name: { type: 'string' },
                            description: { type: 'string' },
                            uses: { type: 'number' },
                            maxUses: { type: 'number' },
                            recharge: { type: 'string' } // e.g., 'long rest', 'short rest', 'dawn'
                        }
                    }
                },
                spells: {
                    type: 'object',
                    properties: {
                        spellSlots: {
                            type: 'array',
                            items: {
                                type: 'object',
                                required: ['level', 'maximum', 'remaining'],
                                properties: {
                                    level: { type: 'number', minimum: 1, maximum: 9 },
                                    maximum: { type: 'number', minimum: 0 },
                                    remaining: { type: 'number', minimum: 0 }
                                }
                            }
                        },
                        knownSpells: {
                            type: 'array',
                            items: { type: 'string' } // Array of spell IDs
                        },
                        preparedSpells: {
                            type: 'array',
                            items: { type: 'string' } // Array of spell IDs
                        }
                    }
                },
                conditions: {
                    type: 'array',
                    items: {
                        type: 'object',
                        required: ['conditionId', 'source', 'appliedAt'],
                        properties: {
                            conditionId: { type: 'string' },
                            source: { type: 'string' }, // e.g., 'spell', 'ability', 'trap'
                            appliedAt: { type: 'string', format: 'date-time' },
                            duration: { type: 'string' }, // e.g., '1 hour', 'until dispelled'
                            notes: { type: 'string' }
                        }
                    }
                },
                notes: { type: 'string' },
                appearance: { type: 'string' },
                backstory: { type: 'string' },
                personalityTraits: { type: 'string' },
                ideals: { type: 'string' },
                bonds: { type: 'string' },
                flaws: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
            }
        }
    },
    
    // Quests
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
                journalEntries: { 
                    type: 'array',
                    items: { type: 'string' } // Array of entry IDs
                },
                relatedItems: { 
                    type: 'array',
                    items: { type: 'string' } // Array of item IDs
                },
                relatedLocations: { 
                    type: 'array',
                    items: { type: 'string' } // Array of location IDs
                },
                relatedCharacters: { 
                    type: 'array',
                    items: { type: 'string' } // Array of character IDs
                },
                relatedFactions: { 
                    type: 'array',
                    items: { type: 'string' } // Array of faction IDs
                },
                relatedQuests: { 
                    type: 'array',
                    items: { type: 'string' } // Array of quest IDs
                },
                notes: { type: 'string' },
                resolution: {
                    type: 'object',
                    properties: {
                        session: { type: 'string' },
                        date: { type: ['string', 'null'], format: 'date' },
                        xp: { type: 'number' }
                    }
                },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
            }
        }
    },

    // Players & Characters
    players: {
        type: 'array',
        items: {
            type: 'object',
            required: ['id', 'name', 'playerClass', 'level'],
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                playerClass: { enum: Object.values(PlayerClass) },
                level: { type: 'number', minimum: 1 },
                ancestry: { type: 'string' },
                backstory: { type: 'string' },
                inventory: { 
                    type: 'array',
                    items: { type: 'string' } // Array of item IDs
                },
                conditions: { 
                    type: 'array',
                    items: { type: 'string' } // Array of condition IDs
                },
                notes: { type: 'string' },
                xp: { type: 'number', default: 0 },
                relatedQuests: {
                    type: 'array',
                    items: { type: 'string' } // Array of quest IDs
                },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
            }
        }
    },

    // Locations
    locations: {
        type: 'array',
        items: {
            type: 'object',
            required: ['id', 'name', 'type', 'discovered'],
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                description: { type: 'string' },
                type: { enum: Object.values(LocationType) },
                tags: { 
                    type: 'array',
                    items: { type: 'string' }
                },
                coordinates: { 
                    type: 'object',
                    properties: {
                        x: { type: 'number' },
                        y: { type: 'number' },
                        mapId: { type: 'string' } // Reference to a specific map
                    }
                },
                factionId: { type: 'string' }, // Reference to faction
                discovered: { type: 'boolean' },
                notes: { type: 'string' },
                relatedQuests: { 
                    type: 'array',
                    items: { type: 'string' } // Array of quest IDs
                },
                relatedNpcs: { 
                    type: 'array',
                    items: { type: 'string' } // Array of NPC IDs
                },
                parentLocationId: { type: 'string' }, // For hierarchical locations
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
            }
        }
    },

    // Loot/Items
    loot: {
        type: 'array',
        items: {
            type: 'object',
            required: ['id', 'name', 'type', 'rarity'],
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                description: { type: 'string' },
                type: { enum: Object.values(ItemType) },
                rarity: { enum: Object.values(ItemRarity) },
                quantity: { type: 'number', minimum: 1, default: 1 },
                value: { type: 'number' }, // In gold pieces
                weight: { type: 'number' }, // In pounds
                attunement: { type: 'boolean', default: false },
                cursed: { type: 'boolean', default: false },
                charges: { type: 'number' },
                ownerId: { type: 'string' }, // Character ID or null if unassigned
                locationId: { type: 'string' }, // Location ID if placed in the world
                questId: { type: 'string' }, // Related quest ID if applicable
                notes: { type: 'string' },
                tags: { 
                    type: 'array',
                    items: { type: 'string' }
                },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
            }
        }
    },

    // Factions
    factions: {
        type: 'array',
        items: {
            type: 'object',
            required: ['id', 'name', 'alignment', 'influence'],
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                description: { type: 'string' },
                alignment: { 
                    type: 'string',
                    enum: ['LG', 'NG', 'CG', 'LN', 'N', 'CN', 'LE', 'NE', 'CE']
                },
                influence: { 
                    type: 'number',
                    minimum: 0,
                    maximum: 100
                },
                relationship: {
                    type: 'string',
                    enum: ['ally', 'friendly', 'neutral', 'unfriendly', 'hostile']
                },
                leaderId: { type: 'string' }, // NPC ID of the faction leader
                headquartersId: { type: 'string' }, // Location ID of headquarters
                relatedQuests: { 
                    type: 'array',
                    items: { type: 'string' } // Array of quest IDs
                },
                memberNpcs: { 
                    type: 'array',
                    items: { type: 'string' } // Array of NPC IDs
                },
                notes: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
            }
        }
    },

    // NPCs
    npcs: {
        type: 'array',
        items: {
            type: 'object',
            required: ['id', 'name', 'status'],
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                title: { type: 'string' },
                race: { type: 'string' },
                class: { type: 'string' },
                level: { type: 'number' },
                alignment: { type: 'string' },
                description: { type: 'string' },
                physicalDescription: { type: 'string' },
                personalityTraits: { type: 'string' },
                ideals: { type: 'string' },
                bonds: { type: 'string' },
                flaws: { type: 'string' },
                status: {
                    type: 'string',
                    enum: ['alive', 'missing', 'dead', 'ascended', 'other']
                },
                factionId: { type: 'string' }, // Primary faction ID
                otherFactionIds: { 
                    type: 'array',
                    items: { type: 'string' } // Array of additional faction IDs
                },
                locationId: { type: 'string' }, // Current location ID
                homeLocationId: { type: 'string' }, // Home location ID
                relatedQuests: { 
                    type: 'array',
                    items: { type: 'string' } // Array of quest IDs
                },
                notes: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
            }
        }
    },

    // Session Notes
    sessionNotes: {
        type: 'array',
        items: {
            type: 'object',
            required: ['id', 'title', 'sessionDate', 'content'],
            properties: {
                id: { type: 'string' },
                title: { type: 'string' },
                sessionDate: { type: 'string', format: 'date' },
                content: { type: 'string' },
                tags: { 
                    type: 'array',
                    items: { type: 'string' }
                },
                relatedQuests: { 
                    type: 'array',
                    items: { type: 'string' } // Array of quest IDs
                },
                relatedLocations: { 
                    type: 'array',
                    items: { type: 'string' } // Array of location IDs
                },
                relatedNpcs: { 
                    type: 'array',
                    items: { type: 'string' } // Array of NPC IDs
                },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
            }
        }
    },

    // Guild Logs
    guildLogs: {
        type: 'object',
        properties: {
            activities: {
                type: 'array',
                items: {
                    type: 'object',
                    required: ['id', 'type', 'timestamp', 'description'],
                    properties: {
                        id: { type: 'string' },
                        type: { enum: Object.values(GuildActivityType) },
                        timestamp: { type: 'string', format: 'date-time' },
                        description: { type: 'string' },
                        characterId: { type: 'string' }, // Optional character ID
                        questId: { type: 'string' }, // Optional quest ID
                        details: { type: 'object' } // Additional context
                    }
                }
            },
            resources: {
                type: 'array',
                items: {
                    type: 'object',
                    required: ['id', 'type', 'amount', 'timestamp'],
                    properties: {
                        id: { type: 'string' },
                        type: { enum: Object.values(GuildResourceType) },
                        amount: { type: 'number' },
                        timestamp: { type: 'string', format: 'date-time' },
                        source: { type: 'string' }, // Description of source
                        questId: { type: 'string' }, // Optional quest ID
                        characterId: { type: 'string' }, // Optional character ID
                        notes: { type: 'string' }
                    }
                }
            }
        }
    }
};

export const INITIAL_STATE = {
    // Core data collections
    characters: [],
    quests: [],
    players: [],
    locations: [],
    loot: [],
    factions: [],
    npcs: [],

    sessionNotes: [],
    guildLogs: {
        activities: [],
        resources: []
    },
    
    // UI state
    ui: {
        state: {
            activeSection: 'dashboard',
            selectedItem: null,
            searchQuery: '',
            filters: {},
            sortOptions: {}
        }
    },
    
    // Application settings
    settings: {
        app: {
            theme: 'dark',
            notifications: true,
            autoSave: true,
            lastSaved: null,
            version: '1.0.0',
            dataVersion: 1
        }
    }
};

// Add UI and settings to the state schema
STATE_SCHEMA.ui = {
    type: 'object',
    properties: {
        state: UI_STATE_SCHEMA
    },
    required: ['state']
};

STATE_SCHEMA.settings = {
    type: 'object',
    properties: {
        app: SETTINGS_SCHEMA
    },
    required: ['app']
};
