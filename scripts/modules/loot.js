/**
 * @file Loot module compatibility layer
 * @deprecated Please use the new modular structure from ./loot/
 * This file provides backward compatibility with the old implementation.
 */

// Import the new modular components
import { LootManager as NewLootManager, Item, LootEnums } from './loot/index.js';

// Re-export enums for backward compatibility
export const ItemType = LootEnums.ItemType;
export const ItemRarity = LootEnums.ItemRarity;

/**
 * @deprecated Please use the new modular structure from ./loot/
 * This class is a compatibility layer that delegates to the new implementation.
 */
export class LootManager {
    /**
     * Create a new LootManager instance
     * @param {Object} dataManager - The application's data manager
     */
    constructor(dataManager) {
        console.warn('The LootManager class is deprecated. Please use the new modular structure from ./loot/');
        this._impl = new NewLootManager(dataManager, document.getElementById('loot'));
    }

    /**
     * Initialize the loot manager
     * @returns {void}
     */
    initialize() {
        return this._impl.initialize();
    }

    /**
     * Initialize the loot section (legacy method)
     * @deprecated Use initialize() instead
     * @returns {void}
     */
    initializeLootSection() {
        console.warn('initializeLootSection() is deprecated. Use initialize() instead.');
        return this.initialize();
    }

    /**
     * Render the loot interface
     * @returns {void}
     */
    render() {
        return this._impl.render();
    }

    /**
     * Get the root element
     * @returns {HTMLElement} The root element
     */
    getElement() {
        return this._impl.getElement();
    }

    /**
     * Refresh the loot interface
     * @returns {void}
     */
    refresh() {
        return this._impl.refresh();
    }

    /**
     * Show the new item form
     * @returns {void}
     */
    showNewItemForm() {
        return this._impl.lootUI?.showAddItemForm();
    }

    /**
     * Add an effect to an item
     * @param {string} itemId - The ID of the item
     * @param {string} effect - The effect to add
     * @returns {void}
     */
    addEffect(itemId, effect) {
        return this._impl.lootService?.addEffect(itemId, effect);
    }

    /**
     * Update an item's location
     * @param {string} itemId - The ID of the item
     * @param {string} location - The new location
     * @returns {void}
     */
    updateItemLocation(itemId, location) {
        return this._impl.lootService?.updateItemLocation(itemId, location);
    }

    /**
     * Get the ItemType enum
     * @static
     * @returns {Object} The ItemType enum
     */
    static get ItemType() {
        return ItemType;
    }

    /**
     * Get the ItemRarity enum
     * @static
     * @returns {Object} The ItemRarity enum
     */
    static get ItemRarity() {
        return ItemRarity;
    }
}

// Re-export the Item class for backward compatibility
export { Item };

// Default export for backward compatibility
export default {
    LootManager,
    Item,
    ItemType,
    ItemRarity
};
