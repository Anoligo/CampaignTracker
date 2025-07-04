import { Item } from '../models/item-model.js';
import { ItemType, ItemRarity } from '../enums/loot-enums.js';

/**
 * Service for handling loot-related business logic
 */
export class LootService {
    /**
     * Create a new LootService instance
     * @param {Object} dataManager - The application's data manager with appState
     */
    constructor(dataManager) {
        if (!dataManager) {
            throw new Error('Data manager is required');
        }
        this.dataManager = dataManager;
        this.initializeLoot();
    }
    
    /**
     * Initialize loot data in the main app state
     * @private
     */
    initializeLoot() {
        try {
            console.log('LootService: Initializing loot data...');
            
            // Ensure appState is initialized
            if (!this.dataManager.appState) {
                throw new Error('appState is not available in dataManager');
            }
            
            // Initialize loot array if it doesn't exist
            if (!Array.isArray(this.dataManager.appState.loot)) {
                console.log('LootService: Initializing empty loot array in app state');
                this._updateLootState([]);
            }
            
            console.log('LootService: Initialized with', this.dataManager.appState.loot.length, 'items');
        } catch (error) {
            console.error('LootService: Error initializing loot data:', error);
            throw error;
        }
    }
    
    /**
     * Update the loot state in a consistent way
     * @param {Array} newLoot - The new loot array
     * @private
     */
    _updateLootState(newLoot) {
        if (typeof this.dataManager.updateState === 'function') {
            this.dataManager.updateState({ loot: [...newLoot] });
        } else if (this.dataManager.appState) {
            this.dataManager.appState.loot = newLoot;
            if (typeof this.dataManager.setState === 'function') {
                this.dataManager.setState({ loot: [...newLoot] });
            }
            this.dataManager.saveData?.();
        }
    }

    /**
     * Ensure the loot array exists in the state
     * @returns {Array} The current loot array
     */
    ensureLootExists() {
        try {
            console.log('LootService: Ensuring loot collection exists...');
            
            let loot = [];
            if (typeof this.dataManager.getAll === 'function') {
                try {
                    loot = this.dataManager.getAll('loot');
                } catch {
                    this.dataManager.updateState?.({ loot: [] });
                    loot = [];
                }
            } else if (Array.isArray(this.dataManager.appState?.loot)) {
                loot = this.dataManager.appState.loot;
            } else {
                this._updateLootState([]);
            }

            console.log('LootService: Loot collection initialized with', loot.length, 'items');
            return [...loot];
        } catch (error) {
            console.error('LootService: Error ensuring loot collection exists:', error);
            // Ensure we always have a valid array, even if there's an error
            this._updateLootState([]);
            return [];
        }
    }

    /**
     * Get all items
     * @returns {Array<Item>} A copy of the items array
     */
    getAllItems() {
        if (typeof this.dataManager.getAll === 'function') {
            return [...this.dataManager.getAll('loot')];
        }
        if (!Array.isArray(this.dataManager.appState.loot)) {
            this.ensureLootExists();
        }
        return [...this.dataManager.appState.loot];
    }

    /**
     * Get an item by ID
     * @param {string} id - The ID of the item to find
     * @returns {Item|undefined} The found item or undefined
     */
    getItemById(id) {
        if (typeof this.dataManager.getAll === 'function') {
            const loot = this.dataManager.getAll('loot');
            return loot.find(item => item.id === id);
        }
        if (!Array.isArray(this.dataManager.appState.loot)) {
            this.ensureLootExists();
        }
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
            this.ensureLootExists();
            
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

            if (typeof this.dataManager.add === 'function') {
                this.dataManager.add('loot', item, { generateId: false });
            } else {
                const current = this.dataManager.appState.loot || [];
                const updatedLoot = [...current, item];
                this._updateLootState(updatedLoot);
            }
            
            console.log('LootService: Item created successfully');
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
            if (typeof this.dataManager.update === 'function') {
                const result = this.dataManager.update('loot', id, updates);
                return result || undefined;
            }

            const index = this.dataManager.appState.loot.findIndex(item => item.id === id);
            if (index === -1) return undefined;

            const updatedItem = {
                ...this.dataManager.appState.loot[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };

            const updatedLoot = [
                ...this.dataManager.appState.loot.slice(0, index),
                updatedItem,
                ...this.dataManager.appState.loot.slice(index + 1)
            ];

            this._updateLootState(updatedLoot);
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
            if (typeof this.dataManager.remove === 'function') {
                const result = this.dataManager.remove('loot', id);
                return result;
            }

            const initialLength = this.dataManager.appState.loot.length;
            const updatedLoot = this.dataManager.appState.loot.filter(item => item.id !== id);

            const wasRemoved = updatedLoot.length < initialLength;

            if (wasRemoved) {
                this._updateLootState(updatedLoot);
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
        const loot = this.getAllItems();
        return loot.filter(item => item.type === type);
    }

    /**
     * Search items by name or description
     * @param {string} query - The search query
     * @returns {Array<Item>} Filtered array of items
     */
    searchItems(query) {
        if (!query) return this.getAllItems();
        
        const lowerQuery = query.toLowerCase();
        const loot = this.getAllItems();
        return loot.filter(item => 
            item.name.toLowerCase().includes(lowerQuery) || 
            (item.description && item.description.toLowerCase().includes(lowerQuery))
        );
    }

    /**
     * Get the total value of all items
     * @returns {number} The total value in copper pieces
     */
    getTotalValue() {
        const loot = this.getAllItems();
        return loot.reduce((total, item) => {
            return total + (item.value * (item.quantity || 1));
        }, 0);
    }

    /**
     * Get the total weight of all items
     * @returns {number} The total weight in pounds
     */
    getTotalWeight() {
        const loot = this.getAllItems();
        return loot.reduce((total, item) => {
            return total + (item.weight * (item.quantity || 1));
        }, 0);
    }


    /**
     * Get all items of a specific type
     * @param {string} type - The type of items to get
     * @returns {Array<Item>} Array of items of the specified type
     */
    getItemsByType(type) {
        return this.filterItemsByType(type);
    }

    /**
     * Get all items of a specific rarity
     * @param {string} rarity - The rarity of items to get
     * @returns {Array<Item>} Array of items of the specified rarity
     */
    getItemsByRarity(rarity) {
        const loot = this.getAllItems();
        return loot.filter(item => item.rarity === rarity);
    }

    /**
     * Get all magic items
     * @returns {Array<Item>} Array of magic items
     */
    getMagicItems() {
        const loot = this.getAllItems();
        return loot.filter(item => item.isMagic);
    }


    /**
     * Get all items that require attunement
     * @returns {Array<Item>} Array of items that require attunement
     */
    getAttunementItems() {
        const loot = this.getAllItems();
        return loot.filter(item => item.requiresAttunement);
    }

    /**
     * Get all items with a specific tag
     * @param {string} tag - The tag to filter by
     * @returns {Array<Item>} Array of items with the specified tag
     */
    getItemsByTag(tag) {
        const loot = this.getAllItems();
        return loot.filter(item => 
            item.tags && item.tags.includes(tag)
        );
    }

    /**
     * Get all unique tags from all items
     * @returns {Array<string>} Array of unique tags
     */
    getAllTags() {
        const loot = this.getAllItems();
        const tags = new Set();
        
        loot.forEach(item => {
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
        const loot = this.getAllItems();
        return loot.filter(item => item.attunedTo === characterId);
    }

    /**
     * Get all items that are currently not assigned to any character
     * @returns {Array<Item>} Array of unassigned items
     */
    getUnassignedItems() {
        const loot = this.getAllItems();
        return loot.filter(item => !item.attunedTo && !item.assignedTo);
    }

    /**
     * Get all items that are currently equipped
     * @returns {Array<Item>} Array of equipped items
     */
    getEquippedItems() {
        const loot = this.getAllItems();
        return loot.filter(item => item.equipped === true);
    }

    /**
     * Get all items that are currently in a specific container
     * @param {string} containerId - The ID of the container
     * @returns {Array<Item>} Array of items in the container
     */
    getItemsInContainer(containerId) {
        const loot = this.getAllItems();
        return loot.filter(item => item.containerId === containerId);
    }
}

export default LootService;
