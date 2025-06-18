/**
 * LootForm Component
 * Handles the item form and its interactions
 */

import { ItemType, ItemRarity } from '../enums/loot-enums.js';
import { formatEnumValue, getRarityColor } from '../../../utils/style-utils.js';
import { showToast } from '../../../utils/notifications.js';

export class LootForm {
    /**
     * Create a new LootForm instance
     * @param {LootUI} parent - Parent LootUI instance
     */
    constructor(parent) {
        this.parent = parent;
        this.modal = null;
        this.form = null;
        this.currentItem = null;
        
        // Bind methods
        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
        this.setupEventListeners = this.setupEventListeners.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.render = this.render.bind(this);
    }
    
    /**
     * Show the form with item data (for new or edit)
     * @param {string|Object} [item] - Item ID or data to edit, or undefined for new item
     */
    async show(item) {
        console.groupCollapsed('[LootForm] Showing form for item:', item);
        try {
            if (typeof item === 'string') {
                // If we got an ID, fetch the item data
                try {
                    this.currentItem = await this.parent.getById(item);
                    console.log('Fetched item data:', this.currentItem);
                } catch (error) {
                    console.error('Error fetching item data:', error);
                    this.currentItem = null;
                }
            } else {
                this.currentItem = item || null;
            }
            
            // Ensure the form container is visible
            const formContainer = document.getElementById(this.parent.config.formContainerId);
            const detailsContainer = document.getElementById(this.parent.config.detailsId);
            
            if (formContainer) {
                formContainer.style.display = 'block';
                // Hide the details view when showing the form
                if (detailsContainer) {
                    detailsContainer.style.display = 'none';
                }
            }
            
            this.render();
            
            // Scroll to the form for better UX
            if (formContainer) {
                formContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
            
            console.log('Form shown successfully');
        } catch (error) {
            console.error('Error in show:', error);
            throw error;
        } finally {
            console.groupEnd();
        }
    }
    
    /**
     * Hide the form
     */
    hide() {
        // No-op for inline form, visibility is controlled by the parent
    }
    
    /**
     * Clear the form and reset to default state
     * @returns {void}
     */
    clearForm() {
        try {
            this.currentItem = null;
            if (this.form) {
                this.form.reset();
            }
            console.log('[LootForm] Form cleared');
        } catch (error) {
            console.error('[LootForm] Error clearing form:', error);
        }
    }
    
    /**
     * Handle form submission
     * @param {Event} e - Form submit event
     */
    async handleSave(e) {
        e.preventDefault();
        
        // Validate form
        if (!this.form.checkValidity()) {
            e.stopPropagation();
            this.form.classList.add('was-validated');
            return;
        }
        
        try {
            // Get form data
            const formData = new FormData(this.form);
            
            // Create item data object with all fields
            const itemData = {
                name: formData.get('itemName')?.trim() || 'Unnamed Item',
                type: formData.get('itemType') || 'miscellaneous',
                rarity: formData.get('itemRarity') || 'common',
                description: formData.get('itemDescription')?.trim() || '',
                quantity: parseInt(formData.get('itemQuantity') || '1', 10),
                weight: parseFloat(formData.get('itemWeight') || '0'),
                value: parseInt(formData.get('itemValue') || '0', 10),
                requiresAttunement: formData.get('itemAttunement') === 'on',
                isCursed: formData.get('itemCursed') === 'on',
                properties: {
                    isCursed: formData.get('itemCursed') === 'on',
                    requiresAttunement: formData.get('itemAttunement') === 'on'
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            if (this.currentItem) {
                // Update existing item using parent's update method
                await this.parent.update(this.currentItem.id, itemData);
                showToast('Item updated successfully', 'success');
            } else {
                // Add new item using parent's add method
                itemData.id = `item-${Date.now()}`;
                await this.parent.add(itemData);
                showToast('Item added successfully', 'success');
            }
            
            // Reset form
            this.form.reset();
            
            // Hide the form
            if (this.parent && typeof this.parent.cancelEdit === 'function') {
                this.parent.cancelEdit();
            }
            
            // Refresh the list
            if (this.parent && typeof this.parent.refreshList === 'function') {
                await this.parent.refreshList();
            }
            
            // Dispatch event to notify other components
            document.dispatchEvent(new CustomEvent('lootUpdated'));
            
        } catch (error) {
            console.error('Error saving item:', error);
            const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred';
            showToast(`Error saving item: ${errorMessage}`, 'error');
        }
    }
    
    /**
     * Render the form
     */
    render() {
        const container = document.getElementById('lootFormContainer');
        if (!container) {
            console.error('Form container not found');
            return;
        }
        
        // Clear existing content
        container.innerHTML = '';
        
        const isEdit = !!this.currentItem;
        const title = isEdit ? 'Edit Item' : 'Add New Item';
        
        const form = document.createElement('form');
        form.id = 'lootItemForm';
        form.className = 'needs-validation';
        form.noValidate = true;
        
        form.innerHTML = `
            <div class="card mb-4">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">${title}</h5>
                    <button type="button" class="btn-close" aria-label="Close" id="closeLootForm"></button>
                </div>
                <div class="card-body">
                    <div class="row g-3">
                        <div class="col-md-6">
                            <label for="itemName" class="form-label">Name</label>
                            <input type="text" class="form-control" id="itemName" name="itemName" required>
                            <div class="invalid-feedback">Please provide a name for the item.</div>
                        </div>
                        <div class="col-md-6">
                            <label for="itemType" class="form-label">Type</label>
                            <select class="form-select" id="itemType" name="itemType" required>
                                ${Object.entries(ItemType).map(([key, value]) => 
                                    `<option value="${value}">${formatEnumValue(value)}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label for="itemRarity" class="form-label">Rarity</label>
                            <select class="form-select" id="itemRarity" name="itemRarity" required>
                                ${Object.entries(ItemRarity).map(([key, value]) => 
                                    `<option value="${value}">${formatEnumValue(value)}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="col-md-4">
                            <label for="itemQuantity" class="form-label">Quantity</label>
                            <input type="number" class="form-control" id="itemQuantity" name="itemQuantity" min="1" value="1" required>
                        </div>
                        <div class="col-md-4">
                            <label for="itemWeight" class="form-label">Weight (lbs)</label>
                            <input type="number" class="form-control" id="itemWeight" name="itemWeight" min="0" step="0.1" value="0">
                        </div>
                        <div class="col-md-4">
                            <label for="itemValue" class="form-label">Value (cp)</label>
                            <input type="number" class="form-control" id="itemValue" name="itemValue" min="0" value="0">
                        </div>
                        <div class="col-12">
                            <label for="itemDescription" class="form-label">Description</label>
                            <textarea class="form-control" id="itemDescription" name="itemDescription" rows="3"></textarea>
                        </div>
                        <div class="col-12">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="itemAttunement" name="itemAttunement" value="true">
                                <label class="form-check-label" for="itemAttunement">
                                    Requires Attunement
                                </label>
                            </div>
                        </div>
                        <div class="col-12">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="itemCursed" name="itemCursed" value="true">
                                <label class="form-check-label" for="itemCursed">
                                    Cursed Item
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card-footer text-end">
                    <button type="button" class="btn btn-outline-secondary me-2" id="cancelLootForm">
                        Cancel
                    </button>
                    <button type="submit" class="btn btn-primary">
                        ${isEdit ? 'Update' : 'Add'} Item
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(form);
        
        // Set up form validation
        this.form = form;
        this.setupEventListeners();
        
        // Populate form if editing
        if (isEdit) {
            this.populateForm(this.currentItem);
        }
    }
    
    /**
     * Populate form fields with item data
     * @param {Object} item - The item data to populate the form with
     */
    populateForm(item) {
        if (!item || !this.form) return;
        
        try {
            // Set form values with null/undefined checks
            const nameInput = this.form.querySelector('#itemName');
            const typeSelect = this.form.querySelector('#itemType');
            const raritySelect = this.form.querySelector('#itemRarity');
            const descriptionTextarea = this.form.querySelector('#itemDescription');
            const quantityInput = this.form.querySelector('#itemQuantity');
            const weightInput = this.form.querySelector('#itemWeight');
            const valueInput = this.form.querySelector('#itemValue');
            const attunementCheckbox = this.form.querySelector('#itemAttunement');
            const cursedCheckbox = this.form.querySelector('#itemCursed');
            
            if (nameInput) nameInput.value = item.name || '';
            if (typeSelect && item.type) typeSelect.value = item.type;
            if (raritySelect && item.rarity) raritySelect.value = item.rarity;
            if (descriptionTextarea) descriptionTextarea.value = item.description || '';
            if (quantityInput) quantityInput.value = item.quantity || 1;
            if (weightInput) weightInput.value = item.weight || 0;
            if (valueInput) valueInput.value = item.value || 0;
            if (attunementCheckbox) attunementCheckbox.checked = Boolean(item.requiresAttunement || (item.properties && item.properties.requiresAttunement));
            if (cursedCheckbox) cursedCheckbox.checked = Boolean(item.isCursed || (item.properties && item.properties.isCursed));
            
        } catch (error) {
            console.error('Error populating form:', error);
        }
    }
    
    /**
     * Set up event listeners for the form
     */
    setupEventListeners() {
        if (!this.form) return;
        
        // Form submission
        this.form.addEventListener('submit', this.handleSave);
        
        // Close button
        const closeBtn = this.form.querySelector('#closeLootForm');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.parent && this.parent.cancelEdit) {
                    this.parent.cancelEdit();
                }
            });
        }
        
        // Cancel button
        const cancelBtn = this.form.querySelector('#cancelLootForm');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.parent && this.parent.cancelEdit) {
                    this.parent.cancelEdit();
                }
            });
        }
    }
}
