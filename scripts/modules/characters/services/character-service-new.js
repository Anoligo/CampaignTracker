/**
 * Character Service
 * Handles all character-related data operations using the unified appState pattern
 */

export class CharacterService {
    /**
     * Create a new CharacterService instance
     * @param {Object} dataManager - The application's data manager (DataService)
     */
    constructor(dataManager) {
        if (!dataManager) {
            throw new Error('Data manager is required');
        }
        
        this.dataManager = dataManager;
        this.STORAGE_KEY = 'characters';
        this.initialize();
    }
    
    /**
     * Initialize the service
     * @private
     */
    initialize() {
        // Ensure characters array exists in appState
        if (!Array.isArray(this.dataManager.appState[this.STORAGE_KEY])) {
            this.dataManager.appState[this.STORAGE_KEY] = [];
            this._saveState();
        }
    }
    
    /**
     * Save the current state
     * @private
     * @returns {boolean} True if save was successful
     */
    _saveState() {
        try {
            this.dataManager.saveData();
            return true;
        } catch (error) {
            console.error('Error saving character data:', error);
            return false;
        }
    }
    
    /**
     * Get all characters
     * @returns {Array<Object>} Array of characters
     */
    getAllCharacters() {
        return [...(this.dataManager.appState[this.STORAGE_KEY] || [])];
    }
    
    /**
     * Get a character by ID
     * @param {string} id - Character ID
     * @returns {Object|undefined} The character or undefined if not found
     */
    getCharacterById(id) {
        if (!id) return undefined;
        return this.dataManager.appState[this.STORAGE_KEY]?.find(char => char.id === id);
    }
    
    /**
     * Create a new character
     * @param {Object} data - Character data
     * @returns {Object} The created character
     */
    createCharacter(data) {
        try {
            if (!data) {
                throw new Error('Character data is required');
            }
            
            // Ensure characters array exists
            if (!Array.isArray(this.dataManager.appState[this.STORAGE_KEY])) {
                this.dataManager.appState[this.STORAGE_KEY] = [];
            }
            
            // Create character with required fields and defaults
            const character = {
                id: data.id || `char-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: data.name || 'Unnamed Character',
                playerClass: data.playerClass || 'fighter',
                level: typeof data.level === 'number' ? data.level : 1,
                race: data.race || 'Human',
                alignment: data.alignment || 'Neutral',
                experience: typeof data.experience === 'number' ? data.experience : 0,
                inventory: Array.isArray(data.inventory) ? [...data.inventory] : [],
                activeQuests: Array.isArray(data.activeQuests) ? [...data.activeQuests] : [],
                completedQuests: Array.isArray(data.completedQuests) ? [...data.completedQuests] : [],
                notes: typeof data.notes === 'string' ? data.notes : '',
                conditions: Array.isArray(data.conditions) ? [...data.conditions] : [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                ...data // Spread any additional properties
            };
            
            // Add to the characters array
            this.dataManager.appState[this.STORAGE_KEY] = [
                ...this.dataManager.appState[this.STORAGE_KEY],
                character
            ];
            
            // Save the state
            if (!this._saveState()) {
                throw new Error('Failed to save character');
            }
            
            return character;
        } catch (error) {
            console.error('Error creating character:', error);
            throw error;
        }
    }
    
    /**
     * Update a character
     * @param {string} id - Character ID
     * @param {Object} updates - Updates to apply
     * @returns {Object|undefined} The updated character or undefined if not found
     */
    updateCharacter(id, updates) {
        try {
            if (!id || !updates) {
                throw new Error('ID and updates are required');
            }
            
            const index = this.dataManager.appState[this.STORAGE_KEY]?.findIndex(char => char.id === id) ?? -1;
            if (index === -1) {
                console.warn(`Character with ID ${id} not found`);
                return undefined;
            }
            
            // Create updated character
            const updatedCharacter = {
                ...this.dataManager.appState[this.STORAGE_KEY][index],
                ...updates,
                id, // Ensure ID doesn't change
                updatedAt: new Date().toISOString()
            };
            
            // Update the array
            const updatedCharacters = [...this.dataManager.appState[this.STORAGE_KEY]];
            updatedCharacters[index] = updatedCharacter;
            this.dataManager.appState[this.STORAGE_KEY] = updatedCharacters;
            
            // Save the state
            if (!this._saveState()) {
                throw new Error('Failed to update character');
            }
            
            return updatedCharacter;
        } catch (error) {
            console.error(`Error updating character ${id}:`, error);
            throw error;
        }
    }
    
    /**
     * Delete a character
     * @param {string} id - Character ID
     * @returns {boolean} True if deleted, false if not found
     */
    deleteCharacter(id) {
        try {
            if (!id) {
                throw new Error('ID is required');
            }
            
            const initialLength = this.dataManager.appState[this.STORAGE_KEY]?.length || 0;
            this.dataManager.appState[this.STORAGE_KEY] = 
                this.dataManager.appState[this.STORAGE_KEY]?.filter(char => char.id !== id) || [];
            
            if (this.dataManager.appState[this.STORAGE_KEY].length === initialLength) {
                console.warn(`Character with ID ${id} not found`);
                return false;
            }
            
            // Save the state
            if (!this._saveState()) {
                throw new Error('Failed to delete character');
            }
            
            return true;
        } catch (error) {
            console.error(`Error deleting character ${id}:`, error);
            throw error;
        }
    }
    
    // Additional character-specific methods
    
    /**
     * Add an item to a character's inventory
     * @param {string} characterId - Character ID
     * @param {Object} item - Item to add
     * @returns {Object|undefined} Updated character or undefined if not found
     */
    addItemToInventory(characterId, item) {
        const character = this.getCharacterById(characterId);
        if (!character) return undefined;
        
        const updatedCharacter = {
            ...character,
            inventory: [...(character.inventory || []), item],
            updatedAt: new Date().toISOString()
        };
        
        return this.updateCharacter(characterId, updatedCharacter);
    }
    
    /**
     * Remove an item from a character's inventory
     * @param {string} characterId - Character ID
     * @param {string} itemId - Item ID to remove
     * @returns {Object|undefined} Updated character or undefined if not found
     */
    removeItemFromInventory(characterId, itemId) {
        const character = this.getCharacterById(characterId);
        if (!character || !character.inventory) return character;
        
        const updatedCharacter = {
            ...character,
            inventory: character.inventory.filter(item => item.id !== itemId),
            updatedAt: new Date().toISOString()
        };
        
        return this.updateCharacter(characterId, updatedCharacter);
    }
    
    /**
     * Add a quest to a character's active quests
     * @param {string} characterId - Character ID
     * @param {string} questId - Quest ID to add
     * @returns {Object|undefined} Updated character or undefined if not found
     */
    addActiveQuest(characterId, questId) {
        const character = this.getCharacterById(characterId);
        if (!character) return undefined;
        
        // Don't add if already in active quests
        if (character.activeQuests?.includes(questId)) {
            return character;
        }
        
        const updatedCharacter = {
            ...character,
            activeQuests: [...(character.activeQuests || []), questId],
            updatedAt: new Date().toISOString()
        };
        
        return this.updateCharacter(characterId, updatedCharacter);
    }
    
    /**
     * Mark a quest as completed for a character
     * @param {string} characterId - Character ID
     * @param {string} questId - Quest ID to complete
     * @returns {Object|undefined} Updated character or undefined if not found
     */
    completeQuest(characterId, questId) {
        const character = this.getCharacterById(characterId);
        if (!character) return undefined;
        
        // Remove from active quests if present
        const activeQuests = character.activeQuests?.filter(id => id !== questId) || [];
        
        // Add to completed quests if not already there
        const completedQuests = [...(character.completedQuests || [])];
        if (!completedQuests.includes(questId)) {
            completedQuests.push(questId);
        }
        
        const updatedCharacter = {
            ...character,
            activeQuests,
            completedQuests,
            updatedAt: new Date().toISOString()
        };
        
        return this.updateCharacter(characterId, updatedCharacter);
    }
    
    /**
     * Search characters by name or description
     * @param {string} query - Search query
     * @returns {Array<Object>} Filtered array of characters
     */
    searchCharacters(query) {
        if (!query) return this.getAllCharacters();
        const q = query.toLowerCase();
        return this.getAllCharacters().filter(character => 
            (character.name && character.name.toLowerCase().includes(q)) ||
            (character.notes && character.notes.toLowerCase().includes(q))
        );
    }
    
    /**
     * Filter characters by class
     * @param {string} className - Class to filter by
     * @returns {Array<Object>} Filtered array of characters
     */
    filterByClass(className) {
        if (!className) return this.getAllCharacters();
        return this.getAllCharacters().filter(character => 
            character.playerClass?.toLowerCase() === className.toLowerCase()
        );
    }
    
    /**
     * Filter characters by level range
     * @param {number} minLevel - Minimum level (inclusive)
     * @param {number} maxLevel - Maximum level (inclusive)
     * @returns {Array<Object>} Filtered array of characters
     */
    filterByLevelRange(minLevel, maxLevel) {
        const min = typeof minLevel === 'number' ? minLevel : 1;
        const max = typeof maxLevel === 'number' ? maxLevel : Infinity;
        
        return this.getAllCharacters().filter(character => {
            const level = typeof character.level === 'number' ? character.level : 1;
            return level >= min && level <= max;
        });
    }
}

export default CharacterService;
