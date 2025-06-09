/**
 * Quest UI Component
 * Handles the rendering and interaction for quest-related UI elements
 */

import { BaseUI } from '../../../components/base-ui.js';
import { showToast } from '../../../components/ui-components.js';
import { QuestType, QuestStatus } from '../enums/quest-enums.js';
import { formatDate } from '../../../utils/date-utils.js';

// Helper function to format enum values for display
function formatEnumValue(str) {
    if (!str) return '';
    return str
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

// Helper function to get status badge class
function getStatusBadgeClass(status) {
    const statusMap = {
        [QuestStatus.NOT_STARTED]: 'bg-secondary',
        [QuestStatus.IN_PROGRESS]: 'bg-primary',
        [QuestStatus.COMPLETED]: 'bg-success',
        [QuestStatus.FAILED]: 'bg-danger',
        [QuestStatus.ON_HOLD]: 'bg-warning',
        [QuestStatus.ABANDONED]: 'bg-dark'
    };
    return statusMap[status] || 'bg-secondary';
}

// Helper function to get quest type badge class
function getQuestTypeBadgeClass(type) {
    const typeMap = {
        [QuestType.MAIN]: 'bg-primary',
        [QuestType.SIDE_QUEST]: 'bg-info',
        [QuestType.PERSONAL]: 'bg-success',
        [QuestType.FACTION]: 'bg-warning',
        [QuestType.EVENT]: 'bg-purple',
        [QuestType.OTHER]: 'bg-secondary'
    };
    return typeMap[type] || 'bg-secondary';
}

export class QuestUI extends BaseUI {
    /**
     * Create a new QuestUI instance
     * @param {Object} questService - The quest service instance
     * @param {Object} options - Configuration options
     */
    constructor(questService, options = {}) {
        super();
        this.questService = questService;
        this.options = options;
        this.currentQuest = null;
        this.isEditing = false;
        this.initialize();
    }

    /**
     * Initialize the UI
     */
    initialize() {
        this.cacheElements();
        this.bindEvents();
        this.render();
    }

    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.elements = {
            container: document.getElementById('quests-container') || document.createElement('div'),
            list: document.getElementById('questList') || document.createElement('div'),
            details: document.getElementById('questDetails') || document.createElement('div'),
            search: document.getElementById('questSearch') || document.createElement('input'),
            addButton: document.getElementById('addQuestBtn') || document.createElement('button'),
            editButton: document.getElementById('editQuestBtn') || document.createElement('button'),
            deleteButton: document.getElementById('deleteQuestBtn') || document.createElement('button')
        };
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        const { addButton, editButton, deleteButton, search } = this.elements;

        // Add button click
        addButton.addEventListener('click', () => this.showQuestForm());

        // Edit button click
        editButton.addEventListener('click', () => {
            if (this.currentQuest) {
                this.showQuestForm(this.currentQuest);
            }
        });

        // Delete button click
        deleteButton.addEventListener('click', () => {
            if (this.currentQuest) {
                this.deleteQuest(this.currentQuest.id);
            }
        });

        // Search input
        search.addEventListener('input', (e) => {
            this.filterQuests(e.target.value);
        });
    }

    /**
     * Render the quest UI
     */
    render() {
        this.renderQuestList();
        this.renderQuestDetails();
    }

    /**
     * Filter quests based on search term
     * @param {string} searchTerm - The search term to filter by
     */
    filterQuests(searchTerm) {
        const quests = this.questService.getAllQuests();
        const filtered = searchTerm 
            ? quests.filter(quest => 
                quest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (quest.description && quest.description.toLowerCase().includes(searchTerm.toLowerCase()))
              )
            : quests;
        this.renderQuestList(filtered);
    }

    /**
     * Render the quest list
     * @param {Array} quests - Optional array of quests to display (uses all quests if not provided)
     */
    renderQuestList(quests) {
        const { list } = this.elements;
        quests = quests || this.questService.getAllQuests();
        
        list.innerHTML = '';
        
        if (quests.length === 0) {
            list.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="fas fa-scroll fa-3x mb-3"></i>
                    <p>No quests found. Click "Add Quest" to get started.</p>
                </div>`;
            return;
        }
        
        quests.forEach(quest => {
            const item = this.createQuestItem(quest);
            list.appendChild(item);
        });
    }

    /**
     * Create a quest list item element
     * @param {Object} quest - The quest data
     * @returns {HTMLElement} The created list item
     */
    createQuestItem(quest) {
        const item = document.createElement('div');
        item.className = 'quest-item';
        item.dataset.id = quest.id;
        
        if (this.currentQuest && this.currentQuest.id === quest.id) {
            item.classList.add('active');
        }
        
        const statusClass = getStatusBadgeClass(quest.status);
        const typeClass = getQuestTypeBadgeClass(quest.type);
        
        item.innerHTML = `
            <div class="quest-item-header">
                <h4>${quest.name}</h4>
                <span class="quest-status ${statusClass}">${formatEnumValue(quest.status)}</span>
            </div>
            <div class="quest-item-meta">
                <span class="quest-type ${typeClass}">${formatEnumValue(quest.type)}</span>
                <span class="quest-date">${formatDate(quest.updatedAt)}</span>
            </div>
            <p class="quest-description">
                ${quest.description ? quest.description.substring(0, 100) + (quest.description.length > 100 ? '...' : '') : 'No description'}
            </p>
        `;
        
        item.addEventListener('click', () => this.showQuestDetails(quest.id));
        return item;
    }

    /**
     * Show quest details
     * @param {string} questId - The ID of the quest to show
     */
    async showQuestDetails(questId) {
        try {
            const quest = await this.questService.getQuestById(questId);
            if (!quest) return;
            
            this.currentQuest = quest;
            this.renderQuestDetails(quest);
            
            // Highlight selected quest in the list
            document.querySelectorAll('.quest-item').forEach(item => {
                item.classList.toggle('active', item.dataset.id === questId);
            });
            
            // Enable edit and delete buttons
            this.elements.editButton.disabled = false;
            this.elements.deleteButton.disabled = false;
            
        } catch (error) {
            console.error('Error loading quest details:', error);
            showToast('Failed to load quest details', 'error');
        }
    }

    /**
     * Render quest details
     * @param {Object} quest - The quest data to display
     */
    renderQuestDetails(quest) {
        const { details } = this.elements;
        
        const statusClass = `status-${quest.status.toLowerCase().replace(/\s+/g, '-')}`;
        const typeClass = `type-${quest.type.toLowerCase()}`;
        
        details.innerHTML = `
            <div class="quest-details">
                <div class="quest-header">
                    <h2>${quest.name}</h2>
                    <div class="quest-meta">
                        <span class="quest-type ${typeClass}">${formatEnumValue(quest.type)}</span>
                        <span class="quest-status ${statusClass}">${formatEnumValue(quest.status)}</span>
                    </div>
                </div>
                <div class="quest-content">
                    <h3>Description</h3>
                    <p>${quest.description || 'No description provided.'}</p>
                    
                    <div class="quest-dates">
                        <div class="date-item">
                            <span class="date-label">Created:</span>
                            <span class="date-value">${formatDate(quest.createdAt)}</span>
                        </div>
                        <div class="date-item">
                            <span class="date-label">Last Updated:</span>
                            <span class="date-value">${formatDate(quest.updatedAt)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Show quest form for adding/editing
     * @param {Object} quest - Optional quest data for editing
     */
    showQuestForm(quest = null) {
        this.isEditing = !!quest;
        this.currentQuest = quest || null;
        
        const { details } = this.elements;
        
        const formHtml = `
            <form id="questForm" class="quest-form">
                <div class="form-group">
                    <label for="questName">Quest Name *</label>
                    <input type="text" id="questName" name="name" 
                           value="${quest ? quest.name : ''}" required>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="questType">Type</label>
                        <select id="questType" name="type" required>
                            ${Object.values(QuestType).map(type => 
                                `<option value="${type}" ${quest && quest.type === type ? 'selected' : ''}>
                                    ${formatEnumValue(type)}
                                </option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="questStatus">Status</label>
                        <select id="questStatus" name="status" required>
                            ${Object.values(QuestStatus).map(status => 
                                `<option value="${status}" ${quest && quest.status === status ? 'selected' : ''}>
                                    ${formatEnumValue(status)}
                                </option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="questDescription">Description</label>
                    <textarea id="questDescription" name="description" rows="5">${quest ? quest.description : ''}</textarea>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" id="cancelQuestBtn">Cancel</button>
                    <button type="submit" class="btn btn-primary">
                        ${quest ? 'Update' : 'Create'} Quest
                    </button>
                </div>
            </form>
        `;
        
        details.innerHTML = formHtml;
        
        // Set up form submission
        const form = document.getElementById('questForm');
        form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Set up cancel button
        document.getElementById('cancelQuestBtn').addEventListener('click', () => {
            if (this.currentQuest) {
                this.showQuestDetails(this.currentQuest.id);
            } else {
                this.elements.details.innerHTML = '';
            }
        });
    }

    /**
     * Handle form submission
     * @param {Event} e - Form submit event
     */
    async handleFormSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const questData = {
            name: formData.get('name'),
            type: formData.get('type'),
            status: formData.get('status'),
            description: formData.get('description')
        };
        
        try {
            if (this.isEditing && this.currentQuest) {
                await this.questService.updateQuest(this.currentQuest.id, questData);
                showToast('Quest updated successfully', 'success');
            } else {
                await this.questService.createQuest(questData);
                showToast('Quest created successfully', 'success');
            }
            
            await this.renderQuestList();
            
            // If editing, show the updated quest details
            if (this.isEditing && this.currentQuest) {
                this.showQuestDetails(this.currentQuest.id);
            } else {
                this.elements.details.innerHTML = '';
            }
            
        } catch (error) {
            console.error('Error saving quest:', error);
            showToast(`Failed to save quest: ${error.message}`, 'error');
        }
    }

    /**
     * Delete a quest
     * @param {string} questId - The ID of the quest to delete
     */
    async deleteQuest(questId) {
        if (!confirm('Are you sure you want to delete this quest?')) {
            return;
        }
        
        try {
            await this.questService.deleteQuest(questId);
            showToast('Quest deleted successfully', 'success');
            
            // Clear the current quest if it was deleted
            if (this.currentQuest && this.currentQuest.id === questId) {
                this.currentQuest = null;
                this.elements.details.innerHTML = `
                    <div class="text-muted text-center py-5">
                        <i class="fas fa-scroll fa-3x mb-3"></i>
                        <p>Select a quest or create a new one</p>
                    </div>`;
                
                // Disable edit and delete buttons
                this.elements.editButton.disabled = true;
                this.elements.deleteButton.disabled = true;
            }
            
            await this.renderQuestList();
            
        } catch (error) {
            console.error('Error deleting quest:', error);
            showToast('Failed to delete quest', 'error');
        }
    }
    /**
     * Create a new QuestUI instance
     * @param {Object} questService - Instance of QuestService
     * @param {Object} dataManager - Application data manager
     */
    constructor(questService, dataManager = {}) {
        super();
        this.questService = questService;
        this.dataManager = dataManager;
        this.currentEntity = null;
        this.isEditing = false;
        
        // Initialize UI elements
        this.initializeElements();
        this.bindEvents();
        this.refreshQuestList();
    }
    
    /**
     * Initialize UI elements
     */
    initializeElements() {
        // Main containers
        this.listContainer = document.getElementById('questList') || document.createElement('div');
        this.detailsContainer = document.getElementById('questDetails') || document.createElement('div');
        
        // Form elements
        this.searchInput = document.getElementById('questSearch') || document.createElement('input');
        this.addButton = document.getElementById('addQuestBtn') || document.createElement('button');
        this.editButton = document.getElementById('editQuestBtn') || document.createElement('button');
        this.deleteButton = document.getElementById('deleteQuestBtn') || document.createElement('button');
        
        // Set up form container
        this.formContainer = document.createElement('div');
        this.formContainer.className = 'quest-form-container';
        this.detailsContainer.appendChild(this.formContainer);
        
        // Set initial button states
        this.editButton.disabled = true;
        this.deleteButton.disabled = true;
    }
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        // Add button click
        if (this.addButton) {
            this.addButton.addEventListener('click', () => this.showQuestForm());
        }
        
        // Edit button click
        if (this.editButton) {
            this.editButton.addEventListener('click', () => this.showQuestForm(this.currentEntity));
        }
        
        // Delete button click
        if (this.deleteButton) {
            this.deleteButton.addEventListener('click', () => {
                if (this.currentEntity) {
                    if (confirm('Are you sure you want to delete this quest?')) {
                        this.deleteQuest(this.currentEntity.id);
                    }
                }
            });
        }
        
        // Search input
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => this.filterQuests(e.target.value));
        }
    }
        this.elements = {
            container: options.container?.list?.parentElement || document.getElementById('quests'),
            list: options.container?.list || document.getElementById('questList'),
            details: options.container?.details || document.getElementById('questDetails'),
            search: options.container?.search || document.getElementById('questSearch'),
            addButton: options.container?.addButton || document.getElementById('addQuestBtn'),
            editButton: options.container?.editButton || document.getElementById('editQuestBtn'),
            deleteButton: options.container?.deleteButton || document.getElementById('deleteQuestBtn')
        };
        
        // Validate required elements
        if (!this.elements.container || !this.elements.list || !this.elements.details) {
            console.error('Required quest UI elements not found');
            return;
        }
        
        // Initialize event listeners
        this._initEventListeners();
        
        // Initial render
        this.render();
    }
    
    /**
     * Initialize event listeners
     * @private
     */
    _initEventListeners() {
        // Add button click
        if (this.elements.addButton) {
            this.elements.addButton.addEventListener('click', () => this._handleAddQuest());
        }
        
        // Edit button click
        if (this.elements.editButton) {
            this.elements.editButton.addEventListener('click', () => this._handleEditQuest());
        }
        
        // Delete button click
        if (this.elements.deleteButton) {
            this.elements.deleteButton.addEventListener('click', () => this._handleDeleteQuest());
        }
        
        // Search input
        if (this.elements.search) {
            this.elements.search.addEventListener('input', (e) => this._handleSearch(e));
        }
    }
    
    /**
     * Render the quest list and details
     */
    filterQuests(searchTerm) {
        const quests = this.questService.getAllQuests();
        const filtered = quests.filter(quest => 
            quest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            quest.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.renderQuestList(filtered);
    }
    
    /**
     * Render the quest list
     * @param {Array} quests - Array of quests to display
     */
    renderQuestList(quests = []) {
        this.listContainer.innerHTML = '';
        
        if (quests.length === 0) {
            this.listContainer.innerHTML = '<div class="empty-state">No quests found. Click the + button to add a new quest.</div>';
                <div class="text-center text-muted py-3">
                    <i class="fas fa-scroll fa-2x mb-2"></i>
                    <p>No quests found. Click "Add Quest" to get started.</p>
                </div>`;
            return;
        }
        
        quests.forEach(quest => {
            const item = this._createQuestListItem(quest);
            this.elements.list.appendChild(item);
        });
    }
    
    /**
     * Create a quest list item element
     * @param {Object} quest - The quest data
     * @returns {HTMLElement} The created list item
     * @private
     */
    _createQuestListItem(quest) {
        const item = document.createElement('div');
        item.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center';
        item.dataset.id = quest.id;
        
        if (this.currentEntity && this.currentEntity.id === quest.id) {
            item.classList.add('active');
        }
        
        const statusClass = getStatusBadgeClass(quest.status);
        const typeClass = getQuestTypeBadgeClass(quest.type);
        
        item.innerHTML = `
            <div class="d-flex align-items-center">
                <span class="badge ${statusClass} me-2">${formatEnumValue(quest.status)}</span>
                <span class="badge ${typeClass} me-2">${formatEnumValue(quest.type)}</span>
                <span class="quest-title">${quest.name || 'Unnamed Quest'}</span>
            </div>
            <small class="text-muted">${new Date(quest.updatedAt).toLocaleDateString()}</small>
        `;
        
        item.addEventListener('click', () => this._selectQuest(quest.id));
        
        return item;
    }
    
    /**
     * Render the quest details
     * @private
     */
    _renderQuestDetails() {
        if (!this.elements.details) return;
        
        if (!this.currentEntity) {
            this.elements.details.innerHTML = `
                <div class="text-center text-muted py-5">
                    <i class="fas fa-scroll fa-3x mb-3"></i>
                    <p>Select a quest to view details</p>
                </div>`;
            
            // Hide edit/delete buttons when no quest is selected
            if (this.elements.editButton) this.elements.editButton.style.display = 'none';
            if (this.elements.deleteButton) this.elements.deleteButton.style.display = 'none';
            return;
        }
        
        const quest = this.currentEntity;
        const statusClass = getStatusBadgeClass(quest.status);
        const typeClass = getQuestTypeBadgeClass(quest.type);
        
        this.elements.details.innerHTML = `
            <h3 class="h4 mb-3">${quest.name || 'Unnamed Quest'}</h3>
            
            <div class="mb-3">
                <span class="badge ${statusClass} me-2">${formatEnumValue(quest.status)}</span>
                <span class="badge ${typeClass}">${formatEnumValue(quest.type)}</span>
            </div>
            
            ${quest.description ? `<div class="mb-3"><p>${quest.description}</p></div>` : ''}
            
            <div class="text-muted small">
                <div>Created: ${new Date(quest.createdAt).toLocaleString()}</div>
                <div>Updated: ${new Date(quest.updatedAt).toLocaleString()}</div>
            </div>
        `;
        
        // Show edit/delete buttons when a quest is selected
        if (this.elements.editButton) this.elements.editButton.style.display = 'inline-block';
        if (this.elements.deleteButton) this.elements.deleteButton.style.display = 'inline-block';
    }
    
    /**
     * Handle search input
     * @param {Event} e - The input event
     * @private
     */
    _handleSearch(e) {
        const searchTerm = e.target.value.toLowerCase();
        const quests = this.questService.getAllQuests();
        
        if (!searchTerm) {
            this._renderQuestList();
            return;
        }
        
        const filteredQuests = quests.filter(quest => 
            (quest.name && quest.name.toLowerCase().includes(searchTerm)) ||
            (quest.description && quest.description.toLowerCase().includes(searchTerm)) ||
            (quest.status && quest.status.toLowerCase().includes(searchTerm)) ||
            (quest.type && quest.type.toLowerCase().includes(searchTerm))
        );
        
        this._renderFilteredQuests(filteredQuests);
    }
    
    /**
     * Render filtered quests
     * @param {Array} quests - The filtered quests to render
     * @private
     */
    _renderFilteredQuests(quests) {
        if (!this.elements.list) return;
        
        this.elements.list.innerHTML = '';
        
        if (quests.length === 0) {
            this.elements.list.innerHTML = `
                <div class="text-center text-muted py-3">
                    <i class="fas fa-search fa-2x mb-2"></i>
                    <p>No quests match your search</p>
                </div>`;
            return;
        }
        
        quests.forEach(quest => {
            const item = this._createQuestListItem(quest);
            this.elements.list.appendChild(item);
        });
    }
    
    /**
     * Select a quest and display its details
     * @param {string} questId - The ID of the quest to select
     * @private
     */
    _selectQuest(questId) {
        const quest = this.questService.getQuestById(questId);
        if (!quest) return;
        
        this.currentEntity = quest;
        this._renderQuestList(); // Update active state in the list
        this._renderQuestDetails();
    }
    
    /**
     * Handle add quest button click
     * @private
     */
    _handleAddQuest() {
        const newQuest = {
            name: 'New Quest',
            description: '',
            type: 'MAIN',
            status: 'NOT_STARTED',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        try {
            const createdQuest = this.questService.createQuest(newQuest);
            this.currentEntity = createdQuest;
            this.render();
            showToastMessage('Quest created successfully', 'success');
        } catch (error) {
            console.error('Error creating quest:', error);
            showToastMessage('Failed to create quest', 'error');
        }
    }
    
    /**
     * Handle edit quest button click
     * @private
     */
    _handleEditQuest() {
        if (!this.currentEntity) return;
        
        // In a real implementation, this would open a modal or form for editing
        // For now, we'll just show a message
        showToastMessage('Edit functionality coming soon!', 'info');
    }
    
    /**
     * Handle delete quest button click
     * @private
     */
    _handleDeleteQuest() {
        if (!this.currentEntity) return;
        
        if (confirm('Are you sure you want to delete this quest? This action cannot be undone.')) {
            try {
                this.questService.deleteQuest(this.currentEntity.id);
                this.currentEntity = null;
                this.render();
                showToastMessage('Quest deleted successfully', 'success');
            } catch (error) {
                console.error('Error deleting quest:', error);
                showToastMessage('Failed to delete quest', 'error');
            }
        }
    }
}