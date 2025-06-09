import { NoteTag } from '../enums/note-enums.js';

export class NotesForms {
    constructor(notesManager) {
        this.notesManager = notesManager;
        this.dataManager = notesManager.dataManager;
        this.service = notesManager.service;
    }

    showAddTagForm(noteId) {
        const note = this.service.getNoteById(noteId);
        if (!note) return;

        const availableTags = Object.values(NoteTag).filter(tag => !note.tags.includes(tag));
        
        if (availableTags.length === 0) {
            alert('No available tags to add.');
            return;
        }

        const tag = prompt(`Available tags: ${availableTags.join(', ')}\nEnter a tag to add:`);
        if (tag && availableTags.includes(tag)) {
            this.service.addTagToNote(noteId, tag);
            this.notesManager.showNoteDetails(noteId);
        }
    }

    showAddRelatedQuestForm(noteId) {
        const note = this.service.getNoteById(noteId);
        if (!note) return;

        const quests = this.dataManager.appState.quests || [];
        const availableQuests = quests.filter(quest => 
            !(note.relatedEntities?.quests || []).includes(quest.id)
        );

        if (availableQuests.length === 0) {
            alert('No available quests to add.');
            return;
        }

        // Create modal for quest selection
        let modal = document.getElementById('addEntityModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'addEntityModal';
            modal.className = 'modal fade';
            modal.setAttribute('tabindex', '-1');
            document.body.appendChild(modal);
        }
        
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content bg-card">
                    <div class="modal-header border-secondary">
                        <h5 class="modal-title text-accent">Add Quest</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="quest-select" class="form-label text">Select quest:</label>
                            <select class="form-select bg-card text searchable-select" id="quest-select">
                                ${availableQuests.map(quest => 
                                    `<option value="${quest.id}">${quest.title || 'Unnamed quest'}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer border-secondary">
                        <button type="button" class="button" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="button" id="add-quest-confirm">Add</button>
                    </div>
                </div>
            </div>
        `;
        
        // Initialize the Bootstrap modal
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
        
        // Initialize Tom Select for searchable dropdown
        setTimeout(() => {
            const selectElement = document.getElementById('quest-select');
            if (selectElement) {
                new TomSelect(selectElement, {
                    create: false,
                    sortField: { field: 'text', direction: 'asc' },
                    placeholder: 'Search for a quest...',
                    plugins: ['dropdown_input']
                });
            }
        }, 100);
        
        // Add event listener for the confirm button
        document.getElementById('add-quest-confirm').addEventListener('click', () => {
            const questSelect = document.getElementById('quest-select');
            const selectedQuestId = questSelect.value;
            
            if (selectedQuestId) {
                this.service.addRelatedEntity(noteId, 'quest', selectedQuestId);
                modalInstance.hide();
                this.notesManager.showNoteDetails(noteId);
            }
        });
    }

    showAddRelatedLocationForm(noteId) {
        const note = this.service.getNoteById(noteId);
        if (!note) return;

        const locations = this.dataManager.appState.locations || [];
        const availableLocations = locations.filter(location => 
            !(note.relatedEntities?.locations || []).includes(location.id)
        );

        if (availableLocations.length === 0) {
            alert('No available locations to add.');
            return;
        }

        // Create modal for location selection
        let modal = document.getElementById('addEntityModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'addEntityModal';
            modal.className = 'modal fade';
            modal.setAttribute('tabindex', '-1');
            document.body.appendChild(modal);
        }
        
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content bg-card">
                    <div class="modal-header border-secondary">
                        <h5 class="modal-title text-accent">Add Location</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="location-select" class="form-label text">Select location:</label>
                            <select class="form-select bg-card text searchable-select" id="location-select">
                                ${availableLocations.map(location => 
                                    `<option value="${location.id}">${location.name || 'Unnamed location'}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer border-secondary">
                        <button type="button" class="button" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="button" id="add-location-confirm">Add</button>
                    </div>
                </div>
            </div>
        `;
        
        // Initialize the Bootstrap modal
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
        
        // Initialize Tom Select for searchable dropdown
        setTimeout(() => {
            const selectElement = document.getElementById('location-select');
            if (selectElement) {
                new TomSelect(selectElement, {
                    create: false,
                    sortField: { field: 'text', direction: 'asc' },
                    placeholder: 'Search for a location...',
                    plugins: ['dropdown_input']
                });
            }
        }, 100);
        
        // Add event listener for the confirm button
        document.getElementById('add-location-confirm').addEventListener('click', () => {
            const locationSelect = document.getElementById('location-select');
            const selectedLocationId = locationSelect.value;
            
            if (selectedLocationId) {
                this.service.addRelatedEntity(noteId, 'location', selectedLocationId);
                modalInstance.hide();
                this.notesManager.showNoteDetails(noteId);
            }
        });
    }

    showAddRelatedCharacterForm(noteId) {
        const note = this.service.getNoteById(noteId);
        if (!note) return;

        // Get characters from both players and characters arrays
        const players = this.dataManager.appState.players || [];
        const characters = this.dataManager.appState.characters || [];
        const allCharacters = [...players, ...characters];
        
        const availableCharacters = allCharacters.filter(character => 
            !(note.relatedEntities?.characters || []).includes(character.id)
        );

        if (availableCharacters.length === 0) {
            alert('No available characters to add.');
            return;
        }

        // Create modal for character selection
        let modal = document.getElementById('addEntityModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'addEntityModal';
            modal.className = 'modal fade';
            modal.setAttribute('tabindex', '-1');
            document.body.appendChild(modal);
        }
        
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content bg-card">
                    <div class="modal-header border-secondary">
                        <h5 class="modal-title text-accent">Add Character</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="character-select" class="form-label text">Select character:</label>
                            <select class="form-select bg-card text searchable-select" id="character-select">
                                ${availableCharacters.map(character => 
                                    `<option value="${character.id}">${character.name || 'Unnamed character'}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer border-secondary">
                        <button type="button" class="button" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="button" id="add-character-confirm">Add</button>
                    </div>
                </div>
            </div>
        `;
        
        // Initialize the Bootstrap modal
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
        
        // Initialize Tom Select for searchable dropdown
        setTimeout(() => {
            const selectElement = document.getElementById('character-select');
            if (selectElement) {
                new TomSelect(selectElement, {
                    create: false,
                    sortField: { field: 'text', direction: 'asc' },
                    placeholder: 'Search for a character...',
                    plugins: ['dropdown_input']
                });
            }
        }, 100);
        
        // Add event listener for the confirm button
        document.getElementById('add-character-confirm').addEventListener('click', () => {
            const characterSelect = document.getElementById('character-select');
            const selectedCharacterId = characterSelect.value;
            
            if (selectedCharacterId) {
                this.service.addRelatedEntity(noteId, 'character', selectedCharacterId);
                modalInstance.hide();
                this.notesManager.showNoteDetails(noteId);
            }
        });
    }

    showAddRelatedItemForm(noteId) {
        const note = this.service.getNoteById(noteId);
        if (!note) return;

        const items = this.dataManager.appState.loot || [];
        const availableItems = items.filter(item => 
            !(note.relatedEntities?.items || []).includes(item.id)
        );

        if (availableItems.length === 0) {
            alert('No available items to add.');
            return;
        }

        // Create modal for item selection
        let modal = document.getElementById('addEntityModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'addEntityModal';
            modal.className = 'modal fade';
            modal.setAttribute('tabindex', '-1');
            document.body.appendChild(modal);
        }
        
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content bg-card">
                    <div class="modal-header border-secondary">
                        <h5 class="modal-title text-accent">Add Item</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="item-select" class="form-label text">Select item:</label>
                            <select class="form-select bg-card text searchable-select" id="item-select">
                                ${availableItems.map(item => 
                                    `<option value="${item.id}">${item.name || 'Unnamed item'}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer border-secondary">
                        <button type="button" class="button" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="button" id="add-item-confirm">Add</button>
                    </div>
                </div>
            </div>
        `;
        
        // Initialize the Bootstrap modal
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
        
        // Initialize Tom Select for searchable dropdown
        setTimeout(() => {
            const selectElement = document.getElementById('item-select');
            if (selectElement) {
                new TomSelect(selectElement, {
                    create: false,
                    sortField: { field: 'text', direction: 'asc' },
                    placeholder: 'Search for an item...',
                    plugins: ['dropdown_input']
                });
            }
        }, 100);
        
        // Add event listener for the confirm button
        document.getElementById('add-item-confirm').addEventListener('click', () => {
            const itemSelect = document.getElementById('item-select');
            const selectedItemId = itemSelect.value;
            
            if (selectedItemId) {
                this.service.addRelatedEntity(noteId, 'item', selectedItemId);
                modalInstance.hide();
                this.notesManager.showNoteDetails(noteId);
            }
        });
    }

    // Confirmation dialogs for removing related entities
    confirmRemoveTag(noteId, tag) {
        if (confirm(`Remove tag "${tag}"?`)) {
            this.service.removeTagFromNote(noteId, tag);
            this.notesManager.showNoteDetails(noteId);
        }
    }

    confirmRemoveRelatedEntity(noteId, entityType, entityId) {
        if (confirm(`Remove this ${entityType}?`)) {
            this.service.removeRelatedEntity(noteId, entityType, entityId);
            this.notesManager.showNoteDetails(noteId);
        }
    }
}
