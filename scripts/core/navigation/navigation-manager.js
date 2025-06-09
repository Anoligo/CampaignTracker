import { appState } from '../state/app-state.js';

/**
 * Navigation Manager
 * Handles application navigation and routing
 */
export class NavigationManager {
    /**
     * Create a new NavigationManager
     * @param {Object} options - Configuration options
     * @param {string} options.defaultSection - The default section to show
     * @param {Function} options.onNavigate - Callback when navigation occurs
     */
    constructor({ defaultSection = 'dashboard', onNavigate = null } = {}) {
        this.defaultSection = defaultSection;
        this.onNavigate = onNavigate;
        this.sectionInitializers = new Map();
        this._setupEventListeners();
        
        // Ensure only one section is visible on initial load
        this._ensureSingleSectionVisible();
        
        // Handle initial navigation
        this._handleInitialNavigation();
    }
    
    /**
     * Register an initializer function for a section
     * @param {string} sectionId - The ID of the section
     * @param {Function} initializer - The initialization function to call when the section is shown
     */
    registerSectionInitializer(sectionId, initializer) {
        if (typeof initializer === 'function') {
            this.sectionInitializers.set(sectionId, initializer);
        }
    }

    /**
     * Set up event listeners for navigation
     * @private
     */
    _setupEventListeners() {
        // Handle browser back/forward buttons
        window.addEventListener('popstate', () => this._handlePopState());
        
        // Delegate link clicks for SPA navigation
        document.addEventListener('click', (event) => {
            const link = event.target.closest('a');
            if (!link) return;
            
            const href = link.getAttribute('href');
            
            // Handle internal hash links (SPA navigation)
            if (href && href.startsWith('#')) {
                event.preventDefault();
                const section = href.substring(1);
                this.navigateTo(section);
            }
            // Handle full page navigation for data management
            else if (href && href.endsWith('data-management.html')) {
                // Let the browser handle the navigation
                return true;
            }
        });
    }

    /**
     * Handle initial page load navigation
     * @private
     */
    _handleInitialNavigation() {
        // Add a small delay to ensure the DOM is fully loaded
        setTimeout(() => {
            // Get the section from the URL hash, default to 'dashboard' if empty
            let section = window.location.hash.replace('#', '');
            
            // If no hash is present, use the default section
            if (!section) {
                section = this.defaultSection;
                // Update the URL to include the default section
                window.history.replaceState({}, '', `#${section}`);
            }
            
            // Hide all sections first
            document.querySelectorAll('.section').forEach(el => {
                el.style.display = 'none';
                el.classList.remove('active');
            });
            
            // Navigate to the section without adding to history
            this.navigateTo(section, false);
        }, 50); // Small delay to ensure the DOM is ready
    }

    /**
     * Handle browser popstate events
     * @private
     */
    _handlePopState() {
        const hash = window.location.hash.replace('#', '');
        if (hash) {
            this._updateUI(hash);
        }
    }
    
    /**
     * Ensure only one section is visible on initial load
     * @private
     */
    _ensureSingleSectionVisible() {
        // Hide all sections by default
        document.querySelectorAll('.section').forEach(section => {
            section.style.display = 'none';
        });
        
        // If we have a hash in the URL, show that section
        const hash = window.location.hash.replace('#', '');
        if (hash) {
            const section = document.getElementById(hash);
            if (section) {
                section.style.display = 'block';
                return;
            }
        }
        
        // Otherwise, show the default section
        const defaultSection = document.getElementById(this.defaultSection);
        if (defaultSection) {
            defaultSection.style.display = 'block';
        }
    }

    /**
     * Navigate to a section
     * @param {string} section - The section to navigate to
     * @param {boolean} updateHistory - Whether to update browser history
     */
    navigateTo(section, updateHistory = true) {
        if (!section) return;
        
        // Update URL
        if (updateHistory) {
            window.history.pushState({}, '', `#${section}`);
        }
        
        // Update application state
        appState.setActiveSection(section);
        
        // Update UI
        this._updateUI(section);
    }

    /**
     * Update the UI to reflect the current section
     * @param {string} section - The section to show
     * @private
     */
    _updateUI(section) {
        console.log(`Updating UI to show section: ${section}`);
        
        // Update active nav item
        try {
            document.querySelectorAll('a[href^="#"]').forEach(link => {
                const linkSection = link.getAttribute('href').substring(1);
                const isActive = linkSection === section;
                
                // Update the parent list item's active state
                const listItem = link.closest('li.nav-item');
                if (listItem) {
                    // Remove active class from all nav items
                    listItem.parentElement.querySelectorAll('li.nav-item').forEach(li => {
                        const a = li.querySelector('a');
                        if (a) a.classList.remove('active');
                    });
                    
                    // Add active class to current nav item
                    if (isActive) {
                        link.classList.add('active');
                    }
                }
                
                // Update ARIA attributes
                link.setAttribute('aria-current', isActive ? 'page' : null);
            });
            
            // Hide all sections first
            const sections = document.querySelectorAll('.section');
            console.log(`Found ${sections.length} sections`);
            
            sections.forEach(el => {
                el.style.display = 'none';
                el.classList.remove('active');
            });
            
            // Show the active section
            const activeSection = document.getElementById(section);
            if (activeSection) {
                console.log(`Showing section: ${section}`);
                activeSection.style.display = 'block';
                activeSection.classList.add('active');
                
                // Initialize the section if an initializer is registered
                if (this.sectionInitializers.has(section)) {
                    try {
                        console.log(`Initializing section: ${section}`);
                        this.sectionInitializers.get(section)();
                    } catch (error) {
                        console.error(`Error initializing section ${section}:`, error);
                    }
                }
                
                // Ensure the section is visible in the viewport
                setTimeout(() => {
                    activeSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 10);
            } else {
                // Fallback to default section if the requested section doesn't exist
                console.warn(`Section '${section}' not found, falling back to default`);
                this.navigateTo(this.defaultSection, false);
                return;
            }
            
            // Call the onNavigate callback if provided
            if (typeof this.onNavigate === 'function') {
                this.onNavigate(section);
            }
        } catch (error) {
            console.error('Error in _updateUI:', error);
            // Fallback to default section on error
            this.navigateTo(this.defaultSection, false);
        }
    }
}

export default NavigationManager;
