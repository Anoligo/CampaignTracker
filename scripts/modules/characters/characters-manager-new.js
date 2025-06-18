/**
 * Characters Manager
 * Main entry point for character-related functionality using the unified appState pattern
 */

import { CharacterService } from './services/character-service-new.js';
import { CharacterUI } from './ui/character-ui.js';

export class CharactersManager {
    /**
     * Create a new CharactersManager instance
     * @param {Object} dataManager - The application's data manager (DataService)
     */
    constructor(dataManager) {
        console.log('[CharactersManager] Initializing with dataManager:', dataManager ? 'valid' : 'invalid');
        
        if (!dataManager) {
            throw new Error('Data manager is required');
        }
        
        this.dataManager = dataManager;
        this.characterService = new CharacterService(dataManager);
        this.characterUI = null;
        this.initialized = false;
        this._isRendering = false;
        
        console.log('[CharactersManager] Initialization complete');
    }
    
    /**
     * Initialize the characters module
     * @returns {Promise<boolean>} True if initialization was successful
     */
    async initialize() {
        if (this.initialized) {
            console.log('[CharactersManager] Already initialized');
            return true;
        }
        
        console.log('[CharactersManager] Initializing...');
        
        try {
            // Initialize the UI if we're in a browser environment
            if (typeof document !== 'undefined') {
                try {
                    // Initialize the CharacterUI
                    this.characterUI = new CharacterUI(this.characterService, this.dataManager);
                    await this.characterUI.init();
                    console.log('[CharactersManager] UI initialized');
                } catch (error) {
                    console.error('[CharactersManager] Error initializing UI:', error);
                    throw error;
                }
            }
            
            // Set up section observer for dynamic loading
            this.setupSectionObserver();
            
            this.initialized = true;
            console.log('[CharactersManager] Initialization complete');
            return true;
        } catch (error) {
            console.error('[CharactersManager] Error during initialization:', error);
            this.initialized = false;
            throw error;
        }
    }
    
    /**
     * Set up a mutation observer to detect when the characters section becomes visible
     * @private
     */
    setupSectionObserver() {
        const targetNode = document.getElementById('characters');
        if (!targetNode) {
            console.warn('[CharactersManager] Characters section not found, will retry on next render');
            return;
        }
        
        // Create an observer instance
        this.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    this.checkSectionVisibility();
                }
            });
        });
        
        // Start observing the target node for attribute changes
        this.observer.observe(targetNode, {
            attributes: true,
            attributeFilter: ['class']
        });
        
        // Initial check
        this.checkSectionVisibility();
    }
    
    /**
     * Check if the characters section is visible and initialize/cleanup accordingly
     * @private
     */
    checkSectionVisibility() {
        const section = document.getElementById('characters');
        if (!section) return;
        
        const isVisible = section.classList.contains('active');
        
        if (isVisible && !this.initialized) {
            console.log('[CharactersManager] Characters section became visible, initializing...');
            this.initialize().catch(error => {
                console.error('[CharactersManager] Error initializing after section became visible:', error);
            });
        } else if (!isVisible && this.initialized) {
            console.log('[CharactersManager] Characters section hidden, cleaning up...');
            this.cleanup();
        }
    }
    
    /**
     * Clean up resources when the characters section is hidden
     */
    cleanup() {
        console.log('[CharactersManager] Cleaning up...');
        
        if (this.characterUI) {
            this.characterUI.cleanup();
            this.characterUI = null;
        }
        
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        
        this.initialized = false;
        this._isRendering = false;
        console.log('[CharactersManager] Cleanup complete');
    }
    
    /**
     * Render the characters manager
     */
    render() {
        console.groupCollapsed('[CharactersManager] Render called');
        
        // Prevent re-rendering if we're already in the process of rendering
        if (this._isRendering) {
            console.log('[CharactersManager] Already rendering, skipping...');
            console.groupEnd();
            return;
        }
        
        this._isRendering = true;
        console.log('[CharactersManager] Starting render');
        
        try {
            if (!this.initialized) {
                this.initialize();
                return; // initialize will call render again when done
            }
            
            // Only render if the characters section is visible
            const section = document.getElementById('characters');
            if (section && section.classList.contains('active') && this.characterUI) {
                this.characterUI.refresh()
                    .catch(error => {
                        console.error('[CharactersManager] Error refreshing UI:', error);
                    });
                
                this.isRendered = true;
            }
        } catch (error) {
            console.error('[CharactersManager] Error during render:', error);
        } finally {
            this._isRendering = false;
            console.groupEnd();
        }
    }
    
    // Proxy methods to the service
    
    /**
     * Get all characters
     * @returns {Array<Object>} Array of characters
     */
    getAllCharacters() {
        return this.characterService.getAllCharacters();
    }
    
    /**
     * Get a character by ID
     * @param {string} id - Character ID
     * @returns {Object|undefined} The character or undefined if not found
     */
    getCharacterById(id) {
        return this.characterService.getCharacterById(id);
    }
    
    /**
     * Create a new character
     * @param {Object} characterData - Character data
     * @returns {Object} The created character
     */
    createCharacter(characterData) {
        return this.characterService.createCharacter(characterData);
    }
    
    /**
     * Update a character
     * @param {string} id - Character ID
     * @param {Object} updates - Updated character data
     * @returns {Object|undefined} Updated character or undefined if not found
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
     * Add an item to a character's inventory
     * @param {string} characterId - Character ID
     * @param {Object} item - Item to add
     * @returns {Object|undefined} Updated character or undefined if not found
     */
    addItemToInventory(characterId, item) {
        return this.characterService.addItemToInventory(characterId, item);
    }
    
    /**
     * Remove an item from a character's inventory
     * @param {string} characterId - Character ID
     * @param {string} itemId - Item ID to remove
     * @returns {Object|undefined} Updated character or undefined if not found
     */
    removeItemFromInventory(characterId, itemId) {
        return this.characterService.removeItemFromInventory(characterId, itemId);
    }
    
    /**
     * Add a quest to a character's active quests
     * @param {string} characterId - Character ID
     * @param {string} questId - Quest ID to add
     * @returns {Object|undefined} Updated character or undefined if not found
     */
    addActiveQuest(characterId, questId) {
        return this.characterService.addActiveQuest(characterId, questId);
    }
    
    /**
     * Mark a quest as completed for a character
     * @param {string} characterId - Character ID
     * @param {string} questId - Quest ID to complete
     * @returns {Object|undefined} Updated character or undefined if not found
     */
    completeQuest(characterId, questId) {
        return this.characterService.completeQuest(characterId, questId);
    }
    
    /**
     * Search characters by name or description
     * @param {string} query - Search query
     * @returns {Array<Object>} Filtered array of characters
     */
    searchCharacters(query) {
        return this.characterService.searchCharacters(query);
    }
    
    /**
     * Filter characters by class
     * @param {string} className - Class to filter by
     * @returns {Array<Object>} Filtered array of characters
     */
    filterByClass(className) {
        return this.characterService.filterByClass(className);
    }
    
    /**
     * Filter characters by level range
     * @param {number} minLevel - Minimum level (inclusive)
     * @param {number} maxLevel - Maximum level (inclusive)
     * @returns {Array<Object>} Filtered array of characters
     */
    filterByLevelRange(minLevel, maxLevel) {
        return this.characterService.filterByLevelRange(minLevel, maxLevel);
    }
}

export default CharactersManager;
