/**
 * Characters Module
 * Main entry point for character-related functionality
 */

import { Character } from '../characters.js';
import { CharacterService } from './services/character-service.js';
import { CharacterUI } from './ui/character-ui.js';
import { initializeCharactersSection } from './characters-section.js';

export class CharactersManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.characterService = new CharacterService(dataManager);
        this.characterUI = null;
    }

    /**
     * Initialize the characters module
     */
    async initialize() {
        // Ensure characters array exists in the data manager
        if (!this.dataManager.appState.characters) {
            this.dataManager.appState = {
                ...this.dataManager.appState,
                characters: []
            };

            // Persist the updated state if a save method is available
            if (typeof this.dataManager.saveData === 'function') {
                this.dataManager.saveData();
            } else if (
                this.dataManager.appState &&
                typeof this.dataManager.appState.saveData === 'function'
            ) {
                this.dataManager.appState.saveData();
            } else {
                console.warn('No save method available on dataManager');
            }
        }

        // Initialize the UI if we're in a browser environment
        if (typeof document !== 'undefined') {
            try {
                // Initialize the CharacterUI
                this.characterUI = new CharacterUI(this.characterService, this.dataManager);
                console.log('Characters module initialized with inline form');
            } catch (error) {
                console.error('Error initializing Characters module:', error);
            }
        }
    }

    /**
     * Get all characters
     * @returns {Array} Array of characters
     */
    getAllCharacters() {
        return this.characterService.getAllCharacters();
    }

    /**
     * Get a character by ID
     * @param {string} id - Character ID
     * @returns {Object|null} Character object or null if not found
     */
    getCharacterById(id) {
        return this.characterService.getCharacterById(id);
    }

    /**
     * Create a new character
     * @param {Object} characterData - Character data
     * @returns {Object} Created character
     */
    createCharacter(characterData) {
        return this.characterService.createCharacter(characterData);
    }

    /**
     * Update a character
     * @param {string} id - Character ID
     * @param {Object} updates - Updated character data
     * @returns {Object|null} Updated character or null if not found
     */
    updateCharacter(id, updates) {
        return this.characterService.updateCharacter(id, updates);
    }

    /**
     * Delete a character
     * @param {string} id - Character ID
     * @returns {boolean} True if deleted, false if not found
     */
    deleteCharacter(id) {
        return this.characterService.deleteCharacter(id);
    }

    /**
     * Add an item to character's inventory
     * @param {string} characterId - Character ID
     * @param {Object} item - Item to add
     * @returns {Object|null} Updated character or null if not found
     */
    addToInventory(characterId, item) {
        return this.characterService.addToInventory(characterId, item);
    }

    /**
     * Remove an item from character's inventory
     * @param {string} characterId - Character ID
     * @param {string} itemId - Item ID to remove
     * @returns {Object|null} Updated character or null if not found
     */
    removeFromInventory(characterId, itemId) {
        return this.characterService.removeFromInventory(characterId, itemId);
    }

    /**
     * Add a quest to character's quests
     * @param {string} characterId - Character ID
     * @param {string} questId - Quest ID to add
     * @returns {Object|null} Updated character or null if not found
     */
    addQuest(characterId, questId) {
        return this.characterService.addQuest(characterId, questId);
    }

    /**
     * Remove a quest from character's quests
     * @param {string} characterId - Character ID
     * @param {string} questId - Quest ID to remove
     * @returns {Object|null} Updated character or null if not found
     */
    removeQuest(characterId, questId) {
        return this.characterService.removeQuest(characterId, questId);
    }

    /**
     * Update character's attribute
     * @param {string} characterId - Character ID
     * @param {string} attribute - Attribute name
     * @param {number} value - New attribute value
     * @returns {Object|null} Updated character or null if not found
     */
    updateAttribute(characterId, attribute, value) {
        return this.characterService.updateAttribute(characterId, attribute, value);
    }

    /**
     * Add a skill to character
     * @param {string} characterId - Character ID
     * @param {string} skill - Skill to add
     * @returns {Object|null} Updated character or null if not found
     */
    addSkill(characterId, skill) {
        return this.characterService.addSkill(characterId, skill);
    }

    /**
     * Remove a skill from character
     * @param {string} characterId - Character ID
     * @param {string} skill - Skill to remove
     * @returns {Object|null} Updated character or null if not found
     */
    removeSkill(characterId, skill) {
        return this.characterService.removeSkill(characterId, skill);
    }
}

// Export the Character class for use in other modules
export { Character };

// Export the section initializer
export { initializeCharactersSection } from './characters-section.js';
