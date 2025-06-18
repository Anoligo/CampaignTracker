import { Item } from '../models/item-model.js';
import { ItemType, ItemRarity } from '../enums/loot-enums.js';

/**
 * Service for handling loot-related business logic
 */
export class LootService {
    /**
     * Create a new LootService instance
     * @param {Object} dataManager - The application's data manager (DataService)
     */
    constructor(dataManager) {
        if (!dataManager) {
            throw new Error('Data manager is required');
        }
        
        this.dataManager = dataManager;
        this.initialize();
    }
    
    /**
     * Initialize the service
     * @private
     */
    initialize() {
        // Ensure loot array exists in appState
        if (!Array.isArray(this.dataManager.appState.loot)) {
            this.dataManager.appState.loot = [];
            this._saveState();
        }
    }
    
    /**
     * Save the current state
     * @private
     */
    _saveState() {
        try {
            this.dataManager.saveData();
            return true;
        } catch (error) {
            console.error('Error saving state:', error);
            return false;
        }
    }
    
    /**
     * Get all items
     * @returns {Array<Item>} Array of items
     */
    getAllItems() {
        return [...(this.dataManager.appState.loot || [])];
    }
    
    /**
     * Get an item by ID
     * @param {string} id - The ID of the item to find
     * @returns {Item|undefined} The found item or undefined
     */
    getItemById(id) {
        return this.dataManager.appState.loot?.find(item => item.id === id);
    }
    
    /**
     * Create a new item
     * @param {Object} data - The item data
     * @returns {Item} The created item
     */
    createItem(data) {
        try {
            if (!data) {
                throw new Error('Item data is required');
            }
            
            // Ensure loot array exists
            if (!Array.isArray(this.dataManager.appState.loot)) {
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
            
            // Add to the loot array
            this.dataManager.appState.loot = [
                ...this.dataManager.appState.loot,
                item
            ];
            
            // Save the state
            if (!this._saveState()) {
                throw new Error('Failed to save item');
            }
            
            return item;
        } catch (error) {
            console.error('Error creating item:', error);
            throw error;
        }
    }
    
    /**
     * Update an existing item
     * @param {string} id - The ID of the item to update
     * @param {Object} updates - The updates to apply
     * @returns {Item|undefined} The updated item or undefined if not found
     */
    updateItem(id, updates) {
        try {
            if (!id || !updates) {
                throw new Error('ID and updates are required');
            }
            
            const index = this.dataManager.appState.loot?.findIndex(item => item.id === id) ?? -1;
            if (index === -1) {
                console.warn(`Item with ID ${id} not found`);
                return undefined;
            }
            
            // Create updated item
            const updatedItem = {
                ...this.dataManager.appState.loot[index],
                ...updates,
                id, // Ensure ID doesn't change
                updatedAt: new Date().toISOString()
            };
            
            // Update the array
            const updatedLoot = [...this.dataManager.appState.loot];
            updatedLoot[index] = updatedItem;
            this.dataManager.appState.loot = updatedLoot;
            
            // Save the state
            if (!this._saveState()) {
                throw new Error('Failed to update item');
            }
            
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
            if (!id) {
                throw new Error('ID is required');
            }
            
            const initialLength = this.dataManager.appState.loot?.length || 0;
            this.dataManager.appState.loot = this.dataManager.appState.loot?.filter(item => item.id !== id) || [];
            
            if (this.dataManager.appState.loot.length === initialLength) {
                console.warn(`Item with ID ${id} not found`);
                return false;
            }
            
            // Save the state
            if (!this._saveState()) {
                throw new Error('Failed to delete item');
            }
            
            return true;
        } catch (error) {
            console.error(`Error deleting item ${id}:`, error);
            throw error;
        }
    }
    
    // Additional utility methods...
    
    /**
     * Filter items by type
     * @param {string} type - The type to filter by
     * @returns {Array<Item>} Filtered array of items
     */
    filterItemsByType(type) {
        if (!type) return [];
        return this.dataManager.appState.loot?.filter(item => item.type === type) || [];
    }
    
    /**
     * Search items by name or description
     * @param {string} query - The search query
     * @returns {Array<Item>} Filtered array of items
     */
    searchItems(query) {
        if (!query) return [];
        const q = query.toLowerCase();
        return this.dataManager.appState.loot?.filter(item => 
            (item.name && item.name.toLowerCase().includes(q)) ||
            (item.description && item.description.toLowerCase().includes(q))
        ) || [];
    }
    
    /**
     * Get the total value of all items
     * @returns {number} The total value in copper pieces
     */
    getTotalValue() {
        return this.dataManager.appState.loot?.reduce((sum, item) => sum + (item.value || 0), 0) || 0;
    }
    
    /**
     * Get the total weight of all items
     * @returns {number} The total weight in pounds
     */
    getTotalWeight() {
        return this.dataManager.appState.loot?.reduce((sum, item) => sum + (item.weight || 0), 0) || 0;
    }
}

export default LootService;
