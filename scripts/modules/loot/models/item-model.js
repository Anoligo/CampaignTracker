// Use uuid from global window object
const { v4: uuidv4 } = window.uuid;
import { ItemType, ItemRarity, ItemCondition } from '../enums/loot-enums.js';

/**
 * Represents an item in the game
 */
export class Item {
    /**
     * Create a new Item
     * @param {string} name - The name of the item
     * @param {string} description - The description of the item
     * @param {string} type - The type of the item (from ItemType)
     * @param {string} rarity - The rarity of the item (from ItemRarity)
     * @param {number} quantity - The quantity of the item
     * @param {number} weight - The weight of the item in pounds
     * @param {number} value - The value of the item in copper pieces
     * @param {Object} properties - Additional properties of the item
     */
    constructor(
        name = '',
        description = '',
        type = ItemType.MISC,
        rarity = ItemRarity.COMMON,
        quantity = 1,
        weight = 0,
        value = 0,
        properties = {}
    ) {
        this.id = uuidv4();
        this.name = name;
        this.description = description;
        this.type = type;
        this.rarity = rarity;
        this.quantity = quantity;
        this.weight = weight;
        this.value = value;
        this.properties = properties;
        this.condition = ItemCondition.GOOD;
        this.attunement = false;
        this.attunedTo = '';
        this.notes = '';
        this.dateFound = new Date().toISOString();
        this.foundAt = '';
        this.obtainedFrom = '';
        this.imageUrl = '';
        this.tags = [];
        this.isMagic = false;
        this.requiresAttunement = false;
        this.charges = 0;
        this.maxCharges = 0;
        this.chargeType = '';
        this.damage = '';
        this.damageType = '';
        this.properties = {
            isCursed: false,
            isSentient: false,
            isArtifact: false,
            requiresAttunement: false,
            ...properties
        };
    }

    /**
     * Get the value of the item in a specific currency
     * @param {string} currency - The currency to convert to (from Currency)
     * @returns {number} The converted value
     */
    getValueInCurrency(currency) {
        const conversionRates = {
            'cp': 1,
            'sp': 10,
            'ep': 50,
            'gp': 100,
            'pp': 1000
        };

        const rate = conversionRates[currency] || 1;
        return Math.round((this.value / 100) * rate * 100) / 100;
    }

    /**
     * Get the total weight of the item (quantity * weight)
     * @returns {number} The total weight
     */
    getTotalWeight() {
        return this.quantity * this.weight;
    }

    /**
     * Get the display name of the item with quantity if greater than 1
     * @returns {string} The display name
     */
    getDisplayName() {
        return this.quantity > 1 ? `${this.name} (${this.quantity})` : this.name;
    }

    /**
     * Create an Item instance from a plain object
     * @param {Object} data - The object containing item data
     * @returns {Item} A new Item instance
     */
    static fromObject(data) {
        const item = new Item();
        Object.assign(item, data);
        return item;
    }

    /**
     * Convert the item to a plain object
     * @returns {Object} A plain object representation of the item
     */
    toJSON() {
        // Create a copy of the object to avoid modifying the original
        const obj = { ...this };
        // Remove any methods that shouldn't be serialized
        delete obj.getValueInCurrency;
        delete obj.getTotalWeight;
        delete obj.getDisplayName;
        return obj;
    }
}

export default Item;
