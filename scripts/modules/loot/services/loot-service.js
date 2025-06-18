import { Item } from '../models/item-model.js';
import { ItemType, ItemRarity } from '../enums/loot-enums.js';

/**
 * Service for handling loot-related business logic
 */
export class LootService {
    /**
     * Create a new LootService instance
     * @param {Object} dataManager - The application's data manager
     */
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.STORAGE_KEY = 'campaign-tracker-loot';
        this.initializeFromStorage();
        this.ensureLootExists();
    }
    
    /**
     * Initialize data from local storage if available
     */
    initializeFromStorage() {
        try {
            console.log('LootService: Initializing from storage...');
            const savedData = localStorage.getItem(this.STORAGE_KEY);
            
            if (savedData) {
                console.log('LootService: Found saved data in storage');
                const parsedData = JSON.parse(savedData);
                
                // Only initialize if we have valid data
                if (parsedData && Array.isArray(parsedData.loot)) {
                    console.log('LootService: Initializing with', parsedData.loot.length, 'items from storage');
                    
                    // Update both appState and state manager
                    this.dataManager.appState.loot = parsedData.loot;
                    
                    // Ensure the state is properly updated through the data manager
                    if (typeof this.dataManager.setState === 'function') {
                        console.log('LootService: Updating state through setState');
                        this.dataManager.setState({ loot: [...parsedData.loot] });
                    }
                    
                    console.log('LootService: Initialized with', parsedData.loot.length, 'items');
                } else {
                    console.warn('LootService: Invalid data format in storage, initializing empty');
                    this._resetState();
                }
            } else {
                console.log('LootService: No saved data found, initializing empty');
                this._resetState();
            }
        } catch (error) {
            console.error('LootService: Error initializing from local storage:', error);
            // Initialize with empty array on error
            this._resetState();
        }
    }
    
    /**
     * Reset the state to empty
     * @private
     */
    _resetState() {
        this.dataManager.appState.loot = [];
        if (typeof this.dataManager.setState === 'function') {
            this.dataManager.setState({ loot: [] });
        }
        this.saveToStorage();
    }
    
    /**
     * Save the current state to local storage
     */
    saveToStorage() {
        try {
            // Ensure we have valid data to save
            const lootData = Array.isArray(this.dataManager.appState.loot) 
                ? this.dataManager.appState.loot 
                : [];
                
            const dataToSave = {
                loot: lootData,
                lastUpdated: new Date().toISOString()
            };
            
            console.log('LootService: Saving', lootData.length, 'items to storage');
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dataToSave));
            console.log('LootService: Data saved successfully');
        } catch (error) {
            console.error('LootService: Error saving to local storage:', error);
        }
    }

    /**
     * Ensure the loot array exists in the state
     */
    ensureLootExists() {
        try {
            console.log('LootService: Ensuring loot collection exists...');
            
            // Ensure appState is initialized
            if (!this.dataManager || !this.dataManager.appState) {
                console.error('LootService: Data manager or appState is not initialized');
                // Try to recover by initializing appState
                if (this.dataManager) {
                    this.dataManager.appState = this.dataManager.appState || {};
                } else {
                    throw new Error('Data manager is not available');
                }
            }

            // Initialize loot array if it doesn't exist or is invalid
            if (!Array.isArray(this.dataManager.appState.loot)) {
                console.log('LootService: Initializing or resetting loot collection');
                this.dataManager.appState.loot = [];
                
                // If using a state management system that requires explicit state updates
                if (typeof this.dataManager.setState === 'function') {
                    console.log('LootService: Updating state through setState');
                    this.dataManager.setState({ loot: [] });
                }
                
                // Save the empty array to storage
                this.saveToStorage();
            }
            
            console.log('LootService: Loot collection initialized with', this.dataManager.appState.loot.length, 'items');
            return this.dataManager.appState.loot;
        } catch (error) {
            console.error('LootService: Error ensuring loot collection exists:', error);
            // Ensure we always have a valid array, even if there's an error
            this.dataManager.appState.loot = [];
            this.saveToStorage();
            return [];
        }
    }

    /**
     * Get all items
     * @returns {Array<Item>} Array of items
     */
    getAllItems() {
        return [...this.dataManager.appState.loot];
    }

    /**
     * Get an item by ID
     * @param {string} id - The ID of the item to find
     * @returns {Item|undefined} The found item or undefined
     */
    getItemById(id) {
        return this.dataManager.appState.loot.find(item => item.id === id);
    }

    /**
     * Create a new item
     * @param {Object} data - The item data
     * @returns {Item} The created item
     */
    createItem(data) {
        try {
            console.log('LootService: Creating new item with data:', data);
            
            // Ensure loot array exists
            if (!Array.isArray(this.dataManager.appState.loot)) {
                console.log('LootService: Initializing empty loot array');
                this.dataManager.appState.loot = [];
            }
            
            // Create the item with proper defaults
            const item = new Item(
                data.name || 'Unnamed Item',
                data.description || '',
                data.type || 'miscellaneous',
                data.rarity || 'common',
                data.quantity || 1,
                data.weight || 0,
                data.value || 0,
                data.properties || {}
            );

            // Generate a unique ID if not provided
            if (!item.id) {
                item.id = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            }
            
            console.log('LootService: Created item with ID:', item.id);

            // Create a new array with the new item
            const updatedLoot = [...this.dataManager.appState.loot, item];
            
            // Update both appState and state manager
            this.dataManager.appState.loot = updatedLoot;
            
            // Trigger state update
            if (typeof this.dataManager.setState === 'function') {
                console.log('LootService: Updating state with new item');
                this.dataManager.setState({ loot: [...updatedLoot] });
            }
            
            // Save to local storage
            this.saveToStorage();
            
            console.log('LootService: Item created and saved successfully');
            return item;
        } catch (error) {
            console.error('LootService: Error creating item:', error);
            throw error;
        }
    }

    /**
     * Update an existing item
     * @param {string} id - The ID of the item to update
     * @param {Object} updates - The updates to apply to the item
     * @returns {Item|undefined} The updated item or undefined if not found
     */
    updateItem(id, updates) {
        try {
            const index = this.dataManager.appState.loot.findIndex(item => item.id === id);
            if (index === -1) return undefined;

            // Create a new item with the updated data
            const updatedItem = {
                ...this.dataManager.appState.loot[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };

            // Update the item in the array
            this.dataManager.appState.loot = [
                ...this.dataManager.appState.loot.slice(0, index),
                updatedItem,
                ...this.dataManager.appState.loot.slice(index + 1)
            ];

            // Trigger state update if available
            if (typeof this.dataManager.setState === 'function') {
                this.dataManager.setState({ loot: [...this.dataManager.appState.loot] });
            }
            
            // Save to local storage
            this.saveToStorage();

            return updatedItem;
        } catch (error) {
            console.error(`Error updating item ${id}:`, error);
            throw error;
        }
    }

    /**
     * Delete an item by ID
     * @param {string} id - The ID of the item to delete
     * @returns {boolean} True if the item was deleted, false otherwise
     */
    deleteItem(id) {
        try {
            const initialLength = this.dataManager.appState.loot.length;
            this.dataManager.appState.loot = this.dataManager.appState.loot.filter(item => item.id !== id);
            
            // Only update state if something was actually removed
            const wasRemoved = this.dataManager.appState.loot.length < initialLength;
            
            if (wasRemoved) {
                if (typeof this.dataManager.setState === 'function') {
                    this.dataManager.setState({ loot: [...this.dataManager.appState.loot] });
                }
                // Save to local storage
                this.saveToStorage();
            }
            
            return wasRemoved;
        } catch (error) {
            console.error(`Error deleting item ${id}:`, error);
            throw error;
        }
    }

    /**
     * Filter items by type
     * @param {string} type - The type to filter by
     * @returns {Array<Item>} Filtered array of items
     */
    filterItemsByType(type) {
        if (!type) return this.getAllItems();
        return this.dataManager.appState.loot.filter(item => item.type === type);
    }

    /**
     * Search items by name or description
     * @param {string} query - The search query
     * @returns {Array<Item>} Filtered array of items
     */
    searchItems(query) {
        if (!query) return this.getAllItems();
        
        const lowerQuery = query.toLowerCase();
        return this.dataManager.appState.loot.filter(item => 
            item.name.toLowerCase().includes(lowerQuery) || 
            (item.description && item.description.toLowerCase().includes(lowerQuery))
        );
    }

    /**
     * Get the total value of all items
     * @returns {number} The total value in copper pieces
     */
    getTotalValue() {
        return this.dataManager.appState.loot.reduce((total, item) => {
            return total + (item.value * (item.quantity || 1));
        }, 0);
    }

    /**
     * Get the total weight of all items
     * @returns {number} The total weight in pounds
     */
    getTotalWeight() {
        return this.dataManager.appState.loot.reduce((total, item) => {
            return total + (item.weight * (item.quantity || 1));
        }, 0);
    }


    /**
     * Get all items of a specific type
     * @param {string} type - The type of items to get
     * @returns {Array<Item>} Array of items of the specified type
     */
    getItemsByType(type) {
        return this.dataManager.appState.loot.filter(item => item.type === type);
    }

    /**
     * Get all items of a specific rarity
     * @param {string} rarity - The rarity of items to get
     * @returns {Array<Item>} Array of items of the specified rarity
     */
    getItemsByRarity(rarity) {
        return this.dataManager.appState.loot.filter(item => item.rarity === rarity);
    }

    /**
     * Get all magic items
     * @returns {Array<Item>} Array of magic items
     */
    getMagicItems() {
        return this.dataManager.appState.loot.filter(item => item.isMagic);
    }


    /**
     * Get all items that require attunement
     * @returns {Array<Item>} Array of items that require attunement
     */
    getAttunementItems() {
        return this.dataManager.appState.loot.filter(item => item.requiresAttunement);
    }

    /**
     * Get all items with a specific tag
     * @param {string} tag - The tag to filter by
     * @returns {Array<Item>} Array of items with the specified tag
     */
    getItemsByTag(tag) {
        return this.dataManager.appState.loot.filter(item => 
            item.tags && item.tags.includes(tag)
        );
    }

    /**
     * Get all unique tags from all items
     * @returns {Array<string>} Array of unique tags
     */
    getAllTags() {
        const tags = new Set();
        this.dataManager.appState.loot.forEach(item => {
            if (item.tags && Array.isArray(item.tags)) {
                item.tags.forEach(tag => tags.add(tag));
            }
        });
        return Array.from(tags).sort();
    }

    /**
     * Get all items that are currently attuned to a specific character
     * @param {string} characterId - The ID of the character
     * @returns {Array<Item>} Array of items attuned to the character
     */
    getAttunedItems(characterId) {
        return this.dataManager.appState.loot.filter(item => 
            item.attunedTo === characterId
        );
    }

    /**
     * Get all items that are currently not assigned to any character
     * @returns {Array<Item>} Array of unassigned items
     */
    getUnassignedItems() {
        return this.dataManager.appState.loot.filter(item => 
            !item.attunedTo && !item.assignedTo
        );
    }

    /**
     * Get all items that are currently equipped
     * @returns {Array<Item>} Array of equipped items
     */
    getEquippedItems() {
        return this.dataManager.appState.loot.filter(item => 
            item.equipped === true
        );
    }

    /**
     * Get all items that are currently in a specific container
     * @param {string} containerId - The ID of the container
     * @returns {Array<Item>} Array of items in the container
     */
    getItemsInContainer(containerId) {
        return this.dataManager.appState.loot.filter(item => 
            item.containerId === containerId
        );
    }
}

export default LootService;
