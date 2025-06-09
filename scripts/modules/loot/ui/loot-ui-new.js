/**
 * Loot UI Component
 * Handles the rendering and interaction for loot-related UI elements
 * Uses the BaseUI class for consistent UI patterns
 */

import { BaseUI } from '../../../components/base-ui.js';
import { createListItem, createDetailsPanel, showToast } from '../../../components/ui-components.js';
import { ItemType, ItemRarity, ItemCondition } from '../enums/loot-enums.js';
import { getRarityBadgeClass, formatEnumValue, getRarityColor, formatCurrency } from '../../../utils/style-utils.js';

export class LootUI extends BaseUI {
    /**
     * Create a new LootUI instance
     * @param {Object} lootService - Instance of LootService
     * @param {Object} dataManager - Instance of DataManager for accessing related entities
     */
    constructor(lootService, dataManager) {
        super({
            containerId: 'loot',
            listId: 'itemList',
            detailsId: 'itemDetails',
            searchId: 'lootItemSearch',
            addButtonId: 'addItemBtn',
            entityName: 'item',
            getAll: () => lootService.getAllItems(),
            getById: (id) => lootService.getItemById(id),
            add: (item) => lootService.createItem(item),
            update: (id, updates) => lootService.updateItem(id, updates),
            delete: (id) => lootService.deleteItem(id)
        });
        
        this.lootService = lootService;
        this.dataManager = dataManager;
        
        // Bind additional methods
        this.formatCurrency = this.formatCurrency.bind(this);
        this.getRarityColor = this.getRarityColor.bind(this);
        this.toggleAttunementSection = this.toggleAttunementSection.bind(this);
        
        // Set up event listeners for the new buttons
        this.setupEventListeners();
        
        console.log('LootUI initialized with container:', this.container);
    }
    
    /**
     * Set up event listeners for the loot UI
     */
    setupEventListeners() {
        // Add event listener for the "Add First Item" button
        const addFirstItemBtn = document.getElementById('addFirstItemBtn');
        if (addFirstItemBtn) {
            addFirstItemBtn.addEventListener('click', () => {
                this.handleAdd();
            });
        }
    }
    
    /**
     * Create a list item for an item
     * @param {Object} item - Item to create list item for
     * @returns {HTMLElement} The created list item
     */
    createListItem(item) {
        const itemElement = document.createElement('div');
        itemElement.className = `loot-item ${this.currentEntity && this.currentEntity.id === item.id ? 'loot-item--selected' : ''}`;
        itemElement.dataset.id = item.id;
        
        // Format metadata
        const rarityClass = item.rarity ? item.rarity.toLowerCase().replace(/\s+/g, '-') : 'common';
        const rarityBadge = item.rarity ? 
            `<span class="rarity-badge rarity-badge--${rarityClass}">${formatEnumValue(item.rarity)}</span>` : '';
        
        itemElement.innerHTML = `
            <div class="loot-item__info">
                <h4 class="loot-item__name">${item.name || 'Unnamed Item'}</h4>
                <div class="loot-item__meta">
                    <span>${formatEnumValue(item.type)}</span>
                    ${item.attunedTo ? '<span><i class="fas fa-link"></i> Attuned</span>' : ''}
                    <span>${this.formatCurrency(item.value || 0)}</span>
                </div>
            </div>
            <div class="loot-item__actions">
                ${rarityBadge}
                <button class="btn btn-sm btn-outline-secondary edit-item" data-id="${item.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger delete-item" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add click handler for the item
        itemElement.addEventListener('click', (e) => {
            if (!e.target.closest('.edit-item') && !e.target.closest('.delete-item')) {
                this.handleSelect(item.id);
            }
        });
        
        // Add click handlers for action buttons
        const editBtn = itemElement.querySelector('.edit-item');
        const deleteBtn = itemElement.querySelector('.delete-item');
        
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleEdit(item.id);
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleDelete(item.id);
            });
        }
        
        return itemElement;
    }
    
    /**
     * Render the details for an item
     * @param {Object} item - Item to render details for
     */
    renderDetails(item) {
        if (!item) {
            this.detailsElement.innerHTML = `
                <div class="loot-empty">
                    <i class="fas fa-coins fa-3x mb-3"></i>
                    <p class="loot-empty__message">Select an item to view details</p>
                </div>
            `;
            return;
        }
        
        // Format rarity class
        const rarityClass = item.rarity ? item.rarity.toLowerCase().replace(/\s+/g, '-') : 'common';
        const rarityBadge = item.rarity ? 
            `<span class="rarity-badge rarity-badge--${rarityClass}">${formatEnumValue(item.rarity)}</span>` : '';
        
        // Format attunement status
        const attunementStatus = item.requiresAttunement ? 
            (item.attunedTo ? 
                `<span class="text-success"><i class="fas fa-check-circle"></i> Attuned to ${item.attunedTo || 'someone'}</span>` : 
                '<span class="text-warning"><i class="fas fa-exclamation-circle"></i> Requires attunement</span>') : 
            '<span class="text-muted"><i class="fas fa-times-circle"></i> No attunement required</span>';
        
        // Format properties
        const properties = [
            { label: 'Type', value: formatEnumValue(item.type) },
            { label: 'Rarity', value: rarityBadge, isHtml: true },
            { label: 'Value', value: this.formatCurrency(item.value) },
            { label: 'Weight', value: item.weight ? `${item.weight} lbs` : 'N/A' },
            { label: 'Condition', value: formatEnumValue(item.condition) },
            { label: 'Attunement', value: attunementStatus, isHtml: true }
        ];
        
        // Create HTML for properties
        const propertiesHtml = properties.map(prop => `
            <div class="loot-detail__property">
                <span class="loot-detail__label">${prop.label}:</span>
                <span class="loot-detail__value">${prop.isHtml ? prop.value : (prop.value || 'N/A')}</span>
            </div>
        `).join('');
        
        // Create HTML for description
        const descriptionHtml = item.description ? `
            <div class="loot-detail__section">
                <h3 class="loot-detail__section-title">Description</h3>
                <div class="loot-detail__content">
                    <p>${item.description}</p>
                </div>
            </div>
        ` : '';
        
        // Create HTML for properties section
        const propertiesSection = `
            <div class="loot-detail__section">
                <h3 class="loot-detail__section-title">Properties</h3>
                <div class="loot-detail__properties">
                    ${propertiesHtml}
                </div>
            </div>
        `;
        
        // Create HTML for attunement section if applicable
        let attunementSection = '';
        if (item.requiresAttunement) {
            attunementSection = `
                <div class="loot-detail__section">
                    <h3 class="loot-detail__section-title">Attunement</h3>
                    <div class="loot-detail__content">
                        <p>${item.attunementNotes || 'No additional attunement requirements specified.'}</p>
                    </div>
                </div>
            `;
        }
        
        // Create HTML for notes section if available
        let notesSection = '';
        if (item.notes) {
            notesSection = `
                <div class="loot-detail__section">
                    <h3 class="loot-detail__section-title">Notes</h3>
                    <div class="loot-detail__content">
                        <p>${item.notes}</p>
                    </div>
                </div>
            `;
        }
        
        // Combine all sections
        this.detailsElement.innerHTML = `
            <div class="loot-detail">
                <div class="loot-detail__header">
                    <h2 class="loot-detail__title">${item.name || 'Unnamed Item'}</h2>
                    <div class="loot-detail__actions">
                        <button class="btn btn-outline-primary btn-sm edit-item" data-id="${item.id}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-outline-danger btn-sm delete-item" data-id="${item.id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
                
                ${propertiesSection}
                ${descriptionHtml}
                ${attunementSection}
                ${notesSection}
            </div>
        `;
        
        // Add event listeners to the action buttons
        const editBtn = this.detailsElement.querySelector('.edit-item');
        const deleteBtn = this.detailsElement.querySelector('.delete-item');
        
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleEdit(item.id);
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleDelete(item.id);
            });
        }
        
        // Add effects section if applicable
        if (item.effects && item.effects.length > 0) {
            sections.push({
                title: 'Effects',
                content: `
                    <div class="mb-3">
                        <ul class="list-group">
                            ${item.effects.map(effect => `
                                <li class="list-group-item bg-card">${effect}</li>
                            `).join('')}
                        </ul>
                    </div>
                `
            });
        }
        
        // The details are already rendered in the template above
        // No need to create another details panel
    }
    
    /**
     * Handle adding a new item
     */
    handleAdd() {
        // Create form container
        const formContainer = document.createElement('div');
        formContainer.id = 'item-form-container';
        formContainer.className = 'card';
        
        // Create form content
        formContainer.innerHTML = `
            <div class="card-header bg-card">
                <h5 class="card-title mb-0">Add New Item</h5>
            </div>
            <div class="card-body bg-card">
                <form id="item-form">
                    <div class="row mb-3">
                        <div class="col-md-12">
                            <label for="item-name" class="form-label">Name</label>
                            <input type="text" class="form-control" id="item-name" required>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="item-type" class="form-label">Type</label>
                            <select class="form-select" id="item-type">
                                <option value="">Select Type</option>
                                ${Object.entries(ItemType).map(([key, value]) => 
                                    `<option value="${value}">${formatEnumValue(value)}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label for="item-rarity" class="form-label">Rarity</label>
                            <select class="form-select" id="item-rarity">
                                <option value="">Select Rarity</option>
                                ${Object.entries(ItemRarity).map(([key, value]) => 
                                    `<option value="${value}">${formatEnumValue(value)}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="item-value" class="form-label">Value (in copper pieces)</label>
                            <input type="number" class="form-control" id="item-value" min="0" value="0">
                        </div>
                        <div class="col-md-6">
                            <label for="item-condition" class="form-label">Condition</label>
                            <select class="form-select" id="item-condition">
                                <option value="">Select Condition</option>
                                ${Object.entries(ItemCondition).map(([key, value]) => 
                                    `<option value="${value}">${formatEnumValue(value)}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="item-description" class="form-label">Description</label>
                        <textarea class="form-control" id="item-description" rows="4"></textarea>
                    </div>
                    
                    <div class="mb-3 form-check">
                        <input type="checkbox" class="form-check-input" id="item-requires-attunement">
                        <label class="form-check-label" for="item-requires-attunement">Requires Attunement</label>
                    </div>
                    
                    <div id="attunement-section" class="mb-3" style="display: none;">
                        <label for="item-attuned-to" class="form-label">Attuned To</label>
                        <input type="text" class="form-control" id="item-attuned-to">
                    </div>
                    
                    <div class="mb-3">
                        <label for="item-effects" class="form-label">Effects (one per line)</label>
                        <textarea class="form-control" id="item-effects" rows="3"></textarea>
                    </div>
                    
                    <div class="d-flex justify-content-between">
                        <button type="button" class="btn btn-secondary" id="cancel-item-btn">
                            <i class="fas fa-times me-1"></i> Cancel
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save me-1"></i> Save Item
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        // Add form to details panel
        this.detailsElement.innerHTML = '';
        this.detailsElement.appendChild(formContainer);
        
        // Set up event listeners
        const form = document.getElementById('item-form');
        const cancelBtn = document.getElementById('cancel-item-btn');
        const requiresAttunementCheckbox = document.getElementById('item-requires-attunement');
        
        if (form) {
            form.addEventListener('submit', (e) => this.handleItemFormSubmit(e, false));
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.refresh();
            });
        }
        
        if (requiresAttunementCheckbox) {
            requiresAttunementCheckbox.addEventListener('change', this.toggleAttunementSection);
        }
    }
    
    /**
     * Handle editing an item
     * @param {Object} item - Item to edit
     */
    handleEdit(item) {
        // Create form container
        const formContainer = document.createElement('div');
        formContainer.id = 'item-form-container';
        formContainer.className = 'card';
        
        // Create form content
        formContainer.innerHTML = `
            <div class="card-header bg-card">
                <h5 class="card-title mb-0">Edit Item: ${item.name}</h5>
            </div>
            <div class="card-body bg-card">
                <form id="item-form" data-item-id="${item.id}">
                    <div class="row mb-3">
                        <div class="col-md-12">
                            <label for="item-name" class="form-label">Name</label>
                            <input type="text" class="form-control" id="item-name" value="${item.name || ''}" required>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="item-type" class="form-label">Type</label>
                            <select class="form-select" id="item-type">
                                <option value="">Select Type</option>
                                ${Object.entries(ItemType).map(([key, value]) => 
                                    `<option value="${value}" ${item.type === value ? 'selected' : ''}>${formatEnumValue(value)}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label for="item-rarity" class="form-label">Rarity</label>
                            <select class="form-select" id="item-rarity">
                                <option value="">Select Rarity</option>
                                ${Object.entries(ItemRarity).map(([key, value]) => 
                                    `<option value="${value}" ${item.rarity === value ? 'selected' : ''}>${formatEnumValue(value)}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="item-value" class="form-label">Value (in copper pieces)</label>
                            <input type="number" class="form-control" id="item-value" min="0" value="${item.value || 0}">
                        </div>
                        <div class="col-md-6">
                            <label for="item-condition" class="form-label">Condition</label>
                            <select class="form-select" id="item-condition">
                                <option value="">Select Condition</option>
                                ${Object.entries(ItemCondition).map(([key, value]) => 
                                    `<option value="${value}" ${item.condition === value ? 'selected' : ''}>${formatEnumValue(value)}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="item-description" class="form-label">Description</label>
                        <textarea class="form-control" id="item-description" rows="4">${item.description || ''}</textarea>
                    </div>
                    
                    <div class="mb-3 form-check">
                        <input type="checkbox" class="form-check-input" id="item-requires-attunement" ${item.requiresAttunement ? 'checked' : ''}>
                        <label class="form-check-label" for="item-requires-attunement">Requires Attunement</label>
                    </div>
                    
                    <div id="attunement-section" class="mb-3" style="display: ${item.requiresAttunement ? 'block' : 'none'};">
                        <label for="item-attuned-to" class="form-label">Attuned To</label>
                        <input type="text" class="form-control" id="item-attuned-to" value="${item.attunedTo || ''}">
                    </div>
                    
                    <div class="mb-3">
                        <label for="item-effects" class="form-label">Effects (one per line)</label>
                        <textarea class="form-control" id="item-effects" rows="3">${(item.effects || []).join('\n')}</textarea>
                    </div>
                    
                    <div class="d-flex justify-content-between">
                        <button type="button" class="btn btn-secondary" id="cancel-item-btn">
                            <i class="fas fa-times me-1"></i> Cancel
                        </button>
                        <div>
                            <button type="button" class="btn btn-danger me-2" id="delete-item-btn">
                                <i class="fas fa-trash me-1"></i> Delete
                            </button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save me-1"></i> Save Changes
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        `;
        
        // Add form to details panel
        this.detailsElement.innerHTML = '';
        this.detailsElement.appendChild(formContainer);
        
        // Set up event listeners
        const form = document.getElementById('item-form');
        const cancelBtn = document.getElementById('cancel-item-btn');
        const deleteBtn = document.getElementById('delete-item-btn');
        const requiresAttunementCheckbox = document.getElementById('item-requires-attunement');
        
        if (form) {
            form.addEventListener('submit', (e) => this.handleItemFormSubmit(e, true));
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.refresh(item.id);
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.handleDelete(item.id);
            });
        }
        
        if (requiresAttunementCheckbox) {
            requiresAttunementCheckbox.addEventListener('change', this.toggleAttunementSection);
        }
    }
    
    /**
     * Toggle the attunement section based on checkbox state
     */
    toggleAttunementSection() {
        const checkbox = document.getElementById('item-requires-attunement');
        const attunementSection = document.getElementById('attunement-section');
        
        if (checkbox && attunementSection) {
            attunementSection.style.display = checkbox.checked ? 'block' : 'none';
        }
    }
    
    /**
     * Handle item form submission
     * @param {Event} e - Form submit event
     * @param {boolean} isEdit - Whether this is an edit operation
     */
    handleItemFormSubmit(e, isEdit = false) {
        e.preventDefault();
        
        try {
            const form = e.target;
            const itemId = isEdit ? form.getAttribute('data-item-id') : null;
            
            // Get form values
            const itemData = {
                name: document.getElementById('item-name').value,
                type: document.getElementById('item-type').value,
                rarity: document.getElementById('item-rarity').value,
                value: parseInt(document.getElementById('item-value').value) || 0,
                condition: document.getElementById('item-condition').value,
                description: document.getElementById('item-description').value,
                requiresAttunement: document.getElementById('item-requires-attunement').checked,
                attunedTo: document.getElementById('item-attuned-to').value,
                effects: document.getElementById('item-effects').value
                    .split('\n')
                    .map(effect => effect.trim())
                    .filter(effect => effect !== '')
            };
            
            let result;
            
            if (isEdit) {
                // Update existing item
                result = this.update(itemId, itemData);
                showToast({
                    message: 'Item updated successfully',
                    type: 'success'
                });
            } else {
                // Create new item
                result = this.add(itemData);
                showToast({
                    message: 'Item created successfully',
                    type: 'success'
                });
            }
            
            // Refresh the UI and select the item
            this.refresh(isEdit ? itemId : result.id);
        } catch (error) {
            console.error('Error saving item:', error);
            showToast({
                message: `Error saving item: ${error.message}`,
                type: 'error'
            });
        }
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
}
