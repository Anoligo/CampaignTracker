/**
 * BaseUI
 * Base class for all module UI components to ensure consistent structure and behavior
 */

import { createListItem, createDetailsPanel, createSearchBar, createConfirmationModal, showToast } from './ui-components.js';

export class BaseUI {
    /**
     * Create a new BaseUI instance
     * @param {Object} options - Configuration options
     * @param {string} options.containerId - ID of the container element
     * @param {string} options.listId - ID of the list element
     * @param {string} options.detailsId - ID of the details element
     * @param {string} options.searchId - ID of the search input element
     * @param {string} options.addButtonId - ID of the add button element
     * @param {string} options.entityName - Name of the entity (e.g., 'quest', 'character')
     * @param {Function} options.getAll - Function to get all entities
     * @param {Function} options.getById - Function to get entity by ID
     * @param {Function} options.add - Function to add a new entity
     * @param {Function} options.update - Function to update an entity
     * @param {Function} options.delete - Function to delete an entity
     */
    constructor(options) {
        const { 
            containerId, 
            listId, 
            detailsId, 
            searchId, 
            addButtonId,
            entityName,
            getAll,
            getById,
            add,
            update,
            delete: deleteEntity
        } = options;
        
        // Store configuration
        this.entityName = entityName || 'item';
        this.getAll = getAll;
        this.getById = getById;
        this.add = add;
        this.update = update;
        this.delete = deleteEntity;
        
        // Get DOM elements
        this.container = document.getElementById(containerId);
        this.listElement = document.getElementById(listId);
        this.detailsElement = document.getElementById(detailsId);
        this.searchInput = document.getElementById(searchId);
        this.addButton = document.getElementById(addButtonId);
        
        // Initialize state
        this.currentEntity = null;
        this.entities = [];
        
        // Bind methods
        this.handleSearch = this.handleSearch.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.handleAdd = this.handleAdd.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.renderList = this.renderList.bind(this);
        this.renderDetails = this.renderDetails.bind(this);
        this.refresh = this.refresh.bind(this);
    }
    
    /**
     * Initialize the UI
     */
    async init() {
        try {
            // Set up event listeners
            if (this.searchInput) {
                this.searchInput.addEventListener('input', this.handleSearch);
            }
            
            if (this.addButton) {
                this.addButton.addEventListener('click', this.handleAdd);
            } else {
                console.warn(`Add button not found with ID: ${this.addButtonId}`);
            }
            
            // Initial render
            await this.refresh();
        } catch (error) {
            console.error('Error initializing UI:', error);
            showToast(`Error initializing ${this.entityName} UI`, 'error');
        }
    }
    
    /**
     * Refresh the UI
     * @param {string} entityId - Optional ID of entity to select after refresh
     */
    async refresh(entityId = null) {
        try {
            // Force a fresh copy of all entities
            const entities = this.getAll ? await this.getAll() : [];
            this.entities = Array.isArray(entities) ? [...entities] : [];
            
            // Debug log
            console.log(`Refreshing UI with ${this.entities.length} ${this.entityName}(s)`, this.entities);
            
            // Render the list with the fresh data
            this.renderList(this.entities);
            
            // If an entity ID is provided, select it
            if (entityId) {
                // Force a fresh copy of the entity
                const freshEntity = this.getById ? await this.getById(entityId) : null;
                if (freshEntity) {
                    this.currentEntity = freshEntity;
                    this.selectEntity(entityId);
                }
            } else if (this.currentEntity) {
                // Otherwise, refresh the current entity if available
                const freshEntity = this.getById ? await this.getById(this.currentEntity.id) : null;
                if (freshEntity) {
                    this.currentEntity = freshEntity;
                    this.renderDetails(freshEntity);
                }
            }
        } catch (error) {
            console.error('Error refreshing UI:', error);
            showToast(`Error refreshing ${this.entityName} data`, 'error');
        }
    }
    
    /**
     * Render the entity list
     * @param {Array} entities - Entities to render
     */
    renderList(entities) {
        if (!this.listElement) return;
        
        // Clear the list
        this.listElement.innerHTML = '';
        
        if (!entities || entities.length === 0) {
            this.listElement.innerHTML = `
                <div class="text-center p-3 text-muted">
                    No ${this.entityName}s found. Click "Add ${this.entityName}" to create one.
                </div>
            `;
            return;
        }
        
        // Render each entity as a list item
        entities.forEach(entity => {
            const listItem = this.createListItem(entity);
            this.listElement.appendChild(listItem);
        });
    }
    
    /**
     * Create a list item for an entity
     * @param {Object} entity - Entity to create list item for
     * @returns {HTMLElement} The created list item
     */
    createListItem(entity) {
        // This should be overridden by subclasses
        return createListItem({
            id: entity.id,
            title: entity.name || entity.title || `${this.entityName} ${entity.id}`,
            isSelected: this.currentEntity && this.currentEntity.id === entity.id,
            onClick: this.handleSelect
        });
    }
    
    /**
     * Render the details for an entity
     * @param {Object} entity - Entity to render details for
     */
    renderDetails(entity) {
        if (!this.detailsElement) return;
        
        // If no entity is provided, show empty state
        if (!entity) {
            this.detailsElement.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-info-circle"></i>
                    <p class="empty-state-message">Select a ${this.entityName} to view details</p>
                </div>
            `;
            return;
        }
        
        // This should be overridden by subclasses
        const detailsPanel = createDetailsPanel({
            title: entity.name || entity.title || `${this.entityName} ${entity.id}`,
            data: entity,
            actions: [
                {
                    label: 'Edit',
                    icon: 'fas fa-edit',
                    type: 'primary',
                    onClick: () => this.handleEdit(entity)
                },
                {
                    label: 'Delete',
                    icon: 'fas fa-trash',
                    type: 'danger',
                    onClick: () => this.handleDelete(entity.id)
                }
            ],
            sections: [
                {
                    title: 'Details',
                    content: `<p>ID: ${entity.id}</p>`
                }
            ]
        });
        
        // Clear the details element and append the new details panel
        this.detailsElement.innerHTML = '';
        this.detailsElement.appendChild(detailsPanel);
    }
    
    /**
     * Handle entity selection
     * @param {string} entityId - ID of the entity to select
     */
    handleSelect(entityId) {
        this.selectEntity(entityId);
    }
    
    /**
     * Select an entity by ID
     * @param {string} entityId - ID of the entity to select
     */
    selectEntity(entityId) {
        // Get the entity by ID
        const entity = this.getById ? this.getById(entityId) : null;
        
        if (!entity) {
            console.warn(`Entity not found with ID: ${entityId}`);
            return;
        }
        
        // Update the current entity
        this.currentEntity = entity;
        
        // Update the list to show the selected entity
        if (this.listElement) {
            // Remove selected class from all list items
            const items = this.listElement.querySelectorAll('.entity-card');
            items.forEach(item => item.classList.remove('entity-card-selected'));
            
            // Add selected class to the selected entity
            const selectedItem = this.listElement.querySelector(`[data-entity-id="${entityId}"]`);
            if (selectedItem) {
                selectedItem.classList.add('entity-card-selected');
                selectedItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
        
        // Render the details for the selected entity
        this.renderDetails(entity);
    }
    
    /**
     * Handle entity search
     * @param {Event} e - Input event
     */
    handleSearch(e) {
        const searchTerm = e.target.value.toLowerCase();
        
        if (!searchTerm) {
            this.renderList(this.entities);
            return;
        }
        
        // Filter entities by search term
        // This should be overridden by subclasses for more specific search logic
        const filteredEntities = this.entities.filter(entity => 
            (entity.name && entity.name.toLowerCase().includes(searchTerm)) ||
            (entity.title && entity.title.toLowerCase().includes(searchTerm)) ||
            (entity.description && entity.description.toLowerCase().includes(searchTerm))
        );
        
        this.renderList(filteredEntities);
    }
    
    /**
     * Handle adding a new entity
     * This should be overridden by subclasses
     */
    handleAdd() {
        console.log(`Add ${this.entityName} not implemented`);
    }
    
    /**
     * Handle editing an entity
     * This should be overridden by subclasses
     * @param {Object} entity - Entity to edit
     */
    handleEdit(entity) {
        console.log(`Edit ${this.entityName} not implemented`, entity);
    }
    
    /**
     * Handle deleting an entity
     * @param {string} entityId - ID of the entity to delete
     */
    handleDelete(entityId) {
        createConfirmationModal({
            title: `Delete ${this.entityName}`,
            message: `Are you sure you want to delete this ${this.entityName}? This action cannot be undone.`,
            confirmText: 'Delete',
            onConfirm: () => this.performDelete(entityId)
        });
    }

    /**
     * Perform the actual deletion after confirmation
     * @param {string} entityId
     * @private
     */
    performDelete(entityId) {
        if (!this.delete) return;

        this.delete(entityId);

        if (this.currentEntity && this.currentEntity.id === entityId) {
            this.currentEntity = null;
        }

        this.refresh();

        showToast({
            message: `${this.entityName.charAt(0).toUpperCase() + this.entityName.slice(1)} deleted successfully.`,
            type: 'success'
        });
    }
}
