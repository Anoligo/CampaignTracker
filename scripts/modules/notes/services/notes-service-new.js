/**
 * Notes Service
 * Handles all note-related data operations using the unified appState pattern
 */

import { Note } from '../models/note-model.js';
import { NoteCategory } from '../enums/note-enums.js';

export class NotesService {
    /**
     * Create a new NotesService instance
     * @param {Object} dataManager - The application's data manager (DataService)
     */
    constructor(dataManager) {
        if (!dataManager) {
            throw new Error('Data manager is required');
        }
        
        this.dataManager = dataManager;
        this.STORAGE_KEY = 'notes';
        this.initialize();
    }
    
    /**
     * Initialize the service
     * @private
     */
    initialize() {
        // Ensure notes array exists in appState
        if (!Array.isArray(this.dataManager.appState[this.STORAGE_KEY])) {
            this.dataManager.appState[this.STORAGE_KEY] = [];
            this._saveState();
        }
    }
    
    /**
     * Save the current state
     * @private
     * @returns {boolean} True if save was successful
     */
    _saveState() {
        try {
            this.dataManager.saveData();
            return true;
        } catch (error) {
            console.error('Error saving notes data:', error);
            return false;
        }
    }
    
    /**
     * Convert a plain object to a Note instance
     * @private
     * @param {Object} data - Note data
     * @returns {Note} Note instance
     */
    _toNote(data) {
        if (data instanceof Note) return data;
        
        // Create a new Note instance
        const note = new Note(
            data.title || 'Untitled Note',
            data.content || '',
            Object.values(NoteCategory).includes(data.category) ? data.category : NoteCategory.LORE,
            data.id || `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        );
        
        // Set timestamps
        if (data.createdAt) note.createdAt = new Date(data.createdAt);
        if (data.updatedAt) note.updatedAt = new Date(data.updatedAt);
        
        // Copy additional properties
        if (data.tags) note.tags = [...data.tags];
        if (data.relatedEntities) note.relatedEntities = { ...data.relatedEntities };
        
        return note;
    }
    
    /**
     * Get all notes
     * @param {Object} [filters] - Optional filters
     * @param {string} [filters.category] - Filter by category
     * @param {string} [filters.search] - Search query
     * @returns {Array<Note>} Array of notes
     */
    getAllNotes(filters = {}) {
        let notes = [...(this.dataManager.appState[this.STORAGE_KEY] || [])];
        
        // Convert plain objects to Note instances
        notes = notes.map(note => this._toNote(note));
        
        // Apply filters
        if (filters.category) {
            notes = notes.filter(note => note.category === filters.category);
        }
        
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            notes = notes.filter(note => 
                note.title.toLowerCase().includes(searchTerm) ||
                note.content.toLowerCase().includes(searchTerm)
            );
        }
        
        return notes;
    }
    
    /**
     * Get a note by ID
     * @param {string} id - Note ID
     * @returns {Note|undefined} The note or undefined if not found
     */
    getNoteById(id) {
        if (!id) return undefined;
        const note = this.dataManager.appState[this.STORAGE_KEY]?.find(n => n.id === id);
        return note ? this._toNote(note) : undefined;
    }
    
    /**
     * Create a new note
     * @param {Object} data - Note data
     * @returns {Note} The created note
     */
    createNote(data) {
        try {
            if (!data) {
                throw new Error('Note data is required');
            }
            
            // Ensure notes array exists
            if (!Array.isArray(this.dataManager.appState[this.STORAGE_KEY])) {
                this.dataManager.appState[this.STORAGE_KEY] = [];
            }
            
            // Create note with required fields and defaults
            const note = this._toNote({
                ...data,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                category: Object.values(NoteCategory).includes(data.category) 
                    ? data.category 
                    : NoteCategory.LORE,
                tags: data.tags || [],
                relatedEntities: data.relatedEntities || {}
            });
            
            // Add to the notes array
            this.dataManager.appState[this.STORAGE_KEY] = [
                ...this.dataManager.appState[this.STORAGE_KEY],
                note
            ];
            
            // Save the state
            if (!this._saveState()) {
                throw new Error('Failed to save note');
            }
            
            return note;
        } catch (error) {
            console.error('Error creating note:', error);
            throw error;
        }
    }
    
    /**
     * Update a note
     * @param {string} id - Note ID
     * @param {Object} updates - Updates to apply
     * @returns {Note|undefined} The updated note or undefined if not found
     */
    updateNote(id, updates) {
        try {
            if (!id || !updates) {
                throw new Error('ID and updates are required');
            }
            
            const index = this.dataManager.appState[this.STORAGE_KEY]?.findIndex(n => n.id === id) ?? -1;
            if (index === -1) {
                console.warn(`Note with ID ${id} not found`);
                return undefined;
            }
            
            // Create updated note
            const updatedNote = {
                ...this.dataManager.appState[this.STORAGE_KEY][index],
                ...updates,
                id, // Ensure ID doesn't change
                updatedAt: new Date().toISOString()
            };
            
            // Update the array
            const updatedNotes = [...this.dataManager.appState[this.STORAGE_KEY]];
            updatedNotes[index] = updatedNote;
            this.dataManager.appState[this.STORAGE_KEY] = updatedNotes;
            
            // Save the state
            if (!this._saveState()) {
                throw new Error('Failed to update note');
            }
            
            return this._toNote(updatedNote);
        } catch (error) {
            console.error(`Error updating note ${id}:`, error);
            throw error;
        }
    }
    
    /**
     * Delete a note
     * @param {string} id - Note ID
     * @returns {boolean} True if deleted, false if not found
     */
    deleteNote(id) {
        try {
            if (!id) {
                throw new Error('ID is required');
            }
            
            const initialLength = this.dataManager.appState[this.STORAGE_KEY]?.length || 0;
            this.dataManager.appState[this.STORAGE_KEY] = 
                this.dataManager.appState[this.STORAGE_KEY]?.filter(n => n.id !== id) || [];
            
            if (this.dataManager.appState[this.STORAGE_KEY].length === initialLength) {
                console.warn(`Note with ID ${id} not found`);
                return false;
            }
            
            // Save the state
            if (!this._saveState()) {
                throw new Error('Failed to delete note');
            }
            
            return true;
        } catch (error) {
            console.error(`Error deleting note ${id}:`, error);
            throw error;
        }
    }
    
    // Tag management
    
    /**
     * Add a tag to a note
     * @param {string} noteId - Note ID
     * @param {string} tag - Tag to add
     * @returns {Note|undefined} Updated note or undefined if not found
     */
    addTagToNote(noteId, tag) {
        const note = this.getNoteById(noteId);
        if (!note) return undefined;
        
        const tags = new Set([...(note.tags || []), tag]);
        return this.updateNote(noteId, { tags: [...tags] });
    }
    
    /**
     * Remove a tag from a note
     * @param {string} noteId - Note ID
     * @param {string} tag - Tag to remove
     * @returns {Note|undefined} Updated note or undefined if not found
     */
    removeTagFromNote(noteId, tag) {
        const note = this.getNoteById(noteId);
        if (!note || !note.tags) return note;
        
        const tags = note.tags.filter(t => t !== tag);
        return this.updateNote(noteId, { tags });
    }
    
    /**
     * Get all unique tags across all notes
     * @returns {Array<string>} Array of unique tags
     */
    getAllTags() {
        const notes = this.getAllNotes();
        const tagSet = new Set();
        
        notes.forEach(note => {
            if (note.tags && Array.isArray(note.tags)) {
                note.tags.forEach(tag => tagSet.add(tag));
            }
        });
        
        return [...tagSet];
    }
    
    // Related entities management
    
    /**
     * Add a related entity to a note
     * @param {string} noteId - Note ID
     * @param {string} entityType - Type of entity (e.g., 'quest', 'character')
     * @param {string} entityId - Entity ID
     * @returns {Note|undefined} Updated note or undefined if not found
     */
    addRelatedEntity(noteId, entityType, entityId) {
        const note = this.getNoteById(noteId);
        if (!note) return undefined;
        
        const relatedEntities = { ...(note.relatedEntities || {}) };
        
        if (!relatedEntities[entityType]) {
            relatedEntities[entityType] = new Set();
        } else if (!(relatedEntities[entityType] instanceof Set)) {
            // Convert to Set if it's not already one
            relatedEntities[entityType] = new Set(relatedEntities[entityType]);
        }
        
        relatedEntities[entityType].add(entityId);
        
        // Convert Sets back to arrays for serialization
        const serializedEntities = {};
        Object.entries(relatedEntities).forEach(([type, ids]) => {
            serializedEntities[type] = [...ids];
        });
        
        return this.updateNote(noteId, { relatedEntities: serializedEntities });
    }
    
    /**
     * Remove a related entity from a note
     * @param {string} noteId - Note ID
     * @param {string} entityType - Type of entity
     * @param {string} entityId - Entity ID to remove
     * @returns {Note|undefined} Updated note or undefined if not found
     */
    removeRelatedEntity(noteId, entityType, entityId) {
        const note = this.getNoteById(noteId);
        if (!note || !note.relatedEntities || !note.relatedEntities[entityType]) {
            return note;
        }
        
        const relatedEntities = { ...note.relatedEntities };
        
        // Convert to Set if it's not already one
        if (!(relatedEntities[entityType] instanceof Set)) {
            relatedEntities[entityType] = new Set(relatedEntities[entityType]);
        }
        
        relatedEntities[entityType].delete(entityId);
        
        // Remove the entity type if it's now empty
        if (relatedEntities[entityType].size === 0) {
            delete relatedEntities[entityType];
        } else {
            // Convert back to array for serialization
            relatedEntities[entityType] = [...relatedEntities[entityType]];
        }
        
        return this.updateNote(noteId, { relatedEntities });
    }
    
    /**
     * Get all notes related to a specific entity
     * @param {string} entityType - Type of entity
     * @param {string} entityId - Entity ID
     * @returns {Array<Note>} Array of related notes
     */
    getNotesByRelatedEntity(entityType, entityId) {
        return this.getAllNotes().filter(note => 
            note.relatedEntities?.[entityType]?.includes(entityId)
        );
    }
    
    // Search and filter
    
    /**
     * Search notes by title or content
     * @param {string} query - Search query
     * @returns {Array<Note>} Filtered array of notes
     */
    searchNotes(query) {
        if (!query) return this.getAllNotes();
        
        const searchTerm = query.toLowerCase();
        return this.getAllNotes().filter(note => 
            (note.title && note.title.toLowerCase().includes(searchTerm)) ||
            (note.content && note.content.toLowerCase().includes(searchTerm))
        );
    }
    
    /**
     * Get notes by category
     * @param {string} category - Category to filter by
     * @returns {Array<Note>} Filtered array of notes
     */
    getNotesByCategory(category) {
        if (!category) return this.getAllNotes();
        return this.getAllNotes({ category });
    }
    
    /**
     * Get notes by tag
     * @param {string} tag - Tag to filter by
     * @returns {Array<Note>} Filtered array of notes
     */
    getNotesByTag(tag) {
        if (!tag) return this.getAllNotes();
        return this.getAllNotes().filter(note => 
            note.tags && note.tags.includes(tag)
        );
    }
}

export default NotesService;
