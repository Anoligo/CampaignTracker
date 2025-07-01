/**
 * Notes UI Component
 * Handles the rendering and interaction for notes-related UI elements
 * Uses the BaseUI class for consistent UI patterns
 */

import { BaseUI } from '../../../components/base-ui.js';
import { createListItem, createDetailsPanel, showToast } from '../../../components/ui-components.js';
import { NoteCategory } from '../enums/note-enums.js';

export class NotesUI extends BaseUI {
    /**
     * Create a new NotesUI instance
     * @param {Object} notesService - Instance of NotesService
     * @param {Object} dataManager - Instance of DataManager for accessing related entities
     */
    constructor(notesService, dataManager) {
        super({
            containerId: 'notes',
            listId: 'noteList',
            detailsId: 'noteDetails',
            searchId: 'noteSearch',
            addButtonId: 'addNoteBtn',
            entityName: 'note',
            getAll: () => notesService.getAllNotes(),
            getById: (id) => notesService.getNoteById(id),
            add: (note) => notesService.createNote(note.title, note.content, note.category),
            update: (id, updates) => notesService.updateNote(id, updates),
            delete: (id) => notesService.deleteNote(id)
        });
        
        this.notesService = notesService;
        this.dataManager = dataManager;
        
        // Bind additional methods
        this.getCategoryBadgeClass = this.getCategoryBadgeClass.bind(this);
        this.getCategoryColor = this.getCategoryColor.bind(this);
        this.formatRelatedEntities = this.formatRelatedEntities.bind(this);
        this.formatTags = this.formatTags.bind(this);
        this.handleRemoveRelatedEntity = this.handleRemoveRelatedEntity.bind(this);
        
        // Add event listener for the removeRelatedEntity custom event
        document.addEventListener('removeRelatedEntity', (e) => {
            const { noteId, entityType, entityId } = e.detail;
            this.handleRemoveRelatedEntity(noteId, entityType, entityId);
        });
    }
    
    /**
     * Create a list item for a note
     * @param {Object} note - Note to create list item for
     * @returns {HTMLElement} The created list item
     */
    createListItem(note) {
        return createListItem({
            id: note.id,
            title: note.title,
            subtitle: this.formatCategoryName(note.category),
            icon: 'fas fa-book',
            isSelected: this.currentEntity && this.currentEntity.id === note.id,
            badgeClass: this.getCategoryBadgeClass(note.category),
            metadata: {
                'Created': new Date(note.createdAt).toLocaleDateString(),
                'Tags': note.tags && note.tags.length ? note.tags.join(', ') : 'None'
            },
            onClick: (id) => this.handleSelect(id)
        });
    }
    
    /**
     * Render the details for a note
     * @param {Object} note - Note to render details for
     */
    renderDetails(note) {
        // Create sections for the details panel
        const sections = [
            {
                title: 'Content',
                content: `
                    <div class="mb-3 note-content">
                        ${note.content.replace(/\n/g, '<br>')}
                    </div>
                `
            }
        ];
        
        // Add tags section if there are tags
        if (note.tags && note.tags.length > 0) {
            sections.push({
                title: 'Tags',
                content: this.formatTags(note.tags)
            });
        }
        
        // Add related entities sections

        // Process related quests
        const relatedQuests = (note.relatedEntities?.quests || []).map(questId => {
            const quest = this.dataManager.appState.quests?.find(q => q.id === questId);
            return {
                id: questId,
                name: quest ? quest.name || quest.title || `Quest ${questId.substring(0,6)}` : `Quest ${questId.substring(0,6)}`
            };
        });
        if (relatedQuests.length > 0) {
            sections.push({
                title: 'Related Quests',
                content: this.formatRelatedEntities(relatedQuests, 'quest')
            });
        }
        
        // Process related locations
        const relatedLocations = (note.relatedEntities?.locations || []).map(locationId => {
            const location = this.dataManager.appState.locations?.find(l => l.id === locationId);
            return {
                id: locationId,
                name: location ? location.name || `Location ${locationId.substring(0,6)}` : `Location ${locationId.substring(0,6)}`
            };
        });
        if (relatedLocations.length > 0) {
            sections.push({
                title: 'Related Locations',
                content: this.formatRelatedEntities(relatedLocations, 'location')
            });
        }
        
        // Process related characters
        const relatedCharacters = (note.relatedEntities?.characters || []).map(characterId => {
            const character = this.dataManager.appState.npcs?.find(c => c.id === characterId);
            return {
                id: characterId,
                name: character ? character.name || `Character ${characterId.substring(0,6)}` : `Character ${characterId.substring(0,6)}`
            };
        });
        if (relatedCharacters.length > 0) {
            sections.push({
                title: 'Related Characters',
                content: this.formatRelatedEntities(relatedCharacters, 'character')
            });
        }
        
        // Process related items
        const relatedItems = (note.relatedEntities?.items || []).map(itemId => {
            const item = this.dataManager.appState.loot?.find(i => i.id === itemId);
            return {
                id: itemId,
                name: item ? item.name || item.title || `Item ${itemId.substring(0,6)}` : `Item ${itemId.substring(0,6)}`
            };
        });
        if (relatedItems.length > 0) {
            sections.push({
                title: 'Related Items',
                content: this.formatRelatedEntities(relatedItems, 'item')
            });
        }
        
        // Add metadata section
        sections.push({
            title: 'Metadata',
            content: `
                <div class="row">
                    <div class="col-md-6">
                        <p><strong>Created:</strong> ${new Date(note.createdAt).toLocaleString()}</p>
                    </div>
                    <div class="col-md-6">
                        <p><strong>Last Updated:</strong> ${note.updatedAt ? new Date(note.updatedAt).toLocaleString() : 'Never'}</p>
                    </div>
                </div>
            `
        });
        
        // Create the details panel
        const detailsPanel = createDetailsPanel({
            title: note.title,
            subtitle: `<span class="badge ${this.getCategoryBadgeClass(note.category)}">${this.formatCategoryName(note.category)}</span>`,
            data: note,
            actions: [
                {
                    label: 'Edit',
                    icon: 'fas fa-edit',
                    type: 'primary',
                    onClick: () => this.handleEdit(note)
                },
                {
                    label: 'Delete',
                    icon: 'fas fa-trash',
                    type: 'danger',
                    onClick: () => this.handleDelete(note.id)
                },
                {
                    label: 'Add Tag',
                    icon: 'fas fa-tag',
                    type: 'info',
                    onClick: () => this.handleAddTag(note.id)
                },
                {
                    label: 'Add Related Entity',
                    icon: 'fas fa-link',
                    type: 'secondary',
                    onClick: () => this.handleAddRelatedEntity(note.id)
                }
            ],
            sections: sections
        });
        
        // Clear the details element and append the new details panel
        this.detailsElement.innerHTML = '';
        this.detailsElement.appendChild(detailsPanel);
    }
    
    /**
     * Format related entities for display
     * @param {Array} entities - Array of related entities
     * @param {string} type - Type of entity (quest, location, character, item)
     * @returns {string} HTML content for related entities
     */
    formatRelatedEntities(entities, type) {
        if (!entities || entities.length === 0) {
            return '<p>None</p>';
        }
        
        const icons = {
            quest: 'fas fa-scroll',
            location: 'fas fa-map-marker-alt',
            character: 'fas fa-user',
            item: 'fas fa-coins'
        };
        
        // Get the current note ID if we have one selected
        const currentNoteId = this.currentEntity ? this.currentEntity.id : null;
        
        // Create a unique function name for this note to handle removals
        const functionName = `removeRelatedEntity_${Date.now()}`;
        
        // Add the function to the window object so it can be called from onclick
        window[functionName] = (noteId, entityType, entityId) => {
            console.log('Removing related entity:', noteId, entityType, entityId);
            
            // Call the NotesService directly to remove the entity
            const success = this.notesService.removeRelatedEntity(noteId, entityType, entityId);
            console.log('Remove operation result:', success);
            
            if (success) {
                // Force a complete refresh of the data
                const updatedNote = this.notesService.getNoteById(noteId);
                console.log('Updated note:', updatedNote);
                
                // Clear the current entity cache
                this.currentEntity = null;
                
                // Reselect the note to force a complete UI refresh
                this.handleSelect(noteId);
                
                // Show success message
                showToast({
                    message: 'Related entity removed successfully',
                    type: 'success'
                });
            } else {
                // Show error message
                showToast({
                    message: 'Failed to remove related entity',
                    type: 'error'
                });
            }
        };
        
        // Generate the HTML with onclick attributes
        return `
            <div class="list-group">
                ${entities.map(entity => `
                    <div class="list-group-item bg-card d-flex justify-content-between align-items-center">
                        <a href="#" class="flex-grow-1 text-decoration-none text-reset" data-${type}-id="${entity.id}">
                            <i class="${icons[type] || 'fas fa-link'} me-2"></i>
                            ${entity.name || entity.title}
                        </a>
                        <button class="btn btn-sm btn-outline-danger" 
                                title="Remove this related entity"
                                onclick="${functionName}('${currentNoteId}', '${type}', '${entity.id}'); return false;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    /**
     * Handle removing a related entity from a note
     * @param {string} noteId - ID of the note to remove the entity from
     * @param {string} entityType - Type of entity to remove (quest, location, character, item)
     * @param {string} entityId - ID of the entity to remove
     */
    handleRemoveRelatedEntity(noteId, entityType, entityId) {
        const note = this.getById(noteId);
        if (!note) return;
        
        // Use the NotesService to remove the related entity
        const success = this.notesService.removeRelatedEntity(noteId, entityType, entityId);
        
        if (success) {
            // Refresh the note to show the updated related entities
            this.refresh(noteId);
            
            showToast({
                message: 'Related entity removed successfully',
                type: 'success'
            });
        } else {
            showToast({
                message: 'Failed to remove related entity',
                type: 'error'
            });
        }
    }
    
    /**
     * Format tags for display
     * @param {Array} tags - Array of tags
     * @returns {string} HTML content for tags
     */
    formatTags(tags) {
        if (!tags || tags.length === 0) {
            return '<p>No tags</p>';
        }
        
        return `
            <div class="d-flex flex-wrap gap-2">
                ${tags.map(tag => `
                    <span class="badge bg-secondary">${tag}</span>
                `).join('')}
            </div>
        `;
    }
    
    /**
     * Handle adding a new note
     */
    handleAdd() {
        // Create form container
        const formContainer = document.createElement('div');
        formContainer.id = 'note-form-container';
        formContainer.className = 'card';
        
        // Create form content
        formContainer.innerHTML = `
            <div class="card-header bg-card">
                <h5 class="card-title mb-0">Add New Note</h5>
            </div>
            <div class="card-body bg-card">
                <form id="note-form">
                    <div class="mb-3">
                        <label for="note-title" class="form-label">Title</label>
                        <input type="text" class="form-control" id="note-title" required>
                    </div>
                    
                    <div class="mb-3">
                        <label for="note-category" class="form-label">Category</label>
                        <select class="form-select" id="note-category" required>
                            <option value="">Select Category</option>
                            ${Object.entries(NoteCategory).map(([key, value]) => 
                                `<option value="${value}">${this.formatCategoryName(value)}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="mb-3">
                        <label for="note-content" class="form-label">Content</label>
                        <textarea class="form-control" id="note-content" rows="8" required></textarea>
                    </div>
                    
                    <div class="d-flex justify-content-between">
                        <button type="button" class="btn btn-secondary" id="cancel-note-btn">
                            <i class="fas fa-times me-1"></i> Cancel
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save me-1"></i> Save Note
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        // Add form to details panel
        this.detailsElement.innerHTML = '';
        this.detailsElement.appendChild(formContainer);
        
        // Set up event listeners
        const form = document.getElementById('note-form');
        const cancelBtn = document.getElementById('cancel-note-btn');
        
        if (form) {
            form.addEventListener('submit', (e) => this.handleNoteFormSubmit(e, false));
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.refresh();
            });
        }
    }
    
    /**
     * Handle editing a note
     * @param {Object} note - Note to edit
     */
    handleEdit(note) {
        // Create form container
        const formContainer = document.createElement('div');
        formContainer.id = 'note-form-container';
        formContainer.className = 'card';
        
        // Create form content
        formContainer.innerHTML = `
            <div class="card-header bg-card">
                <h5 class="card-title mb-0">Edit Note: ${note.title}</h5>
            </div>
            <div class="card-body bg-card">
                <form id="note-form" data-note-id="${note.id}">
                    <div class="mb-3">
                        <label for="note-title" class="form-label">Title</label>
                        <input type="text" class="form-control" id="note-title" value="${note.title || ''}" required>
                    </div>
                    
                    <div class="mb-3">
                        <label for="note-category" class="form-label">Category</label>
                        <select class="form-select" id="note-category" required>
                            <option value="">Select Category</option>
                            ${Object.entries(NoteCategory).map(([key, value]) => 
                                `<option value="${value}" ${note.category === value ? 'selected' : ''}>${this.formatCategoryName(value)}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="mb-3">
                        <label for="note-content" class="form-label">Content</label>
                        <textarea class="form-control" id="note-content" rows="8" required>${note.content || ''}</textarea>
                    </div>
                    
                    <div class="d-flex justify-content-between">
                        <button type="button" class="btn btn-secondary" id="cancel-note-btn">
                            <i class="fas fa-times me-1"></i> Cancel
                        </button>
                        <div>
                            <button type="button" class="btn btn-danger me-2" id="delete-note-btn">
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
        const form = document.getElementById('note-form');
        const cancelBtn = document.getElementById('cancel-note-btn');
        const deleteBtn = document.getElementById('delete-note-btn');
        
        if (form) {
            form.addEventListener('submit', (e) => this.handleNoteFormSubmit(e, true));
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.refresh(note.id);
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.handleDelete(note.id);
            });
        }
    }
    
    /**
     * Handle note form submission
     * @param {Event} e - Form submit event
     * @param {boolean} isEdit - Whether this is an edit operation
     */
    handleNoteFormSubmit(e, isEdit = false) {
        e.preventDefault();
        
        try {
            const form = e.target;
            const noteId = isEdit ? form.getAttribute('data-note-id') : null;
            
            // Get form values
            const noteData = {
                title: document.getElementById('note-title').value,
                category: document.getElementById('note-category').value,
                content: document.getElementById('note-content').value
            };
            
            let result;
            
            if (isEdit) {
                // Update existing note
                result = this.update(noteId, noteData);
                showToast({
                    message: 'Note updated successfully',
                    type: 'success'
                });
            } else {
                // Create new note
                result = this.add(noteData);
                showToast({
                    message: 'Note created successfully',
                    type: 'success'
                });
            }
            
            // Refresh the UI and select the note
            this.refresh(isEdit ? noteId : result.id);
        } catch (error) {
            console.error('Error saving note:', error);
            showToast({
                message: `Error saving note: ${error.message}`,
                type: 'error'
            });
        }
    }
    
    /**
     * Handle adding a tag to a note
     * @param {string} noteId - ID of the note to add a tag to
     */
    handleAddTag(noteId) {
        const note = this.getById(noteId);
        if (!note) return;
        
        const tag = prompt('Enter a new tag:');
        if (!tag || tag.trim() === '') return;
        
        const tags = note.tags || [];
        if (tags.includes(tag)) {
            showToast({
                message: 'Tag already exists',
                type: 'warning'
            });
            return;
        }
        
        tags.push(tag);
        this.update(noteId, { tags });
        this.refresh(noteId);
        
        showToast({
            message: 'Tag added successfully',
            type: 'success'
        });
    }
    
    /**
     * Handle adding a related entity to a note
     * @param {string} noteId - ID of the note to add a related entity to
     */
    handleAddRelatedEntity(noteId) {
        const note = this.getById(noteId);
        if (!note) return;
        
        // Create a modal with buttons for each entity type
        const modalId = 'relatedEntityModal';
        const modalHtml = `
            <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content bg-card">
                        <div class="modal-header">
                            <h5 class="modal-title text-accent" id="${modalId}Label">Add Related Entity</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-4">
                                <h6 class="mb-3">Select Entity Type:</h6>
                                <div class="d-flex flex-wrap gap-2">
                                    <button class="btn btn-outline-primary entity-type-btn" data-type="quest">
                                        <i class="fas fa-scroll me-2"></i>Quests
                                    </button>
                                    <button class="btn btn-outline-primary entity-type-btn" data-type="location">
                                        <i class="fas fa-map-marker-alt me-2"></i>Locations
                                    </button>
                                    <button class="btn btn-outline-primary entity-type-btn" data-type="character">
                                        <i class="fas fa-user-shield me-2"></i>Characters
                                    </button>
                                    <button class="btn btn-outline-primary entity-type-btn" data-type="item">
                                        <i class="fas fa-coins me-2"></i>Items
                                    </button>
                                </div>
                            </div>
                            
                            <div id="entityListContainer" class="d-none">
                                <h6 class="mb-3">Select Entity:</h6>
                                <div class="input-group mb-3">
                                    <span class="input-group-text"><i class="fas fa-search"></i></span>
                                    <input type="text" id="entitySearchInput" class="form-control" placeholder="Search entities...">
                                </div>
                                <div id="entityList" class="list-group" style="max-height: 300px; overflow-y: auto;">
                                    <!-- Entities will be loaded here -->
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" id="addEntityBtn" disabled>Add Selected Entity</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to the DOM if it doesn't exist
        if (!document.getElementById(modalId)) {
            const modalContainer = document.createElement('div');
            modalContainer.innerHTML = modalHtml;
            document.body.appendChild(modalContainer.firstElementChild);
        }
        
        // Get modal elements
        const modal = document.getElementById(modalId);
        const entityListContainer = document.getElementById('entityListContainer');
        const entityList = document.getElementById('entityList');
        const entitySearchInput = document.getElementById('entitySearchInput');
        const addEntityBtn = document.getElementById('addEntityBtn');
        
        // Initialize modal
        const bsModal = new bootstrap.Modal(modal);
        // Define these variables in the outer scope so they can be accessed by all event handlers
        window.noteRelatedEntityVars = {
            selectedEntityType: null,
            selectedEntityId: null,
            currentNoteId: noteId
        };
        
        // Set up event listeners for entity type buttons
        const entityTypeBtns = modal.querySelectorAll('.entity-type-btn');
        entityTypeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Reset selected state
                entityTypeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Get entity type
                window.noteRelatedEntityVars.selectedEntityType = btn.getAttribute('data-type');
                
                // Load entities of the selected type
                this.loadEntitiesOfType(window.noteRelatedEntityVars.selectedEntityType, entityList);
                
                // Show entity list container
                entityListContainer.classList.remove('d-none');
                
                // Reset search input
                entitySearchInput.value = '';
                
                // Disable add button until an entity is selected
                addEntityBtn.disabled = true;
            });
        });
        
        // Set up event listener for entity search input
        entitySearchInput.addEventListener('input', () => {
            const searchTerm = entitySearchInput.value.toLowerCase();
            const entityItems = entityList.querySelectorAll('.list-group-item');
            
            entityItems.forEach(item => {
                const entityName = item.textContent.toLowerCase();
                if (entityName.includes(searchTerm)) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });
        });
        
        // Set up event listener for add entity button
        addEntityBtn.addEventListener('click', () => {
            if (window.noteRelatedEntityVars.selectedEntityType && window.noteRelatedEntityVars.selectedEntityId) {
                this.addRelatedEntityToNote(noteId, window.noteRelatedEntityVars.selectedEntityType, window.noteRelatedEntityVars.selectedEntityId);
                bsModal.hide();
            }
        });
        
        // Show modal
        bsModal.show();
    }
    
    /**
     * Load entities of the specified type into the entity list
     * @param {string} entityType - Type of entity to load (quest, location, character, item)
     * @param {HTMLElement} entityList - The list element to populate
     */
    loadEntitiesOfType(entityType, entityList) {
        // Get the current note ID from the window variable
        const noteId = window.noteRelatedEntityVars.currentNoteId;
        if (!noteId) return;
        
        // Get the current note to check for already related entities
        const currentNote = this.getById(noteId);
        if (!currentNote) return;
        
        // Clear the entity list
        entityList.innerHTML = '';
        
        // Get entities of the specified type
        let entities = [];
        switch (entityType) {
            case 'quest':
                if (this.dataManager.appState.quests) {
                    entities = this.dataManager.appState.quests;
                }
                break;
            case 'location':
                if (this.dataManager.appState.locations) {
                    entities = this.dataManager.appState.locations;
                }
                break;
            case 'character':
                if (this.dataManager.appState.npcs) {
                    entities = this.dataManager.appState.npcs;
                }
                break;
            case 'item':
                if (this.dataManager.appState.loot) {
                    entities = this.dataManager.appState.loot;
                }
                break;
        }
        
        // Check which entities are already related to the note
        const alreadyRelatedIds = new Set(currentNote.relatedEntities?.[`${entityType}s`] || []);
        
        // Filter out already related entities
        const availableEntities = entities.filter(entity => !alreadyRelatedIds.has(entity.id));
        
        // Add entities to the list
        if (availableEntities.length === 0) {
            const emptyItem = document.createElement('div');
            emptyItem.className = 'list-group-item bg-card text-center';
            emptyItem.textContent = alreadyRelatedIds.size > 0 
                ? `All available ${entityType}s are already related to this note.` 
                : `No ${entityType}s found. Create some first.`;
            entityList.appendChild(emptyItem);
        } else {
            availableEntities.forEach(entity => {
                const item = document.createElement('a');
                item.href = '#';
                item.className = 'list-group-item list-group-item-action bg-card';
                item.setAttribute('data-entity-id', entity.id);
                item.textContent = entity.name || entity.title || `${entityType} ${entity.id.substring(0, 6)}`;
                
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    // Remove selected class from all items
                    entityList.querySelectorAll('.list-group-item').forEach(i => {
                        i.classList.remove('active');
                    });
                    
                    // Add selected class to clicked item
                    item.classList.add('active');
                    
                    // Set selected entity ID
                    window.noteRelatedEntityVars.selectedEntityId = entity.id;
                    
                    // Enable add button
                    document.getElementById('addEntityBtn').disabled = false;
                });
                
                entityList.appendChild(item);
            });
        }
    }
    
    /**
     * Add a related entity to a note
     * @param {string} noteId - ID of the note to add the entity to
     * @param {string} entityType - Type of entity to add (quest, location, character, item)
     * @param {string} entityId - ID of the entity to add
     */
    addRelatedEntityToNote(noteId, entityType, entityId) {
        const note = this.getById(noteId);
        if (!note) return;
        
        // Get the entity details
        let entity = null;
        switch (entityType) {
            case 'quest':
                if (this.dataManager.appState.quests) {
                    entity = this.dataManager.appState.quests.find(q => q.id === entityId);
                }
                break;
            case 'location':
                if (this.dataManager.appState.locations) {
                    entity = this.dataManager.appState.locations.find(l => l.id === entityId);
                }
                break;
            case 'character':
                if (this.dataManager.appState.npcs) {
                    entity = this.dataManager.appState.npcs.find(c => c.id === entityId);
                }
                break;
            case 'item':
                if (this.dataManager.appState.loot) {
                    entity = this.dataManager.appState.loot.find(i => i.id === entityId);
                }
                break;
        }
        
        if (!entity) {
            showToast({
                message: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} not found`,
                type: 'error'
            });
            return;
        }
        
        // Use the NotesService to add the related entity
        const success = this.notesService.addRelatedEntity(noteId, entityType, entityId);
        
        if (!success) {
            showToast({
                message: 'Failed to add related entity',
                type: 'error'
            });
            return;
        }
        
        // Refresh the note to show the updated related entities
        const updatedNote = this.getById(noteId);
        
        // Refresh the UI
        this.renderDetails(updatedNote);
        
        showToast({
            message: 'Related entity added successfully',
            type: 'success'
        });
    }
    
    /**
     * Format a category name for display
     * @param {string} category - Category value from NoteCategory enum
     * @returns {string} Formatted category name
     */
    formatCategoryName(category) {
        if (!category) return 'Unknown';
        
        // Find the key for this value in the NoteCategory enum
        const entry = Object.entries(NoteCategory).find(([_, value]) => value === category);
        if (entry) {
            const [key] = entry;
            return key.charAt(0) + key.slice(1).toLowerCase();
        }
        
        // Fallback to formatting the value directly
        return category
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }
    
    /**
     * Get the badge class for a category
     * @param {string} category - Category value from NoteCategory enum
     * @returns {string} CSS class for the badge
     */
    getCategoryBadgeClass(category) {
        const categoryClasses = {
            [NoteCategory.BACKSTORY]: 'bg-primary',
            [NoteCategory.QUEST]: 'bg-success',
            [NoteCategory.LOCATION]: 'bg-info',
            [NoteCategory.CHARACTER]: 'bg-warning text-dark',
            [NoteCategory.ITEM]: 'bg-secondary',
            [NoteCategory.SESSION]: 'bg-dark',
            [NoteCategory.LORE]: 'bg-purple',
            [NoteCategory.OTHER]: 'bg-secondary',
            [NoteCategory.GENERAL]: 'bg-light text-dark border'
        };
        return categoryClasses[category] || 'bg-secondary';
    }
    
    /**
     * Get the color for a category
     * @param {string} category - Category value from NoteCategory enum
     * @returns {string} Color hex code
     */
    getCategoryColor(category) {
        const colors = {
            [NoteCategory.BACKSTORY]: '#0d6efd',
            [NoteCategory.QUEST]: '#198754',
            [NoteCategory.LOCATION]: '#0dcaf0',
            [NoteCategory.CHARACTER]: '#ffc107',
            [NoteCategory.ITEM]: '#6c757d',
            [NoteCategory.SESSION]: '#212529',
            [NoteCategory.LORE]: '#6f42c1',
            [NoteCategory.OTHER]: '#6c757d',
            [NoteCategory.GENERAL]: '#f8f9fa'
        };
        return colors[category] || '#6c757d';
    }
}
