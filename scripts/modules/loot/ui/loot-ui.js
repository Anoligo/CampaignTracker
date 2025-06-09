import { LootService } from '../services/loot-service.js';
import { ItemType, ItemRarity, ItemCondition } from '../enums/loot-enums.js';
import { getRarityBadgeClass, formatEnumValue, getRarityColor, formatCurrency } from '../../../utils/style-utils.js';
import { RelationalInputs } from '../../../global-styles.js';

/**
 * UI component for handling loot-related user interface
 */
export class LootUI {
    /**
     * Create a new LootUI instance
     * @param {LootService} lootService - The loot service instance
     * @param {HTMLElement} container - The container element for the UI
     */
    constructor(lootManager, container) {
        this.lootManager = lootManager;
        this.lootService = lootManager.lootService;
        this.container = container;
        this.currentItem = null;
        this.isRendered = false;
        this.initialized = false;
        
        // Bind methods
        this.cleanup = this.cleanup.bind(this);
    }

    /**
     * Set up event listeners for the UI
     */
    setupEventListeners() {
        // Add event delegation for dynamic elements
        this.container.addEventListener('click', (e) => {
            // Handle add item button
            if (e.target.closest('.add-item-btn')) {
                e.preventDefault();
                this.showAddItemForm();
            } 
            // Handle save item button (form submission)
            else if (e.target.closest('#itemForm')) {
                e.preventDefault();
                const submitBtn = e.target.closest('button[type="submit"]');
                if (submitBtn) {
                    this.handleSaveItem(e);
                }
            }
            // Handle cancel button
            else if (e.target.closest('.cancel-item-btn') || e.target.closest('#closeItemForm')) {
                e.preventDefault();
                this.hideItemForm();
            } 
            // Handle edit button in item list
            else if (e.target.closest('.edit-item-btn')) {
                e.preventDefault();
                e.stopPropagation();
                const itemId = e.target.closest('.edit-item-btn').dataset.id;
                if (itemId) this.showEditItemForm(itemId);
            } 
            // Handle delete button
            else if (e.target.closest('.delete-item-btn')) {
                e.preventDefault();
                e.stopPropagation();
                const itemId = e.target.closest('.delete-item-btn').dataset.id;
                if (itemId) {
                    this.handleDeleteItem(itemId);
                }
            } 
            // Handle item row click
            else if (e.target.closest('.item-row')) {
                e.preventDefault();
                const itemRow = e.target.closest('.item-row');
                // Only navigate to details if clicking on the row itself, not on buttons
                if (itemRow && !e.target.closest('button, a, input, select, textarea')) {
                    const itemId = itemRow.dataset.id;
                    if (itemId) {
                        // Highlight the selected item
                        document.querySelectorAll('.item-row').forEach(row => {
                            row.classList.remove('selected');
                        });
                        itemRow.classList.add('selected');
                        
                        // Show item details
                        this.renderItemDetails(itemId);
                    }
                }
            }
        });

        // Handle search input
        const searchInput = this.container.querySelector('.item-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim().toLowerCase();
                this.filterItems(query);
            });
        }

        // Type filter handler
        const typeFilter = this.container.querySelector('.item-type-filter');
        if (typeFilter) {
            typeFilter.addEventListener('change', (e) => {
                const type = e.target.value === 'all' ? null : e.target.value;
                this.filterItemsByType(type);
            });
        }
        
        // Toggle attunement section when checkbox changes
        const requiresAttunement = this.container.querySelector('#requiresAttunement');
        if (requiresAttunement) {
            requiresAttunement.addEventListener('change', () => this.toggleAttunementSection());
        }
        
        // Handle form submission
        const itemForm = this.container.querySelector('#itemForm');
        if (itemForm) {
            itemForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSaveItem(e);
            });
        }
    }

    /**
     * Render the loot section
     */
    renderLootSection() {
        if (!this.lootManager || !this.lootManager.container) {
            console.warn('Cannot render loot section: container not available');
            return;
        }
        
        // Don't modify the container's display - let the navigation manager handle it
        
        // Verify we're rendering in the correct section
        const lootSection = document.getElementById('loot');
        if (lootSection && lootSection !== this.container) {
            console.warn('Container mismatch - updating container reference');
            this.container = lootSection;
        }
        
        // Only clear and render if the loot section is visible/active
        if (!this.container.classList.contains('active')) {
            console.log('Loot section is not active, skipping render');
            return;
        }
        
        // Clear any existing content
        this.container.innerHTML = '';
        
        // Get all items
        const items = this.lootService.getAllItems();
        const hasItems = items && items.length > 0;
        
        // Set the container's inner HTML with the loot interface
        this.container.innerHTML = `
            <div class="loot-container container">
                <div class="loot-header d-flex justify-content-between align-items-center mb-4">
                    <h2 class="mb-0 text-accent">Loot & Inventory</h2>
                    <div class="d-flex gap-2">
                        <div class="input-group max-w-300">
                            <span class="input-group-text bg-card"><i class="fas fa-search"></i></span>
                            <input type="text" class="form-control bg-card text item-search" placeholder="Search items...">
                        </div>
                        <select class="form-select bg-card text item-type-filter max-w-200">
                            <option value="all">All Types</option>
                            ${Object.entries(ItemType).map(([key, value]) => 
                                `<option value="${value}">${this.formatEnumValue(value)}</option>`
                            ).join('')}
                        </select>
                        <button class="button add-item-btn">
                            <i class="fas fa-plus me-1"></i> Add Item
                        </button>
                    </div>
                </div>
                <div class="loot-content" id="lootContent">
                    ${!hasItems ? `
                        <div class="alert alert-info mt-3">
                            No items found. Click the "Add Item" button to get started.
                        </div>` 
                    : ''}
                </div>
                
                <!-- Inline Form Container -->
                <div id="itemFormContainer" class="mt-4 mb-4 d-none">
                    <div class="card">
                        <div class="card-header bg-card d-flex justify-content-between align-items-center">
                            <h5 class="mb-0 text-accent" id="itemFormTitle">Add New Item</h5>
                            <button type="button" class="btn-close" id="closeItemForm" aria-label="Close"></button>
                        </div>
                        <div class="card-body">
                            <form id="itemForm" class="needs-validation" novalidate>
                                <input type="hidden" id="itemId">
                                
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <label for="itemName" class="form-label">Item Name *</label>
                                        <input type="text" class="form-control" id="itemName" required>
                                        <div class="invalid-feedback">Please provide an item name.</div>
                                    </div>
                                    <div class="col-md-3">
                                        <label for="itemType" class="form-label">Type *</label>
                                        <select class="form-select" id="itemType" required>
                                            ${Object.entries(ItemType).map(([key, value]) => 
                                                `<option value="${value}">${this.formatEnumValue(value)}</option>`
                                            ).join('')}
                                        </select>
                                    </div>
                                    <div class="col-md-3">
                                        <label for="itemRarity" class="form-label">Rarity *</label>
                                        <select class="form-select" id="itemRarity" required>
                                            ${Object.entries(ItemRarity).map(([key, value]) => 
                                                `<option value="${value}">${this.formatEnumValue(value)}</option>`
                                            ).join('')}
                                        </select>
                                    </div>
                                </div>
                                
                                <div class="row mb-3">
                                    <div class="col-md-2">
                                        <label for="itemQuantity" class="form-label">Quantity</label>
                                        <input type="number" class="form-control" id="itemQuantity" value="1" min="1">
                                    </div>
                                    <div class="col-md-2">
                                        <label for="itemWeight" class="form-label">Weight (lbs)</label>
                                        <input type="number" class="form-control" id="itemWeight" step="0.1" min="0">
                                    </div>
                                    <div class="col-md-2">
                                        <label for="itemValue" class="form-label">Value (gp)</label>
                                        <input type="number" class="form-control" id="itemValue" min="0">
                                    </div>
                                    <div class="col-md-3">
                                        <label for="itemCondition" class="form-label">Condition</label>
                                        <select class="form-select" id="itemCondition">
                                            ${Object.entries(ItemCondition).map(([key, value]) => 
                                                `<option value="${value}">${this.formatEnumValue(value)}</option>`
                                            ).join('')}
                                        </select>
                                    </div>
                                    <div class="col-md-3 d-flex align-items-end">
                                        <div class="form-check form-switch mb-3">
                                            <input class="form-check-input" type="checkbox" role="switch" id="isMagic">
                                            <label class="form-check-label" for="isMagic">Magic Item</label>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="itemDescription" class="form-label">Description</label>
                                    <textarea class="form-control" id="itemDescription" rows="3"></textarea>
                                </div>
                                
                                <div class="mb-3">
                                    <div class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" role="switch" id="requiresAttunement">
                                        <label class="form-check-label" for="requiresAttunement">Requires Attunement</label>
                                    </div>
                                </div>
                                
                                <div id="attunementSection" class="mb-3 d-none">
                                    <label for="attunedTo" class="form-label">Attuned To</label>
                                    <select class="form-select bg-card text" id="attunedTo" data-relational="true" data-entity-type="character" data-placeholder="Search or select character...">
                                        <option value="">Select a character...</option>
                                    </select>
                                </div>
                                
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <label for="itemTags" class="form-label">Tags (comma-separated)</label>
                                        <input type="text" class="form-control" id="itemTags" placeholder="weapon, magical, plot">
                                    </div>
                                    <div class="col-md-6">
                                        <label for="itemNotes" class="form-label">Notes</label>
                                        <input type="text" class="form-control" id="itemNotes" placeholder="Additional notes">
                                    </div>
                                </div>
                                
                                <div class="d-flex justify-content-end gap-2">
                                    <button type="button" class="btn btn-secondary" id="cancelItemForm">Cancel</button>
                                    <button type="submit" class="btn btn-primary">Save Item</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // If we have items, render them
        if (hasItems) {
            const lootContent = this.container.querySelector('#lootContent');
            if (lootContent) {
                lootContent.innerHTML = this.renderItemList();
            }
        }
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Set up type filter after rendering
        const typeFilter = this.container.querySelector('.item-type-filter');
        if (typeFilter) {
            typeFilter.addEventListener('change', (e) => {
                const type = e.target.value === 'all' ? null : e.target.value;
                this.filterItemsByType(type);
            });
        }
    }
    
    /**
     * Render the item list
     * @returns {string} HTML string for the item list
     */
    renderItemList() {
        const items = this.lootService.getAllItems();
        
        if (items.length === 0) {
            return `
                <div class="alert alert-info mt-3">
                    No items found. Add your first item to get started!
                </div>
            `;
        }
        
        return items.map(item => `
            <div class="item-row mb-2 p-2 border-bottom bg-card shadow-accent" data-id="${item.id}">
                <div class="row align-items-center">
                    <div class="col-md-4">
                        <strong class="text">${item.name}</strong>
                        ${item.isMagic ? ' <span class="badge bg-primary ms-1"><i class="fas fa-magic"></i></span>' : ''}
                        ${item.requiresAttunement ? ' <span class="badge bg-warning ms-1"><i class="fas fa-link"></i></span>' : ''}
                    </div>
                    <div class="col-md-2">${this.formatEnumValue(item.type)}</div>
                    <div class="col-md-2">
                        <span class="badge" style="background-color: ${this.getRarityColor(item.rarity)}">
                            ${this.formatEnumValue(item.rarity)}
                        </span>
                    </div>
                    <div class="col-md-1 text-center">${item.quantity || 1}</div>
                    <div class="col-md-2 text-end">${this.formatCurrency(item.value)}</div>
                    <div class="col-md-1 text-end">
                        <button class="btn btn-sm btn-outline-primary edit-item-btn me-1" data-id="${item.id}" title="Edit Item">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-item-btn" data-id="${item.id}" title="Delete Item">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Render the item details view
     * @param {string} itemId - The ID of the item to display
     */
    renderItemDetails(itemId) {
        const item = this.lootService.getItemById(itemId);
        if (!item) return;
        
        const detailsContainer = this.container.querySelector('#itemDetails');
        if (!detailsContainer) return;
        
        detailsContainer.innerHTML = `
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">${item.name}</h5>
                    <div>
                        <span class="badge me-1" style="background-color: ${this.getRarityColor(item.rarity)}">
                            ${this.formatEnumValue(item.rarity)}
                        </span>
                        <span class="badge bg-secondary">${this.formatEnumValue(item.type)}</span>
                        ${item.isMagic ? '<span class="badge bg-primary"><i class="fas fa-magic"></i> Magical</span>' : ''}
                        ${item.requiresAttunement ? '<span class="badge bg-warning"><i class="fas fa-link"></i> Requires Attunement</span>' : ''}
                    </div>
                </div>
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <p><strong>Quantity:</strong> ${item.quantity || 1}</p>
                            <p><strong>Weight:</strong> ${item.weight || 0} lbs</p>
                            <p><strong>Value:</strong> ${this.formatCurrency(item.value || 0)}</p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Condition:</strong> ${this.formatEnumValue(item.condition || 'good')}</p>
                            ${item.attunedTo ? `<p><strong>Attuned To:</strong> ${item.attunedTo}</p>` : ''}
                            ${item.dateFound ? `<p><strong>Found On:</strong> ${new Date(item.dateFound).toLocaleDateString()}</p>` : ''}
                        </div>
                    </div>
                    
                    ${item.description ? `
                        <div class="mb-3">
                            <h6>Description</h6>
                            <p>${item.description}</p>
                        </div>
                    ` : ''}
                    
                    ${item.notes ? `
                        <div class="mb-3">
                            <h6>Notes</h6>
                            <p>${item.notes}</p>
                        </div>
                    ` : ''}
                    
                    ${item.tags && item.tags.length > 0 ? `
                        <div class="mb-3">
                            <h6>Tags</h6>
                            <div>
                                ${item.tags.map(tag => `<span class="badge bg-secondary me-1">${tag}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="mt-4">
                        <button class="btn btn-primary edit-item-btn" data-id="${item.id}">
                            <i class="fas fa-edit"></i> Edit Item
                        </button>
                        <button class="btn btn-outline-danger ms-2 delete-item-btn" data-id="${item.id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners to the new buttons
        const editBtn = detailsContainer.querySelector('.edit-item-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => this.showEditItemForm(item.id));
        }
        
        const deleteBtn = detailsContainer.querySelector('.delete-item-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.handleDeleteItem(item.id));
        }
    }

    /**
     * Show the add item form inline
     */
    showAddItemForm() {
        // First, ensure we have a form container in the loot section
        let formContainer = this.container.querySelector('#itemFormContainer');
        
        // If the form container doesn't exist, create it
        if (!formContainer) {
            // Create the form container and add it to the loot section
            formContainer = document.createElement('div');
            formContainer.id = 'itemFormContainer';
            formContainer.className = 'mt-4 mb-4';
            formContainer.style.display = 'none';
            
            // Create the form HTML
            formContainer.innerHTML = `
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center bg-card">
                        <h5 class="mb-0 text-accent" id="itemFormTitle">Add New Item</h5>
                        <button type="button" class="btn-close btn-close-white" id="closeItemForm" aria-label="Close"></button>
                    </div>
                    <div class="card-body bg-card">
                        <form id="itemForm" class="needs-validation" novalidate>
                            <input type="hidden" id="itemId">
                            
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label for="itemName" class="form-label">Item Name *</label>
                                    <input type="text" class="form-control" id="itemName" required>
                                    <div class="invalid-feedback">Please provide an item name.</div>
                                </div>
                                <div class="col-md-3">
                                    <label for="itemType" class="form-label">Type *</label>
                                    <select class="form-select" id="itemType" required>
                                        ${Object.entries(ItemType).map(([key, value]) => 
                                            `<option value="${value}">${this.formatEnumValue(value)}</option>`
                                        ).join('')}
                                    </select>
                                </div>
                                <div class="col-md-3">
                                    <label for="itemRarity" class="form-label">Rarity *</label>
                                    <select class="form-select" id="itemRarity" required>
                                        ${Object.entries(ItemRarity).map(([key, value]) => 
                                            `<option value="${value}">${this.formatEnumValue(value)}</option>`
                                        ).join('')}
                                    </select>
                                </div>
                            </div>
                            
                            <!-- Add the rest of your form fields here -->
                            
                            <div class="d-flex justify-content-end gap-2">
                                <button type="button" class="btn btn-secondary" id="cancelItemForm">Cancel</button>
                                <button type="submit" class="btn btn-primary">Save Item</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            
            // Add the form container to the loot section
            this.container.appendChild(formContainer);
            
            // Set up event listeners for the form
            const closeBtn = formContainer.querySelector('#closeItemForm');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.hideItemForm());
            }
            
            const cancelBtn = formContainer.querySelector('#cancelItemForm');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => this.hideItemForm());
            }
            
            const form = formContainer.querySelector('#itemForm');
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleSaveItem(e);
                });
            }
        }
        
        // Get the form element
        const form = formContainer.querySelector('#itemForm');
        
        if (form) {
            form.reset();
            form.classList.remove('was-validated');
            
            // Reset all form fields to default values
            form.querySelector('#itemId').value = '';
            form.querySelector('#itemName').value = '';
            form.querySelector('#itemType').value = Object.values(ItemType)[0];
            form.querySelector('#itemRarity').value = ItemRarity.COMMON;
            
            // Set other fields if they exist
            const itemQuantity = form.querySelector('#itemQuantity');
            if (itemQuantity) itemQuantity.value = '1';
            
            const itemWeight = form.querySelector('#itemWeight');
            if (itemWeight) itemWeight.value = '';
            
            const itemValue = form.querySelector('#itemValue');
            if (itemValue) itemValue.value = '';
            
            const itemCondition = form.querySelector('#itemCondition');
            if (itemCondition) itemCondition.value = ItemCondition.NEW;
            
            const itemDescription = form.querySelector('#itemDescription');
            if (itemDescription) itemDescription.value = '';
            
            const isMagic = form.querySelector('#isMagic');
            if (isMagic) isMagic.checked = false;
            
            const requiresAttunement = form.querySelector('#requiresAttunement');
            if (requiresAttunement) requiresAttunement.checked = false;
            
            // Initialize the character dropdown for attunement
            const attunedTo = form.querySelector('#attunedTo');
            if (attunedTo) {
                // Get all characters from the data manager
                const characters = this.lootManager.dataManager?.getAllCharacters?.() || [];
                
                // Format characters as options for the dropdown
                const characterOptions = characters.map(character => ({
                    value: character.id,
                    text: character.name || 'Unnamed Character'
                }));
                
                // Initialize the dropdown
                if (typeof RelationalInputs !== 'undefined') {
                    try {
                        // Destroy existing instance if it exists
                        if (attunedTo._tomSelect) {
                            attunedTo._tomSelect.destroy();
                        }
                        
                        // Initialize new dropdown
                        RelationalInputs.initEntityDropdown('#attunedTo', 'character', characterOptions, {
                            placeholder: 'Search or select character...'
                        });
                    } catch (error) {
                        console.error('Error initializing character dropdown:', error);
                    }
                }
            }
            
            const itemTags = form.querySelector('#itemTags');
            if (itemTags) itemTags.value = '';
            
            const itemNotes = form.querySelector('#itemNotes');
            if (itemNotes) itemNotes.value = '';
            
            // Toggle attunement section
            this.toggleAttunementSection();
        }
        
        // Set form title
        const title = formContainer.querySelector('#itemFormTitle');
        if (title) {
            title.textContent = 'Add New Item';
        }
        
        // Show the form container
        formContainer.style.display = 'block';
        
        // Hide any existing item details
        const detailsContainer = this.container.querySelector('#itemDetails');
        if (detailsContainer) {
            detailsContainer.style.display = 'none';
        }
        
        // Scroll to the form
        formContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Focus on the first input field
        const firstInput = formContainer.querySelector('input:not([type="hidden"]), select, textarea');
        if (firstInput) {
            firstInput.focus();
        }
    }
    
    /**
     * Show the edit item form inline
     * @param {string} itemId - The ID of the item to edit
     */
    showEditItemForm(itemId) {
        const item = this.lootService.getItemById(itemId);
        if (!item) {
            this.showToast('Item not found', 'error');
            return;
        }
        
        // Store the current item being edited
        this.currentItem = item;
        
        // First, make sure the form container exists and is properly initialized
        this.ensureFormContainerExists();
        
        // Get the form container and form
        const formContainer = this.container.querySelector('#itemFormContainer');
        const form = formContainer.querySelector('#itemForm');
        
        if (!formContainer || !form) {
            console.error('Form elements not found');
            return;
        }
        
        // Reset form validation
        form.classList.remove('was-validated');
        
        // Set form values from item
        form.querySelector('#itemId').value = item.id || '';
        form.querySelector('#itemName').value = item.name || '';
        form.querySelector('#itemType').value = item.type || ItemType.OTHER;
        form.querySelector('#itemRarity').value = item.rarity || ItemRarity.COMMON;
        
        const itemQuantity = form.querySelector('#itemQuantity');
        if (itemQuantity) itemQuantity.value = item.quantity || 1;
        
        const itemWeight = form.querySelector('#itemWeight');
        if (itemWeight) itemWeight.value = item.weight || 0;
        
        const itemValue = form.querySelector('#itemValue');
        if (itemValue) itemValue.value = item.value || 0;
        
        const itemCondition = form.querySelector('#itemCondition');
        if (itemCondition) itemCondition.value = item.condition || ItemCondition.NEW;
        
        const itemDescription = form.querySelector('#itemDescription');
        if (itemDescription) itemDescription.value = item.description || '';
        
        const isMagic = form.querySelector('#isMagic');
        if (isMagic) isMagic.checked = !!item.isMagic;
        
        const requiresAttunement = form.querySelector('#requiresAttunement');
        if (requiresAttunement) requiresAttunement.checked = !!item.requiresAttunement;
        
        // Initialize the character dropdown for attunement
        const attunedTo = form.querySelector('#attunedTo');
        if (attunedTo) {
            // Get all characters from the data manager
            const characters = this.lootManager.dataManager?.getAllCharacters?.() || [];
            
            // Format characters as options for the dropdown
            const characterOptions = characters.map(character => ({
                value: character.id,
                text: character.name || 'Unnamed Character',
                selected: character.id === item.attunedTo
            }));
            
            // Initialize the dropdown
            if (typeof RelationalInputs !== 'undefined') {
                try {
                    // Destroy existing instance if it exists
                    if (attunedTo._tomSelect) {
                        attunedTo._tomSelect.destroy();
                    }
                    
                    // Initialize new dropdown
                    RelationalInputs.initEntityDropdown('#attunedTo', 'character', characterOptions, {
                        placeholder: 'Search or select character...',
                        selectedId: item.attunedTo
                    });
                } catch (error) {
                    console.error('Error initializing character dropdown:', error);
                    // Fall back to regular select
                    attunedTo.value = item.attunedTo || '';
                }
            } else {
                // Fall back to regular select
                attunedTo.value = item.attunedTo || '';
            }
        }
        
        const itemTags = form.querySelector('#itemTags');
        if (itemTags) itemTags.value = item.tags ? item.tags.join(', ') : '';
        
        const itemNotes = form.querySelector('#itemNotes');
        if (itemNotes) itemNotes.value = item.notes || '';
        
        // Toggle attunement section
        this.toggleAttunementSection();
        
        // Set form title
        const title = formContainer.querySelector('#itemFormTitle');
        if (title) {
            title.textContent = 'Edit Item';
        }
        
        // Hide any existing item details
        const detailsContainer = this.container.querySelector('#itemDetails');
        if (detailsContainer) {
            detailsContainer.style.display = 'none';
        }
        
        // Show the form container
        formContainer.style.display = 'block';
        
        // Scroll to the form
        formContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Focus on the first input field
        const firstInput = form.querySelector('input:not([type="hidden"]), select, textarea');
        if (firstInput) {
            firstInput.focus();
        }
    }
    
    /**
     * Ensure the form container exists and is properly initialized
     */
    ensureFormContainerExists() {
        let formContainer = this.container.querySelector('#itemFormContainer');
        
        // If the form container doesn't exist, create it
        if (!formContainer) {
            formContainer = document.createElement('div');
            formContainer.id = 'itemFormContainer';
            formContainer.className = 'mt-4 mb-4';
            
            // Create the form HTML with all necessary fields
            formContainer.innerHTML = `
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0 text-accent" id="itemFormTitle">Edit Item</h5>
                        <button type="button" class="btn-close btn-close-white" id="closeItemForm" aria-label="Close"></button>
                    </div>
                    <div class="card-body">
                        <form id="itemForm" class="needs-validation" novalidate>
                            <input type="hidden" id="itemId">
                            
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label for="itemName" class="form-label">Item Name *</label>
                                    <input type="text" class="form-control" id="itemName" required>
                                    <div class="invalid-feedback">Please provide an item name.</div>
                                </div>
                                <div class="col-md-3">
                                    <label for="itemType" class="form-label">Type *</label>
                                    <select class="form-select" id="itemType" required>
                                        ${Object.entries(ItemType).map(([key, value]) => 
                                            `<option value="${value}">${this.formatEnumValue(value)}</option>`
                                        ).join('')}
                                    </select>
                                </div>
                                <div class="col-md-3">
                                    <label for="itemRarity" class="form-label">Rarity *</label>
                                    <select class="form-select" id="itemRarity" required>
                                        ${Object.entries(ItemRarity).map(([key, value]) => 
                                            `<option value="${value}">${this.formatEnumValue(value)}</option>`
                                        ).join('')}
                                    </select>
                                </div>
                            </div>
                            
                            <div class="row mb-3">
                                <div class="col-md-2">
                                    <label for="itemQuantity" class="form-label">Quantity</label>
                                    <input type="number" class="form-control" id="itemQuantity" value="1" min="1">
                                </div>
                                <div class="col-md-2">
                                    <label for="itemWeight" class="form-label">Weight (lbs)</label>
                                    <input type="number" class="form-control" id="itemWeight" step="0.1" min="0">
                                </div>
                                <div class="col-md-2">
                                    <label for="itemValue" class="form-label">Value (gp)</label>
                                    <input type="number" class="form-control" id="itemValue" min="0">
                                </div>
                                <div class="col-md-3">
                                    <label for="itemCondition" class="form-label">Condition</label>
                                    <select class="form-select" id="itemCondition">
                                        ${Object.entries(ItemCondition).map(([key, value]) => 
                                            `<option value="${value}">${this.formatEnumValue(value)}</option>`
                                        ).join('')}
                                    </select>
                                </div>
                                <div class="col-md-3 d-flex align-items-end">
                                    <div class="form-check form-switch mb-3">
                                        <input class="form-check-input" type="checkbox" role="switch" id="isMagic">
                                        <label class="form-check-label" for="isMagic">Magic Item</label>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="itemDescription" class="form-label">Description</label>
                                <textarea class="form-control" id="itemDescription" rows="3"></textarea>
                            </div>
                            
                            <div class="mb-3">
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" role="switch" id="requiresAttunement">
                                    <label class="form-check-label" for="requiresAttunement">Requires Attunement</label>
                                </div>
                            </div>
                            
                            <div id="attunementSection" class="mb-3 d-none">
                                <label for="attunedTo" class="form-label">Attuned To</label>
                                <select class="form-select" id="attunedTo" data-relational="true" data-entity-type="character" data-placeholder="Search or select character...">
                                    <option value="">Select a character...</option>
                                </select>
                            </div>
                            
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label for="itemTags" class="form-label">Tags (comma-separated)</label>
                                    <input type="text" class="form-control" id="itemTags" placeholder="weapon, magical, plot">
                                </div>
                                <div class="col-md-6">
                                    <label for="itemNotes" class="form-label">Notes</label>
                                    <input type="text" class="form-control" id="itemNotes" placeholder="Additional notes">
                                </div>
                            </div>
                            
                            <div class="d-flex justify-content-end gap-2">
                                <button type="button" class="button" id="cancelItemForm">Cancel</button>
                                <button type="submit" class="button accent-button">Save Item</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            
            // Add the form container to the loot section
            this.container.appendChild(formContainer);
            
            // Set up event listeners for the form
            const closeBtn = formContainer.querySelector('#closeItemForm');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.hideItemForm());
            }
            
            const cancelBtn = formContainer.querySelector('#cancelItemForm');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => this.hideItemForm());
            }
            
            const form = formContainer.querySelector('#itemForm');
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleSaveItem(e);
                });
            }
            
            // Set up the attunement toggle
            const requiresAttunement = formContainer.querySelector('#requiresAttunement');
            if (requiresAttunement) {
                requiresAttunement.addEventListener('change', () => this.toggleAttunementSection());
            }
        }
        
        return formContainer;
    }
    
    /**
     * Hide the item form
     */
    hideItemForm() {
        // Look for the form container within the loot container
        const formContainer = this.container.querySelector('#itemFormContainer');
        if (formContainer) {
            formContainer.style.display = 'none';
            
            // Show the item details if we have a current item
            if (this.currentItem) {
                this.renderItemDetails(this.currentItem.id);
            }
            
            // Reset the current item
            this.currentItem = null;
        }
        
        // Reset the form
        const form = this.container.querySelector('#itemForm');
        if (form) {
            form.reset();
            form.classList.remove('was-validated');
        }
    }
    
    /**
     * Toggle the attunement section based on checkbox state
     */
    toggleAttunementSection() {
        // Look for these elements within the loot container
        const formContainer = this.container.querySelector('#itemFormContainer');
        if (!formContainer) return;
        
        const requiresAttunement = formContainer.querySelector('#requiresAttunement');
        const attunementSection = formContainer.querySelector('#attunementSection');
        
        if (requiresAttunement && attunementSection) {
            attunementSection.style.display = requiresAttunement.checked ? 'block' : 'none';
        }
    }
    
    /**
     * Handle deleting an item with a custom modal confirmation
     * @param {string} itemId - The ID of the item to delete
     */
    handleDeleteItem(itemId) {
        const item = this.lootService.getItemById(itemId);
        if (!item) {
            console.error('Item not found:', itemId);
            return;
        }
        
        // Check if confirmation modal already exists
        let confirmModal = document.getElementById('deleteItemConfirmModal');
        
        // If it doesn't exist, create it
        if (!confirmModal) {
            confirmModal = document.createElement('div');
            confirmModal.id = 'deleteItemConfirmModal';
            confirmModal.className = 'modal fade';
            confirmModal.setAttribute('tabindex', '-1');
            confirmModal.setAttribute('aria-labelledby', 'deleteItemConfirmModalLabel');
            confirmModal.setAttribute('aria-hidden', 'true');
            
            confirmModal.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-content bg-card">
                        <div class="modal-header">
                            <h5 class="modal-title text-accent" id="deleteItemConfirmModalLabel">Confirm Deletion</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body text">
                            <p>Are you sure you want to delete <strong id="deleteItemName"></strong>?</p>
                            <p>This action cannot be undone.</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-danger" id="confirmDeleteItemBtn">Delete</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(confirmModal);
        }
        
        // Set the item name in the modal
        const itemNameEl = confirmModal.querySelector('#deleteItemName');
        if (itemNameEl) {
            itemNameEl.textContent = item.name;
        }
        
        // Initialize the modal if it's not already initialized
        let bsModal = bootstrap.Modal.getInstance(confirmModal);
        if (!bsModal) {
            bsModal = new bootstrap.Modal(confirmModal);
        }
        
        // Remove any existing event listeners from the confirm button
        const confirmBtn = confirmModal.querySelector('#confirmDeleteItemBtn');
        if (confirmBtn) {
            const newConfirmBtn = confirmBtn.cloneNode(true);
            confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
            
            // Add event listener to the new confirm button
            newConfirmBtn.addEventListener('click', () => {
                // Delete the item
                const success = this.lootService.deleteItem(itemId);
                
                if (success) {
                    // Hide the modal
                    bsModal.hide();
                    
                    // Update the UI
                    this.renderItemList();
                    
                    // Clear the details view if we were showing the deleted item
                    const detailsContainer = this.container.querySelector('#itemDetails');
                    if (detailsContainer && detailsContainer.dataset.itemId === itemId) {
                        detailsContainer.innerHTML = '';
                        detailsContainer.style.display = 'none';
                    }
                    
                    // Show success message
                    this.showToast('Item deleted successfully', 'success');
                } else {
                    // Show error message
                    this.showToast('Failed to delete item', 'error');
                }
            });
        }
        
        // Show the modal
        bsModal.show();
    }

    /**
     * Show a toast notification
     * @param {string} message - The message to display
     * @param {string} type - The type of toast (success, error, warning, info)
     */
    showToast(message, type = 'info') {
        // Create toast container if it doesn't exist
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            document.body.appendChild(toastContainer);
        }
        
        // Create a unique ID for this toast
        const toastId = 'toast-' + Date.now();
        
        // Set the appropriate background class based on type
        let bgClass = 'bg-info';
        if (type === 'success') bgClass = 'bg-success';
        if (type === 'error') bgClass = 'bg-danger';
        if (type === 'warning') bgClass = 'bg-warning';
        
        // Create the toast element
        const toastEl = document.createElement('div');
        toastEl.id = toastId;
        toastEl.className = `toast ${bgClass} text-white`;
        toastEl.setAttribute('role', 'alert');
        toastEl.setAttribute('aria-live', 'assertive');
        toastEl.setAttribute('aria-atomic', 'true');
        
        toastEl.innerHTML = `
            <div class="toast-header ${bgClass} text-white">
                <strong class="me-auto">${type.charAt(0).toUpperCase() + type.slice(1)}</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        `;
        
        // Add the toast to the container
        toastContainer.appendChild(toastEl);
        
        // Initialize and show the toast
        const toast = new bootstrap.Toast(toastEl, { autohide: true, delay: 5000 });
        toast.show();
        
        // Remove the toast element after it's hidden
        toastEl.addEventListener('hidden.bs.toast', () => {
            toastEl.remove();
        });
    }
    
    /**
     * Handle saving an item
     * @param {Event} event - The form submission event
     */
    handleSaveItem(event) {
        event.preventDefault();
        
        // Look for the form within the loot container
        const form = this.container.querySelector('#itemForm');
        if (!form || !form.checkValidity()) {
            if (form) form.classList.add('was-validated');
            return false;
        }
        
        try {
            // Get form values
            const itemId = form.querySelector('#itemId').value;
            const isNewItem = !itemId;
            
            // Prepare item data
            const itemData = {
                id: itemId || crypto.randomUUID(),
                name: form.querySelector('#itemName').value.trim(),
                type: form.querySelector('#itemType').value,
                rarity: form.querySelector('#itemRarity').value,
                dateModified: new Date().toISOString()
            };
            
            // Add optional fields if they exist
            const itemQuantity = form.querySelector('#itemQuantity');
            if (itemQuantity) {
                itemData.quantity = parseInt(itemQuantity.value) || 1;
            }
            
            const itemWeight = form.querySelector('#itemWeight');
            if (itemWeight) {
                itemData.weight = parseFloat(itemWeight.value) || 0;
            }
            
            const itemValue = form.querySelector('#itemValue');
            if (itemValue) {
                itemData.value = parseInt(itemValue.value) || 0;
            }
            
            const itemCondition = form.querySelector('#itemCondition');
            if (itemCondition) {
                itemData.condition = itemCondition.value;
            }
            
            const itemDescription = form.querySelector('#itemDescription');
            if (itemDescription) {
                itemData.description = itemDescription.value.trim();
            }
            
            const isMagic = form.querySelector('#isMagic');
            if (isMagic) {
                itemData.isMagic = isMagic.checked;
            }
            
            const requiresAttunement = form.querySelector('#requiresAttunement');
            const attunedTo = form.querySelector('#attunedTo');
            if (requiresAttunement) {
                itemData.requiresAttunement = requiresAttunement.checked;
                if (requiresAttunement.checked && attunedTo) {
                    itemData.attunedTo = attunedTo.value.trim();
                }
            }
            
            const itemTags = form.querySelector('#itemTags');
            if (itemTags) {
                itemData.tags = itemTags.value
                    ? itemTags.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                    : [];
            }
            
            const itemNotes = form.querySelector('#itemNotes');
            if (itemNotes) {
                itemData.notes = itemNotes.value.trim();
            }
            
            // Add date found for new items
            if (isNewItem) {
                itemData.dateFound = new Date().toISOString();
            }
            
            // Save the item
            const savedItem = isNewItem 
                ? this.lootService.addItem(itemData)
                : this.lootService.updateItem(itemId, itemData);
            
            if (savedItem) {
                this.showToast(
                    `Item ${isNewItem ? 'added' : 'updated'} successfully!`,
                    'success'
                );
                
                // Hide the form and refresh the UI
                this.hideItemForm();
                this.renderLootSection();
                
                // Show the details of the saved item
                this.renderItemDetails(savedItem.id);
                
                return true;
            } else {
                throw new Error('Failed to save item');
            }
        } catch (error) {
            console.error('Error saving item:', error);
            this.showToast(
                'An error occurred while saving the item. Please try again.',
                'error'
            );
            return false;
        }
    }

    /**
     * Handle deleting an item
     * @param {string} itemId - The ID of the item to delete
     */
    handleDeleteItem(itemId) {
        // Prevent multiple confirmations by using a static flag and checking if we're already deleting
        if (LootUI._isDeleting) {
            console.log('Delete operation already in progress');
            return;
        }
        
        try {
            // Set the static flag to prevent multiple confirmations
            LootUI._isDeleting = true;
            
            // Use a custom modal instead of the native confirm dialog
            this.showDeleteConfirmation(itemId);
        } catch (error) {
            console.error('Error in delete handler:', error);
            LootUI._isDeleting = false;
            this.showToast('An error occurred while trying to delete the item', 'error');
        }
    }
    
    /**
     * Show a custom delete confirmation modal
     * @param {string} itemId - The ID of the item to delete
     */
    showDeleteConfirmation(itemId) {
        // Create the modal element
        const modalId = `delete-confirm-${Date.now()}`;
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = modalId;
        modal.setAttribute('tabindex', '-1');
        modal.setAttribute('aria-hidden', 'true');
        
        // Set the modal content
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content bg-card">
                    <div class="modal-header border-secondary">
                        <h5 class="modal-title text-accent">Confirm Deletion</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>Are you sure you want to delete this item? This action cannot be undone.</p>
                    </div>
                    <div class="modal-footer border-secondary">
                        <button type="button" class="button" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="button btn-danger" id="confirm-delete-btn">Delete</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add the modal to the document
        document.body.appendChild(modal);
        
        // Initialize the Bootstrap modal
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
        
        // Handle the delete confirmation
        const confirmBtn = modal.querySelector('#confirm-delete-btn');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                // Perform the delete operation
                const success = this.lootService.deleteItem(itemId);
                if (success) {
                    this.showToast('Item deleted successfully', 'success');
                    this.renderLootSection();
                    
                    // Clear the details view
                    const detailsContainer = this.container.querySelector('#itemDetails');
                    if (detailsContainer) {
                        detailsContainer.innerHTML = `
                            <div class="empty-state">
                                <i class="fas fa-search"></i>
                                <p>Select an item to view details</p>
                            </div>
                        `;
                    }
                } else {
                    this.showToast('Failed to delete item', 'error');
                }
                
                // Hide and remove the modal
                modalInstance.hide();
            });
        }
        
        // Clean up when the modal is hidden
        modal.addEventListener('hidden.bs.modal', () => {
            document.body.removeChild(modal);
            // Reset the deleting flag
            LootUI._isDeleting = false;
        });
    }

    /**
     * Filter items by search query
     * @param {string} query - The search query
     */
    filterItems(query) {
        const filteredItems = this.lootService.searchItems(query);
        this.renderFilteredItems(filteredItems);
    }

    /**
     * Filter items by type
     * @param {string} type - The type to filter by
     */
    filterItemsByType(type) {
        const filteredItems = type 
            ? this.lootService.filterItemsByType(type)
            : this.lootService.getAllItems();
        this.renderFilteredItems(filteredItems);
    }

    /**
     * Render filtered items
     * @param {Array<Item>} items - The items to render
     */
    renderFilteredItems(items) {
        const lootContent = this.container.querySelector('#lootContent');
        if (!lootContent) return;
        
        if (items.length === 0) {
            lootContent.innerHTML = `
                <div class="alert alert-info mt-3">
                    No items match your search criteria.
                </div>
            `;
            return;
        }
        
        lootContent.innerHTML = items.map(item => `
            <div class="item-row mb-2 p-2 border-bottom" data-id="${item.id}">
                <div class="row align-items-center">
                    <div class="col-md-4">
                        <strong>${item.name}</strong>
                        ${item.isMagic ? ' <span class="badge bg-primary ms-1"><i class="fas fa-magic"></i></span>' : ''}
                        ${item.requiresAttunement ? ' <span class="badge bg-warning ms-1"><i class="fas fa-link"></i></span>' : ''}
                    </div>
                    <div class="col-md-2">${this.formatEnumValue(item.type)}</div>
                    <div class="col-md-2">
                        <span class="badge" style="background-color: ${this.getRarityColor(item.rarity)}">
                            ${this.formatEnumValue(item.rarity)}
                        </span>
                    </div>
                    <div class="col-md-1 text-center">${item.quantity || 1}</div>
                    <div class="col-md-2 text-end">${this.formatCurrency(item.value)}</div>
                    <div class="col-md-1 text-end">
                        <button class="btn btn-sm btn-outline-primary edit-item-btn me-1" data-id="${item.id}" title="Edit Item">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-item-btn" data-id="${item.id}" title="Delete Item">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add event listeners to the new buttons
        this.setupItemListEventListeners();
    }

    /**
     * Toggle the attunement section based on the requiresAttunement checkbox
     */
    toggleAttunementSection() {
        const requiresAttunement = document.getElementById('requiresAttunement');
        const attunementSection = document.getElementById('attunementSection');
        
        if (!requiresAttunement || !attunementSection) return;
        
        requiresAttunement.addEventListener('change', () => {
            attunementSection.style.display = requiresAttunement.checked ? 'block' : 'none';
        });
        
        // Initial state
        attunementSection.style.display = requiresAttunement.checked ? 'block' : 'none';
    }

    /**
     * Show a toast notification
     * @param {string} message - The message to display
     * @param {string} type - The type of toast (success, error, warning, info)
     */
    showToast(message, type = 'info') {
        // You can implement a toast notification system here
        // For now, we'll just log to the console
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        // If you're using Bootstrap 5's toast component, you can uncomment and use this:
        /*
        const toastContainer = document.getElementById('toastContainer') || document.body;
        const toastId = `toast-${Date.now()}`;
        const toastHtml = `
            <div class="toast align-items-center text-white bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true" id="${toastId}">
                <div class="d-flex">
                    <div class="toast-body">
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;
        
        toastContainer.insertAdjacentHTML('beforeend', toastHtml);
        const toastElement = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
        
        // Remove the toast after it's hidden
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
        */
    }

    /**
     * Format an enum value for display
     * @param {string} value - The enum value to format
     * @returns {string} The formatted value
     */
    formatEnumValue(value) {
        if (!value) return '';
        return value
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }
    
    /**
     * Get the color for an item rarity
     * @param {string} rarity - The rarity value
     * @returns {string} The color hex code
     */
    getRarityColor(rarity) {
        const colors = {
            'COMMON': '#6c757d',      // Gray
            'UNCOMMON': '#198754',    // Green
            'RARE': '#0d6efd',        // Blue
            'VERY_RARE': '#6f42c1',   // Purple
            'LEGENDARY': '#fd7e14',    // Orange
            'ARTIFACT': '#dc3545',     // Red
            'UNIQUE': '#e91e63',       // Pink
        };
        return colors[rarity] || '#6c757d';  // Default to gray
    }

    /**
     * Format a currency value
     * @param {number} value - The value in copper pieces
     * @returns {string} The formatted currency string
     */
    formatCurrency(value) {
        if (value === undefined || value === null) return '0 cp';
        
        const pp = Math.floor(value / 1000);
        const gp = Math.floor((value % 1000) / 100);
        const ep = Math.floor((value % 100) / 50);
        const sp = Math.floor((value % 50) / 10);
        const cp = value % 10;
        
        const parts = [];
        if (pp > 0) parts.push(`${pp} pp`);
        if (gp > 0) parts.push(`${gp} gp`);
        if (ep > 0) parts.push(`${ep} ep`);
        if (sp > 0) parts.push(`${sp} sp`);
        if (cp > 0 || parts.length === 0) parts.push(`${cp} cp`);
        
        return parts.join(', ');
    }
    /**
     * Set up event listeners for the item list
     */
    setupItemListEventListeners() {
        // Handle item clicks
        document.querySelectorAll('[data-item-id]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const itemId = item.getAttribute('data-item-id');
                if (itemId) {
                    this.renderItemDetails(itemId);
                    // Highlight the selected item
                    document.querySelectorAll('[data-item-id]').forEach(i => {
                        i.classList.remove('active');
                    });
                    item.classList.add('active');
                }
            });
        });
    }
    
    /**
     * Clean up resources and event listeners
     */
    cleanup() {
        if (!this.initialized) return;
        
        // Remove any event listeners
        try {
            // Remove any modal event listeners if using modals
            const modals = this.container.querySelectorAll('.modal');
            modals.forEach(modal => {
                const modalInstance = bootstrap.Modal.getInstance(modal);
                if (modalInstance) {
                    modalInstance.dispose();
                }
            });
            
            // Remove any tooltips
            const tooltips = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            tooltips.forEach(tooltip => {
                const tooltipInstance = bootstrap.Tooltip.getInstance(tooltip);
                if (tooltipInstance) {
                    tooltipInstance.dispose();
                }
            });
        } catch (e) {
            console.warn('Error cleaning up UI components:', e);
        }
        
        // Clear the container but keep it in the DOM
        this.container.innerHTML = '';
        
        // Reset state
        this.isRendered = false;
        this.initialized = false;
        this.currentItem = null;
    }
}

export default LootUI;
