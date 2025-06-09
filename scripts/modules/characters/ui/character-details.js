/**
 * Character Details Component
 * Handles displaying and managing character details
 */

export class CharacterDetails {
    constructor(characterService, dataManager, ui) {
        this.characterService = characterService;
        this.dataManager = dataManager;
        this.ui = ui;
    }

    /**
     * Show character details
     * @param {string} characterId - ID of the character to show
     */
    show(characterId) {
        const character = this.characterService.getCharacterById(characterId);
        if (!character) return;

        const detailsContainer = document.getElementById('character-details');
        if (!detailsContainer) return;

        // Format attributes for display
        const attributesHtml = character.attributes ? Object.entries(character.attributes)
            .map(([key, value]) => `
                <div class="col-6 col-md-4 mb-2">
                    <div class="card bg-light">
                        <div class="card-body text-center p-2">
                            <div class="text-uppercase small text-muted">${key}</div>
                            <div class="h4 mb-0">${value}</div>
                            <div class="small text-muted">${this.getModifier(value)}</div>
                        </div>
                    </div>
                </div>`).join('') : '';

        // Format inventory items
        const inventoryItems = character.inventory && character.inventory.length > 0
            ? character.inventory.map(item => `
                <div class="list-group-item">
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1">${item.name || 'Unnamed Item'}</h6>
                        <small class="text-muted">${item.quantity ? `x${item.quantity}` : ''}</small>
                    </div>
                    ${item.description ? `<small class="text-muted">${item.description}</small>` : ''}
                </div>`).join('')
            : '<div class="text-muted">No items in inventory</div>';

        // Format skills
        const skillsList = character.skills && character.skills.length > 0
            ? character.skills.map(skill => `<span class="badge bg-secondary me-1 mb-1">${skill}</span>`).join('')
            : '<span class="text-muted">No skills added</span>';

        // Format quests
        const questsList = character.quests && character.quests.length > 0
            ? character.quests.map(questId => {
                const quest = this.dataManager.getQuestById?.(questId);
                return quest 
                    ? `<li class="list-group-item">${quest.name || 'Unnamed Quest'}</li>`
                    : '';
            }).filter(Boolean).join('') 
            : '<li class="list-group-item text-muted">No active quests</li>';

        detailsContainer.innerHTML = `
            <div class="card h-100">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <div>
                        <h4 class="mb-0">${character.name || 'Unnamed Character'}</h4>
                        <div class="text-muted">
                            Level ${character.level || 1} ${character.race || ''} ${character.classType || ''}
                            ${character.alignment ? `(${character.alignment})` : ''}
                        </div>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-outline-primary me-1" id="edit-character-btn">
                            <i class="fas fa-edit me-1"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-outline-danger" id="delete-character-btn">
                            <i class="fas fa-trash me-1"></i> Delete
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <ul class="nav nav-tabs" id="characterTabs" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active" id="overview-tab" data-bs-toggle="tab" 
                                    data-bs-target="#overview" type="button" role="tab">Overview</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="inventory-tab" data-bs-toggle="tab" 
                                    data-bs-target="#inventory" type="button" role="tab">Inventory</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="quests-tab" data-bs-toggle="tab" 
                                    data-bs-target="#quests" type="button" role="tab">Quests</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="notes-tab" data-bs-toggle="tab" 
                                    data-bs-target="#notes" type="button" role="tab">Notes</button>
                        </li>
                    </ul>
                    
                    <div class="tab-content p-3" id="characterTabContent">
                        <!-- Overview Tab -->
                        <div class="tab-pane fade show active" id="overview" role="tabpanel">
                            <div class="row mb-4">
                                <div class="col-md-6">
                                    <h5>Attributes</h5>
                                    <div class="row g-2">
                                        ${attributesHtml}
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <h5>Skills</h5>
                                    <div class="p-3 bg-light rounded">
                                        ${skillsList}
                                    </div>
                                </div>
                            </div>
                            
                            ${character.bio ? `
                                <h5>Biography</h5>
                                <div class="p-3 bg-light rounded mb-3">
                                    ${character.bio}
                                </div>
                            ` : ''}
                        </div>
                        
                        <!-- Inventory Tab -->
                        <div class="tab-pane fade" id="inventory" role="tabpanel">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h5 class="mb-0">Inventory</h5>
                                <button class="btn btn-sm btn-primary" id="add-item-btn">
                                    <i class="fas fa-plus me-1"></i> Add Item
                                </button>
                            </div>
                            <div class="list-group">
                                ${inventoryItems}
                            </div>
                        </div>
                        
                        <!-- Quests Tab -->
                        <div class="tab-pane fade" id="quests" role="tabpanel">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h5 class="mb-0">Active Quests</h5>
                                <button class="btn btn-sm btn-primary" id="add-quest-btn">
                                    <i class="fas fa-plus me-1"></i> Add Quest
                                </button>
                            </div>
                            <ul class="list-group">
                                ${questsList}
                            </ul>
                        </div>
                        
                        <!-- Notes Tab -->
                        <div class="tab-pane fade" id="notes" role="tabpanel">
                            <h5>Notes</h5>
                            <div class="mb-3">
                                <textarea class="form-control" id="character-notes-field" rows="8" 
                                          placeholder="Add notes about this character...">${character.notes || ''}</textarea>
                            </div>
                            <button class="btn btn-primary" id="save-notes-btn">
                                <i class="fas fa-save me-1"></i> Save Notes
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;

        // Initialize tabs
        const tabElms = detailsContainer.querySelectorAll('[data-bs-toggle="tab"]');
        tabElms.forEach(tabEl => {
            tabEl.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = new bootstrap.Tab(tabEl);
                tab.show();
            });
        });

        // Add event listeners for buttons
        const editBtn = detailsContainer.querySelector('#edit-character-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => this.ui.characterForm.show(characterId));
        }

        const deleteBtn = detailsContainer.querySelector('#delete-character-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.ui.deleteCharacter(characterId));
        }

        const saveNotesBtn = detailsContainer.querySelector('#save-notes-btn');
        if (saveNotesBtn) {
            saveNotesBtn.addEventListener('click', () => {
                const notes = detailsContainer.querySelector('#character-notes-field').value;
                this.characterService.updateCharacter(characterId, { notes });
                
                // Show feedback
                const originalText = saveNotesBtn.innerHTML;
                saveNotesBtn.innerHTML = '<i class="fas fa-check me-1"></i> Saved!';
                saveNotesBtn.classList.remove('btn-primary');
                saveNotesBtn.classList.add('btn-success');
                
                setTimeout(() => {
                    saveNotesBtn.innerHTML = originalText;
                    saveNotesBtn.classList.remove('btn-success');
                    saveNotesBtn.classList.add('btn-primary');
                }, 2000);
            });
        }

        // Add item button
        const addItemBtn = detailsContainer.querySelector('#add-item-btn');
        if (addItemBtn) {
            addItemBtn.addEventListener('click', () => this.showAddItemForm(characterId));
        }

        // Add quest button
        const addQuestBtn = detailsContainer.querySelector('#add-quest-btn');
        if (addQuestBtn) {
            addQuestBtn.addEventListener('click', () => this.showAddQuestForm(characterId));
        }
    }

    /**
     * Show form to add an item to character's inventory
     * @param {string} characterId - ID of the character
     */
    showAddItemForm(characterId) {
        const modalId = 'add-item-modal';
        let modal = document.getElementById(modalId);
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = modalId;
            modal.className = 'modal fade';
            modal.tabIndex = '-1';
            modal.setAttribute('aria-hidden', 'true');
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Add Item to Inventory</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="add-item-form">
                            <div class="mb-3">
                                <label for="item-name" class="form-label">Item Name</label>
                                <input type="text" class="form-control" id="item-name" required>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="item-quantity" class="form-label">Quantity</label>
                                        <input type="number" class="form-control" id="item-quantity" value="1" min="1">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="item-weight" class="form-label">Weight (lbs)</label>
                                        <input type="number" class="form-control" id="item-weight" step="0.1" min="0">
                                    </div>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="item-description" class="form-label">Description</label>
                                <textarea class="form-control" id="item-description" rows="3"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="save-item-btn">Add Item</button>
                    </div>
                </div>
            </div>`;

        // Initialize and show the modal
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();

        // Handle save button click
        const saveBtn = modal.querySelector('#save-item-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const name = modal.querySelector('#item-name').value.trim();
                const quantity = parseInt(modal.querySelector('#item-quantity').value) || 1;
                const weight = parseFloat(modal.querySelector('#item-weight').value) || 0;
                const description = modal.querySelector('#item-description').value.trim();

                if (!name) {
                    alert('Please enter an item name.');
                    return;
                }

                const item = {
                    id: Date.now().toString(),
                    name,
                    quantity,
                    weight: weight > 0 ? weight : undefined,
                    description: description || undefined,
                    addedAt: new Date()
                };

                this.characterService.addToInventory(characterId, item);
                modalInstance.hide();
                this.show(characterId); // Refresh the view
            });
        }

        // Remove modal from DOM after it's hidden
        modal.addEventListener('hidden.bs.modal', () => {
            document.body.removeChild(modal);
        });
    }

    /**
     * Show form to add a quest to character
     * @param {string} characterId - ID of the character
     */
    showAddQuestForm(characterId) {
        // This would be implemented to show a list of available quests to add
        alert('Adding quests to characters is not yet implemented.');
    }

    /**
     * Calculate ability modifier from score
     * @param {number} score - Ability score
     * @returns {string} Modifier with sign (e.g., "+2")
     */
    getModifier(score) {
        if (typeof score !== 'number') return '+0';
        const modifier = Math.floor((score - 10) / 2);
        return modifier >= 0 ? `+${modifier}` : `${modifier}`;
    }
}
