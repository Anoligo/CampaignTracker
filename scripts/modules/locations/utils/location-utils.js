/**
 * Escapes HTML special characters to prevent XSS
 * @param {string} unsafe - The string to escape
 * @returns {string} The escaped string
 */
export const escapeHtml = (unsafe) => {
    if (typeof unsafe !== 'string') return '';
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

/**
 * Formats a location object for display
 * @param {Object} location - The location object
 * @returns {Object} Formatted location object
 */
export const formatLocationForDisplay = (location) => {
    if (!location) return {};
    
    return {
        ...location,
        formattedName: location.name || 'Unnamed Location',
        formattedType: location.type ? 
            location.type.charAt(0) + location.type.slice(1).toLowerCase() : 
            'Unknown',
        formattedStatus: location.discoveryStatus ? 
            location.discoveryStatus.charAt(0) + location.discoveryStatus.slice(1).toLowerCase() : 
            'Unknown',
        formattedDescription: location.description || 'No description available.',
        formattedNotes: location.notes || 'No notes available.'
    };
};

/**
 * Validates a location object
 * @param {Object} location - The location to validate
 * @returns {{isValid: boolean, errors: Array<string>}} Validation result
 */
export const validateLocation = (location) => {
    const errors = [];
    
    if (!location) {
        errors.push('Location data is required');
        return { isValid: false, errors };
    }
    
    if (!location.name || location.name.trim() === '') {
        errors.push('Location name is required');
    }
    
    if (!location.type) {
        errors.push('Location type is required');
    }
    
    if (!location.discoveryStatus) {
        errors.push('Discovery status is required');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Filters locations based on search query
 * @param {Array<Object>} locations - Array of location objects
 * @param {string} query - Search query
 * @returns {Array<Object>} Filtered locations
 */
export const filterLocations = (locations, query) => {
    if (!query) return locations;
    
    const lowerQuery = query.toLowerCase();
    return locations.filter(location => 
        (location.name && location.name.toLowerCase().includes(lowerQuery)) ||
        (location.type && location.type.toLowerCase().includes(lowerQuery)) ||
        (location.description && location.description.toLowerCase().includes(lowerQuery)) ||
        (location.notes && location.notes.toLowerCase().includes(lowerQuery))
    );
};

/**
 * Sorts locations by a given field
 * @param {Array<Object>} locations - Array of location objects
 * @param {string} field - Field to sort by
 * @param {boolean} ascending - Sort direction
 * @returns {Array<Object>} Sorted locations
 */
export const sortLocations = (locations, field, ascending = true) => {
    if (!field) return [...locations];
    
    return [...locations].sort((a, b) => {
        let valueA = a[field];
        let valueB = b[field];
        
        // Handle undefined/null values
        if (valueA === undefined || valueA === null) return ascending ? 1 : -1;
        if (valueB === undefined || valueB === null) return ascending ? -1 : 1;
        
        // Convert to string for comparison
        valueA = String(valueA).toLowerCase();
        valueB = String(valueB).toLowerCase();
        
        if (valueA < valueB) return ascending ? -1 : 1;
        if (valueA > valueB) return ascending ? 1 : -1;
        return 0;
    });
};

export default {
    escapeHtml,
    formatLocationForDisplay,
    validateLocation,
    filterLocations,
    sortLocations
};
