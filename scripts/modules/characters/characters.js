/**
 * Characters Module
 * Main entry point for character-related functionality
 */

/**
 * Character class representing a game character
 */
export class Character {
    /**
     * Create a new Character
     * @param {string} name - Character's name
     * @param {string} race - Character's race
     * @param {string} classType - Character's class
     * @param {number} [level=1] - Character's level
     * @param {Date} [createdAt] - Creation timestamp
     * @param {Date} [updatedAt] - Last update timestamp
     */
    constructor(name, race, classType, level = 1, createdAt, updatedAt) {
        this.id = Date.now().toString();
        this.name = name;
        this.race = race;
        this.classType = classType;
        this.level = level;
        this.attributes = {
            strength: 10,
            dexterity: 10,
            constitution: 10,
            intelligence: 10,
            wisdom: 10,
            charisma: 10
        };
        this.skills = [];
        this.inventory = [];
        this.quests = [];
        this.bio = '';
        this.notes = '';
        this.alignment = '';
        this.createdAt = createdAt || new Date();
        this.updatedAt = updatedAt || new Date();
    }

    /**
     * Update character's name
     * @param {string} newName - New name for the character
     */
    updateName(newName) {
        this.name = newName;
        this.updatedAt = new Date();
    }

    /**
     * Update character's race
     * @param {string} newRace - New race for the character
     */
    updateRace(newRace) {
        this.race = newRace;
        this.updatedAt = new Date();
    }

    /**
     * Update character's class
     * @param {string} newClass - New class for the character
     */
    updateClass(newClass) {
        this.classType = newClass;
        this.updatedAt = new Date();
    }

    /**
     * Update character's level
     * @param {number} newLevel - New level for the character
     */
    updateLevel(newLevel) {
        this.level = newLevel;
        this.updatedAt = new Date();
    }

    /**
     * Update a character attribute
     * @param {string} attribute - Attribute to update
     * @param {number} value - New value for the attribute
     */
    updateAttribute(attribute, value) {
        if (this.attributes.hasOwnProperty(attribute)) {
            this.attributes[attribute] = value;
            this.updatedAt = new Date();
        }
    }


    /**
     * Add a skill to the character
     * @param {string} skill - Skill to add
     */
    addSkill(skill) {
        if (!this.skills.includes(skill)) {
            this.skills.push(skill);
            this.updatedAt = new Date();
        }
    }

    /**
     * Remove a skill from the character
     * @param {string} skill - Skill to remove
     */
    removeSkill(skill) {
        this.skills = this.skills.filter(s => s !== skill);
        this.updatedAt = new Date();
    }

    /**
     * Add an item to the character's inventory
     * @param {Object} item - Item to add
     */
    addToInventory(item) {
        this.inventory.push(item);
        this.updatedAt = new Date();
    }

    /**
     * Remove an item from the character's inventory
     * @param {string} itemId - ID of the item to remove
     */
    removeFromInventory(itemId) {
        this.inventory = this.inventory.filter(item => item.id !== itemId);
        this.updatedAt = new Date();
    }

    /**
     * Add a quest to the character's quests
     * @param {string} questId - ID of the quest to add
     */
    addQuest(questId) {
        if (!this.quests.includes(questId)) {
            this.quests.push(questId);
            this.updatedAt = new Date();
        }
    }

    /**
     * Remove a quest from the character's quests
     * @param {string} questId - ID of the quest to remove
     */
    removeQuest(questId) {
        this.quests = this.quests.filter(id => id !== questId);
        this.updatedAt = new Date();
    }

    /**
     * Update character's biography
     * @param {string} bio - New biography text
     */
    updateBio(bio) {
        this.bio = bio;
        this.updatedAt = new Date();
    }

    /**
     * Update character's notes
     * @param {string} notes - New notes text
     */
    updateNotes(notes) {
        this.notes = notes;
        this.updatedAt = new Date();
    }

    /**
     * Update character's alignment
     * @param {string} alignment - New alignment
     */
    updateAlignment(alignment) {
        this.alignment = alignment;
        this.updatedAt = new Date();
    }

    /**
     * Calculate an ability modifier from an ability score
     * @param {number} score - Ability score
     * @returns {number} Ability modifier
     */
    static calculateModifier(score) {
        return Math.floor((score - 10) / 2);
    }

    /**
     * Get the modifier for a given ability score
     * @param {string} ability - Ability name (e.g., 'strength', 'dexterity')
     * @returns {number} Ability modifier
     */
    getModifier(ability) {
        if (this.attributes && this.attributes[ability] !== undefined) {
            return Character.calculateModifier(this.attributes[ability]);
        }
        return 0;
    }

    /**
     * Get a formatted string representation of a modifier (with + or -)
     * @param {string} ability - Ability name
     * @returns {string} Formatted modifier (e.g., "+2" or "-1")
     */
    getFormattedModifier(ability) {
        const modifier = this.getModifier(ability);
        return modifier >= 0 ? `+${modifier}` : `${modifier}`;
    }

    /**
     * Create a Character instance from a plain object
     * @param {Object} data - Object containing character data
     * @returns {Character} New Character instance
     */
    static fromObject(data) {
        const character = new Character(
            data.name || 'Unnamed Character',
            data.race || 'Unknown',
            data.classType || 'Adventurer',
            data.level || 1,
            data.createdAt ? new Date(data.createdAt) : new Date(),
            data.updatedAt ? new Date(data.updatedAt) : new Date()
        );

        // Copy all properties from data to the character
        Object.assign(character, data);

        // Ensure arrays are properly initialized
        character.skills = Array.isArray(data.skills) ? [...data.skills] : [];
        character.inventory = Array.isArray(data.inventory) ? [...data.inventory] : [];
        character.quests = Array.isArray(data.quests) ? [...data.quests] : [];

        // Ensure attributes is an object
        if (data.attributes && typeof data.attributes === 'object') {
            character.attributes = { ...data.attributes };
        }

        return character;
    }

    /**
     * Convert the character to a plain object (for serialization)
     * @returns {Object} Plain object representation of the character
     */
    toObject() {
        return {
            id: this.id,
            name: this.name,
            race: this.race,
            classType: this.classType,
            level: this.level,
            attributes: { ...this.attributes },
            skills: [...this.skills],
            inventory: [...this.inventory],
            quests: [...this.quests],
            bio: this.bio,
            notes: this.notes,
            alignment: this.alignment,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString()
        };
    }
}
