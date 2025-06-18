/**
 * Players Manager
 * Main entry point for player-related functionality using the unified appState pattern
 */

import { PlayerService } from './services/player-service-new.js';
import { PlayerUI } from './ui/player-ui-new.js';
import { PlayerForms } from './ui/player-forms.js';

export class PlayersManager {
    /**
     * Create a new PlayersManager instance
     * @param {Object} dataManager - The application's data manager (DataService)
     * @param {boolean} isTest - Whether this is a test instance (prevents sample data creation)
     */
    constructor(dataManager, isTest = false) {
        console.log('[PlayersManager] Initializing with dataManager:', dataManager ? 'valid' : 'invalid');
        
        if (!dataManager) {
            throw new Error('Data manager is required');
        }
        
        this.dataManager = dataManager;
        this.playerService = new PlayerService(dataManager);
        this.playerUI = null;
        this.forms = null;
        this.initialized = false;
        this._isRendering = false;
        
        if (!isTest) {
            this.initialize();
        }
        
        console.log('[PlayersManager] Initialization complete');
    }
    
    /**
     * Initialize the players module
     * @returns {Promise<boolean>} True if initialization was successful
     */
    async initialize() {
        if (this.initialized) {
            console.log('[PlayersManager] Already initialized');
            return true;
        }
        
        console.log('[PlayersManager] Initializing...');
        
        try {
            // Initialize the UI if we're in a browser environment
            if (typeof document !== 'undefined') {
                try {
                    // Initialize the PlayerUI and PlayerForms
                    this.playerUI = new PlayerUI(this);
                    this.forms = new PlayerForms(this);
                    
                    // Set up event listeners
                    this.setupEventListeners();
                    
                    console.log('[PlayersManager] UI and forms initialized');
                } catch (error) {
                    console.error('[PlayersManager] Error initializing UI:', error);
                    throw error;
                }
            }
            
            // Set up section observer for dynamic loading
            this.setupSectionObserver();
            
            this.initialized = true;
            console.log('[PlayersManager] Initialization complete');
            return true;
        } catch (error) {
            console.error('[PlayersManager] Error during initialization:', error);
            this.initialized = false;
            throw error;
        }
    }
    
    /**
     * Set up a mutation observer to detect when the players section becomes visible
     * @private
     */
    setupSectionObserver() {
        const targetNode = document.getElementById('players');
        if (!targetNode) {
            console.warn('[PlayersManager] Players section not found, will retry on next render');
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
     * Check if the players section is visible and initialize/cleanup accordingly
     * @private
     */
    checkSectionVisibility() {
        const section = document.getElementById('players');
        if (!section) return;
        
        const isVisible = section.classList.contains('active');
        
        if (isVisible && !this.initialized) {
            console.log('[PlayersManager] Players section became visible, initializing...');
            this.initialize().catch(error => {
                console.error('[PlayersManager] Error initializing after section became visible:', error);
            });
        } else if (!isVisible && this.initialized) {
            console.log('[PlayersManager] Players section hidden, cleaning up...');
            this.cleanup();
        }
    }
    
    /**
     * Set up event listeners
     * @private
     */
    setupEventListeners() {
        console.log('[PlayersManager] Setting up event listeners');
        
        // Handle class filter clicks
        document.addEventListener('click', (e) => {
            const classFilterItem = e.target.closest('[data-class]');
            if (classFilterItem) {
                e.preventDefault();
                const className = classFilterItem.getAttribute('data-class');
                this.filterPlayersByClass(className);
            }
            
            // Handle new player button
            if (e.target.matches('#addPlayerBtn')) {
                e.preventDefault();
                this.forms?.showNewPlayerForm();
            }
        });
    }
    
    /**
     * Clean up resources when the players section is hidden
     */
    cleanup() {
        console.log('[PlayersManager] Cleaning up...');
        
        if (this.playerUI) {
            this.playerUI.cleanup();
            this.playerUI = null;
        }
        
        if (this.forms) {
            // If PlayerForms has a cleanup method, call it
            if (typeof this.forms.cleanup === 'function') {
                this.forms.cleanup();
            }
            this.forms = null;
        }
        
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        
        this.initialized = false;
        this._isRendering = false;
        console.log('[PlayersManager] Cleanup complete');
    }
    
    /**
     * Render the players manager
     */
    render() {
        console.groupCollapsed('[PlayersManager] Render called');
        
        // Prevent re-rendering if we're already in the process of rendering
        if (this._isRendering) {
            console.log('[PlayersManager] Already rendering, skipping...');
            console.groupEnd();
            return;
        }
        
        this._isRendering = true;
        console.log('[PlayersManager] Starting render');
        
        try {
            if (!this.initialized) {
                this.initialize();
                return; // initialize will call render again when done
            }
            
            // Only render if the players section is visible
            const section = document.getElementById('players');
            if (section && section.classList.contains('active') && this.playerUI) {
                this.playerUI.render()
                    .catch(error => {
                        console.error('[PlayersManager] Error refreshing UI:', error);
                    });
                
                this.isRendered = true;
            }
        } catch (error) {
            console.error('[PlayersManager] Error during render:', error);
        } finally {
            this._isRendering = false;
            console.groupEnd();
        }
    }
    
    // Player CRUD Operations
    
    /**
     * Get all players
     * @returns {Array<Object>} Array of players
     */
    getAllPlayers() {
        return this.playerService.getAllPlayers();
    }
    
    /**
     * Get a player by ID
     * @param {string} id - Player ID
     * @returns {Object|undefined} The player or undefined if not found
     */
    getPlayerById(id) {
        return this.playerService.getPlayerById(id);
    }
    
    /**
     * Create a new player
     * @param {Object} playerData - Player data
     * @returns {Object} The created player
     */
    createPlayer(playerData) {
        return this.playerService.createPlayer(playerData);
    }
    
    /**
     * Update a player
     * @param {string} id - Player ID
     * @param {Object} updates - Updated player data
     * @returns {Object|undefined} Updated player or undefined if not found
     */
    updatePlayer(id, updates) {
        return this.playerService.updatePlayer(id, updates);
    }
    
    /**
     * Delete a player
     * @param {string} id - Player ID
     * @returns {boolean} True if deleted, false if not found
     */
    deletePlayer(id) {
        return this.playerService.deletePlayer(id);
    }
    
    // Player-specific methods
    
    /**
     * Filter players by class
     * @param {string} className - Class to filter by
     */
    filterPlayersByClass(className) {
        if (!this.playerUI) return;
        
        const filteredPlayers = className 
            ? this.playerService.filterByClass(className)
            : this.getAllPlayers();
            
        this.playerUI.renderPlayerList(filteredPlayers);
    }
    
    /**
     * Search players by name or notes
     * @param {string} query - Search query
     * @returns {Array<Object>} Filtered array of players
     */
    searchPlayers(query) {
        return this.playerService.searchPlayers(query);
    }
    
    /**
     * Add an item to a player's inventory
     * @param {string} playerId - Player ID
     * @param {Object} item - Item to add
     * @returns {Object|undefined} Updated player or undefined if not found
     */
    addItemToInventory(playerId, item) {
        return this.playerService.addItemToInventory(playerId, item);
    }
    
    /**
     * Remove an item from a player's inventory
     * @param {string} playerId - Player ID
     * @param {string} itemId - Item ID to remove
     * @returns {Object|undefined} Updated player or undefined if not found
     */
    removeItemFromInventory(playerId, itemId) {
        return this.playerService.removeItemFromInventory(playerId, itemId);
    }
    
    /**
     * Add a condition to a player
     * @param {string} playerId - Player ID
     * @param {string} condition - Condition to add
     * @returns {Object|undefined} Updated player or undefined if not found
     */
    addCondition(playerId, condition) {
        return this.playerService.addCondition(playerId, condition);
    }
    
    /**
     * Remove a condition from a player
     * @param {string} playerId - Player ID
     * @param {string} condition - Condition to remove
     * @returns {Object|undefined} Updated player or undefined if not found
     */
    removeCondition(playerId, condition) {
        return this.playerService.removeCondition(playerId, condition);
    }
}

export default PlayersManager;
