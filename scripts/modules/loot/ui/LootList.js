/**
 * LootList Component
 * Handles rendering and interactions for the item list
 */

/**
 * Escapes HTML special characters to prevent XSS
 * @param {string} unsafe - The string to escape
 * @returns {string} The escaped string
 */
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return '';
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Formats an enum value for display (e.g., 'magic_sword' -> 'Magic Sword')
 * @param {string} value - The enum value to format
 * @returns {string} The formatted string
 */
function formatEnumValue(value) {
    if (!value) return '';
    return value
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

export class LootList {
    /**
     * Create a new LootList instance
     * @param {LootUI} parent - Parent LootUI instance
     */
    /**
     * Create a new LootList instance
     * @param {Object} parent - Parent LootUI instance with config
     */
    constructor(parent) {
        if (!parent) {
            console.error('[LootList] Parent is required');
            throw new Error('LootList: Parent is required');
        }
        
        this.parent = parent;
        
        // Get config from parent or use defaults
        this.config = {
            listId: 'itemList',
            searchId: 'lootItemSearch',
            ...(parent.config || {})
        };
        
        // Safely get container and search input with fallbacks
        this.container = document.getElementById(this.config.listId);
        this.searchInput = document.getElementById(this.config.searchId);
        this.items = [];
        
        console.log('[LootList] Initialized with config:', {
            listId: this.config.listId,
            searchId: this.config.searchId,
            containerFound: !!this.container,
            searchInputFound: !!this.searchInput
        });
        
        if (!this.container) {
            console.warn(`[LootList] Container not found with ID: ${this.config.listId || 'itemList'}`);
        }
        
        // Bind methods
        this.render = this.render.bind(this);
        this.createListItem = this.createListItem.bind(this);
        this.setupEventListeners = this.setupEventListeners.bind(this);
        this.handleEditClick = this.handleEditClick.bind(this);
        
        // Initialize event listeners if container exists
        if (this.container) {
            this.setupEventListeners();
        }
    }
    
    /**
     * Handle item click in the list
     * @param {string} id - The ID of the clicked item
     */
    handleItemClick(id) {
        console.log(`[LootList] Item clicked: ${id}`);
        if (this.parent && typeof this.parent.handleItemClick === 'function') {
            this.parent.handleItemClick(id);
        }
    }
    
    /**
     * Handle edit button click
     * @param {Event} e - The click event
     */
    handleEditClick(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const itemId = e.currentTarget.dataset.id;
        if (!itemId) return;
        
        console.log(`[LootList] Edit button clicked for item: ${itemId}`);
        
        // Find the clicked item in the DOM to update active state
        const items = this.container.querySelectorAll('.list-group-item');
        items.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.id === itemId) {
                item.classList.add('active');
            }
        });
        
        if (this.parent && typeof this.parent.handleEdit === 'function') {
            this.parent.handleEdit(itemId);
        }
    }
    
    /**
     * Render the item list
     * @param {Array} items - Array of item objects
     */
    render(items = []) {
        if (!this.container) return;
        
        this.items = items || [];
        
        // Clear existing items
        this.container.innerHTML = '';
        
        if (this.items.length === 0) {
            this.container.innerHTML = `
                <div class="text-center py-5">
                    <p class="text-muted mb-3">No items found</p>
                    <button id="addFirstItemBtn" class="btn btn-primary">
                        <i class="fas fa-plus me-2"></i>Add Your First Item
                    </button>
                </div>
            `;
            
            // Set up add first item button
            const addFirstBtn = document.getElementById('addFirstItemBtn');
            if (addFirstBtn) {
                addFirstBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (this.parent && this.parent.handleAdd) {
                        this.parent.handleAdd();
                    }
                });
            }
            return;
        }
        
        // Create a grid container for the items
        const grid = document.createElement('div');
        grid.className = 'row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4';
        
        // Sort items by name
        const sortedItems = [...this.items].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        
        // Add each item to the grid
        sortedItems.forEach(item => {
            const card = this.createItemCard(item);
            if (card) {
                grid.appendChild(card);
            }
        });
        
        this.container.appendChild(grid);
        
        // Make cards clickable for editing
        this.container.querySelectorAll('.loot-item-card').forEach(card => {
            const editBtn = card.querySelector('.edit-item');
            if (editBtn) {
                card.style.cursor = 'pointer';
                card.addEventListener('click', (e) => {
                    // Don't trigger if clicking on buttons or interactive elements
                    if (!e.target.closest('button, a, [role="button"]')) {
                        editBtn.click();
                    }
                });
            }
        });
    }
    
    /**
     * Create a card element for an item
     * @param {Object} item - Item to create card for
     * @returns {HTMLElement} The created card element
     */
    createItemCard(item) {
        if (!item) return null;
        
        const rarityClass = item.rarity ? item.rarity.toLowerCase().replace(/\s+/g, '-') : 'common';
        const rarityColor = this.getRarityColor(item.rarity);
        
        const card = document.createElement('div');
        card.className = 'col';
        card.dataset.id = item.id;
        
        card.innerHTML = `
            <div class="card h-100 border-0 shadow-sm hover-shadow transition-all loot-item-card">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title mb-1">${escapeHtml(item.name || 'Unnamed Item')}</h5>
                        <span class="badge" style="background-color: ${rarityColor}">
                            ${formatEnumValue(item.rarity || 'Common')}
                        </span>
                    </div>
                    <h6 class="card-subtitle mb-2 text-muted">
                        <i class="${this.getItemTypeIcon(item.type)} me-1"></i>
                        ${formatEnumValue(item.type || 'Miscellaneous')}
                    </h6>
                    ${item.description ? `
                        <p class="card-text text-muted small mb-3">
                            ${this.truncate(escapeHtml(item.description), 100)}
                        </p>` : ''
                    }
                    <div class="d-flex flex-wrap gap-1 mb-2">
                        ${item.requiresAttunement ? 
                            '<span class="badge bg-warning text-dark">Requires Attunement</span>' : ''}
                        ${item.isCursed ? 
                            '<span class="badge bg-danger">Cursed</span>' : ''}
                    </div>
                </div>
                <div class="card-footer bg-transparent border-top-0 pt-0 pb-3">
                    <div class="d-flex justify-content-end gap-2">
                        <button class="btn btn-sm btn-outline-primary edit-item" data-id="${item.id}" title="Edit">
                            <i class="fas fa-edit me-1"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-item" data-id="${item.id}" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>`;
            
        return card;
    }
    
    /**
     * Handle container click events
     * @param {Event} e - The click event
     */
    /**
     * Clean up event listeners and references
     */
    cleanup() {
        console.log('[LootList] Cleaning up event listeners and references');
        
        // Remove container click handler if it exists
        if (this.container) {
            this.container.removeEventListener('click', this.handleContainerClick);
        }
        
        // Remove search input handler if it exists
        if (this.searchInput) {
            // Create a new input element to remove all event listeners
            const newInput = this.searchInput.cloneNode(true);
            this.searchInput.parentNode.replaceChild(newInput, this.searchInput);
            this.searchInput = newInput;
        }
        
        // Clear references
        this.container = null;
        this.searchInput = null;
        this.items = [];
        
        console.log('[LootList] Cleanup complete');
    }
    
    handleContainerClick = async (e) => {
        const editBtn = e.target.closest('.edit-item');
        const deleteBtn = e.target.closest('.delete-item');
        const card = e.target.closest('.loot-item-card');
        
        if (!editBtn && !deleteBtn && !card) return;
        
        const itemId = (editBtn || deleteBtn || card)?.dataset.id;
        if (!itemId) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        console.log(`[LootList] Item action triggered:`, { itemId, editBtn: !!editBtn, deleteBtn: !!deleteBtn, card: !!card });
        
        const item = this.items.find(i => i.id === itemId);
        if (!item) {
            console.warn(`[LootList] Item not found: ${itemId}`);
            return;
        }
        
        try {
            if (editBtn || card) {
                // Handle edit/select
                console.log(`[LootList] Handling edit/select for item: ${itemId}`);
                if (this.parent) {
                    if (this.parent.handleItemClick) {
                        await this.parent.handleItemClick(itemId);
                    } else if (this.parent.handleEdit) {
                        await this.parent.handleEdit(itemId);
                    }
                }
            } else if (deleteBtn) {
                // Handle delete
                console.log(`[LootList] Handling delete for item: ${itemId}`);
                if (this.parent?.handleDelete) {
                    const confirmed = await this.showConfirmationDialog(
                        'Delete Item',
                        `Are you sure you want to delete "${item.name || 'this item'}"?`,
                        'Delete',
                        'btn-danger'
                    );
                    
                    if (confirmed) {
                        await this.parent.handleDelete(itemId);
                        showToast('Item deleted successfully', 'success');
                    }
                }
            }
        } catch (error) {
            console.error('[LootList] Error handling item action:', error);
            showToast(`Error: ${error.message}`, 'error');
        }
    }
    
    /**
     * Set up event listeners for the list
     */
    setupEventListeners() {
        console.log('[LootList] Setting up event listeners');
        
        // Remove any existing event listeners to prevent duplicates
        this.cleanup();
        
        // Only set up event listeners if we have a valid container
        if (!this.container) {
            console.warn('[LootList] Container not found, cannot set up event listeners');
            return;
        }
        
        try {
            // Delegate events for edit and delete buttons
            this.container.addEventListener('click', this.handleContainerClick);
            console.log('[LootList] Added click event listener to container');
            
            // Search functionality
            if (this.searchInput) {
                this.searchInput.addEventListener('input', (e) => {
                    const query = e.target.value.toLowerCase().trim();
                    const filtered = this.items.filter(item => 
                        (item.name && item.name.toLowerCase().includes(query)) ||
                        (item.description && item.description.toLowerCase().includes(query)) ||
                        (item.type && item.type.toLowerCase().includes(query)) ||
                        (item.rarity && item.rarity.toLowerCase().includes(query))
                    );
                    this.render(filtered);
                });
                console.log('[LootList] Added input event listener to search');
            }
        } catch (error) {
            console.error('[LootList] Error setting up event listeners:', error);
        }
    }
    
    /**
     * Get the appropriate icon for an item type
     * @param {string} type - Item type
     * @returns {string} Icon class
     */
    getItemTypeIcon(type) {
        const icons = {
            'weapon': 'fa-sword',
            'armor': 'fa-shield',
            'potion': 'fa-flask',
            'scroll': 'fa-scroll',
            'wand': 'fa-magic',
            'ring': 'fa-ring',
            'rod': 'fa-gavel',
            'staff': 'fa-staff',
            'wondrous': 'fa-star',
            'consumable': 'fa-wine-bottle',
            'tool': 'fa-tools',
            'gear': 'fa-cog',
            'treasure': 'fa-gem',
            'artifact': 'fa-dragon',
            'other': 'fa-question',
            'miscellaneous': 'fa-box-open'
        };
        
        const normalizedType = type ? type.toLowerCase() : 'miscellaneous';
        return `fas ${icons[normalizedType] || icons.miscellaneous}`;
    }
    
    /**
     * Get the appropriate color for a rarity
     * @param {string} rarity - Item rarity
     * @returns {string} CSS color value
     */
    getRarityColor(rarity) {
        const colors = {
            'common': '#ffffff',
            'uncommon': '#1eff00',
            'rare': '#0070dd',
            'very rare': '#a335ee',
            'legendary': '#ff8000',
            'artifact': '#e6cc80',
            'unknown': '#9d9d9d'
        };
        
        const normalizedRarity = rarity ? rarity.toLowerCase() : 'common';
        return colors[normalizedRarity] || colors.common;
    }
    
    /**
     * Show a confirmation dialog
     * @param {string} title - Dialog title
     * @param {string} message - Dialog message
     * @param {string} confirmText - Confirm button text
     * @param {string} confirmClass - Confirm button CSS class
     * @returns {Promise<boolean>} Whether the user confirmed
     */
    showConfirmationDialog(title, message, confirmText = 'Confirm', confirmClass = 'btn-primary') {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal fade';
            modal.tabIndex = '-1';
            modal.setAttribute('role', 'dialog');
            
            modal.innerHTML = `
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${escapeHtml(title)}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <p>${escapeHtml(message)}</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn ${confirmClass}" id="confirmBtn">
                                ${escapeHtml(confirmText)}
                            </button>
                        </div>
                    </div>
                </div>`;
            
            document.body.appendChild(modal);
            
            const modalInstance = new bootstrap.Modal(modal);
            modalInstance.show();
            
            const confirmBtn = modal.querySelector('#confirmBtn');
            const closeBtn = modal.querySelector('.btn-secondary');
            
            const cleanup = () => {
                confirmBtn.removeEventListener('click', confirmHandler);
                closeBtn.removeEventListener('click', cancelHandler);
                modalInstance.dispose();
                document.body.removeChild(modal);
            };
            
            const confirmHandler = () => {
                cleanup();
                resolve(true);
            };
            
            const cancelHandler = () => {
                cleanup();
                resolve(false);
            };
            
            confirmBtn.addEventListener('click', confirmHandler);
            closeBtn.addEventListener('click', cancelHandler);
            
            // Handle modal dismissal
            modal.addEventListener('hidden.bs.modal', () => {
                cleanup();
                resolve(false);
            });
        });
    }
    
    /**
    }
    
    /**
     * Truncate text to a maximum length
     * @param {string} text - Text to truncate
     * @param {number} maxLength - Maximum length
     * @returns {string} Truncated text with ellipsis if needed
     */
    truncate(text, maxLength = 100) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    }
    
    /**
     * Create a list item element for an item
     * @param {Object} item - The item to create a list item for
     * @returns {HTMLElement} The created list item element
     */
    createListItem(item) {
        if (!item) return null;
        
        const listItem = document.createElement('div');
        listItem.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center';
        listItem.dataset.id = item.id;
        
        // Create item info container
        const itemInfo = document.createElement('div');
        itemInfo.className = 'd-flex flex-column';
        
        // Item name and type
        const nameElement = document.createElement('span');
        nameElement.className = 'fw-bold';
        nameElement.textContent = item.name || 'Unnamed Item';
        
        const typeElement = document.createElement('small');
        typeElement.className = 'text-muted';
        typeElement.textContent = formatEnumValue(item.type || 'Miscellaneous');
        
        itemInfo.appendChild(nameElement);
        itemInfo.appendChild(typeElement);
        
        // Badges for rarity and attunement
        const badges = document.createElement('div');
        badges.className = 'd-flex gap-1';
        
        if (item.rarity) {
            const rarityBadge = document.createElement('span');
            rarityBadge.className = 'badge';
            rarityBadge.style.backgroundColor = this.getRarityColor(item.rarity);
            rarityBadge.textContent = formatEnumValue(item.rarity);
            badges.appendChild(rarityBadge);
        }
        
        if (item.requiresAttunement) {
            const attunementBadge = document.createElement('span');
            attunementBadge.className = 'badge bg-warning text-dark';
            attunementBadge.textContent = 'Attunement';
            badges.appendChild(attunementBadge);
        }
        
        listItem.appendChild(itemInfo);
        listItem.appendChild(badges);
        
        return listItem;
    }
}
