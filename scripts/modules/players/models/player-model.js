import { Entity } from '../../entity.js';

export class Player extends Entity {
    constructor(name, playerClass, level = 1, id = null, createdAt = new Date(), updatedAt = new Date()) {
        // Generate a unique ID if none provided
        const playerId = id || `player-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        super(playerId, new Date(createdAt), new Date(updatedAt));
        
        this.name = name;
        this.class = playerClass;
        this.level = level;
        this.experience = 0;
        this.inventory = [];
        this.activeQuests = [];
        this.completedQuests = [];
        
        console.log(`Created new Player:`, this);
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
        this.class = playerClass;
        this.updatedAt = new Date();
    }
}
