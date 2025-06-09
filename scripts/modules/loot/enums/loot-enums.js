/**
 * Enums for the Loot module
 */

/**
 * Enum for item types
 * @readonly
 * @enum {string}
 */
export const ItemType = {
    WEAPON: 'weapon',
    ARMOR: 'armor',
    CONSUMABLE: 'consumable',
    TREASURE: 'treasure',
    QUEST: 'quest',
    MISC: 'misc'
};

/**
 * Enum for item rarities
 * @readonly
 * @enum {string}
 */
export const ItemRarity = {
    COMMON: 'common',
    UNCOMMON: 'uncommon',
    RARE: 'rare',
    VERY_RARE: 'very rare',
    LEGENDARY: 'legendary',
    ARTIFACT: 'artifact'
};

/**
 * Enum for item conditions
 * @readonly
 * @enum {string}
 */
export const ItemCondition = {
    PRISTINE: 'pristine',
    GOOD: 'good',
    USED: 'used',
    WORN: 'worn',
    DAMAGED: 'damaged',
    BROKEN: 'broken'
};

/**
 * Enum for currencies
 * @readonly
 * @enum {string}
 */
export const Currency = {
    COPPER: 'cp',
    SILVER: 'sp',
    ELECTRUM: 'ep',
    GOLD: 'gp',
    PLATINUM: 'pp'
};

export default {
    ItemType,
    ItemRarity,
    ItemCondition,
    Currency
};
