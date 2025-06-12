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
        this.ensureLootExists();
    }

    /**
     * Ensure the loot array exists in the state
     */
    ensureLootExists() {
        if (!Array.isArray(this.dataManager.appState.loot)) {
            this.dataManager.appState.loot = [];
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
        const item = new Item(
            data.name,
            data.description,
            data.type,
            data.rarity,
            data.quantity,
            data.weight,
            data.value,
            data.properties
        );

        return this.dataManager.add('loot', item);
    }

    /**
     * Update an existing item
     * @param {string} id - The ID of the item to update
     * @param {Object} updates - The updates to apply
     * @returns {Item|undefined} The updated item or undefined if not found
     */
    updateItem(id, updates) {
        return this.dataManager.update('loot', id, updates);
    }

    /**
     * Delete an item
     * @param {string} id - The ID of the item to delete
     * @returns {boolean} True if the item was deleted, false otherwise
     */
    deleteItem(id) {
        return this.dataManager.remove('loot', id);
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
