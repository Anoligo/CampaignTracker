/**
 * Character UI Component
 * Handles the rendering and interaction for character-related UI elements
 * Uses the BaseUI class for consistent UI patterns
 */

import { BaseUI } from '../../../components/base-ui.js';
import { createListItem, createDetailsPanel, showToast } from '../../../components/ui-components.js';
import { formatEnumValue } from '../../../utils/style-utils.js';
import { PlayerClass } from '../../players/enums/player-enums.js';

// Define common races for the dropdown
const PlayerRace = {
    HUMAN: 'Human',
    ELF: 'Elf',
    DWARF: 'Dwarf',
    HALFLING: 'Halfling',
    GNOME: 'Gnome',
    HALF_ELF: 'Half-Elf',
    HALF_ORC: 'Half-Orc',
    TIEFLING: 'Tiefling',
    AASIMAR: 'Aasimar',
    GOBLIN: 'Goblin',
    KOBOLD: 'Kobold',
    LIZARDFOLK: 'Lizardfolk',
    ORC: 'Orc',
    RATFOLK: 'Ratfolk',
    CATFOLK: 'Catfolk',
    TENGU: 'Tengu',
    KITSUNE: 'Kitsune',
    STRIX: 'Strix',
    SYLPH: 'Sylph',
    UNDINE: 'Undine',
    IFRIT: 'Ifrit',
    OREAD: 'Oread',
    SULI: 'Suli'
};

export class CharacterUI extends BaseUI {
    /**
     * Create a new CharacterUI instance
     * @param {Object} characterService - Instance of CharacterService
     * @param {Object} dataManager - Instance of DataManager for accessing related entities
     */
    constructor(characterService, dataManager) {
        super({
            containerId: 'npcs',
            listId: 'characterList',
            detailsId: 'characterDetails',
            searchId: 'characterSearch',
            addButtonId: 'addCharacterBtn',
            entityName: 'character',
            getAll: () => characterService.getAllCharacters(),
            getById: (id) => characterService.getCharacterById(id),
            add: (character) => characterService.createCharacter(character),
            update: (id, updates) => characterService.updateCharacter(id, updates),
            delete: (id) => characterService.deleteCharacter(id)
        });
        
        this.characterService = characterService;
        this.dataManager = dataManager;
        
        // Bind additional methods
        this.formatModifier = this.formatModifier.bind(this);
        this.removeExistingForm = this.removeExistingForm.bind(this);
    }
    
    /**
     * Clean up event listeners and resources
     */
    cleanup() {
        console.log('[CharacterUI] Cleaning up...');
        
        // Remove any custom event listeners here
        // Example: document.removeEventListener('customEvent', this.handler);
        
        // Clean up any DOM elements or references
        // This will be called when the characters section is hidden
        
        console.log('[CharacterUI] Cleanup complete');
    }
    
    /**
     * Create a list item for a character
     * @param {Object} character - Character to create list item for
     * @returns {HTMLElement} The created list item
     */
    createListItem(character) {
        const listItem = document.createElement('a');
        listItem.href = '#';
        listItem.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center';
        listItem.dataset.id = character.id;
        
        if (this.currentEntity && this.currentEntity.id === character.id) {
            listItem.classList.add('active');
        }
        
        listItem.innerHTML = `
            <div class="d-flex flex-column">
                <div class="d-flex align-items-center">
                    <i class="fas fa-user-shield me-2"></i>
                    <strong>${character.name}</strong>
                </div>
                <small>${character.race || 'Unknown Race'} ${(character.class || character.classType || 'Unknown Class')} (Level ${character.level || 1})</small>
            </div>
            <span class="badge bg-secondary rounded-pill">${character.status || 'Active'}</span>
        `;
        
        listItem.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleSelect(character.id);
        });
        
        return listItem;
    }
    
    /**
     * Render the details for a character
     * @param {Object} character - Character to render details for
     */
    renderDetails(character) {
        if (!this.detailsElement) return;
        
        if (!character) {
            this.detailsElement.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-user-shield fa-3x mb-3"></i>
                    <p class="empty-state-message">Select a character to view details</p>
                </div>
            `;
            return;
        }
        
        // Create sections for the details panel
        const sections = [
            {
                title: 'Basic Information',
                content: `
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>Race:</strong> ${character.race || 'Unknown'}</p>
                            <p><strong>Class:</strong> ${(character.class || character.classType || 'Unknown')}</p>
                            <p><strong>Level:</strong> ${character.level || 1}</p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Status:</strong> <span class="badge bg-secondary">${character.status || 'Active'}</span></p>
                            <p><strong>Alignment:</strong> ${character.alignment || 'Unknown'}</p>
                            <p><strong>Deity:</strong> ${character.deity || 'None'}</p>
                        </div>
                    </div>
                `
            },
            {
                title: 'Attributes',
                content: `
                    <div class="row">
                        <div class="col-md-4">
                            <p><strong>STR:</strong> ${character.strength || 10} (${this.formatModifier(character, 'strength')})</p>
                            <p><strong>DEX:</strong> ${character.dexterity || 10} (${this.formatModifier(character, 'dexterity')})</p>
                        </div>
                        <div class="col-md-4">
                            <p><strong>CON:</strong> ${character.constitution || 10} (${this.formatModifier(character, 'constitution')})</p>
                            <p><strong>INT:</strong> ${character.intelligence || 10} (${this.formatModifier(character, 'intelligence')})</p>
                        </div>
                        <div class="col-md-4">
                            <p><strong>WIS:</strong> ${character.wisdom || 10} (${this.formatModifier(character, 'wisdom')})</p>
                            <p><strong>CHA:</strong> ${character.charisma || 10} (${this.formatModifier(character, 'charisma')})</p>
                        </div>
                    </div>
                `
            },
            {
                title: 'Quests',
                content: this.renderRelatedQuests(character)
            },
            {
                title: 'Background',
                content: `
                    <div class="mb-3">
                        <p>${character.background || 'No background information available.'}</p>
                    </div>
                `
            }
        ];
        
        // Create the details panel content
        let detailsContent = `
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">${character.name}</h5>
                <div>
                    <button class="btn btn-sm btn-primary me-2" id="edit-character-btn">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" id="delete-character-btn">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
            <div class="card-body">
        `;
        
        // Add each section to the details content
        sections.forEach(section => {
            detailsContent += `
                <div class="mb-4">
                    <h6 class="text-accent mb-3">${section.title}</h6>
                    ${section.content}
                </div>
            `;
        });
        
        // Close the card body
        detailsContent += `</div>`;
        
        // Add the details panel to the DOM
        this.detailsElement.innerHTML = detailsContent;
        
        // Add event listeners
        document.getElementById('edit-character-btn').addEventListener('click', () => this.handleEdit(character));
        document.getElementById('delete-character-btn').addEventListener('click', () => this.handleDelete(character.id));
    }
    
    /**
     * Format an ability modifier with sign
     * @param {Object} character - Character object
     * @param {string} ability - Ability name
     * @returns {string} Formatted modifier (e.g., "+2" or "-1")
     */
    formatModifier(character, ability) {
        if (!character || !character[ability]) return '+0';
        
        const score = character[ability];
        const modifier = Math.floor((score - 10) / 2);
        
        return modifier >= 0 ? `+${modifier}` : `${modifier}`;
    }
    
    /**
     * Render related quests for a character
     * @param {Object} character - Character object
     * @returns {string} HTML content for related quests
     */
    renderRelatedQuests(character) {
        // Get quests that reference this character
        const quests = (this.dataManager.appState.quests || []).filter(quest => 
            quest.characters && quest.characters.includes(character.id)
        );
        
        if (quests.length === 0) {
            return '<p>No quests associated with this character.</p>';
        }
        
        return `
            <div class="list-group mb-3">
                ${quests.map(quest => `
                    <div class="list-group-item bg-card d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-1">${quest.name}</h6>
                            <small>${quest.status || 'Unknown status'}</small>
                        </div>
                        <span class="badge bg-accent">${quest.type || 'Quest'}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    /**
     * Remove any existing character form
     */
    removeExistingForm() {
        const existingForm = document.getElementById('character-form-container');
        if (existingForm) {
            existingForm.remove();
        }
    }
    
    /**
     * Handle adding a new character
     */
    handleAdd() {
        this.removeExistingForm();
        
        // Create form container
        const formContainer = document.createElement('div');
        formContainer.id = 'character-form-container';
        formContainer.className = 'card';
        
        // Create form content
        formContainer.innerHTML = `
            <div class="card-header bg-card">
                <h5 class="card-title mb-0">Add New Character</h5>
            </div>
            <div class="card-body bg-card">
                <form id="character-form">
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="character-name" class="form-label">Name</label>
                            <input type="text" class="form-control" id="character-name" required>
                        </div>
                        <div class="col-md-6">
                            <label for="character-level" class="form-label">Level</label>
                            <input type="number" class="form-control" id="character-level" min="1" max="20" value="1">
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="character-race" class="form-label">Race</label>
                            <select class="form-select" id="character-race" required>
                                <option value="">Select Race</option>
                                ${Object.entries(PlayerRace).map(([key, value]) => 
                                    `<option value="${value}">${value}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label for="character-class" class="form-label">Class</label>
                            <select class="form-select" id="character-class" required>
                                <option value="">Select Class</option>
                                ${Object.entries(PlayerClass).map(([key, value]) => 
                                    `<option value="${value}">${formatEnumValue(value)}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="character-alignment" class="form-label">Alignment</label>
                            <select class="form-select" id="character-alignment">
                                <option value="">Select Alignment</option>
                                <option value="Lawful Good">Lawful Good</option>
                                <option value="Neutral Good">Neutral Good</option>
                                <option value="Chaotic Good">Chaotic Good</option>
                                <option value="Lawful Neutral">Lawful Neutral</option>
                                <option value="True Neutral">True Neutral</option>
                                <option value="Chaotic Neutral">Chaotic Neutral</option>
                                <option value="Lawful Evil">Lawful Evil</option>
                                <option value="Neutral Evil">Neutral Evil</option>
                                <option value="Chaotic Evil">Chaotic Evil</option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label for="character-deity" class="form-label">Deity</label>
                            <input type="text" class="form-control" id="character-deity">
                        </div>
                    </div>
                    
                    <h5 class="mb-3">Attributes</h5>
                    <div class="row mb-3">
                        <div class="col-md-4">
                            <label for="character-str" class="form-label">Strength</label>
                            <input type="number" class="form-control" id="character-str" min="1" max="30" value="10">
                        </div>
                        <div class="col-md-4">
                            <label for="character-dex" class="form-label">Dexterity</label>
                            <input type="number" class="form-control" id="character-dex" min="1" max="30" value="10">
                        </div>
                        <div class="col-md-4">
                            <label for="character-con" class="form-label">Constitution</label>
                            <input type="number" class="form-control" id="character-con" min="1" max="30" value="10">
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-4">
                            <label for="character-int" class="form-label">Intelligence</label>
                            <input type="number" class="form-control" id="character-int" min="1" max="30" value="10">
                        </div>
                        <div class="col-md-4">
                            <label for="character-wis" class="form-label">Wisdom</label>
                            <input type="number" class="form-control" id="character-wis" min="1" max="30" value="10">
                        </div>
                        <div class="col-md-4">
                            <label for="character-cha" class="form-label">Charisma</label>
                            <input type="number" class="form-control" id="character-cha" min="1" max="30" value="10">
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="character-background" class="form-label">Background</label>
                        <textarea class="form-control" id="character-background" rows="4"></textarea>
                    </div>
                    
                    <div class="d-flex justify-content-between">
                        <button type="button" class="btn btn-secondary" id="cancel-character-btn">
                            <i class="fas fa-times me-1"></i> Cancel
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save me-1"></i> Save Character
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        // Add form to details panel
        this.detailsElement.innerHTML = '';
        this.detailsElement.appendChild(formContainer);
        
        // Set up event listeners
        const form = document.getElementById('character-form');
        const cancelBtn = document.getElementById('cancel-character-btn');
        
        if (form) {
            form.addEventListener('submit', (e) => this.handleCharacterFormSubmit(e, false));
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.removeExistingForm();
                this.refresh();
            });
        }
    }
    
    /**
     * Handle editing a character
     * @param {Object} character - Character to edit
     */
    handleEdit(character) {
        this.removeExistingForm();
        
        // Create form container
        const formContainer = document.createElement('div');
        formContainer.id = 'character-form-container';
        formContainer.className = 'card';
        
        // Create form content
        formContainer.innerHTML = `
            <div class="card-header bg-card">
                <h5 class="card-title mb-0">Edit Character: ${character.name}</h5>
            </div>
            <div class="card-body bg-card">
                <form id="character-form" data-character-id="${character.id}">
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="character-name" class="form-label">Name</label>
                            <input type="text" class="form-control" id="character-name" value="${character.name || ''}" required>
                        </div>
                        <div class="col-md-6">
                            <label for="character-level" class="form-label">Level</label>
                            <input type="number" class="form-control" id="character-level" min="1" max="20" value="${character.level || 1}">
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="character-race" class="form-label">Race</label>
                            <select class="form-select" id="character-race">
                                <option value="">Select Race</option>
                                ${Object.entries(PlayerRace).map(([key, value]) => 
                                    `<option value="${value}" ${character.race === value ? 'selected' : ''}>${value}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label for="character-class" class="form-label">Class</label>
                            <select class="form-select" id="character-class">
                                <option value="">Select Class</option>
                                ${Object.entries(PlayerClass).map(([key, value]) =>
                                    `<option value="${value}" ${(character.class === value || character.classType === value) ? 'selected' : ''}>${formatEnumValue(value)}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="character-alignment" class="form-label">Alignment</label>
                            <select class="form-select" id="character-alignment">
                                <option value="">Select Alignment</option>
                                <option value="Lawful Good" ${character.alignment === 'Lawful Good' ? 'selected' : ''}>Lawful Good</option>
                                <option value="Neutral Good" ${character.alignment === 'Neutral Good' ? 'selected' : ''}>Neutral Good</option>
                                <option value="Chaotic Good" ${character.alignment === 'Chaotic Good' ? 'selected' : ''}>Chaotic Good</option>
                                <option value="Lawful Neutral" ${character.alignment === 'Lawful Neutral' ? 'selected' : ''}>Lawful Neutral</option>
                                <option value="True Neutral" ${character.alignment === 'True Neutral' ? 'selected' : ''}>True Neutral</option>
                                <option value="Chaotic Neutral" ${character.alignment === 'Chaotic Neutral' ? 'selected' : ''}>Chaotic Neutral</option>
                                <option value="Lawful Evil" ${character.alignment === 'Lawful Evil' ? 'selected' : ''}>Lawful Evil</option>
                                <option value="Neutral Evil" ${character.alignment === 'Neutral Evil' ? 'selected' : ''}>Neutral Evil</option>
                                <option value="Chaotic Evil" ${character.alignment === 'Chaotic Evil' ? 'selected' : ''}>Chaotic Evil</option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label for="character-deity" class="form-label">Deity</label>
                            <input type="text" class="form-control" id="character-deity" value="${character.deity || ''}">
                        </div>
                    </div>
                    
                    <h5 class="mb-3">Attributes</h5>
                    <div class="row mb-3">
                        <div class="col-md-4">
                            <label for="character-str" class="form-label">Strength</label>
                            <input type="number" class="form-control" id="character-str" min="1" max="30" value="${character.strength || 10}">
                        </div>
                        <div class="col-md-4">
                            <label for="character-dex" class="form-label">Dexterity</label>
                            <input type="number" class="form-control" id="character-dex" min="1" max="30" value="${character.dexterity || 10}">
                        </div>
                        <div class="col-md-4">
                            <label for="character-con" class="form-label">Constitution</label>
                            <input type="number" class="form-control" id="character-con" min="1" max="30" value="${character.constitution || 10}">
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-4">
                            <label for="character-int" class="form-label">Intelligence</label>
                            <input type="number" class="form-control" id="character-int" min="1" max="30" value="${character.intelligence || 10}">
                        </div>
                        <div class="col-md-4">
                            <label for="character-wis" class="form-label">Wisdom</label>
                            <input type="number" class="form-control" id="character-wis" min="1" max="30" value="${character.wisdom || 10}">
                        </div>
                        <div class="col-md-4">
                            <label for="character-cha" class="form-label">Charisma</label>
                            <input type="number" class="form-control" id="character-cha" min="1" max="30" value="${character.charisma || 10}">
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="character-background" class="form-label">Background</label>
                        <textarea class="form-control" id="character-background" rows="4">${character.background || ''}</textarea>
                    </div>
                    
                    <div class="d-flex justify-content-between">
                        <button type="button" class="btn btn-secondary" id="cancel-character-btn">
                            <i class="fas fa-times me-1"></i> Cancel
                        </button>
                        <div>
                            <button type="button" class="btn btn-danger me-2" id="delete-character-btn">
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
        const form = document.getElementById('character-form');
        const cancelBtn = document.getElementById('cancel-character-btn');
        const deleteBtn = document.getElementById('delete-character-btn');
        
        if (form) {
            form.addEventListener('submit', (e) => this.handleCharacterFormSubmit(e, true));
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.removeExistingForm();
                this.refresh(character.id);
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.handleDelete(character.id);
            });
        }
    }
    
    /**
     * Handle character form submission
     * @param {Event} e - Form submit event
     * @param {boolean} isEdit - Whether this is an edit operation
     */
    handleCharacterFormSubmit(e, isEdit = false) {
        e.preventDefault();
        
        try {
            const form = e.target;
            const characterId = isEdit ? form.getAttribute('data-character-id') : null;
            
            // Get form values
            const characterData = {
                name: document.getElementById('character-name').value || 'Unnamed Character',
                level: parseInt(document.getElementById('character-level').value) || 1,
                race: document.getElementById('character-race').value || 'Unknown',
                class: document.getElementById('character-class').value || 'Adventurer',
                status: 'alive',
                alignment: document.getElementById('character-alignment').value || '',
                deity: document.getElementById('character-deity').value || '',
                attributes: {
                    strength: parseInt(document.getElementById('character-str').value) || 10,
                    dexterity: parseInt(document.getElementById('character-dex').value) || 10,
                    constitution: parseInt(document.getElementById('character-con').value) || 10,
                    intelligence: parseInt(document.getElementById('character-int').value) || 10,
                    wisdom: parseInt(document.getElementById('character-wis').value) || 10,
                    charisma: parseInt(document.getElementById('character-cha').value) || 10
                },
                bio: document.getElementById('character-background').value || '',
                notes: '',
                skills: [],
                inventory: [],
                quests: [],
                createdAt: isEdit ? this.getById(characterId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            let result;
            
            if (isEdit) {
                // Update existing character
                result = this.update(characterId, characterData);
                showToast({
                    message: 'Character updated successfully',
                    type: 'success'
                });
            } else {
                // Create new character
                result = this.add(characterData);
                showToast({
                    message: 'Character created successfully',
                    type: 'success'
                });
            }
            
            // Refresh the UI and select the character
            this.refresh(isEdit ? characterId : result.id);
        } catch (error) {
            console.error('Error saving character:', error);
            showToast({
                message: `Error saving character: ${error.message}`,
                type: 'error'
            });
        }
    }
}
