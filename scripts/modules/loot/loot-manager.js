import { LootService } from './services/loot-service.js';
import { LootUI } from './ui/index.js';

/**
 * Main manager for the Loot module
 * Coordinates between the service layer and UI components
 */
export class LootManager {
    /**
     * Check if the loot section is currently visible
     * @returns {boolean} True if the loot section is visible
     */
    static isLootSectionVisible() {
        const lootSection = document.getElementById('loot');
        return lootSection && lootSection.style.display !== 'none';
    }
    
    /**
     * Create a new LootManager instance
     * @param {Object} appState - The application state object
     */
    constructor(appState) {
        console.log('[LootManager] Initializing with appState:', appState ? 'valid' : 'invalid');
        this.appState = appState;
        
        // Initialize data manager if not provided
        this.dataManager = appState.dataManager || {
            appState: appState,
            setState: (updates) => {
                console.log('[LootManager] Updating state:', updates);
                Object.assign(appState, updates);
            }
        };
        
        console.log('[LootManager] Creating LootService');
        this.lootService = new LootService(this.dataManager);
        this.lootUI = null;
        this.initialized = false;
        this._isRendering = false;
        this._isRefreshing = false;
        
        console.log('[LootManager] Initialization complete');
        
        // Initialize loot array if it doesn't exist
        if (!this.dataManager.appState.loot) {
            this.dataManager.appState.loot = [];
        }
    }
    
    /**
     * Set up a mutation observer to detect when the loot section becomes visible
     */
    setupSectionObserver() {
        const lootSection = document.getElementById('loot');
        if (!lootSection) return;
        
        // Create an observer instance
        this.observer = new MutationObserver((mutations) => {
            this.checkSectionVisibility();
        });
        
        // Start observing the loot section for attribute changes
        this.observer.observe(lootSection, { attributes: true, attributeFilter: ['style'] });
    }
    
    /**
     * Check if the loot section is visible and initialize/cleanup accordingly
     */
    checkSectionVisibility() {
        const isVisible = LootManager.isLootSectionVisible();
        if (isVisible) {
            if (!this.lootUI || !this.lootUI.isRendered) {
                this.initialize();
            }
        } else if (this.lootUI && this.lootUI.isRendered) {
            this.cleanup();
        }
    }
    
    /**
     * Set up event listeners for the loot module
     */
    setupEventListeners() {
        console.log('[LootManager] Setting up event listeners');
        // The LootUI handles its own DOM event listeners
    }
    
    /**
     * Fallback event listener setup in case the normal setup fails
     * @private
     */
    _setupFallbackEventListeners() {
        console.log('[LootManager] Setting up fallback event listeners');
        
        // Add button in the header
        const addButton = document.getElementById('addItemBtn');
        if (addButton) {
            console.log('[LootManager] Found add button in fallback setup');
            addButton.addEventListener('click', (e) => {
                console.log('[LootManager] Add button clicked (fallback)');
                if (this.lootUI && typeof this.lootUI.handleAdd === 'function') {
                    this.lootUI.handleAdd(e);
                }
            });
        } else {
            console.warn('[LootManager] Could not find add button in fallback setup');
        }
    }
    
    /**
     * Ensure the form container exists in the DOM
     * @private
     */
    _ensureFormContainer() {
        console.log('[LootManager] Ensuring form container exists...');
        
        // Check if the form container already exists
        let formContainer = document.getElementById('lootFormContainer');
        
        if (!formContainer) {
            console.log('[LootManager] Form container not found, creating one...');
            
            // Find the loot details container
            const detailsContainer = document.querySelector('.loot-details-container');
            
            if (detailsContainer) {
                // Create the form container
                formContainer = document.createElement('div');
                formContainer.id = 'lootFormContainer';
                formContainer.className = 'loot-form-container';
                formContainer.style.display = 'none';
                
                // Insert the form container before the details container
                detailsContainer.parentNode.insertBefore(formContainer, detailsContainer);
                console.log('[LootManager] Form container created');
            } else {
                console.error('[LootManager] Could not find loot details container to insert form');
            }
        } else {
            console.log('[LootManager] Form container already exists');
        }
        
        return formContainer;
    }
    
    /**
     * Initialize the loot manager
     * @returns {Promise<boolean>} True if initialization was successful
     */
    async initialize() {
        console.groupCollapsed('[LootManager] Initializing...');
        
        if (this.initialized) {
            console.log('[LootManager] Already initialized, skipping...');
            console.groupEnd();
            return true;
        }
        
        try {
            // Wait for the DOM to be fully loaded
            if (document.readyState !== 'complete') {
                console.log('[LootManager] Waiting for DOM to be ready...');
                await new Promise(resolve => {
                    if (document.readyState === 'complete') {
                        resolve();
                    } else {
                        window.addEventListener('load', resolve);
                    }
                });
            }
            
            console.log('[LootManager] Document readyState:', document.readyState);
            
            // Find or create the loot section
            let container = document.getElementById('loot');
            
            if (!container) {
                console.warn('[LootManager] Loot section not found, creating one...');
                container = document.createElement('div');
                container.id = 'loot';
                container.className = 'section';
                document.body.appendChild(container);
            }
            
            this.container = container;
            console.log('[LootManager] Loot container:', container);
            
            // Ensure the form container exists
            this._ensureFormContainer();
            
            // Set up section observer to handle dynamic loading
            this.setupSectionObserver();
            
            // Initialize the LootUI with the service
            console.log('[LootManager] Initializing LootUI');
            this.lootUI = new LootUI(this.lootService, this.dataManager);
            
            // Set up event listeners
            console.log('[LootManager] Setting up event listeners');
            this.setupEventListeners();
            
            // Initial render
            console.log('[LootManager] Performing initial render');
            if (this.lootUI && typeof this.lootUI.init === 'function') {
                await this.lootUI.init();
                await this.lootUI.refresh();
            } else {
                console.warn('[LootManager] LootUI does not have an init method, proceeding without it');
            }
            
            this.initialized = true;
            console.log('[LootManager] Initialization complete');
            console.groupEnd();
            return true;
        } catch (error) {
            console.error('[LootManager] Error during initialization:', error);
            console.groupEnd();
            throw error;
        }
    }
    
    /**
     * Clean up resources when the loot section is hidden
     */
    cleanup() {
        console.log('[LootManager] Cleaning up...');
        
        if (!this.initialized) {
            console.log('[LootManager] Not initialized, nothing to clean up');
            return;
        }
        
        // Clean up LootUI instance
        if (this.lootUI) {
            console.log('[LootManager] Cleaning up LootUI instance');
            if (typeof this.lootUI.cleanup === 'function') {
                this.lootUI.cleanup();
            }
            this.lootUI = null;
        }
        
        // Clean up container
        if (this.container) {
            console.log('[LootManager] Removing container from DOM');
            this.container.remove();
            this.container = null;
        }
        
        // Clean up observer if it exists
        if (this.observer) {
            console.log('[LootManager] Disconnecting observer');
            this.observer.disconnect();
            this.observer = null;
        }
        
        this.initialized = false;
        this.isRendered = false;
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
                // Make sure we're rendering into the correct container
                if (this.container !== lootSection) {
                    // If the container is not the loot section, clear it and use the loot section
                    console.log('[LootManager] Updating container to loot section');
                    this.container = lootSection;
                }
                
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
        return this.container;
    }
    
    /**
     * Refresh the UI with the latest data
     */
    refresh() {
        if (this.initialized && this.lootUI) {
            this.lootUI.refresh();
        }
    }
    
    /**
     * Initialize the loot section
     */
    initializeLootSection() {
        this.render();
    }
    
    // Item management methods
    
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
     * Filter items by search query
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
