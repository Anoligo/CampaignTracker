import { LootService } from './services/loot-service.js';
import { LootUI } from './ui/loot-ui-new.js';

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
     * @param {Object} dataManager - The application's data manager
     * @param {HTMLElement} container - The container element for the UI
     */
    constructor(dataManager, container) {
        this.dataManager = dataManager;
        this.container = container || document.createElement('div');
        this.container.className = 'loot-module';
        this.initialized = false;
        this.isRendered = false;
        
        // Initialize services
        this.lootService = new LootService(dataManager);
        this.lootUI = null;
        
        // Initialize loot array if it doesn't exist
        if (!dataManager.appState.loot) {
            dataManager.appState.loot = [];
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
        // Add any global event listeners here
        // The LootUI handles its own DOM event listeners
    }
    
    /**
     * Initialize the loot manager
     */
    initialize() {
        console.log('Initializing LootManager...');
        if (this.initialized) {
            console.log('LootManager already initialized');
            return;
        }
        
        this.initialized = true;
        console.log('LootManager initialization started');
        
        try {
            // Get or create the container
            let container = document.getElementById('loot-container');
            if (!container) {
                console.log('Creating loot container element');
                container = document.createElement('div');
                container.id = 'loot-container';
                container.className = 'section';
                
                // Add the container to the main content area
                const mainContent = document.querySelector('main') || document.body;
                mainContent.appendChild(container);
                
                // Create the basic structure
                container.innerHTML = `
                    <div class="container-fluid p-0">
                        <div class="row g-3">
                            <div class="col-md-4">
                                <div class="card h-100">
                                    <div class="card-header d-flex justify-content-between align-items-center">
                                        <h5 class="mb-0">Loot Items</h5>
                                        <button id="addItemBtn" class="btn btn-sm btn-primary">
                                            <i class="fas fa-plus me-1"></i> Add Item
                                        </button>
                                    </div>
                                    <div class="card-body p-0">
                                        <div class="input-group p-2">
                                            <span class="input-group-text">
                                                <i class="fas fa-search"></i>
                                            </span>
                                            <input type="text" id="lootManagerItemSearch" class="form-control" placeholder="Search items..." data-search-type="loot-manager">
                                        </div>
                                        <div id="itemList" class="list-group list-group-flush" style="max-height: 70vh; overflow-y: auto;">
                                            <!-- Items will be rendered here -->
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-8">
                                <div id="itemDetails" class="card h-100">
                                    <div class="card-body d-flex align-items-center justify-content-center" style="min-height: 200px;">
                                        <div class="text-center text-muted">
                                            <i class="fas fa-arrow-left me-2"></i>
                                            Select an item to view or edit
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            this.container = container;
            console.log('Loot container:', this.container);
            
            // Initialize the UI
            console.log('Initializing LootUI...');
            this.lootUI = new LootUI(this.lootService, this.dataManager);
            
            // Initialize the UI components
            if (this.lootUI.init) {
                this.lootUI.init();
                console.log('LootUI initialized');
                
                // Force a refresh to load initial data
                this.lootUI.refresh();
            } else {
                console.error('LootUI does not have an init method');
            }
            
            // Set up event listeners
            console.log('Setting up event listeners...');
            this.setupEventListeners();
            
            // Initial render
            console.log('Performing initial render...');
            this.render();
            
            this.isRendered = true;
            console.log('LootManager initialization completed successfully');
        } catch (error) {
            console.error('Error initializing LootManager:', error);
            throw error;
        }
    }
    
    /**
     * Clean up resources when the loot section is hidden
     */
    cleanup() {
        if (!this.initialized) return;
        
        if (this.lootUI) {
            this.lootUI.cleanup();
            this.lootUI = null;
        }
        
        // Don't modify the container's display here - let the navigation manager handle it
        
        this.initialized = false;
        this.isRendered = false;
    }
    
    /**
     * Render the loot manager
     */
    render() {
        if (!this.initialized) {
            this.initialize();
        }
        
        // Only render if the loot section is visible
        const lootSection = document.getElementById('loot');
        if (lootSection && lootSection.classList.contains('active') && this.lootUI) {
            // Make sure we're rendering into the correct container
            if (this.container !== lootSection) {
                // If the container is not the loot section, clear it and use the loot section
                this.container = lootSection;
                this.lootUI.container = lootSection;
            }
            
            this.lootUI.refresh();
            this.isRendered = true;
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
