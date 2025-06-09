/**
 * Relational Inputs Utility
 * 
 * This utility provides functions for creating and managing searchable dropdowns
 * for relational data as required by the Iron Meridian style guide.
 */

/**
 * Initialize a searchable dropdown for relational data
 * @param {string} selector - CSS selector for the element
 * @param {Array} options - Array of options {value, text}
 * @param {Object} config - Additional configuration
 * @returns {TomSelect} The initialized TomSelect instance
 */
export function initRelationalDropdown(selector, options = [], config = {}) {
    // Handle both string selectors and DOM elements
    let element;
    if (config.useElementDirectly && selector instanceof HTMLElement) {
        element = selector;
    } else if (typeof selector === 'string') {
        element = document.querySelector(selector);
    } else {
        console.error('Invalid selector type:', typeof selector);
        return null;
    }
    
    if (!element) {
        console.error(`Element not found: ${selector}`);
        return null;
    }
    
    // Clear existing options
    element.innerHTML = '';
    
    // Add placeholder option
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = config.placeholder || 'Select an option...';
    element.appendChild(placeholder);
    
    // Add options
    options.forEach(option => {
        const optElement = document.createElement('option');
        optElement.value = option.value;
        optElement.textContent = option.text;
        if (option.selected) {
            optElement.selected = true;
        }
        element.appendChild(optElement);
    });
    
    // Default configuration
    const defaultConfig = {
        create: false,
        maxItems: config.multiple ? null : 1,
        allowEmptyOption: true,
        placeholder: config.placeholder || 'Select an option...',
        plugins: config.plugins || ['clear_button'],
        // Custom styling to match our design system
        render: {
            option: function(data, escape) {
                return `<div class="option">${escape(data.text)}</div>`;
            },
            item: function(data, escape) {
                return `<div class="item">${escape(data.text)}</div>`;
            }
        }
    };
    
    // Merge with custom config
    const mergedConfig = { ...defaultConfig, ...config };
    
    // Initialize Tom Select
    try {
        const tomSelect = new TomSelect(element, mergedConfig);
        
        // Store the TomSelect instance on the element for future reference
        element._tomSelect = tomSelect;
        
        return tomSelect;
    } catch (error) {
        console.error('Error initializing TomSelect:', error);
        return null;
    }
}

/**
 * Initialize a searchable dropdown for a specific entity type
 * @param {string} selector - CSS selector for the element
 * @param {string} entityType - Type of entity (character, location, faction, etc.)
 * @param {Array} entities - Array of entity objects
 * @param {Object} config - Additional configuration
 * @returns {TomSelect} The initialized TomSelect instance
 */
export function initEntityDropdown(selector, entityType, entities = [], config = {}) {
    // Format entities as options
    const options = entities.map(entity => ({
        value: entity.id,
        text: entity.name || entity.title || `Unnamed ${entityType}`,
        selected: config.selectedId === entity.id
    }));
    
    // Default configuration for entity dropdowns
    const entityConfig = {
        placeholder: `Search or select ${entityType}...`,
        ...config
    };
    
    return initRelationalDropdown(selector, options, entityConfig);
}

/**
 * Update the options in an existing TomSelect dropdown
 * @param {string} selector - CSS selector for the element
 * @param {Array} options - New array of options {value, text}
 */
export function updateDropdownOptions(selector, options = []) {
    const element = document.querySelector(selector);
    if (!element || !element._tomSelect) {
        console.error(`TomSelect not found for element: ${selector}`);
        return;
    }
    
    const tomSelect = element._tomSelect;
    
    // Clear existing options
    tomSelect.clear();
    tomSelect.clearOptions();
    
    // Add new options
    options.forEach(option => {
        tomSelect.addOption({
            value: option.value,
            text: option.text
        });
    });
    
    // If there's a selected value, set it
    const selectedOption = options.find(option => option.selected);
    if (selectedOption) {
        tomSelect.setValue(selectedOption.value);
    }
}

/**
 * Destroy a TomSelect instance and restore the original select element
 * @param {string} selector - CSS selector for the element
 */
export function destroyDropdown(selector) {
    const element = document.querySelector(selector);
    if (!element || !element._tomSelect) {
        return;
    }
    
    element._tomSelect.destroy();
    delete element._tomSelect;
}

/**
 * Get the selected value(s) from a TomSelect dropdown
 * @param {string} selector - CSS selector for the element
 * @returns {string|Array} The selected value(s)
 */
export function getDropdownValue(selector) {
    const element = document.querySelector(selector);
    if (!element || !element._tomSelect) {
        return element?.value || '';
    }
    
    return element._tomSelect.getValue();
}

/**
 * Set the value of a TomSelect dropdown
 * @param {string} selector - CSS selector for the element
 * @param {string|Array} value - The value(s) to set
 */
export function setDropdownValue(selector, value) {
    const element = document.querySelector(selector);
    if (!element || !element._tomSelect) {
        if (element) element.value = value;
        return;
    }
    
    element._tomSelect.setValue(value);
}
