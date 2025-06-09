/**
 * Date utilities for formatting and handling date values
 */

/**
 * Format a date into a readable string
 * @param {Date|string|number} date - The date value to format
 * @returns {string} Formatted date like `Jan 1, 2020`
 */
export function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}
