import { LootService } from './services/loot-service-new.js';
import { LootUI } from './ui/index.js';

/**
 * Main manager for the Loot module
 * Coordinates between the service layer and UI components
 */
export class LootManager {
    /**
     * Create a new LootManager instance
     * @param {Object} appState - The application state object
     */
    constructor(appState) {
        console.log('[LootManager] Initializing with appState/dataService:', appState ? 'valid' : 'invalid');

        if (!appState) {
            throw new Error('appState is required');
        }

        if (appState && typeof appState.saveData === 'function') {
            // DataService instance provided
            this.dataManager = appState;
            this.appState = appState.exportState ? appState.exportState() : appState.appState;
        } else {
            this.appState = appState;
            this.dataManager = appState?.dataManager || appState?.dataService || {
                appState: appState,
                setState: (updates) => {
                    console.log('[LootManager] Updating state:', updates);
                    Object.assign(appState, updates);
                },
                saveData: () => {}
            };
        }
        
        console.log('[LootManager] Creating LootService');
        this.lootService = new LootService(this.dataManager);
        this.lootUI = null;
        this.initialized = false;
        this._isRendering = false;
        this._isRefreshing = false;
        
        // Initialize loot array if it doesn't exist
        try {
            const currentLoot = typeof this.dataManager.getAll === 'function'
                ? this.dataManager.getAll('loot')
                : this.dataManager.appState?.loot;
            if (!Array.isArray(currentLoot)) {
                if (typeof this.dataManager.updateState === 'function') {
                    this.dataManager.updateState({ loot: [] });
                } else if (this.dataManager.appState) {
                    this.dataManager.appState.loot = [];
                    this.dataManager.saveData?.();
                }
            }
        } catch (error) {
            console.error('[LootManager] Error ensuring loot array:', error);
        }
        
        console.log('[LootManager] Initialization complete');
    }
    
    /**
     * Initialize the loot manager
     * @returns {Promise<boolean>} True if initialization was successful
     */
    async initialize() {
        if (this.initialized) {
            console.log('[LootManager] Already initialized');
            return true;
        }
        
        console.log('[LootManager] Initializing...');
        
        try {
            // Initialize the UI
            this.lootUI = new LootUI(this.lootService, this.dataManager);
            await this.lootUI.init();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Set up observer for section visibility
            this.setupSectionObserver();
            
            this.initialized = true;
            console.log('[LootManager] Initialization complete');
            return true;
        } catch (error) {
            console.error('[LootManager] Error during initialization:', error);
            this.initialized = false;
            throw error;
        }
    }
    
    /**
     * Set up a mutation observer to detect when the loot section becomes visible
     * @private
     */
    setupSectionObserver() {
        const targetNode = document.getElementById('loot');
        if (!targetNode) {
            console.warn('[LootManager] Loot section not found, will retry on next render');
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
     * Check if the loot section is visible and initialize/cleanup accordingly
     * @private
     */
    checkSectionVisibility() {
        const lootSection = document.getElementById('loot');
        if (!lootSection) return;
        
        const isVisible = lootSection.classList.contains('active');
        
        if (isVisible && !this.initialized) {
            console.log('[LootManager] Loot section became visible, initializing...');
            this.initialize().catch(error => {
                console.error('[LootManager] Error initializing after section became visible:', error);
            });
        } else if (!isVisible && this.initialized) {
            console.log('[LootManager] Loot section hidden, cleaning up...');
            this.cleanup();
        }
    }
    
    /**
     * Set up event listeners
     * @private
     */
    setupEventListeners() {
        // Any global event listeners can go here
        console.log('[LootManager] Setting up event listeners');
    }
    
    /**
     * Clean up resources when the loot section is hidden
     */
    cleanup() {
        console.log('[LootManager] Cleaning up...');
        
        if (this.lootUI) {
            this.lootUI.cleanup();
        }
        
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        
        this.initialized = false;
        this._isRendering = false;
        console.log('[LootManager] Cleanup complete');
    }
    
    /**
     * Render the loot manager
     */
    render() {
        console.groupCollapsed('[LootManager] Render called');
        
        // Prevent re-rendering if we're already in the process of rendering
        if (this._isRendering) {
            console.log('[LootManager] Already rendering, skipping...');
            console.groupEnd();
            return;
        }
        
        this._isRendering = true;
        console.log('[LootManager] Starting render');
        
        try {
            if (!this.initialized) {
                this.initialize();
                return; // initialize will call render again when done
            }
            
            // Only render if the loot section is visible
            const lootSection = document.getElementById('loot');
            if (lootSection && lootSection.classList.contains('active') && this.lootUI) {
                // Only refresh if we're not already in the process of refreshing
                if (!this._isRefreshing) {
                    this._isRefreshing = true;
                    this.lootUI.refresh()
                        .finally(() => {
                            this._isRefreshing = false;
                        });
                }
                
                this.isRendered = true;
            }
        } catch (error) {
            console.error('[LootManager] Error during render:', error);
        } finally {
            this._isRendering = false;
            console.groupEnd();
        }
    }
    
    /**
     * Get the HTML element for this module
     * @returns {HTMLElement} The container element
     */
    getElement() {
        return document.getElementById('loot');
    }
    
    /**
     * Refresh the UI with the latest data
     */
    refresh() {
        if (this.initialized && this.lootUI) {
            this.lootUI.refresh();
        }
    }
    
    // Proxy methods to the service
    
    /**
     * Get all items
     * @returns {Array<Object>} Array of items
     */
    getAllItems() {
        return this.lootService.getAllItems();
    }
    
    /**
     * Get an item by ID
     * @param {string} id - The ID of the item to find
     * @returns {Object|undefined} The found item or undefined
     */
    getItemById(id) {
        return this.lootService.getItemById(id);
    }
    
    /**
     * Create a new item
     * @param {Object} data - The item data
     * @returns {Object} The created item
     */
    createItem(data) {
        return this.lootService.createItem(data);
    }
    
    /**
     * Update an existing item
     * @param {string} id - The ID of the item to update
     * @param {Object} updates - The updates to apply
     * @returns {Object|undefined} The updated item or undefined if not found
     */
    updateItem(id, updates) {
        return this.lootService.updateItem(id, updates);
    }
    
    /**
     * Delete an item
     * @param {string} id - The ID of the item to delete
     * @returns {boolean} True if the item was deleted, false otherwise
     */
    deleteItem(id) {
        return this.lootService.deleteItem(id);
    }
    
    /**
     * Search items by name or description
     * @param {string} query - The search query
     * @returns {Array<Object>} Filtered array of items
     */
    searchItems(query) {
        return this.lootService.searchItems(query);
    }
    
    /**
     * Filter items by type
     * @param {string} type - The type to filter by
     * @returns {Array<Object>} Filtered array of items
     */
    filterItemsByType(type) {
        return this.lootService.filterItemsByType(type);
    }
    
    /**
     * Get the total value of all items
     * @returns {number} The total value in copper pieces
     */
    getTotalValue() {
        return this.lootService.getTotalValue();
    }
    
    /**
     * Get the total weight of all items
     * @returns {number} The total weight in pounds
     */
    getTotalWeight() {
        return this.lootService.getTotalWeight();
    }
}

export default LootManager;
