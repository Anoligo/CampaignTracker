/**
 * CharacterUI
 * Handles the user interface for managing characters
 */

import { PlayerClass } from '../../players/enums/player-enums.js';
import { RelationalInputs } from '../../../global-styles.js';
import { formatEnumValue } from '../../../utils/style-utils.js';

// Import game data service
import { gameDataService } from '../../game-data/services/game-data-service.js';

export class CharacterUI {
    /**
     * Create a new CharacterUI instance
     * @param {CharacterService} characterService - Instance of CharacterService
     * @param {DataManager} dataManager - Instance of the application's DataManager
     */
    constructor(characterService, dataManager) {
        console.log('CharacterUI constructor called');
        
        this.characterService = characterService;
        this.dataManager = dataManager;
        this.characterList = document.getElementById('character-list');
        this.characterDetails = document.getElementById('character-details');
        this.searchInput = document.getElementById('character-search');
        this.addCharacterBtn = document.getElementById('addCharacterBtn');
        
        // Initialize current character
        this.currentCharacter = null;
        
        // Bind methods
        this.handleSearch = this.handleSearch.bind(this);
        this.handleAddCharacter = this.handleAddCharacter.bind(this);
        this.handleEditCharacter = this.handleEditCharacter.bind(this);
        this.handleDeleteCharacter = this.handleDeleteCharacter.bind(this);
        this.saveCharacter = this.saveCharacter.bind(this);
        this.refresh = this.refresh.bind(this);
        this.showToast = this.showToast.bind(this);
        
        // Initialize the UI when the DOM is ready
        const initialize = () => {
            console.log('Initializing CharacterUI');
            this.init();
        };
        
        if (document.readyState === 'loading') {
            console.log('DOM not ready, adding DOMContentLoaded listener');
            document.addEventListener('DOMContentLoaded', initialize);
        } else {
            console.log('DOM already ready, initializing immediately');
            initialize();
        }
    }
    
    /**
     * Initialize the UI components
     */
    init() {
        console.log('CharacterUI.init() called');
        
        // Get DOM elements
        this.characterList = document.getElementById('characterList');
        this.characterDetails = document.getElementById('characterDetails');
        this.addCharacterBtn = document.getElementById('addCharacterBtn');
        this.characterSearch = document.getElementById('characterSearch');
        
        console.log('CharacterUI elements:', {
            characterList: !!this.characterList,
            characterDetails: !!this.characterDetails,
            addCharacterBtn: !!this.addCharacterBtn,
            characterSearch: !!this.characterSearch
        });
        
        // Set up event listeners
        if (this.addCharacterBtn) {
            console.log('Adding click event listener to addCharacterBtn');
            // Store the bound function so we can remove it later if needed
            this.boundHandleAddCharacter = this.handleAddCharacter.bind(this);
            this.addCharacterBtn.addEventListener('click', this.boundHandleAddCharacter);
        }
        
        if (this.characterSearch) {
            this.characterSearch.addEventListener('input', this.handleSearch);
        }
        
        // Initial render
        console.log('Calling renderCharacterList()');
        this.renderCharacterList();
    }
    
    /**
     * Render the character list
     * @param {Array} characters - Optional array of characters to display
     */
    renderCharacterList(characters = null) {
        if (!this.characterList) return;
        
        const chars = characters || this.characterService.getAllCharacters();
        
        if (chars.length === 0) {
            this.characterList.innerHTML = `
                <div class="text-center p-3 text-muted">
                    No characters found. Click "Add Character" to create one.
                </div>`;
            return;
        }
        
        this.characterList.innerHTML = chars.map(character => `
            <div class="card hover-lift mb-2 cursor-pointer" data-character-id="${character.id}">
                <div class="d-flex justify-content-between align-items-center p-3">
                    <div>
                        <h6 class="mb-1 text-accent">${character.name}</h6>
                        <small class="text-meta">${character.race || ''} ${character.classType || ''} ${character.level ? `(Level ${character.level})` : ''}</small>
                    </div>
                    <div class="btn-group btn-group-sm">
                        <button class="button btn-edit" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="button btn-delete" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add event listeners to the character items
        this.characterList.querySelectorAll('.card[data-character-id]').forEach(item => {
            const characterId = item.dataset.characterId;
            const character = this.characterService.getCharacterById(characterId);
            
            if (!character) return; // Skip if character not found
            
            // Click on item to view details
            item.addEventListener('click', (e) => {
                // Only handle click if not clicking on a button
                if (!e.target.closest('.btn-group, button')) {
                    this.renderCharacterDetails(character);
                    
                    // Highlight the selected card
                    this.characterList.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
                    item.classList.add('selected');
                }
            });
            
            // Edit button
            const editBtn = item.querySelector('.btn-edit');
            if (editBtn) {
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.handleEditCharacter(character);
                });
            }
            
            // Delete button
            const deleteBtn = item.querySelector('.btn-delete');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.handleDeleteCharacter(characterId);
                });
            }
        });
    }
    
    /**
     * Render character details
     * @param {Object} character - Character object to display
     */
    renderCharacterDetails(character) {
        if (!this.characterDetails) return;
        
        this.currentCharacter = character;
        
        // Format attributes
        const attributes = character.attributes || {};
        const attributesHtml = `
            <div class="col-4 col-md-2 text-center">
                <div class="attribute-value">${attributes.strength || 10}</div>
                <div class="attribute-label">STR</div>
                <div class="attribute-modifier">${this.formatModifier(character, 'strength')}</div>
            </div>
            <div class="col-4 col-md-2 text-center">
                <div class="attribute-value">${attributes.dexterity || 10}</div>
                <div class="attribute-label">DEX</div>
                <div class="attribute-modifier">${this.formatModifier(character, 'dexterity')}</div>
            </div>
            <div class="col-4 col-md-2 text-center">
                <div class="attribute-value">${attributes.constitution || 10}</div>
                <div class="attribute-label">CON</div>
                <div class="attribute-modifier">${this.formatModifier(character, 'constitution')}</div>
            </div>
            <div class="col-4 col-md-2 text-center">
                <div class="attribute-value">${attributes.intelligence || 10}</div>
                <div class="attribute-label">INT</div>
                <div class="attribute-modifier">${this.formatModifier(character, 'intelligence')}</div>
            </div>
            <div class="col-4 col-md-2 text-center">
                <div class="attribute-value">${attributes.wisdom || 10}</div>
                <div class="attribute-label">WIS</div>
                <div class="attribute-modifier">${this.formatModifier(character, 'wisdom')}</div>
            </div>
            <div class="col-4 col-md-2 text-center">
                <div class="attribute-value">${attributes.charisma || 10}</div>
                <div class="attribute-label">CHA</div>
                <div class="attribute-modifier">${this.formatModifier(character, 'charisma')}</div>
            </div>
        `;
        
        // Format skills
        const skillsHtml = character.skills && character.skills.length > 0
            ? character.skills.map(skill => `<span class="badge bg-primary me-1 mb-1">${skill}</span>`).join('')
            : '<p class="text-muted mb-0">No skills added yet.</p>';
        
        // Format inventory
        const inventoryHtml = character.inventory && character.inventory.length > 0
            ? character.inventory.map(item => `
                <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div>${item.name || 'Unnamed Item'}</div>
                    <div class="text-muted small">${item.quantity || 1}</div>
                </div>`).join('')
            : '<p class="text-muted mb-0">No items in inventory.</p>';
        
        // Render the details
        this.characterDetails.innerHTML = `
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center bg-card">
                    <h5 class="mb-0 text-accent">${character.name}</h5>
                    <div>
                        <button class="btn btn-sm btn-outline-primary me-1 btn-edit text">
                            <i class="fas fa-edit me-1"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-outline-danger btn-delete text">
                            <i class="fas fa-trash me-1"></i> Delete
                        </button>
                    </div>
                </div>
                <div class="card-body bg-card">
                    <div class="row mb-3">
                        <div class="col-md-4">
                            <p class="mb-1 text"><strong>Race:</strong> ${character.race || '—'}</p>
                            <p class="mb-1 text"><strong>Class:</strong> ${character.classType || '—'}</p>
                            <p class="mb-0 text"><strong>Level:</strong> ${character.level || 1}</p>
                        </div>
                        <div class="col-md-4">
                            <p class="mb-0"><strong>Created:</strong> ${character.createdAt ? new Date(character.createdAt).toLocaleDateString() : '—'}</p>
                        </div>
                    </div>
                    
                    <h6 class="border-bottom pb-2">Attributes</h6>
                    <div class="row g-2 mb-4">
                        ${attributesHtml}
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <h6 class="border-bottom pb-2">Skills</h6>
                            <div class="skills-container">
                                ${skillsHtml}
                            </div>
                        </div>
                        <div class="col-md-6 mb-3">
                            <h6 class="border-bottom pb-2">Inventory</h6>
                            <div class="inventory-list">
                                ${inventoryHtml}
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
            
        // Add event listeners to action buttons
        const editBtn = this.characterDetails.querySelector('.btn-edit');
        if (editBtn) {
            editBtn.addEventListener('click', () => this.handleEditCharacter(character));
        }
        
        const deleteBtn = this.characterDetails.querySelector('.btn-delete');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.handleDeleteCharacter(character.id));
        }
    }
    
    /**
     * Format an ability modifier with sign
     * @param {Object} character - Character object
     * @param {string} ability - Ability name
     * @returns {string} Formatted modifier (e.g., "+2" or "-1")
     */
    formatModifier(character, ability) {
        if (!character || !character.attributes || !character.attributes[ability]) {
            return '+0';
        }
        const score = character.attributes[ability];
        const modifier = Math.floor((score - 10) / 2);
        return modifier >= 0 ? `+${modifier}` : `${modifier}`;
    }
    
    /**
     * Remove any existing character form
     */
    removeExistingForm() {
        const existingForm = document.getElementById('character-form-container');
        if (existingForm) {
            existingForm.remove();
        }
        // Always ensure the add button is visible when removing forms
        if (this.addCharacterBtn) {
            this.addCharacterBtn.style.display = 'block';
        }
    }
    
    /**
     * Handle adding a new character
     */
    handleAddCharacter() {
        // Remove any existing form first
        this.removeExistingForm();
        
        // Hide the add button while the form is open
        this.addCharacterBtn.style.display = 'none';
        
        try {
            // Ensure gameDataService is available
            if (typeof gameDataService === 'undefined') {
                console.error('GameDataService is not available');
                this.showToast('Error: Game data service not available', 'error');
                // Show the add button again since we're bailing out
                this.addCharacterBtn.style.display = 'block';
                return;
            }
            
            // Log game data service status
            console.log('GameDataService available:', !!gameDataService);
            
            // Get races and classes
            const races = gameDataService.getRaces();
            const classes = gameDataService.getClasses();
            
            console.log('Races:', races);
            console.log('Classes:', classes);
            
            if (!races || !races.length || !classes || !classes.length) {
                console.error('Failed to load game data');
                this.showToast('Error: Failed to load game data', 'error');
                // Show the add button again since we're bailing out
                this.addCharacterBtn.style.display = 'block';
                return;
            }
            
            // If we get here, we have valid data, so proceed with creating the form
            this.createCharacterForm(races, classes);
            
        } catch (error) {
            console.error('Error in handleAddCharacter:', error);
            this.showToast(`Error: ${error.message}`, 'error');
            // Make sure to show the add button again on error
            this.addCharacterBtn.style.display = 'block';
        }
    }
    
    /**
     * Create the character form with the provided race and class options
     * @param {Array} races - Array of race objects with id and name properties
     * @param {Array} classes - Array of class objects with id and name properties
     */
    createCharacterForm(races, classes) {
        // Create the form container
        const formContainer = document.createElement('div');
        formContainer.id = 'character-form-container';
        formContainer.className = 'card mb-4';
        
        // Generate the form HTML with the provided races and classes
        formContainer.innerHTML = `
            <div class="card-header d-flex justify-content-between align-items-center bg-card">
                <h5 class="mb-0 text-accent">New Character</h5>
                <button type="button" class="btn-close btn-close-white" id="cancel-add-character"></button>
            </div>
            <div class="card-body bg-card">
                <form id="character-form">
                    <input type="hidden" id="character-id" value="">
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="character-name" class="form-label text">Name *</label>
                            <input type="text" class="form-control bg-card text" id="character-name" required>
                        </div>
                        <div class="col-md-3">
                            <label for="character-level" class="form-label text">Level</label>
                            <input type="number" class="form-control bg-card text" id="character-level" min="1" value="1">
                        </div>
                        <div class="col-md-3">
                            <label for="character-race" class="form-label text">Race *</label>
                            <select class="form-select bg-card text" id="character-race" required data-relational="true" data-entity-type="race" data-placeholder="Search or select race...">
                                <option value="">Select a race</option>
                                ${races.map(race => 
                                    `<option value="${race.id}">${race.name}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="character-class" class="form-label text">Class *</label>
                            <select class="form-select bg-card text" id="character-class" required data-relational="true" data-entity-type="class" data-placeholder="Search or select class...">
                                <option value="">Select a class</option>
                                ${classes.map(cls => 
                                    `<option value="${cls.id}">${cls.name}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-12">
                            <h6>Attributes</h6>
                            <div class="row g-2">
                                <div class="col-4 col-md-2">
                                    <label for="character-strength" class="form-label small text">STR</label>
                                    <input type="number" class="form-control form-control-sm bg-card text" id="character-strength" value="10">
                                </div>
                                <div class="col-4 col-md-2">
                                    <label for="character-dexterity" class="form-label small text">DEX</label>
                                    <input type="number" class="form-control form-control-sm bg-card text" id="character-dexterity" value="10">
                                </div>
                                <div class="col-4 col-md-2">
                                    <label for="character-constitution" class="form-label small text">CON</label>
                                    <input type="number" class="form-control form-control-sm bg-card text" id="character-constitution" value="10">
                                </div>
                                <div class="col-4 col-md-2">
                                    <label for="character-intelligence" class="form-label small text">INT</label>
                                    <input type="number" class="form-control form-control-sm bg-card text" id="character-intelligence" value="10">
                                </div>
                                <div class="col-4 col-md-2">
                                    <label for="character-wisdom" class="form-label small text">WIS</label>
                                    <input type="number" class="form-control form-control-sm bg-card text" id="character-wisdom" value="10">
                                </div>
                                <div class="col-4 col-md-2">
                                    <label for="character-charisma" class="form-label small text">CHA</label>
                                    <input type="number" class="form-control form-control-sm bg-card text" id="character-charisma" value="10">
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="character-bio" class="form-label text">Bio</label>
                        <textarea class="form-control bg-card text" id="character-bio" rows="3"></textarea>
                    </div>
                    
                    <div class="mb-3">
                        <label for="character-notes" class="form-label text">Notes</label>
                        <textarea class="form-control bg-card text" id="character-notes" rows="2"></textarea>
                    </div>
                    
                    <div class="d-flex justify-content-end gap-2">
                        <button type="button" class="btn btn-outline-secondary text" id="cancel-character">
                            <i class="fas fa-times me-1"></i> Cancel
                        </button>
                        <button type="submit" class="btn btn-primary text">
                            <i class="fas fa-save me-1"></i> Save Character
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        // Insert the form after the header
        const container = this.characterList.closest('.row');
        if (container) {
            container.querySelector('.col-md-4').after(formContainer);
        } else {
            // Fallback: insert before the character details
            this.characterDetails.parentNode.insertBefore(formContainer, this.characterDetails);
        }
        
        // Add event listeners
        const form = formContainer.querySelector('#character-form');
        
        // Remove any existing event listeners to prevent duplicates
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        
        newForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCharacter(newForm, false);
        });
        
        // Cancel button
        const cancelBtn = formContainer.querySelector('#cancel-character');
        cancelBtn.addEventListener('click', () => {
            this.removeExistingForm();
        });
        
        // Close button (X)
        const closeBtn = formContainer.querySelector('#cancel-add-character');
        closeBtn.addEventListener('click', () => {
            this.removeExistingForm();
        });
        
        // Focus the name field for better UX
        const nameInput = formContainer.querySelector('#character-name');
        if (nameInput) {
            nameInput.focus();
        }
    }
    
    /**
     * Handle editing a character
     * @param {Object} character - Character to edit
     */
    handleEditCharacter(character) {
        // Remove any existing form first
        this.removeExistingForm();
        
        // Hide the character details
        this.characterDetails.style.display = 'none';
        
        // Create the form container
        const formContainer = document.createElement('div');
        formContainer.id = 'character-form-container';
        formContainer.className = 'card mb-4';
        
        formContainer.innerHTML = `
            <div class="card-header d-flex justify-content-between align-items-center bg-card">
                <h5 class="mb-0 text-accent">Edit Character</h5>
                <button type="button" class="btn-close btn-close-white" id="cancel-edit-character"></button>
            </div>
            <div class="card-body bg-card">
                <form id="character-form">
                    <input type="hidden" id="character-id" value="${character.id}">
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="character-name" class="form-label text">Name *</label>
                            <input type="text" class="form-control bg-card text" id="character-name" value="${character.name || ''}" required>
                        </div>
                        <div class="col-md-3">
                            <label for="character-level" class="form-label text">Level</label>
                            <input type="number" class="form-control bg-card text" id="character-level" value="${character.level || 1}" min="1">
                        </div>
                        <div class="col-md-3">
                            <label for="character-race" class="form-label text">Race *</label>
                            <select class="form-select bg-card text" id="character-race" required data-relational="true" data-entity-type="race" data-placeholder="Search or select race...">
                                <option value="">Select a race</option>
                                ${gameDataService.getRaces().map(race => 
                                    `<option value="${race.id}" ${character.race === race.id ? 'selected' : ''}>${race.name}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="character-class" class="form-label">Class *</label>
                            <select class="form-select bg-card text" id="character-class" required data-relational="true" data-entity-type="class" data-placeholder="Search or select class...">
                                <option value="">Select a class</option>
                                ${gameDataService.getClasses().map(cls => {
                                    // Check multiple possible property names for class
                                    const isSelected = character.classType === cls.id || 
                                                     character.class === cls.id || 
                                                     character.className === cls.id || 
                                                     character.playerClass === cls.id;
                                    return `<option value="${cls.id}" ${isSelected ? 'selected' : ''}>${cls.name}</option>`;
                                }).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-12">
                            <h6 class="text-accent">Attributes</h6>
                            <div class="row g-2">
                                <div class="col-4 col-md-2">
                                    <label for="character-strength" class="form-label small text">STR</label>
                                    <input type="number" class="form-control form-control-sm bg-card text" id="character-strength" value="${character.attributes?.strength || 10}">
                                </div>
                                <div class="col-4 col-md-2">
                                    <label for="character-dexterity" class="form-label small text">DEX</label>
                                    <input type="number" class="form-control form-control-sm bg-card text" id="character-dexterity" value="${character.attributes?.dexterity || 10}">
                                </div>
                                <div class="col-4 col-md-2">
                                    <label for="character-constitution" class="form-label small text">CON</label>
                                    <input type="number" class="form-control form-control-sm bg-card text" id="character-constitution" value="${character.attributes?.constitution || 10}">
                                </div>
                                <div class="col-4 col-md-2">
                                    <label for="character-intelligence" class="form-label small text">INT</label>
                                    <input type="number" class="form-control form-control-sm bg-card text" id="character-intelligence" value="${character.attributes?.intelligence || 10}">
                                </div>
                                <div class="col-4 col-md-2">
                                    <label for="character-wisdom" class="form-label small text">WIS</label>
                                    <input type="number" class="form-control form-control-sm bg-card text" id="character-wisdom" value="${character.attributes?.wisdom || 10}">
                                </div>
                                <div class="col-4 col-md-2">
                                    <label for="character-charisma" class="form-label small text">CHA</label>
                                    <input type="number" class="form-control form-control-sm bg-card text" id="character-charisma" value="${character.attributes?.charisma || 10}">
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="character-bio" class="form-label">Bio</label>
                        <textarea class="form-control" id="character-bio" rows="3">${character.bio || ''}</textarea>
                    </div>
                    
                    <div class="mb-3">
                        <label for="character-notes" class="form-label">Notes</label>
                        <textarea class="form-control" id="character-notes" rows="2">${character.notes || ''}</textarea>
                    </div>
                    
                    <div class="d-flex justify-content-end gap-2">
                        <button type="button" class="btn btn-outline-secondary" id="cancel-character">
                            <i class="fas fa-times me-1"></i> Cancel
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save me-1"></i> Save Changes
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        // Insert the form before the character details
        this.characterDetails.parentNode.insertBefore(formContainer, this.characterDetails);
        
        // Add event listeners
        const form = formContainer.querySelector('#character-form');
        
        // Remove any existing event listeners to prevent duplicates
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        
        newForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCharacter(newForm, true);
        });
        
        // Cancel button
        const cancelBtn = formContainer.querySelector('#cancel-character');
        cancelBtn.addEventListener('click', () => {
            this.removeExistingForm();
            this.characterDetails.style.display = 'block';
        });
        
        // Close button (X)
        const closeBtn = formContainer.querySelector('#cancel-edit-character');
        closeBtn.addEventListener('click', () => {
            this.removeExistingForm();
            this.characterDetails.style.display = 'block';
        });
        
        // Focus the name field for better UX
        const nameInput = formContainer.querySelector('#character-name');
        if (nameInput) {
            nameInput.focus();
            nameInput.select();
        }
    }
    
    /**
     * Handle deleting a character with a custom modal confirmation
     * @param {string} characterId - ID of the character to delete
     */
    async handleDeleteCharacter(characterId) {
        const character = this.characterService.getCharacterById(characterId);
        if (!character) {
            console.error('Character not found:', characterId);
            return;
        }
        
        // Check if confirmation modal already exists
        let confirmModal = document.getElementById('deleteCharacterConfirmModal');
        
        // If it doesn't exist, create it
        if (!confirmModal) {
            confirmModal = document.createElement('div');
            confirmModal.id = 'deleteCharacterConfirmModal';
            confirmModal.className = 'modal fade';
            confirmModal.setAttribute('tabindex', '-1');
            confirmModal.setAttribute('aria-labelledby', 'deleteCharacterConfirmModalLabel');
            confirmModal.setAttribute('aria-hidden', 'true');
            
            confirmModal.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-content bg-card">
                        <div class="modal-header">
                            <h5 class="modal-title text-accent" id="deleteCharacterConfirmModalLabel">Confirm Deletion</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body text">
                            <p>Are you sure you want to delete <strong id="deleteCharacterName"></strong>?</p>
                            <p>This action cannot be undone.</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary text" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-danger text" id="confirmDeleteCharacterBtn">Delete</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(confirmModal);
        }
        
        // Set the character name in the modal
        const characterNameEl = confirmModal.querySelector('#deleteCharacterName');
        if (characterNameEl) {
            characterNameEl.textContent = character.name;
        }
        
        // Initialize the modal if it's not already initialized
        let bsModal = bootstrap.Modal.getInstance(confirmModal);
        if (!bsModal) {
            bsModal = new bootstrap.Modal(confirmModal);
        }
        
        // Remove any existing event listeners from the confirm button
        const confirmBtn = confirmModal.querySelector('#confirmDeleteCharacterBtn');
        if (confirmBtn) {
            const newConfirmBtn = confirmBtn.cloneNode(true);
            confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
            
            // Add event listener to the new confirm button
            newConfirmBtn.addEventListener('click', async () => {
                try {
                    // Delete the character
                    await this.characterService.deleteCharacter(characterId);
                    
                    // Hide the modal
                    bsModal.hide();
                    
                    // Clear the details view
                    this.characterDetails.innerHTML = `
                        <div class="card">
                            <div class="card-body bg-card text-center text-muted" style="min-height: 200px; display: flex; align-items: center; justify-content: center;">
                                <div>
                                    <i class="fas fa-user fa-3x mb-3"></i>
                                    <p class="mb-0 text">Select a character to view or edit details</p>
                                </div>
                            </div>
                        </div>`;
                    
                    // Refresh the character list
                    this.renderCharacterList();
                    
                    // Show a success message
                    this.showToast('Character deleted successfully', 'success');
                } catch (error) {
                    console.error('Error deleting character:', error);
                    this.showToast('Error deleting character', 'error');
                    // Hide the modal on error too
                    bsModal.hide();
                }
            });
        }
        
        // Show the modal
        bsModal.show();
    }
    
    /**
     * Save character from form
     * @param {boolean} isEdit - Whether this is an edit operation
     */
    async saveCharacter(form, isEdit = false) {
        try {
            const id = form.querySelector('#character-id')?.value || Date.now().toString();
            const name = form.querySelector('#character-name')?.value?.trim() || '';
            const level = parseInt(form.querySelector('#character-level')?.value) || 1;
            const race = form.querySelector('#character-race')?.value?.trim() || '';
            const classType = form.querySelector('#character-class')?.value?.trim() || '';
            const bio = form.querySelector('#character-bio')?.value || '';
            const notes = form.querySelector('#character-notes')?.value || '';
            
            // Validate required fields
            if (!name || !race || !classType) {
                this.showToast('Please fill in all required fields', 'error');
                return;
            }
            
            // Get attributes
            const attributes = {
                strength: parseInt(form.querySelector('#character-strength')?.value) || 10,
                dexterity: parseInt(form.querySelector('#character-dexterity')?.value) || 10,
                constitution: parseInt(form.querySelector('#character-constitution')?.value) || 10,
                intelligence: parseInt(form.querySelector('#character-intelligence')?.value) || 10,
                wisdom: parseInt(form.querySelector('#character-wisdom')?.value) || 10,
                charisma: parseInt(form.querySelector('#character-charisma')?.value) || 10
            };
            
            const characterData = {
                id,
                name,
                level,
                race,
                classType,
                attributes,
                bio,
                notes,
                createdAt: isEdit ? undefined : new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            // Show loading state
            const saveButton = form.querySelector('button[type="submit"]');
            const originalButtonText = saveButton?.innerHTML || 'Save';
            if (saveButton) {
                saveButton.disabled = true;
                saveButton.innerHTML = '<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Saving...';
            }
            
            // Save the character
            let savedCharacter;
            if (isEdit) {
                savedCharacter = await this.characterService.updateCharacter(id, characterData);
            } else {
                savedCharacter = await this.characterService.createCharacter(characterData);
            }
            
            // Remove the form
            this.removeExistingForm();
            
            // Refresh the UI
            await this.refresh(savedCharacter.id);
            
            // Show success message
            this.showToast(
                `Character ${isEdit ? 'updated' : 'added'} successfully`,
                'success'
            );
            
        } catch (error) {
            console.error(`Error ${isEdit ? 'updating' : 'adding'} character:`, error);
            this.showToast(
                `Error ${isEdit ? 'updating' : 'adding'} character: ${error.message || 'Unknown error'}`,
                'error'
            );
        } finally {
            // Reset button state
            const saveButton = form?.querySelector('button[type="submit"]');
            if (saveButton) {
                saveButton.disabled = false;
                saveButton.innerHTML = isEdit ? 'Save Changes' : 'Add Character';
            }
            
            // Show the add character button again
            this.toggleAddButton(true);
        }
    }
    
    /**
     * Scroll to a specific character in the list
     * @param {string} characterId - ID of the character to scroll to
     */
    scrollToCharacter(characterId) {
        const characterElement = document.querySelector(`[data-character-id="${characterId}"]`);
        if (characterElement) {
            characterElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            // Add a highlight effect
            characterElement.classList.add('highlight');
            setTimeout(() => {
                characterElement.classList.remove('highlight');
            }, 2000);
        }
    }
    
    /**
     * Toggle the visibility of the add character button
     * @param {boolean} show - Whether to show the button
     */
    toggleAddButton(show) {
        const addCharacterBtn = document.getElementById('addCharacterBtn');
        if (addCharacterBtn) {
            addCharacterBtn.style.display = show ? 'block' : 'none';
        }
    }
    
    /**
     * Show a toast notification
     * @param {string} message - The message to display
     * @param {string} type - The type of notification (success, error, warning, info)
     */
    showToast(message, type = 'info') {
        // Create toast container if it doesn't exist
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.style.position = 'fixed';
            toastContainer.style.top = '20px';
            toastContainer.style.right = '20px';
            toastContainer.style.zIndex = '9999';
            document.body.appendChild(toastContainer);
        }

        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast show align-items-center text-white bg-${type} border-0`;
        toast.role = 'alert';
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        // Add close button
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;

        // Add to container
        toastContainer.appendChild(toast);

        // Auto-remove after delay
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 5000);
    }
    
    /**
     * Handle character search
     * @param {Event} e - Input event
     */
    handleSearch(e) {
        const searchTerm = e.target.value.toLowerCase();
        if (!searchTerm) {
            this.renderCharacterList();
            return;
        }
        
        const characters = this.characterService.getAllCharacters().filter(character => 
            character.name.toLowerCase().includes(searchTerm) ||
            (character.race && character.race.toLowerCase().includes(searchTerm)) ||
            (character.classType && character.classType.toLowerCase().includes(searchTerm))
        );
        
        this.renderCharacterList(characters);
    }
    
    /**
     * Refresh the UI after adding or editing a character
     * @param {string} characterId - Optional ID of the character to show details for
     */
    async refresh(characterId = null) {
        try {
            // Re-render the character list
            this.renderCharacterList();
            
            // If a character ID is provided, show its details
            if (characterId) {
                const character = this.characterService.getCharacterById(characterId);
                console.log('Refreshing character details for ID:', characterId, 'Found:', character);
                
                if (character) {
                    this.currentCharacter = character;
                    this.renderCharacterDetails(character);
                    
                    // Ensure the character details are visible
                    this.characterDetails.style.display = 'block';
                    
                    // Scroll to the character in the list
                    const listItem = document.querySelector(`[data-character-id="${characterId}"]`);
                    if (listItem) {
                        listItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                } else {
                    console.warn('Character not found with ID:', characterId);
                }
            } else if (this.currentCharacter) {
                // Otherwise, refresh the current character details if available
                const character = this.characterService.getCharacterById(this.currentCharacter.id);
                if (character) {
                    this.currentCharacter = character;
                    this.renderCharacterDetails(character);
                }
            }
            
            // Force a reflow to ensure the UI updates
            if (document.body) {
                document.body.offsetHeight;
            }
            
        } catch (error) {
            console.error('Error refreshing UI:', error);
        }
    }
}
