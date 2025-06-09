/**
 * Quest UI Component
 * Handles the rendering and interaction for quest-related UI elements
 */

export class QuestUI {
    constructor(questsManager) {
        this.questsManager = questsManager;
        this.initializeUI();
    }

    /**
     * Initialize the quests UI
     */
    initializeUI() {
        this.initializeQuestList();
        this.initializeEventListeners();
    }

    /**
     * Initialize the quest list container
     */
    initializeQuestList() {
        // Create or get the quests container
        let container = document.getElementById('quests');
        if (!container) {
            container = document.createElement('div');
            container.id = 'quests';
            document.body.appendChild(container);
        }

        // Set up the basic UI structure
        container.innerHTML = `
            <div class="quests-container container">
                <div class="quests-header">
                    <h2 class="text-accent">Quests</h2>
                    <button id="new-quest-btn" class="button">New Quest</button>
                </div>
                <div class="quests-content">
                    <div class="quest-list" id="quest-list">
                        <!-- Quest items will be rendered here -->
                        <div class="empty-state">No quests available. Create a new quest to get started.</div>
                    </div>
                    <div class="quest-details" id="quest-details">
                        <!-- Quest details will be shown here -->
                        <div class="empty-state">Select a quest to view details</div>
                    </div>
                </div>
            </div>
        `;
        

    }

    /**
     * Set up event listeners for the quest UI
     */
    initializeEventListeners() {
        // New quest button
        const newQuestBtn = document.getElementById('new-quest-btn');
        if (newQuestBtn) {
            newQuestBtn.addEventListener('click', () => this.showNewQuestForm());
        }

        // Search functionality
        const searchInput = document.getElementById('quest-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterQuests(e.target.value));
        }
    }

    /**
     * Show the new quest form
     */
    showNewQuestForm() {
        const detailsContainer = document.getElementById('quest-details');
        if (!detailsContainer) return;

        detailsContainer.innerHTML = `
            <div class="card">
                <div class="card-header bg-card">
                    <h3 class="card-title mb-0 text-accent">Create New Quest</h3>
                </div>
                <div class="card-body bg-card">
                    <form id="quest-form">
                        <div class="mb-3">
                            <label for="quest-title" class="form-label">Quest Name</label>
                            <input type="text" class="form-control bg-card text" id="quest-title" required>
                        </div>
                        <div class="mb-3">
                            <label for="quest-type" class="form-label">Type</label>
                            <select class="form-select bg-card text" id="quest-type" required>
                                <option value="MAIN">Main Quest</option>
                                <option value="SIDE">Side Quest</option>
                                <option value="GUILD">Guild Quest</option>
                                <option value="PERSONAL">Personal Quest</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="quest-description" class="form-label">Description</label>
                            <textarea class="form-control bg-card text" id="quest-description" rows="4"></textarea>
                        </div>
                        <div class="d-flex justify-content-between">
                            <button type="button" class="button" id="cancel-quest">
                                <i class="fas fa-times me-1"></i> Cancel
                            </button>
                            <button type="submit" class="button">
                                <i class="fas fa-save me-1"></i> Save Quest
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Add form submission handler
        const form = document.getElementById('quest-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleQuestFormSubmit(e));
        }

        // Add cancel button handler
        const cancelBtn = document.getElementById('cancel-quest');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.clearQuestDetails());
        }
    }

    /**
     * Handle quest form submission
     * @param {Event} e - Form submit event
     */
    async handleQuestFormSubmit(e) {
        e.preventDefault();
        
        const name = document.getElementById('quest-title').value.trim();
        const type = document.getElementById('quest-type').value;
        const description = document.getElementById('quest-description').value.trim();

        if (!name) {
            alert('Please enter a quest name');
            return;
        }

        try {
            await this.questsManager.createQuest({
                name,
                type,
                description,
                status: 'ongoing',
                journalEntries: [],
                relatedItems: [],
                relatedLocations: [],
                relatedCharacters: []
            });
            
            // Refresh the quest list
            const quests = this.questsManager.getAllQuests();
            this.renderQuestList(quests);
            this.clearQuestDetails();
        } catch (error) {
            console.error('Error creating quest:', error);
            // Show error to user
            alert(`Failed to create quest: ${error.message}`);
        }
    }

    /**
     * Render the list of quests
     * @param {Array} quests - Array of quest objects
     */
    renderQuestList(quests = []) {
        const questList = document.getElementById('quest-list');
        if (!questList) return;

        if (quests.length === 0) {
            questList.innerHTML = '<div class="empty-state">No quests found. Create a new quest to get started.</div>';
            return;
        }
        
        // Store the current quests for event handling
        this.currentQuests = quests;

        questList.innerHTML = `
            <div class="display-grid">
                ${quests.map(quest => {
                    const journalCount = quest.journalEntries?.length || 0;
                    const itemCount = quest.relatedItems?.length || 0;
                    const locationCount = quest.relatedLocations?.length || 0;
                    const characterCount = quest.relatedCharacters?.length || 0;
                    
                    return `
                    <div class="card quest-card cursor-pointer" data-quest-id="${quest.id}">
                        <div class="d-flex w-100 justify-content-between p-2">
                            <h5 class="mb-1 text-accent">${quest.name || 'Untitled Quest'}</h5>
                            <small>${this.formatDate(quest.updatedAt)}</small>
                        </div>
                        <p class="mb-1 p-2">${quest.description ? quest.description.substring(0, 100) + (quest.description.length > 100 ? '...' : '') : 'No description'}</p>
                        <div class="d-flex flex-wrap gap-2 mb-2">
                            <span class="badge bg-${this.getQuestTypeBadgeClass(quest.type)}">
                                ${this.formatQuestType(quest.type)}
                            </span>
                            <span class="badge bg-${this.getStatusBadgeClass(quest.status)}">
                                ${quest.status.replace('_', ' ')}
                            </span>
                            ${journalCount > 0 ? `
                                <span class="badge bg-info text-dark" title="Journal Entries">
                                    <i class="fas fa-book me-1"></i>${journalCount}
                                </span>` : ''}
                            ${itemCount > 0 ? `
                                <span class="badge bg-warning text-dark" title="Related Items">
                                    <i class="fas fa-scroll me-1"></i>${itemCount}
                                </span>` : ''}
                            ${locationCount > 0 ? `
                                <span class="badge bg-success" title="Related Locations">
                                    <i class="fas fa-map-marker-alt me-1"></i>${locationCount}
                                </span>` : ''}
                            ${characterCount > 0 ? `
                                <span class="badge bg-primary" title="Related Characters">
                                    <i class="fas fa-users me-1"></i>${characterCount}
                                </span>` : ''}
                        </div>
                    </div>`;
                }).join('')}
            </div>`;

        // Add click handlers to quest cards
        document.querySelectorAll('.quest-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Prevent triggering if clicking on buttons or links
                if (e.target.closest('button, a')) return;
                
                const questId = card.dataset.questId;
                if (questId) {
                    this.showQuestDetails(questId);
                    
                    // Highlight the selected card
                    document.querySelectorAll('.quest-card').forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                }
            });
            
            // Add edit button to each quest card
            const cardHeader = card.querySelector('.d-flex.w-100');
            if (cardHeader) {
                const editButton = document.createElement('button');
                editButton.className = 'btn btn-sm btn-outline-accent edit-quest-btn ms-2';
                editButton.innerHTML = '<i class="fas fa-edit"></i>';
                editButton.title = 'Edit Quest';
                editButton.dataset.questId = card.dataset.questId;
                editButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.showEditQuestForm(card.dataset.questId);
                });
                cardHeader.appendChild(editButton);
            }
        });
    }

    /**
     * Show details for a specific quest
     * @param {string} questId - ID of the quest to show
     */
    async showQuestDetails(questId) {
        if (!questId) return;

        try {
            const quest = await this.questsManager.getQuestById(questId);
            if (!quest) return;

            const detailsContainer = document.getElementById('quest-details');
            if (!detailsContainer) return;

            // Get related entities from the data manager
            // Use the correct method names based on the application's architecture
            const allCharacters = this.questsManager.dataManager.getAllCharacters?.() || 
                                this.questsManager.dataManager.getCharacters?.() || 
                                this.questsManager.dataManager.appState?.characters || [];
            
            const allItems = this.questsManager.dataManager.getAllItems?.() || 
                          this.questsManager.dataManager.getItems?.() || 
                          this.questsManager.dataManager.appState?.items || [];
            
            const allLocations = this.questsManager.dataManager.getAllLocations?.() || 
                              this.questsManager.dataManager.getLocations?.() || 
                              this.questsManager.dataManager.appState?.locations || [];
            
            console.log('Available characters:', allCharacters);
            console.log('Available items:', allItems);
            console.log('Available locations:', allLocations);

            detailsContainer.innerHTML = `
                <div class="quest-detail">
                    <div class="card mb-4">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h3 class="mb-0">${quest.name || 'Untitled Quest'}</h3>
                            <div>
                                <span class="badge bg-${this.getQuestTypeBadgeClass(quest.type)} me-2">
                                    ${this.formatQuestType(quest.type)}
                                </span>
                                <span class="badge bg-${this.getStatusBadgeClass(quest.status)}">
                                    ${quest.status.replace('_', ' ')}
                                </span>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="row mb-4">
                                <div class="col-md-6">
                                    <h5>Description</h5>
                                    <p class="text-muted">${quest.description || 'No description provided.'}</p>
                                </div>
                                <div class="col-md-6">
                                    <div class="d-flex justify-content-between mb-2">
                                        <span class="text-muted">Created:</span>
                                        <span>${this.formatDate(quest.createdAt)}</span>
                                    </div>
                                    <div class="d-flex justify-content-between mb-2">
                                        <span class="text-muted">Last Updated:</span>
                                        <span>${this.formatDate(quest.updatedAt)}</span>
                                    </div>
                                    <div class="d-flex justify-content-between">
                                        <span class="text-muted">Status:</span>
                                        <select id="quest-status" class="form-select form-select-sm d-inline-block w-auto">
                                            <option value="ONGOING" ${quest.status === 'ONGOING' ? 'selected' : ''}>Ongoing</option>
                                            <option value="COMPLETED" ${quest.status === 'COMPLETED' ? 'selected' : ''}>Completed</option>
                                            <option value="ON_HOLD" ${quest.status === 'ON_HOLD' ? 'selected' : ''}>On Hold</option>
                                            <option value="FAILED" ${quest.status === 'FAILED' ? 'selected' : ''}>Failed</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <!-- Related Characters -->
                                <div class="col-md-4 mb-4">
                                    <div class="card h-100">
                                        <div class="card-header d-flex justify-content-between align-items-center">
                                            <h5 class="mb-0">Characters</h5>
                                            <button class="btn btn-sm btn-outline-primary" id="add-character-btn">
                                                <i class="fas fa-plus"></i>
                                            </button>
                                        </div>
                                        <div class="card-body">
                                            <ul class="list-group list-group-flush" id="character-list">
                                                ${quest.relatedCharacters && quest.relatedCharacters.length > 0 
                                                    ? quest.relatedCharacters.map(charId => {
                                                        const char = allCharacters.find(c => c.id === charId);
                                                        return char ? `
                                                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                                                ${char.name || 'Unnamed Character'}
                                                                <button class="btn btn-sm btn-outline-danger remove-entity" data-type="character" data-id="${charId}">
                                                                    <i class="fas fa-times"></i>
                                                                </button>
                                                            </li>` : '';
                                                    }).join('')
                                                    : '<li class="list-group-item text-muted">No characters added</li>'
                                                }
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <!-- Related Items -->
                                <div class="col-md-4 mb-4">
                                    <div class="card h-100">
                                        <div class="card-header d-flex justify-content-between align-items-center">
                                            <h5 class="mb-0">Items</h5>
                                            <button class="btn btn-sm btn-outline-primary" id="add-item-btn">
                                                <i class="fas fa-plus"></i>
                                            </button>
                                        </div>
                                        <div class="card-body">
                                            <ul class="list-group list-group-flush" id="item-list">
                                                ${quest.relatedItems && quest.relatedItems.length > 0 
                                                    ? quest.relatedItems.map(itemId => {
                                                        const item = allItems.find(i => i.id === itemId);
                                                        return item ? `
                                                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                                                ${item.name || 'Unnamed Item'}
                                                                <button class="btn btn-sm btn-outline-danger remove-entity" data-type="item" data-id="${itemId}">
                                                                    <i class="fas fa-times"></i>
                                                                </button>
                                                            </li>` : '';
                                                    }).join('')
                                                    : '<li class="list-group-item text-muted">No items added</li>'
                                                }
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <!-- Related Locations -->
                                <div class="col-md-4 mb-4">
                                    <div class="card h-100">
                                        <div class="card-header d-flex justify-content-between align-items-center">
                                            <h5 class="mb-0">Locations</h5>
                                            <button class="btn btn-sm btn-outline-primary" id="add-location-btn">
                                                <i class="fas fa-plus"></i>
                                            </button>
                                        </div>
                                        <div class="card-body">
                                            <ul class="list-group list-group-flush" id="location-list">
                                                ${quest.relatedLocations && quest.relatedLocations.length > 0 
                                                    ? quest.relatedLocations.map(locId => {
                                                        const loc = allLocations.find(l => l.id === locId);
                                                        return loc ? `
                                                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                                                ${loc.name || 'Unnamed Location'}
                                                                <button class="btn btn-sm btn-outline-danger remove-entity" data-type="location" data-id="${locId}">
                                                                    <i class="fas fa-times"></i>
                                                                </button>
                                                            </li>` : '';
                                                    }).join('')
                                                    : '<li class="list-group-item text-muted">No locations added</li>'
                                                }
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Journal Entries -->
                            <div class="card">
                                <div class="card-header d-flex justify-content-between align-items-center">
                                    <h5 class="mb-0">Journal Entries</h5>
                                    <button class="btn btn-sm btn-primary" id="add-journal-entry-btn">
                                        <i class="fas fa-plus me-1"></i> Add Entry
                                    </button>
                                </div>
                                <div class="card-body">
                                    <div id="journal-entries">
                                        ${quest.journalEntries && quest.journalEntries.length > 0 
                                            ? quest.journalEntries.map((entry, index) => `
                                                <div class="card mb-3" id="entry-${index}">
                                                    <div class="card-header d-flex justify-content-between align-items-center">
                                                        <h6 class="mb-0">${entry.title || 'Untitled Entry'}</h6>
                                                        <small class="text-muted">${this.formatDate(entry.timestamp)}</small>
                                                    </div>
                                                    <div class="card-body">
                                                        <p class="card-text">${entry.content}</p>
                                                        <div class="d-flex justify-content-between align-items-center">
                                                            <small class="text-muted">By ${entry.author || 'Unknown'}</small>
                                                            <div>
                                                                <button class="btn btn-sm btn-outline-secondary edit-journal-entry" data-index="${index}">
                                                                    <i class="fas fa-edit"></i>
                                                                </button>
                                                                <button class="btn btn-sm btn-outline-danger delete-journal-entry" data-index="${index}">
                                                                    <i class="fas fa-trash"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            `).join('')
                                            : '<p class="text-muted mb-0">No journal entries yet. Add one to track quest progress.</p>'
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="card-footer d-flex justify-content-end">
                            <button class="btn btn-outline-secondary me-2" id="edit-quest-btn">
                                <i class="fas fa-edit me-1"></i> Edit Quest
                            </button>
                            <button class="btn btn-danger" id="delete-quest">
                                <i class="fas fa-trash me-1"></i> Delete Quest
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // Add status change handler
            const statusSelect = document.getElementById('quest-status');
            if (statusSelect) {
                statusSelect.addEventListener('change', (e) => {
                    this.updateQuestStatus(questId, e.target.value);
                });
            }

            // Add edit quest button handler
            const editBtn = document.getElementById('edit-quest-btn');
            if (editBtn) {
                editBtn.addEventListener('click', () => this.editQuest(questId));
            }

            // Add delete handler
            const deleteBtn = document.getElementById('delete-quest');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => this.deleteQuest(questId));
            }

            // Add journal entry button handler
            const addJournalBtn = document.getElementById('add-journal-entry-btn');
            if (addJournalBtn) {
                addJournalBtn.addEventListener('click', () => this.showAddJournalEntryForm(questId));
            }

            // Add entity button handlers
            const addCharacterBtn = document.getElementById('add-character-btn');
            if (addCharacterBtn) {
                addCharacterBtn.addEventListener('click', () => this.showAddEntityModal(questId, 'character'));
            }

            const addItemBtn = document.getElementById('add-item-btn');
            if (addItemBtn) {
                addItemBtn.addEventListener('click', () => this.showAddEntityModal(questId, 'item'));
            }

            const addLocationBtn = document.getElementById('add-location-btn');
            if (addLocationBtn) {
                addLocationBtn.addEventListener('click', () => this.showAddEntityModal(questId, 'location'));
            }

            // Add remove entity button handlers
            document.querySelectorAll('.remove-entity').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const type = btn.dataset.type;
                    const id = btn.dataset.id;
                    this.removeEntityFromQuest(questId, type, id);
                });
            });

            // Add journal entry edit/delete handlers
            document.querySelectorAll('.edit-journal-entry').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const index = parseInt(btn.dataset.index);
                    this.editJournalEntry(questId, index);
                });
            });

            document.querySelectorAll('.delete-journal-entry').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const index = parseInt(btn.dataset.index);
                    if (confirm('Are you sure you want to delete this journal entry?')) {
                        this.deleteJournalEntry(questId, index);
                    }
                });
            });

        } catch (error) {
            console.error('Error loading quest details:', error);
            alert('Failed to load quest details.');
        }
    }

    /**
     * Update a quest's status
     * @param {string} questId - ID of the quest to update
     * @param {string} status - New status
     */
    async updateQuestStatus(questId, status) {
        if (!questId || !status) return;

        try {
            await this.questsManager.updateQuest(questId, { status });
            this.renderQuestList();
        } catch (error) {
            console.error('Error updating quest status:', error);
            alert('Failed to update quest status.');
        }
    }

    /**
     * Delete a quest
     * @param {string} questId - ID of the quest to delete
     */
    async deleteQuest(questId) {
        if (!questId || !confirm('Are you sure you want to delete this quest?')) return;

        try {
            await this.questsManager.deleteQuest(questId);
            this.clearQuestDetails();
            this.renderQuestList();
        } catch (error) {
            console.error('Error deleting quest:', error);
            alert('Failed to delete quest.');
        }
    }

    /**
     * Clear the quest details panel
     */
    clearQuestDetails() {
        const detailsContainer = document.getElementById('quest-details');
        if (detailsContainer) {
            detailsContainer.innerHTML = `
                <div class="text-center p-5">
                    <i class="fas fa-search fa-3x text-muted mb-3"></i>
                    <p class="text-muted">Select a quest to view details</p>
                </div>`;
        }
    }

    /**
     * Filter quests based on search term
     * @param {string} searchTerm - Term to search for in quest titles and descriptions
     */
    filterQuests(searchTerm) {
        if (!searchTerm) {
            this.renderQuestList();
            return;
        }

        const filteredQuests = this.questsManager.searchQuests(searchTerm);
        this.renderQuestList(filteredQuests);
    }

    /**
     * Format quest type for display
     * @param {string} type - Quest type
     * @returns {string} Formatted type
     */
    formatQuestType(type) {
        if (!type) return '';
        return type
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Format date for display
     * @param {Date|string} date - Date to format
     * @returns {string} Formatted date string
     */
    formatDate(date) {
        if (!date) return '';
        
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    /**
     * Get the appropriate badge class for a quest type
     * @param {string} type - Quest type
     * @returns {string} Bootstrap badge class
     */
    getQuestTypeBadgeClass(type) {
        const typeMap = {
            'MAIN': 'primary',
            'SIDE': 'success',
            'GUILD': 'warning',
            'PERSONAL': 'info'
        };
        return typeMap[type] || 'secondary';
    }

    /**
     * Get the appropriate badge class for a quest status
     * @param {string} status - Quest status
     * @returns {string} Bootstrap badge class
     */
    getStatusBadgeClass(status) {
        const statusMap = {
            'ONGOING': 'primary',
            'COMPLETED': 'success',
            'ON_HOLD': 'warning',
            'FAILED': 'danger'
        };
        return statusMap[status] || 'secondary';
    }

    /**
     * Show a modal to add a related entity to a quest
     * @param {string} questId - ID of the quest
     * @param {string} entityType - Type of entity to add (character, item, location)
     */
    showAddEntityModal(questId, entityType) {
        // Get available entities of the specified type
        const availableEntities = this.questsManager.dataManager[`getAll${entityType.charAt(0).toUpperCase() + entityType.slice(1)}s`]?.() || [];
        const quest = this.questsManager.getQuestById(questId);
        
        // Filter out already added entities
        const addedIds = quest[`related${entityType.charAt(0).toUpperCase() + entityType.slice(1)}s`] || [];
        const filteredEntities = availableEntities.filter(entity => !addedIds.includes(entity.id));

        if (filteredEntities.length === 0) {
            alert(`No available ${entityType}s to add.`);
            return;
        }

        // Create modal HTML
        const modalId = `add-${entityType}-modal`;
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = modalId;
        modal.tabIndex = '-1';
        modal.setAttribute('aria-hidden', 'true');
        
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content bg-card">
                    <div class="modal-header border-secondary">
                        <h5 class="modal-title text-accent">Add ${entityType.charAt(0).toUpperCase() + entityType.slice(1)}</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="${entityType}-select" class="form-label text">Select ${entityType}:</label>
                            <select class="form-select bg-card text" id="${entityType}-select">
                                ${filteredEntities.map(entity => 
                                    `<option value="${entity.id}">${entity.name || entity.title || `Unnamed ${entityType}`}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer border-secondary">
                        <button type="button" class="button" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="button" id="add-${entityType}-confirm">Add</button>
                    </div>
                </div>
            </div>
        `;

        // Add modal to the document
        document.body.appendChild(modal);
        
        // Initialize and show the modal
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();

        // Handle add button click
        const addBtn = modal.querySelector(`#add-${entityType}-btn`);
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                const select = modal.querySelector(`#${entityType}-select`);
                const entityId = select.value;
                this.addEntityToQuest(questId, entityType, entityId);
                modalInstance.hide();
            });
        }

        // Remove modal from DOM after it's hidden
        modal.addEventListener('hidden.bs.modal', () => {
            document.body.removeChild(modal);
        });
    }

    /**
     * Add an entity to a quest
     * @param {string} questId - ID of the quest
     * @param {string} entityType - Type of entity (character, item, location)
     * @param {string} entityId - ID of the entity to add
     */
    async addEntityToQuest(questId, entityType, entityId) {
        try {
            const quest = this.questsManager.getQuestById(questId);
            const relationKey = `related${entityType.charAt(0).toUpperCase() + entityType.slice(1)}s`;
            
            // Initialize the array if it doesn't exist
            if (!quest[relationKey]) {
                quest[relationKey] = [];
            }
            
            // Add the entity if not already added
            if (!quest[relationKey].includes(entityId)) {
                quest[relationKey].push(entityId);
                await this.questsManager.updateQuest(questId, { [relationKey]: quest[relationKey] });
                this.showQuestDetails(questId); // Refresh the view
            }
        } catch (error) {
            console.error(`Error adding ${entityType} to quest:`, error);
            alert(`Failed to add ${entityType} to quest.`);
        }
    }

    /**
     * Remove an entity from a quest
     * @param {string} questId - ID of the quest
     * @param {string} entityType - Type of entity (character, item, location)
     * @param {string} entityId - ID of the entity to remove
     */
    async removeEntityFromQuest(questId, entityType, entityId) {
        if (!confirm(`Are you sure you want to remove this ${entityType} from the quest?`)) {
            return;
        }

        try {
            const quest = this.questsManager.getQuestById(questId);
            const relationKey = `related${entityType.charAt(0).toUpperCase() + entityType.slice(1)}s`;
            
            if (quest[relationKey] && quest[relationKey].includes(entityId)) {
                const updatedEntities = quest[relationKey].filter(id => id !== entityId);
                await this.questsManager.updateQuest(questId, { [relationKey]: updatedEntities });
                this.showQuestDetails(questId); // Refresh the view
            }
        } catch (error) {
            console.error(`Error removing ${entityType} from quest:`, error);
            alert(`Failed to remove ${entityType} from quest.`);
        }
    }

    /**
     * Show the form to add a new journal entry
     * @param {string} questId - ID of the quest to add the entry to
     * @param {number} [entryIndex] - Optional index of the entry to edit
     */
    showAddJournalEntryForm(questId, entryIndex = null) {
        const quest = this.questsManager.getQuestById(questId);
        const isEdit = entryIndex !== null;
        const entry = isEdit && quest.journalEntries ? quest.journalEntries[entryIndex] : null;
        
        // Create a modal for the journal entry form
        const modalId = 'journal-entry-modal';
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = modalId;
        modal.tabIndex = '-1';
        modal.setAttribute('aria-hidden', 'true');
        
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content bg-card">
                    <div class="modal-header border-secondary">
                        <h5 class="modal-title text-accent">${isEdit ? 'Edit' : 'Add'} Journal Entry</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="journal-entry-form">
                            <div class="mb-3">
                                <label for="entry-title" class="form-label text">Title</label>
                                <input type="text" class="form-control bg-card text" id="entry-title" 
                                       value="${entry?.title || ''}" required>
                            </div>
                            <div class="mb-3">
                                <label for="entry-content" class="form-label text">Content</label>
                                <textarea class="form-control bg-card text" id="entry-content" rows="6" 
                                           required>${entry?.content || ''}</textarea>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="entry-author" class="form-label text">Author</label>
                                        <input type="text" class="form-control bg-card text" id="entry-author" 
                                               value="${entry?.author || 'GM'}" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label text">Date</label>
                                        <input type="datetime-local" class="form-control bg-card text" id="entry-timestamp" 
                                               value="${entry?.timestamp ? new Date(entry.timestamp).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)}">
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer border-secondary">
                        <button type="button" class="button" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="button" id="save-journal-entry">
                            ${isEdit ? 'Update' : 'Save'} Entry
                        </button>
                    </div>
                </div>
            </div>`;

        // Add modal to the document
        document.body.appendChild(modal);
        
        // Initialize and show the modal
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();

        // Handle save button click
        const saveBtn = modal.querySelector('#save-journal-entry');
        if (saveBtn) {
            saveBtn.addEventListener('click', async () => {
                const title = modal.querySelector('#entry-title').value.trim();
                const content = modal.querySelector('#entry-content').value.trim();
                const author = modal.querySelector('#entry-author').value.trim() || 'GM';
                const timestamp = new Date(modal.querySelector('#entry-timestamp').value);

                if (!title || !content) {
                    alert('Please fill in all required fields.');
                    return;
                }


                const journalEntry = {
                    title,
                    content,
                    author,
                    timestamp: timestamp.getTime() ? timestamp : new Date()
                };

                try {
                    const quest = this.questsManager.getQuestById(questId);
                    let journalEntries = Array.isArray(quest.journalEntries) ? [...quest.journalEntries] : [];
                    
                    if (isEdit && entryIndex !== null && journalEntries[entryIndex]) {
                        // Update existing entry
                        journalEntries[entryIndex] = journalEntry;
                    } else {
                        // Add new entry
                        journalEntries.push(journalEntry);
                    }
                    
                    await this.questsManager.updateQuest(questId, { journalEntries });
                    modalInstance.hide();
                    this.showQuestDetails(questId); // Refresh the view
                } catch (error) {
                    console.error('Error saving journal entry:', error);
                    alert('Failed to save journal entry. Please try again.');
                }
            });
        }

        // Remove modal from DOM after it's hidden
        modal.addEventListener('hidden.bs.modal', () => {
            document.body.removeChild(modal);
        });
    }

    /**
     * Edit a journal entry
     * @param {string} questId - ID of the quest
     * @param {number} entryIndex - Index of the entry to edit
     */
    editJournalEntry(questId, entryIndex) {
        this.showAddJournalEntryForm(questId, entryIndex);
    }

    /**
     * Delete a journal entry
     * @param {string} questId - ID of the quest
     * @param {number} entryIndex - Index of the entry to delete
     */
    async deleteJournalEntry(questId, entryIndex) {
        try {
            const quest = this.questsManager.getQuestById(questId);
            if (quest.journalEntries && quest.journalEntries[entryIndex]) {
                const updatedEntries = quest.journalEntries.filter((_, index) => index !== entryIndex);
                await this.questsManager.updateQuest(questId, { journalEntries: updatedEntries });
                this.showQuestDetails(questId); // Refresh the view
            }
        } catch (error) {
            console.error('Error deleting journal entry:', error);
            alert('Failed to delete journal entry.');
        }
    }

    /**
     * Edit a quest
     * @param {string} questId - ID of the quest to edit
     */
    async editQuest(questId) {
        const quest = this.questsManager.getQuestById(questId);
        if (!quest) return;

        const detailsContainer = document.getElementById('quest-details');
        if (!detailsContainer) return;

        detailsContainer.innerHTML = `
            <div class="card">
                <div class="card-header bg-primary text-white">
                    <h3 class="card-title mb-0">Edit Quest</h3>
                </div>
                <div class="card-body">
                    <form id="edit-quest-form">
                        <input type="hidden" id="edit-quest-id" value="${quest.id}">
                        <div class="mb-3">
                            <label for="edit-quest-name" class="form-label">Quest Name</label>
                            <input type="text" class="form-control" id="edit-quest-name" value="${quest.name || ''}" required>
                        </div>
                        <div class="mb-3">
                            <label for="edit-quest-type" class="form-label">Type</label>
                            <select class="form-select" id="edit-quest-type" required>
                                <option value="MAIN" ${quest.type === 'MAIN' ? 'selected' : ''}>Main Quest</option>
                                <option value="SIDE" ${quest.type === 'SIDE' ? 'selected' : ''}>Side Quest</option>
                                <option value="GUILD" ${quest.type === 'GUILD' ? 'selected' : ''}>Guild Quest</option>
                                <option value="PERSONAL" ${quest.type === 'PERSONAL' ? 'selected' : ''}>Personal Quest</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="edit-quest-status" class="form-label">Status</label>
                            <select class="form-select" id="edit-quest-status" required>
                                <option value="ONGOING" ${quest.status === 'ONGOING' ? 'selected' : ''}>Ongoing</option>
                                <option value="COMPLETED" ${quest.status === 'COMPLETED' ? 'selected' : ''}>Completed</option>
                                <option value="ON_HOLD" ${quest.status === 'ON_HOLD' ? 'selected' : ''}>On Hold</option>
                                <option value="FAILED" ${quest.status === 'FAILED' ? 'selected' : ''}>Failed</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="edit-quest-description" class="form-label">Description</label>
                            <textarea class="form-control" id="edit-quest-description" rows="4">${quest.description || ''}</textarea>
                        </div>
                        <div class="d-flex justify-content-between">
                            <button type="button" class="btn btn-secondary" id="cancel-edit-quest">
                                <i class="fas fa-times me-1"></i> Cancel
                            </button>
                            <div>
                                <button type="button" class="btn btn-danger me-2" id="delete-quest-btn">
                                    <i class="fas fa-trash me-1"></i> Delete
                                </button>
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save me-1"></i> Save Changes
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>`;

        // Handle form submission
        const form = document.getElementById('edit-quest-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const updates = {
                    name: document.getElementById('edit-quest-name').value.trim(),
                    type: document.getElementById('edit-quest-type').value,
                    status: document.getElementById('edit-quest-status').value,
                    description: document.getElementById('edit-quest-description').value.trim(),
                    updatedAt: new Date()
                };

                try {
                    await this.questsManager.updateQuest(questId, updates);
                    
                    // Refresh the view
                    const quests = this.questsManager.getAllQuests();
                    this.renderQuestList(quests);
                    this.showQuestDetails(questId);
                } catch (error) {
                    console.error('Error updating quest:', error);
                    alert(`Failed to update quest: ${error.message}`);
                }
            });
        }

        // Handle delete button
        const deleteBtn = document.getElementById('delete-quest-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', async () => {
                if (confirm('Are you sure you want to delete this quest? This action cannot be undone.')) {
                    try {
                        await this.questsManager.deleteQuest(questId);
                        this.clearQuestDetails();
                        const quests = this.questsManager.getAllQuests();
                        this.renderQuestList(quests);
                    } catch (error) {
                        console.error('Error deleting quest:', error);
                        alert(`Failed to delete quest: ${error.message}`);
                    }
                }
            });
        }

        // Handle cancel button
        const cancelBtn = document.getElementById('cancel-edit-quest');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.showQuestDetails(questId);
            });
        }
    }
}

// Export as default
export default QuestUI;
