/**
 * Utility functions for the Loot UI
 */

import { ItemRarity } from '../enums/loot-enums.js';

/**
 * Format a currency value
 * @param {number} value - Value in copper pieces
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value) {
    if (value === undefined || value === null) return '0 gp';
    
    const gold = Math.floor(value);
    const silver = Math.floor((value - gold) * 10);
    const copper = Math.floor(((value - gold) * 10 - silver) * 10);
    
    if (gold === 0 && silver === 0) {
        return `${copper} cp`;
    } else if (gold === 0) {
        return `${silver} sp`;
    } else {
        return `${gold} gp`;
    }
}

/**
 * Get the color for a rarity
 * @param {string} rarity - Rarity value
 * @returns {string} Color hex code
 */
export function getRarityColor(rarity) {
    if (!rarity) return '#ffffff';
    
    const colors = {
        [ItemRarity.COMMON]: '#ffffff',
        [ItemRarity.UNCOMMON]: '#1eff00',
        [ItemRarity.RARE]: '#0070dd',
        [ItemRarity.VERY_RARE]: '#a335ee',
        [ItemRarity.LEGENDARY]: '#ff8000',
        [ItemRarity.ARTIFACT]: '#e6cc80',
    };
    
    return colors[rarity] || '#ffffff';
}

/**
 * Format an enum value for display
 * @param {string} value - Enum value to format
 * @returns {string} Formatted string
 */
export function formatEnumValue(value) {
    if (!value) return '';
    return value
        .toLowerCase()
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
