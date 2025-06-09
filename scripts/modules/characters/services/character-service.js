/**
 * Character Service
 * Handles all character-related data operations
 */

export class CharacterService {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }

    /**
     * Get all characters
     * @returns {Array} Array of characters
     */
    getAllCharacters() {
        // Ensure characters array exists in state
        if (!this.dataManager.appState.characters) {
            this.dataManager.appState.characters = [];
            this.dataManager.saveData();
        }
        return this.dataManager.appState.characters || [];
    }

    /**
     * Get a character by ID
     * @param {string} id - Character ID
     * @returns {Object|null} Character object or null if not found
     */
    getCharacterById(id) {
        const characters = this.getAllCharacters();
        return characters.find(char => char.id === id) || null;
    }

    /**
     * Create a new character
     * @param {Object} characterData - Character data
     * @returns {Promise<Object>} Created character
     */
    async createCharacter(characterData) {
        try {
            const characters = this.getAllCharacters();
            const newCharacter = {
                id: Date.now().toString(),
                name: characterData.name || 'Unnamed Character',
                race: characterData.race || 'Unknown',
                classType: characterData.classType || 'Adventurer',
                level: characterData.level || 1,
                attributes: characterData.attributes || {
                    strength: 10,
                    dexterity: 10,
                    constitution: 10,
                    intelligence: 10,
                    wisdom: 10,
                    charisma: 10
                },
                skills: characterData.skills || [],
                inventory: characterData.inventory || [],
                quests: characterData.quests || [],
                bio: characterData.bio || '',
                notes: characterData.notes || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Add to the characters array
            characters.push(newCharacter);
            
            // Update the state
            this.dataManager.appState.characters = characters;
            
            // Save the updated state
            this.dataManager.saveData();
            
            console.log('Character created:', newCharacter);
            return newCharacter;
        } catch (error) {
            console.error('Error creating character:', error);
            throw error;
        }
    }

    /**
     * Update a character
     * @param {string} id - Character ID
     * @param {Object} updates - Updated character data
     * @returns {Object|null} Updated character or null if not found
     */
    async updateCharacter(id, updates) {
        try {
            const characters = this.getAllCharacters();
            const index = characters.findIndex(char => char.id === id);
            
            if (index === -1) return null;
            
            const updatedCharacter = {
                ...characters[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            
            // Update the character in the array
            characters[index] = updatedCharacter;
            
            // Update the state
            this.dataManager.appState.characters = characters;
            
            // Save the updated state
            this.dataManager.saveData();
            
            console.log('Character updated:', updatedCharacter);
            return updatedCharacter;
        } catch (error) {
            console.error('Error updating character:', error);
            throw error;
        }
    }

    /**
     * Delete a character
     * @param {string} id - Character ID
     * @returns {boolean} True if deleted, false if not found
     */
    deleteCharacter(id) {
        const characters = this.getAllCharacters();
        const initialLength = characters.length;
        const filteredCharacters = characters.filter(char => char.id !== id);
        
        if (filteredCharacters.length === initialLength) return false;
        
        this.dataManager.appState = { ...this.dataManager.appState, characters: filteredCharacters };
        this.dataManager.saveData();
        return true;
    }

    /**
     * Add an item to character's inventory
     * @param {string} characterId - Character ID
     * @param {Object} item - Item to add
     * @returns {Object|null} Updated character or null if not found
     */
    addToInventory(characterId, item) {
        const character = this.getCharacterById(characterId);
        if (!character) return null;

        const updatedCharacter = {
            ...character,
            inventory: [...(character.inventory || []), item],
            updatedAt: new Date()
        };

        return this.updateCharacter(characterId, updatedCharacter);
    }

    /**
     * Remove an item from character's inventory
     * @param {string} characterId - Character ID
     * @param {string} itemId - Item ID to remove
     * @returns {Object|null} Updated character or null if not found
     */
    removeFromInventory(characterId, itemId) {
        const character = this.getCharacterById(characterId);
        if (!character || !character.inventory) return null;

        const updatedCharacter = {
            ...character,
            inventory: character.inventory.filter(item => item.id !== itemId),
            updatedAt: new Date()
        };

        return this.updateCharacter(characterId, updatedCharacter);
    }

    /**
     * Add a quest to character's quests
     * @param {string} characterId - Character ID
     * @param {string} questId - Quest ID to add
     * @returns {Object|null} Updated character or null if not found
     */
    addQuest(characterId, questId) {
        const character = this.getCharacterById(characterId);
        if (!character) return null;

        const updatedQuests = [...new Set([...(character.quests || []), questId])];
        
        return this.updateCharacter(characterId, {
            quests: updatedQuests,
            updatedAt: new Date()
        });
    }

    /**
     * Remove a quest from character's quests
     * @param {string} characterId - Character ID
     * @param {string} questId - Quest ID to remove
     * @returns {Object|null} Updated character or null if not found
     */
    removeQuest(characterId, questId) {
        const character = this.getCharacterById(characterId);
        if (!character || !character.quests) return null;

        return this.updateCharacter(characterId, {
            quests: character.quests.filter(id => id !== questId),
            updatedAt: new Date()
        });
    }

    /**
     * Update character's attribute
     * @param {string} characterId - Character ID
     * @param {string} attribute - Attribute name
     * @param {number} value - New attribute value
     * @returns {Object|null} Updated character or null if not found
     */
    updateAttribute(characterId, attribute, value) {
        const character = this.getCharacterById(characterId);
        if (!character) return null;

        const updatedAttributes = {
            ...(character.attributes || {}),
            [attribute]: value
        };

        return this.updateCharacter(characterId, {
            attributes: updatedAttributes,
            updatedAt: new Date()
        });
    }

    /**
     * Add a skill to character
     * @param {string} characterId - Character ID
     * @param {string} skill - Skill to add
     * @returns {Object|null} Updated character or null if not found
     */
    addSkill(characterId, skill) {
        const character = this.getCharacterById(characterId);
        if (!character) return null;

        const updatedSkills = [...new Set([...(character.skills || []), skill])];
        
        return this.updateCharacter(characterId, {
            skills: updatedSkills,
            updatedAt: new Date()
        });
    }

    /**
     * Remove a skill from character
     * @param {string} characterId - Character ID
     * @param {string} skill - Skill to remove
     * @returns {Object|null} Updated character or null if not found
     */
    removeSkill(characterId, skill) {
        const character = this.getCharacterById(characterId);
        if (!character || !character.skills) return null;

        return this.updateCharacter(characterId, {
            skills: character.skills.filter(s => s !== skill),
            updatedAt: new Date()
        });
    }
    
    /**
     * Search for characters by name, race, or class
     * @param {string} searchTerm - Search term to match against character properties
     * @returns {Array} Array of matching characters
     */
    searchCharacters(searchTerm) {
        if (!searchTerm) {
            return this.getAllCharacters();
        }
        
        const term = searchTerm.toLowerCase();
        const characters = this.getAllCharacters();
        
        return characters.filter(character => {
            return (
                (character.name && character.name.toLowerCase().includes(term)) ||
                (character.race && character.race.toLowerCase().includes(term)) ||
                (character.classType && character.classType.toLowerCase().includes(term)) ||
                (character.bio && character.bio.toLowerCase().includes(term))
            );
        });
    }
}
