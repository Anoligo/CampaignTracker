import { Note } from '../models/note-model.js';
import { NoteCategory } from '../enums/note-enums.js';

export class NotesService {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }

    createNote(title, content, category = NoteCategory.LORE) {
        const note = new Note(title, content, category);
        return this.dataManager.add('notes', note);
    }

    getNoteById(id) {
        const noteData = this.dataManager.appState.notes.find(note => note.id === id);
        if (!noteData) return null;
        
        // If it's already a Note instance, return it
        if (noteData instanceof Note) {
            return noteData;
        }
        
        // Otherwise, create a new Note instance from the plain object
        const note = new Note(
            noteData.title,
            noteData.content,
            noteData.category,
            new Date(noteData.createdAt),
            new Date(noteData.updatedAt)
        );
        
        // Copy over the ID
        note.id = noteData.id;
        
        // Copy over other properties if they exist
        if (noteData.tags) {
            note.tags = [...noteData.tags];
        }
        
        if (noteData.relatedEntities) {
            note.relatedEntities = { ...noteData.relatedEntities };
        }
        
        return note;
    }

    updateNote(noteId, updates) {
        return this.dataManager.update('notes', noteId, updates);
    }

    deleteNote(noteId) {
        return this.dataManager.remove('notes', noteId);
    }

    searchNotes(query) {
        if (!query) return this.dataManager.appState.notes || [];
        
        const searchTerm = query.toLowerCase();
        return (this.dataManager.appState.notes || []).filter(note => 
            note.title.toLowerCase().includes(searchTerm) ||
            note.content.toLowerCase().includes(searchTerm)
        );
    }

    getNotesByCategory(category) {
        if (!category) return this.dataManager.appState.notes || [];
        return (this.dataManager.appState.notes || []).filter(note => note.category === category);
    }
    
    getAllNotes() {
        return this.dataManager.appState.notes || [];
    }

    // Tag management
    addTagToNote(noteId, tag) {
        const note = this.getNoteById(noteId);
        if (note) {
            note.addTag(tag);
            this.dataManager.update('notes', noteId, note);
            return true;
        }
        return false;
    }

    removeTagFromNote(noteId, tag) {
        const note = this.getNoteById(noteId);
        if (note) {
            note.removeTag(tag);
            this.dataManager.update('notes', noteId, note);
            return true;
        }
        return false;
    }

    // Related entities management
    addRelatedEntity(noteId, entityType, entityId) {
        const note = this.getNoteById(noteId);
        if (!note) return false;

        const methodMap = {
            'quest': 'addRelatedQuest',
            'location': 'addRelatedLocation',
            'character': 'addRelatedCharacter',
            'item': 'addRelatedItem'
        };

        if (methodMap[entityType] && typeof note[methodMap[entityType]] === 'function') {
            const result = note[methodMap[entityType]](entityId);
            if (result) {
                this.dataManager.update('notes', noteId, note);
            }
            return result;
        }
        return false;
    }

    removeRelatedEntity(noteId, entityType, entityId) {
        console.log(`NotesService.removeRelatedEntity called with noteId: ${noteId}, entityType: ${entityType}, entityId: ${entityId}`);
        
        const note = this.getNoteById(noteId);
        if (!note) {
            console.error('Failed to get note instance:', noteId);
            return false;
        }
        
        console.log('Current note before removal:', JSON.parse(JSON.stringify(note)));

        const methodMap = {
            'quest': 'removeRelatedQuest',
            'location': 'removeRelatedLocation',
            'character': 'removeRelatedCharacter',
            'item': 'removeRelatedItem'
        };

        if (methodMap[entityType] && typeof note[methodMap[entityType]] === 'function') {
            // Call the remove method on the note instance
            const result = note[methodMap[entityType]](entityId);
            
            if (result) {
                console.log('Entity removed from note model:', note);
                this.dataManager.update('notes', noteId, note);
                return true;
            }
            return false;
        }
        return false;
    }
}
