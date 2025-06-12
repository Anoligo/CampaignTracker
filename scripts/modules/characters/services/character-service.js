/**
 * Character Service
 * Handles all character-related data operations
 */

export class CharacterService {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }

    /**
     * Safely retrieve the NPC array from the underlying data manager.
     * Supports both the newer DataService interface ("npcs" collection)
     * and the legacy plain object structure using "characters".
     * @returns {Array} Array of characters
     */
    _getCharactersArray() {
        try {
            let characters = [];

            // Preferred: use data service's getAll method
            if (this.dataManager && typeof this.dataManager.getAll === 'function') {
                try {
                    const result = this.dataManager.getAll('npcs');
                    if (Array.isArray(result)) {
                        characters = result;
                        return [...characters];
                    }
                } catch (error) {
                    console.warn('Error getting NPCs from dataManager.getAll:', error);
                }
            }

            // Fallback: check appState.state.npcs or .characters
            if (this.dataManager && this.dataManager.appState) {
                const state = this.dataManager.appState.state || this.dataManager.appState;
                if (state && Array.isArray(state.npcs)) {
                    characters = state.npcs;
                    return [...characters];
                }
                if (state && Array.isArray(state.characters)) {
                    characters = state.characters;
                    return [...characters];
                }
            }

            // Legacy fallback
            if (this.dataManager && Array.isArray(this.dataManager.appState?.characters)) {
                characters = this.dataManager.appState.characters;
                return [...characters];
            }

            // Initialize empty array if none found
            if (this.dataManager && this.dataManager.appState && typeof this.dataManager.appState.update === 'function') {
                this.dataManager.appState.update({ npcs: [] }, true);
            }

            return [...characters];
        } catch (error) {
            console.error('Error in _getCharactersArray:', error);
            return [];
        }
    }

    _saveData() {
        try {
            if (this.dataManager && this.dataManager._saveData) {
                this.dataManager._saveData();
                return true;
            }
            if (this.dataManager && typeof this.dataManager.saveData === 'function') {
                this.dataManager.saveData();
                return true;
            }
            console.warn('No save method available on dataManager');
            return false;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    }

    /**
     * Get all characters
     * @returns {Array} Array of characters
     */
    getAllCharacters() {
        return this._getCharactersArray();
    }

    /**
     * Get a character by ID
     * @param {string} id - Character ID
     * @returns {Object|null} Character object or null if not found
     */
    getCharacterById(id) {
        const characters = this._getCharactersArray();
        return characters.find(char => char.id === id) || null;
    }

    /**
     * Create a new character
     * @param {Object} characterData - Character data
     * @returns {Promise<Object>} Created character
     */
    async createCharacter(characterData) {
        try {
            const characters = this._getCharactersArray();
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

            // Add to the collection using data service if available
            if (this.dataManager && typeof this.dataManager.add === 'function') {
                const added = this.dataManager.add('npcs', newCharacter, { generateId: false });
                this._saveData();
                console.log('Character created:', added);
                return added;
            }

            // Fallback to manual array update
            characters.push(newCharacter);
            if (this.dataManager && this.dataManager.appState && typeof this.dataManager.appState.update === 'function') {
                this.dataManager.appState.update({ npcs: characters }, true);
            } else if (this.dataManager && this.dataManager.appState) {
                this.dataManager.appState.npcs = characters;
                this._saveData();
            }

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
            const characters = this._getCharactersArray();
            const index = characters.findIndex(char => char.id === id);
            
            if (index === -1) return null;
            
            const updatedCharacter = {
                ...characters[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            
            if (this.dataManager && typeof this.dataManager.update === 'function') {
                const updated = this.dataManager.update('npcs', id, updatedCharacter);
                this._saveData();
                console.log('Character updated:', updated);
                return updated;
            }

            // Fallback to manual update
            characters[index] = updatedCharacter;
            if (this.dataManager && this.dataManager.appState && typeof this.dataManager.appState.update === 'function') {
                this.dataManager.appState.update({ npcs: characters }, true);
            } else if (this.dataManager && this.dataManager.appState) {
                this.dataManager.appState.npcs = characters;
                this._saveData();
            }

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
        const characters = this._getCharactersArray();
        const initialLength = characters.length;
        const filteredCharacters = characters.filter(char => char.id !== id);

        if (filteredCharacters.length === initialLength) return false;

        if (this.dataManager && typeof this.dataManager.remove === 'function') {
            const removed = this.dataManager.remove('npcs', id);
            this._saveData();
            return removed;
        }

        this.dataManager.appState = { ...this.dataManager.appState, npcs: filteredCharacters };
        this._saveData();
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
