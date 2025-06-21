/**
 * Notes Manager
 * Main entry point for note-related functionality using the unified appState pattern
 */

import { NotesService } from './services/notes-service-new.js';
import { NotesUI } from './ui/notes-ui-new.js';
import { NoteCategory } from './enums/note-enums.js';

export class NotesManager {
    /**
     * Create a new NotesManager instance
     * @param {Object} dataManager - The application's data manager (DataService)
     * @param {boolean} isTest - Whether this is a test instance (prevents sample data creation)
     */
    constructor(dataManager, isTest = false) {
        console.log('[NotesManager] Initializing with dataManager:', dataManager ? 'valid' : 'invalid');
        
        if (!dataManager) {
            throw new Error('Data manager is required');
        }
        
        this.dataManager = dataManager;
        this.notesService = new NotesService(dataManager);
        this.notesUI = null;
        this.initialized = false;
        this._isRendering = false;
        this.currentFilter = null;
        this.currentSearchQuery = '';
        
        if (!isTest) {
            this.initialize();
        }
        
        console.log('[NotesManager] Initialization complete');
    }
    
    /**
     * Initialize the notes module
     * @returns {Promise<boolean>} True if initialization was successful
     */
    async initialize() {
        if (this.initialized) {
            console.log('[NotesManager] Already initialized');
            return true;
        }
        
        console.log('[NotesManager] Initializing...');
        
        try {
            // Initialize the UI if we're in a browser environment
            if (typeof document !== 'undefined') {
                try {
                    // Initialize the NotesUI
                    this.notesUI = new NotesUI(this);
                    
                    // Set up event listeners
                    this.setupEventListeners();
                    
                    console.log('[NotesManager] UI initialized');
                } catch (error) {
                    console.error('[NotesManager] Error initializing UI:', error);
                    throw error;
                }
            }
            
            // Set up section observer for dynamic loading
            this.setupSectionObserver();
            
            // Create sample notes if none exist
            if (this.notesService.getAllNotes().length === 0 && !this._sampleNotesCreated) {
                console.log('[NotesManager] No notes found, creating sample notes');
                await this.createSampleNotes();
                this._sampleNotesCreated = true;
            }
            
            this.initialized = true;
            console.log('[NotesManager] Initialization complete');
            return true;
        } catch (error) {
            console.error('[NotesManager] Error during initialization:', error);
            this.initialized = false;
            throw error;
        }
    }
    
    /**
     * Set up a mutation observer to detect when the notes section becomes visible
     * @private
     */
    setupSectionObserver() {
        const targetNode = document.getElementById('notes');
        if (!targetNode) {
            console.warn('[NotesManager] Notes section not found, will retry on next render');
            return;
        }
        
        // Create an observer instance
        this.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    this.checkSectionVisibility();
                }
            });
        });
        
        // Start observing the target node for attribute changes
        this.observer.observe(targetNode, {
            attributes: true,
            attributeFilter: ['class']
        });
        
        // Initial check
        this.checkSectionVisibility();
    }
    
    /**
     * Check if the notes section is visible and initialize/cleanup accordingly
     * @private
     */
    checkSectionVisibility() {
        const section = document.getElementById('notes');
        if (!section) return;
        
        const isVisible = section.classList.contains('active');
        
        if (isVisible && !this.initialized) {
            console.log('[NotesManager] Notes section became visible, initializing...');
            this.initialize().catch(error => {
                console.error('[NotesManager] Error initializing after section became visible:', error);
            });
        } else if (!isVisible && this.initialized) {
            console.log('[NotesManager] Notes section hidden, cleaning up...');
            this.cleanup();
        }
    }
    
    /**
     * Set up event listeners
     * @private
     */
    setupEventListeners() {
        console.log('[NotesManager] Setting up event listeners');
        
        // Global event listeners can be added here
        // The NotesUI component will handle its own event delegation
    }
    
    /**
     * Clean up resources when the notes section is hidden
     */
    cleanup() {
        console.log('[NotesManager] Cleaning up...');
        
        if (this.notesUI) {
            // If NotesUI has a cleanup method, call it
            if (typeof this.notesUI.cleanup === 'function') {
                this.notesUI.cleanup();
            }
            this.notesUI = null;
        }
        
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        
        this.initialized = false;
        this._isRendering = false;
        console.log('[NotesManager] Cleanup complete');
    }
    
    /**
     * Render the notes manager
     */
    render() {
        console.groupCollapsed('[NotesManager] Render called');
        
        // Prevent re-rendering if we're already in the process of rendering
        if (this._isRendering) {
            console.log('[NotesManager] Already rendering, skipping...');
            console.groupEnd();
            return;
        }
        
        this._isRendering = true;
        console.log('[NotesManager] Starting render');
        
        try {
            if (!this.initialized) {
                this.initialize();
                return; // initialize will call render again when done
            }
            
            // Only render if the notes section is visible
            const section = document.getElementById('notes');
            if (section && section.classList.contains('active') && this.notesUI) {
                // Get filtered notes based on current filter and search
                let notes = this.getFilteredNotes();
                
                // Render the UI with the filtered notes
                if (typeof this.notesUI.render === 'function') {
                    this.notesUI.render(notes);
                } else if (typeof this.notesUI.refresh === 'function') {
                    this.notesUI.refresh();
                } else if (typeof this.notesUI.init === 'function') {
                    this.notesUI.init();
                } else {
                    console.error('[NotesManager] NotesUI is missing required rendering methods');
                }
                
                this.isRendered = true;
            }
        } catch (error) {
            console.error('[NotesManager] Error during render:', error);
        } finally {
            this._isRendering = false;
            console.groupEnd();
        }
    }
    
    // Note CRUD Operations
    
    /**
     * Get all notes, optionally filtered by the current filter and search query
     * @returns {Array<Object>} Array of notes
     */
    getFilteredNotes() {
        let notes = [];
        
        if (this.currentSearchQuery) {
            notes = this.notesService.searchNotes(this.currentSearchQuery);
        } else if (this.currentFilter) {
            notes = this.notesService.getNotesByCategory(this.currentFilter);
        } else {
            notes = this.notesService.getAllNotes();
        }
        
        return notes;
    }
    
    /**
     * Get all notes
     * @returns {Array<Object>} Array of notes
     */
    getAllNotes() {
        return this.notesService.getAllNotes();
    }
    
    /**
     * Get a note by ID
     * @param {string} id - Note ID
     * @returns {Object|undefined} The note or undefined if not found
     */
    getNoteById(id) {
        return this.notesService.getNoteById(id);
    }
    
    /**
     * Create a new note
     * @param {Object} noteData - Note data
     * @returns {Object} The created note
     */
    createNote(noteData) {
        const note = this.notesService.createNote(noteData);
        this.render();
        return note;
    }
    
    /**
     * Update a note
     * @param {string} id - Note ID
     * @param {Object} updates - Updated note data
     * @returns {Object|undefined} Updated note or undefined if not found
     */
    updateNote(id, updates) {
        const updatedNote = this.notesService.updateNote(id, updates);
        this.render();
        return updatedNote;
    }
    
    /**
     * Delete a note
     * @param {string} id - Note ID
     * @returns {boolean} True if deleted, false if not found
     */
    deleteNote(id) {
        const result = this.notesService.deleteNote(id);
        this.render();
        return result;
    }
    
    // Tag management
    
    /**
     * Add a tag to a note
     * @param {string} noteId - Note ID
     * @param {string} tag - Tag to add
     * @returns {Object|undefined} Updated note or undefined if not found
     */
    addTagToNote(noteId, tag) {
        return this.notesService.addTagToNote(noteId, tag);
    }
    
    /**
     * Remove a tag from a note
     * @param {string} noteId - Note ID
     * @param {string} tag - Tag to remove
     * @returns {Object|undefined} Updated note or undefined if not found
     */
    removeTagFromNote(noteId, tag) {
        return this.notesService.removeTagFromNote(noteId, tag);
    }
    
    /**
     * Get all unique tags across all notes
     * @returns {Array<string>} Array of unique tags
     */
    getAllTags() {
        return this.notesService.getAllTags();
    }
    
    // Related entities management
    
    /**
     * Add a related entity to a note
     * @param {string} noteId - Note ID
     * @param {string} entityType - Type of entity (e.g., 'quest', 'character')
     * @param {string} entityId - Entity ID
     * @returns {Object|undefined} Updated note or undefined if not found
     */
    addRelatedEntity(noteId, entityType, entityId) {
        return this.notesService.addRelatedEntity(noteId, entityType, entityId);
    }
    
    /**
     * Remove a related entity from a note
     * @param {string} noteId - Note ID
     * @param {string} entityType - Type of entity
     * @param {string} entityId - Entity ID to remove
     * @returns {Object|undefined} Updated note or undefined if not found
     */
    removeRelatedEntity(noteId, entityType, entityId) {
        return this.notesService.removeRelatedEntity(noteId, entityType, entityId);
    }
    
    /**
     * Get all notes related to a specific entity
     * @param {string} entityType - Type of entity
     * @param {string} entityId - Entity ID
     * @returns {Array<Object>} Array of related notes
     */
    getNotesByRelatedEntity(entityType, entityId) {
        return this.notesService.getNotesByRelatedEntity(entityType, entityId);
    }
    
    // Filtering and searching
    
    /**
     * Set the current category filter
     * @param {string} category - Category to filter by, or null to clear filter
     */
    setCategoryFilter(category) {
        this.currentFilter = category;
        this.currentSearchQuery = ''; // Clear search when applying category filter
        this.render();
    }
    
    /**
     * Set the current search query
     * @param {string} query - Search query
     */
    setSearchQuery(query) {
        this.currentSearchQuery = query;
        this.currentFilter = null; // Clear category filter when searching
        this.render();
    }
    
    /**
     * Clear all filters and search
     */
    clearFilters() {
        this.currentFilter = null;
        this.currentSearchQuery = '';
        this.render();
    }
    
    // Sample data
    
    /**
     * Create sample notes for demonstration purposes
     * @private
     */
    async createSampleNotes() {
        try {
            const sampleNotes = [
                {
                    title: 'Campaign Overview',
                    content: 'The party is currently investigating the disappearance of several villagers near the Whispering Woods. Suspicion falls on the cult of the Crimson Dawn.',
                    category: NoteCategory.CAMPAIGN,
                    tags: ['plot', 'villains', 'locations']
                },
                {
                    title: 'NPC: Elder Thalric',
                    content: 'Elder Thalric is the leader of the village of Briarwood. He is a stern but fair man in his late 50s, with a distinctive scar across his left eye. He knows more than he\'s letting on about the recent disappearances.',
                    category: NoteCategory.NPCS,
                    tags: ['allies', 'quest-givers']
                },
                {
                    title: 'The Whispering Woods',
                    content: 'A dense, ancient forest that borders the village. Locals say the trees whisper secrets to those who listen. Recent reports suggest the whispers have grown more intense and unsettling.',
                    category: NoteCategory.LOCATIONS,
                    tags: ['exploration', 'dungeon']
                },
                {
                    title: 'Cult of the Crimson Dawn',
                    content: 'A secretive cult that worships a forgotten deity of the same name. They are known for their blood rituals and belief in an impending apocalypse. Recent activity suggests they may be involved in the disappearances.',
                    category: NoteCategory.LORE,
                    tags: ['villains', 'religion']
                },
                {
                    title: 'Session Notes: 2023-11-15',
                    content: 'The party arrived in Briarwood and met with Elder Thalric. They investigated the forest and found a hidden shrine with crimson markings. A fight with cultists revealed they are searching for the "Eyes of the Dawn."',
                    category: NoteCategory.SESSION_NOTES,
                    tags: ['recap', 'plot-advancement']
                }
            ];
            
            // Create each sample note
            for (const noteData of sampleNotes) {
                await this.createNote(noteData);
            }
            
            console.log('[NotesManager] Created sample notes');
            return true;
        } catch (error) {
            console.error('[NotesManager] Error creating sample notes:', error);
            return false;
        }
    }
}

export default NotesManager;
