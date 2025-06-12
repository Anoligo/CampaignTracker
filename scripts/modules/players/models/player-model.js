import { Entity } from '../../entity.js';

export class Player extends Entity {
    constructor(name, playerClass, level = 1, id = null, createdAt = new Date(), updatedAt = new Date()) {
        // Generate a unique ID if none provided
        const playerId = id || `player-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        super(playerId, new Date(createdAt), new Date(updatedAt));
        
        // Import PlayerClass enum
        const PlayerClass = {
            ALCHEMIST: 'alchemist',
            BARBARIAN: 'barbarian',
            BARD: 'bard',
            CHAMPION: 'champion',
            CLERIC: 'cleric',
            DRUID: 'druid',
            FIGHTER: 'fighter',
            INVENTOR: 'inventor',
            INVESTIGATOR: 'investigator',
            KINETICIST: 'kineticist',
            MAGUS: 'magus',
            MONK: 'monk',
            ORACLE: 'oracle',
            PSYCHIC: 'psychic',
            RANGER: 'ranger',
            ROGUE: 'rogue',
            SORCERER: 'sorcerer',
            SUMMONER: 'summoner',
            SWASHBUCKLER: 'swashbuckler',
            THAUMATURGE: 'thaumaturge',
            WITCH: 'witch',
            WIZARD: 'wizard',
            GUNSLINGER: 'gunslinger'
        };
        
        // Get all valid class values
        const validPlayerClasses = Object.values(PlayerClass);
        
        // Ensure playerClass is valid, default to 'fighter' if not
        const validatedClass = validPlayerClasses.includes(playerClass) ? playerClass : 'fighter';
        
        this.name = name;
        this.playerClass = validatedClass; 
        this.level = level;
        this.experience = 0;
        this.inventory = [];
        this.activeQuests = [];
        this.completedQuests = [];
        
        console.log(`Created new Player with class '${this.playerClass}':`, this);
    }

    addToInventory(item) {
        if (!this.inventory.includes(item)) {
            this.inventory.push(item);
            this.updatedAt = new Date();
        }
    }

    removeFromInventory(item) {
        this.inventory = this.inventory.filter(i => i !== item);
        this.updatedAt = new Date();
    }

    addActiveQuest(quest) {
        if (!this.activeQuests.includes(quest)) {
            this.activeQuests.push(quest);
            this.updatedAt = new Date();
        }
    }

    removeActiveQuest(quest) {
        this.activeQuests = this.activeQuests.filter(q => q !== quest);
        this.updatedAt = new Date();
    }

    addCompletedQuest(quest) {
        if (!this.completedQuests.includes(quest)) {
            this.completedQuests.push(quest);
            this.updatedAt = new Date();
        }
    }

    removeCompletedQuest(quest) {
        this.completedQuests = this.completedQuests.filter(q => q !== quest);
        this.updatedAt = new Date();
    }

    addExperience(amount) {
        this.experience += amount;
        // Check for level up (1000 XP per level)
        const newLevel = Math.floor(this.experience / 1000) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
        }
        this.updatedAt = new Date();
    }

    updateName(name) {
        this.name = name;
        this.updatedAt = new Date();
    }

    updateClass(playerClass) {
        // Import PlayerClass enum
        const PlayerClass = {
            ALCHEMIST: 'alchemist',
            BARBARIAN: 'barbarian',
            BARD: 'bard',
            CHAMPION: 'champion',
            CLERIC: 'cleric',
            DRUID: 'druid',
            FIGHTER: 'fighter',
            INVENTOR: 'inventor',
            INVESTIGATOR: 'investigator',
            KINETICIST: 'kineticist',
            MAGUS: 'magus',
            MONK: 'monk',
            ORACLE: 'oracle',
            PSYCHIC: 'psychic',
            RANGER: 'ranger',
            ROGUE: 'rogue',
            SORCERER: 'sorcerer',
            SUMMONER: 'summoner',
            SWASHBUCKLER: 'swashbuckler',
            THAUMATURGE: 'thaumaturge',
            WITCH: 'witch',
            WIZARD: 'wizard',
            GUNSLINGER: 'gunslinger'
        };
        
        // Get all valid class values
        const validPlayerClasses = Object.values(PlayerClass);
        
        // Ensure playerClass is valid, default to 'fighter' if not
        this.playerClass = validPlayerClasses.includes(playerClass) ? playerClass : 'fighter';
        this.updatedAt = new Date();
        console.log(`Updated player class to '${this.playerClass}'`);
    }

    toJSON() {
        // Ensure we're using the correct property name that matches the schema
        const result = {
            id: this.id,
            name: this.name,
            // Always use playerClass in the output, fall back to class if needed
            playerClass: this.playerClass || this.class || 'fighter',
            level: this.level,
            experience: this.experience || 0,
            inventory: [...(this.inventory || [])],
            activeQuests: [...(this.activeQuests || [])],
            completedQuests: [...(this.completedQuests || [])],
            createdAt: this.createdAt ? new Date(this.createdAt).toISOString() : new Date().toISOString(),
            updatedAt: this.updatedAt ? new Date(this.updatedAt).toISOString() : new Date().toISOString()
        };
        
        // Clean up any class property to avoid confusion
        if ('class' in result) {
            delete result.class;
        }
        
        console.log('Player toJSON result:', result);
        return result;
    }
}
