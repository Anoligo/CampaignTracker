/**
 * Style utilities for consistent UI styling across components
 * These utilities help ensure that all UI elements follow the Iron Meridian style guide
 */

/**
 * Get the badge class for an item rarity
 * @param {string} rarity - The rarity value
 * @returns {string} The badge class name
 */
export function getRarityBadgeClass(rarity) {
    if (!rarity) return 'rarity-common';
    
    // Convert the rarity to a standardized format for CSS classes
    // Replace spaces and underscores with hyphens for valid CSS class names
    const normalizedRarity = rarity.toLowerCase().replace(/[_\s]+/g, '-');
    return `rarity-${normalizedRarity}`;
}

/**
 * Get the color for an item rarity
 * @param {string} rarity - The rarity value
 * @returns {string} The color value
 */
export function getRarityColor(rarity) {
    if (!rarity) return '#aaaaaa'; // Default gray for unknown rarity
    
    const colors = {
        'common': '#aaaaaa',
        'uncommon': '#1a9172',
        'rare': '#3f51b5',
        'very_rare': '#9c27b0',
        'legendary': '#ff9800',
        'artifact': '#e91e63',
        'unique': '#ffd966'
    };
    
    // Normalize the rarity key
    const key = rarity.toLowerCase().replace(/[\s-]+/g, '_');
    
    return colors[key] || colors.common;
}

/**
 * Get the badge class for a quest type
 * @param {string} type - The quest type
 * @returns {string} The badge class name
 */
export function getQuestTypeBadgeClass(type) {
    const classes = {
        'MAIN': 'primary',
        'SIDE': 'info',
        'GUILD': 'warning',
        'PERSONAL': 'success',
    };
    return classes[type] || 'secondary';
}

/**
 * Get the badge class for a status
 * @param {string} status - The status value
 * @returns {string} The badge class name
 */
export function getStatusBadgeClass(status) {
    const classes = {
        'active': 'success',
        'ongoing': 'primary',
        'completed': 'success',
        'failed': 'danger',
        'abandoned': 'secondary',
        'pending': 'warning',
        'in_progress': 'primary',
        'on_hold': 'warning',
        'cursed': 'danger',
        'injured': 'warning',
    };
    return classes[status?.toLowerCase().replace('-', '_')] || 'secondary';
}

/**
 * Format an enum value for display
 * @param {string} value - The enum value
 * @returns {string} The formatted value
 */
export function formatEnumValue(value) {
    if (!value) return '';
    
    // Convert snake_case or SCREAMING_SNAKE_CASE to Title Case
    return value
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Format a currency value
 * @param {number} value - The value in gold pieces
 * @returns {string} The formatted currency string
 */
export function formatCurrency(value) {
    if (value === null || value === undefined) return '0 gp';
    
    // Handle non-numeric values
    const numValue = Number(value);
    if (isNaN(numValue)) return '0 gp';
    
    // Format the currency based on value
    if (numValue >= 1) {
        return `${numValue} gp`;
    } else if (numValue >= 0.1) {
        return `${Math.floor(numValue * 10)} sp`;
    } else {
        return `${Math.floor(numValue * 100)} cp`;
    }
}

/**
 * Apply consistent card styling to an element
 * @param {HTMLElement} element - The element to style
 */
export function applyCardStyle(element) {
    if (!element) return;
    
    element.classList.add('bg-card');
    element.style.borderLeft = '3px solid var(--border-light)';
    element.style.borderRadius = 'var(--radius)';
    element.style.boxShadow = 'var(--shadow)';
    element.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
    
    // Add hover effect
    element.addEventListener('mouseenter', () => {
        element.style.transform = 'translateY(-2px)';
        element.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.3)';
    });
    
    element.addEventListener('mouseleave', () => {
        element.style.transform = '';
        element.style.boxShadow = 'var(--shadow)';
    });
}

/**
 * Create a badge element with consistent styling
 * @param {string} text - The badge text
 * @param {string} type - The badge type (success, warning, info, etc.)
 * @returns {HTMLElement} The badge element
 */
export function createBadge(text, type = 'secondary') {
    const badge = document.createElement('span');
    badge.className = `badge bg-${type}`;
    badge.textContent = text;
    return badge;
}
