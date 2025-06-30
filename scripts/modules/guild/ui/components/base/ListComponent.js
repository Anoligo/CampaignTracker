import { createLoadingSpinner, createEmptyState } from '../../utils/ui-utils.js';

/**
 * Base class for list components with common functionality
 */
export class ListComponent {
    /**
     * Create a new ListComponent
     * @param {HTMLElement} container - The container element for the list
     * @param {Object} config - Configuration object
     * @param {string} config.entityName - Name of the entity (e.g., 'activity', 'resource')
     * @param {Function} config.onItemSelect - Called when an item is selected
     * @param {Function} config.onAddItem - Called when add button is clicked
     * @param {Function} config.getItemTemplate - Function that returns HTML for a single item
     * @param {Array} [config.filters=[]] - Array of filter configurations
     */
    constructor(container, { 
        entityName, 
        onItemSelect, 
        onAddItem, 
        getItemTemplate,
        filters = []
    }) {
        this.container = container;
        this.entityName = entityName;
        this.onItemSelect = onItemSelect;
        this.onAddItem = onAddItem;
        this.getItemTemplate = getItemTemplate;
        this.filters = filters;
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.items = [];
    }

    /**
     * Render the list with the provided items
     * @param {Array} items - Array of items to display
     */
    render(items = []) {
        console.log(`Rendering ${this.entityName} list with`, items);
        this.items = items || [];
        
        try {
            if (!this.container) {
                console.error('Container is not defined');
                return;
            }
            
            // Debug container state
            console.log(`${this.entityName} container before render:`, this.container);
            console.log('Container parent:', this.container.parentElement);
            console.log('Container visibility:', window.getComputedStyle(this.container).visibility);
            console.log('Container display:', window.getComputedStyle(this.container).display);
            
            // Save scroll position
            const scrollTop = this.container.scrollTop;
            
            // Generate template
            const template = this.getTemplate();
            console.log(`Generated template for ${this.entityName}:`, template);
            
            // Update the container HTML
            this.container.innerHTML = template;
            
            // Debug after setting innerHTML
            console.log('Container after setting innerHTML:', this.container);
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Restore scroll position
            this.container.scrollTop = scrollTop;
            
            // Force reflow to ensure layout is updated
            // eslint-disable-next-line no-void
            void this.container.offsetHeight;
            
            // Log container state after render
            const rect = this.container.getBoundingClientRect();
            console.log(`Container dimensions after render (${this.entityName}):`, {
                width: rect.width,
                height: rect.height,
                top: rect.top,
                left: rect.left,
                computedStyles: window.getComputedStyle(this.container)
            });
            
            console.log(`Successfully rendered ${this.items.length} ${this.entityName} items`);
            
            // Force a redraw
            this.container.style.display = 'none';
            // eslint-disable-next-line no-void
            void this.container.offsetWidth;
            this.container.style.display = '';
        } catch (error) {
            console.error(`Error rendering ${this.entityName} list:`, error);
            const errorHtml = `
                <div class="alert alert-danger m-3">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Failed to load ${this.entityName}s. Please try refreshing the page.
                    <div class="mt-2 small">${error.message}</div>
                </div>
            `;
            
            if (this.container) {
                this.container.innerHTML = errorHtml;
            } else {
                console.error('Container not available to show error');
            }
        }
    }

    /**
     * Show loading state
     * @param {string} [message] - Optional loading message
     */
    showLoading(message = `Loading ${this.entityName}s...`) {
        this.container.innerHTML = createLoadingSpinner(message);
    }

    /**
     * Get the HTML template for the list
     * @returns {string} HTML string
     * @private
     */
    getTemplate() {
        const filteredItems = this.getFilteredItems();
        
        return `
            <div class="${this.entityName}-list-container">
                <div class="list-search-filter-bar">
                    <div class="input-group input-group-sm mb-2">
                        <span class="input-group-text list-search-icon">
                            <i class="fas fa-search"></i>
                        </span>
                        <input type="text"
                               class="form-control form-control-sm list-search-input"
                               placeholder="Search ${this.entityName}s...">
                    </div>
                    ${this.getFilterButtons()}
                </div>
                
                <!-- List Content -->
                <div class="flex-grow-1">
                    ${filteredItems.length > 0 
                        ? filteredItems.map(item => this.getItemTemplate(item)).join('')
                        : this.getEmptyState()}
                </div>
                
                <!-- Item Count -->
                <div class="list-item-count">
                    ${filteredItems.length} ${filteredItems.length === 1 ? this.entityName : this.entityName + 's'}
                </div>
            </div>
        `;
    }

    /**
     * Get the header section of the list
     * @returns {string} HTML string
     * @protected
     */
    getHeader() {
        const displayName = this.entityName.charAt(0).toUpperCase() + this.entityName.slice(1);
        
        return `
            <div class="card-header bg-card-header d-flex justify-content-between align-items-center">
                <h3 class="h5 mb-0">${displayName}s</h3>
                <button class="btn btn-sm btn-primary new-${this.entityName}-btn">
                    <i class="fas fa-plus me-1"></i> New ${displayName}
                </button>
            </div>
        `;
    }

    /**
     * Get the search and filters section
     * @returns {string} HTML string
     * @protected
     */
    getSearchAndFilters() {
        if (this.filters.length === 0) return '';
        
        return `
            <div class="sticky-top bg-body" style="z-index: 5;">
                <div class="p-3 border-bottom">
                    <div class="input-group input-group-sm mb-2">
                        <span class="input-group-text bg-dark border-dark text-light">
                            <i class="fas fa-search"></i>
                        </span>
                        <input type="text" 
                               class="form-control form-control-sm ${this.entityName}-search-input bg-dark text-light border-dark" 
                               placeholder="Search ${this.entityName}s...">
                    </div>
                    ${this.getFilterButtons()}
                </div>
            </div>
        `;
    }

    /**
     * Get the filter buttons HTML
     * @returns {string} HTML string
     * @protected
     */
    getFilterButtons() {
        if (this.filters.length === 0) return '';
        
        return `
            <div class="d-flex flex-wrap gap-2">
                ${this.filters.map(filter => `
                    <button class="btn btn-sm btn-outline-secondary ${this.entityName}-filter 
                            ${this.currentFilter === filter.value ? 'active' : ''}"
                            data-filter="${filter.value}">
                        ${filter.icon ? `<i class="fas ${filter.icon} me-1"></i>` : ''}
                        ${filter.label}
                    </button>
                `).join('\n')}
            </div>
        `;
    }

    /**
     * Get the list content HTML
     * @param {Array} items - Items to display
     * @returns {string} HTML string
     * @protected
     */
    getListContent(items) {
        if (!items || items.length === 0) {
            return createEmptyState(
                `No ${this.entityName}s found. Create one to get started!`,
                `fa-${this.entityName === 'activity' ? 'tasks' : 'box'}`
            );
        }

        return `
            <div class="list-group list-group-flush">
                ${items.map(item => this.getItemTemplate(item)).join('\n')}
            </div>
        `;
    }

    /**
     * Get filtered items based on current filter and search query
     * @returns {Array} Filtered items
     * @protected
     */
    getFilteredItems() {
        return this.items.filter(item => {
            const matchesFilter = this.currentFilter === 'all' || 
                               !item.type || 
                               item.type === this.currentFilter;
            
            const matchesSearch = !this.searchQuery || 
                               item.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                               (item.description && 
                                item.description.toLowerCase().includes(this.searchQuery.toLowerCase()));
            
            return matchesFilter && matchesSearch;
        });
    }

    /**
     * Set up event listeners
     * @protected
     */
    setupEventListeners() {
        // Item click
        this.container.addEventListener('click', (e) => {
            const item = e.target.closest(`.${this.entityName}-item`);
            if (item) {
                e.preventDefault();
                const itemId = item.dataset[`${this.entityName}Id`];
                this.onItemSelect(itemId);
            }

            // New item button
            if (e.target.closest(`.new-${this.entityName}-btn`)) {
                e.preventDefault();
                this.onAddItem();
            }

            // Filter buttons
            const filterBtn = e.target.closest(`.${this.entityName}-filter`);
            if (filterBtn) {
                e.preventDefault();
                this.currentFilter = filterBtn.dataset.filter;
                this.render(this.items);
            }

            // Search button
            if (e.target.closest(`.${this.entityName}-search-btn`)) {
                e.preventDefault();
                this.searchQuery = this.container.querySelector(`.${this.entityName}-search-input`).value.trim();
                this.render(this.items);
            }
        });

        // Handle Enter key in search input
        const searchInput = this.container.querySelector(`.${this.entityName}-search-input`);
        if (searchInput) {
            searchInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    this.searchQuery = e.target.value.trim();
                    this.render(this.items);
                }
            });
        }
    }
}
