/**
 * Global styles application script
 * This script applies the global styling rules from the design guide to all components
 */

import { getRarityBadgeClass, getQuestTypeBadgeClass, getStatusBadgeClass } from './utils/style-utils.js';
import * as RelationalInputs from './utils/relational-inputs.js';

// Export relational inputs for use in other modules
export { RelationalInputs };

/**
 * Apply global styles to the application
 * This ensures consistent styling across all components
 */
export function applyGlobalStyles() {
    // Apply card styling
    applyCardStyles();
    
    // Apply button styling
    applyButtonStyles();
    
    // Apply form control styling
    applyFormStyles();
    
    // Apply badge styling
    applyBadgeStyles();
    
    // Initialize relational inputs
    initializeRelationalInputs();
    
    // Listen for dynamic content changes
    observeDynamicContent();
    
    console.log('Global styles applied successfully');
}

/**
 * Apply card styling to all cards in the application
 */
function applyCardStyles() {
    // Apply styles to all cards
    document.querySelectorAll('.card, .report').forEach(card => {
        // Ensure card has the accent border
        if (!card.style.borderLeft) {
            card.style.borderLeft = '5px solid var(--accent)';
        }
        
        // Ensure card has the correct background color
        card.style.backgroundColor = 'var(--bg-card)';
        card.style.color = 'var(--text)';
        
        // Add box shadow
        card.classList.add('shadow-accent');
        
        // Style card headers
        const headers = card.querySelectorAll('.card-header');
        headers.forEach(header => {
            header.style.backgroundColor = 'var(--bg-card)';
            header.style.color = 'var(--text)';
            
            // Make titles use accent color
            const titles = header.querySelectorAll('h1, h2, h3, h4, h5, h6');
            titles.forEach(title => {
                title.classList.add('text-accent');
            });
        });
        
        // Style card bodies
        const bodies = card.querySelectorAll('.card-body');
        bodies.forEach(body => {
            body.style.backgroundColor = 'var(--bg-card)';
            body.style.color = 'var(--text)';
        });
    });
}

/**
 * Apply button styling to all buttons in the application
 */
function applyButtonStyles() {
    // Apply styles to all buttons
    document.querySelectorAll('button:not(.btn-close)').forEach(button => {
        // Skip buttons that already have the .button class
        if (button.classList.contains('button')) return;
        
        // Convert Bootstrap buttons to our custom button style
        if (button.classList.contains('btn')) {
            button.classList.add('button');
            
            // Ensure text is white for visibility
            button.style.color = '#fff';
        }
    });
}

/**
 * Apply form control styling to all form controls in the application
 */
function applyFormStyles() {
    // Apply styles to all form controls
    document.querySelectorAll('input, select, textarea').forEach(control => {
        // Skip checkboxes and radios
        if (control.type === 'checkbox' || control.type === 'radio') {
            return;
        }
        
        // Add specific class for form controls if they don't have one already
        if (!control.classList.contains('form-control') && !control.classList.contains('form-select')) {
            if (control.tagName === 'SELECT') {
                control.classList.add('form-select');
            } else if (control.tagName === 'TEXTAREA' || control.tagName === 'INPUT') {
                control.classList.add('form-control');
            }
        }
        
        // Remove any inline styles that might interfere with our CSS
        control.style.removeProperty('background-color');
        control.style.removeProperty('color');
    });
}

/**
 * Apply badge styling to all badges in the application
 */
function applyBadgeStyles() {
    // Apply styles to all badges
    document.querySelectorAll('.badge').forEach(badge => {
        // Skip badges that already have a bg-* class
        if (Array.from(badge.classList).some(cls => cls.startsWith('bg-'))) return;
        
        // Try to determine the appropriate badge class based on content
        const text = badge.textContent.trim().toLowerCase();
        
        // Check if it's a rarity badge
        const rarityClasses = ['common', 'uncommon', 'rare', 'very rare', 'legendary', 'artifact', 'unique'];
        if (rarityClasses.some(cls => text.includes(cls))) {
            // Get the normalized class name (spaces replaced with hyphens)
            const badgeClass = getRarityBadgeClass(text);
            badge.classList.add(`bg-${badgeClass}`);
        }
        // Check if it's a status badge
        else if (['active', 'ongoing', 'completed', 'failed', 'pending', 'in progress', 'on hold'].some(cls => text.includes(cls))) {
            badge.classList.add(`bg-${getStatusBadgeClass(text)}`);
        }
        // Default to accent
        else {
            badge.classList.add('bg-accent');
        }
    });
}

/**
 * Initialize relational inputs throughout the application
 */
function initializeRelationalInputs() {
    // Check if TomSelect is available
    if (typeof TomSelect === 'undefined') {
        console.warn('TomSelect library not found. Relational inputs will not be enhanced.');
        return;
    }
    
    // Find all selects that should be enhanced with TomSelect
    document.querySelectorAll('select[data-relational]').forEach(select => {
        // Skip if already initialized
        if (select._tomSelect) return;
        
        // Get configuration from data attributes
        const entityType = select.dataset.entityType || '';
        const placeholder = select.dataset.placeholder || `Search or select ${entityType}...`;
        const multiple = select.hasAttribute('multiple');
        
        // Initialize TomSelect
        try {
            // Pass the element directly instead of using it as a selector
            const options = [];
            RelationalInputs.initRelationalDropdown(select, options, {
                placeholder,
                multiple,
                useElementDirectly: true // Add a flag to indicate we're passing the element directly
            });
        } catch (error) {
            console.error('Error initializing relational input:', error);
        }
    });
}

/**
 * Observe dynamic content changes and apply styles as needed
 */
function observeDynamicContent() {
    // Create a MutationObserver to watch for DOM changes
    const observer = new MutationObserver(mutations => {
        let shouldApplyStyles = false;
        let shouldInitRelational = false;
        
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length) {
                shouldApplyStyles = true;
                
                // Check if any of the added nodes contain relational inputs
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.querySelector('select[data-relational]')) {
                            shouldInitRelational = true;
                        }
                    }
                });
            }
        });
        
        if (shouldApplyStyles) {
            // Apply styles to newly added nodes
            applyCardStyles();
            applyButtonStyles();
            applyFormStyles();
            applyBadgeStyles();
        }
        
        if (shouldInitRelational) {
            // Initialize relational inputs in newly added nodes
            initializeRelationalInputs();
        }
    });
    
    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true });
}

// Apply global styles when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Load TomSelect if not already loaded
    if (typeof TomSelect === 'undefined') {
        // Check if the CSS is loaded
        if (!document.querySelector('link[href*="tom-select"]')) {
            const tomSelectCss = document.createElement('link');
            tomSelectCss.rel = 'stylesheet';
            tomSelectCss.href = 'https://cdn.jsdelivr.net/npm/tom-select@2.2.2/dist/css/tom-select.min.css';
            document.head.appendChild(tomSelectCss);
        }
        
        // Load the JavaScript
        const tomSelectScript = document.createElement('script');
        tomSelectScript.src = 'https://cdn.jsdelivr.net/npm/tom-select@2.2.2/dist/js/tom-select.complete.min.js';
        tomSelectScript.onload = applyGlobalStyles;
        document.head.appendChild(tomSelectScript);
    } else {
        applyGlobalStyles();
    }
});
