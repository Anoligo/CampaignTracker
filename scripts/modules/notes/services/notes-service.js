import { Note } from '../models/note-model.js';
import { NoteCategory } from '../enums/note-enums.js';

export class NotesService {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }

    createNote(title, content, category = NoteCategory.LORE) {
        const note = new Note(title, content, category);
        this.dataManager.appState.notes.push(note);
        this.dataManager.saveData();
        return note;
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
        console.log('NotesService.updateNote called with noteId:', noteId, 'updates:', updates);
        
        // Get the note from the data manager's state
        const noteIndex = this.dataManager.appState.notes.findIndex(n => n.id === noteId);
        if (noteIndex === -1) {
            console.error('Note not found:', noteId);
            return null;
        }
        
        // Get the note using our getNoteById to ensure it's a proper Note instance
        const note = this.getNoteById(noteId);
        if (!note) {
            console.error('Failed to get note instance:', noteId);
            return null;
        }
        
        console.log('Current note before updates:', JSON.parse(JSON.stringify(note)));
        
        // Apply updates
        if (updates.title !== undefined) {
            console.log('Updating title to:', updates.title);
            note.updateTitle(updates.title);
        }
        
        if (updates.content !== undefined) {
            console.log('Updating content');
            note.updateContent(updates.content);
        }
        
        if (updates.category !== undefined) {
            console.log('Updating category to:', updates.category);
            const success = note.updateCategory(updates.category);
            if (!success) {
                console.error('Failed to update category. Invalid category:', updates.category);
                return null;
            }
        }
        
        // Update the note in the data manager's state
        this.dataManager.appState.notes[noteIndex] = note;
        
        // Save the changes
        this.dataManager.saveData();
        
        console.log('Note after updates:', JSON.parse(JSON.stringify(note)));
        return note;
    }

    deleteNote(noteId) {
        const index = this.dataManager.appState.notes.findIndex(n => n.id === noteId);
        if (index !== -1) {
            this.dataManager.appState.notes.splice(index, 1);
            this.dataManager.saveData();
            return true;
        }
        return false;
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
            this.dataManager.saveData();
            return true;
        }
        return false;
    }

    removeTagFromNote(noteId, tag) {
        const note = this.getNoteById(noteId);
        if (note) {
            note.removeTag(tag);
            this.dataManager.saveData();
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
                this.dataManager.saveData();
            }
            return result;
        }
        return false;
    }

    removeRelatedEntity(noteId, entityType, entityId) {
        console.log(`NotesService.removeRelatedEntity called with noteId: ${noteId}, entityType: ${entityType}, entityId: ${entityId}`);
        
        // Get the note from the data manager's state
        const noteIndex = this.dataManager.appState.notes.findIndex(n => n.id === noteId);
        if (noteIndex === -1) {
            console.error('Note not found:', noteId);
            return false;
        }
        
        // Get the note using our getNoteById to ensure it's a proper Note instance
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
                
                // IMPORTANT: Update the note in the data manager's state
                this.dataManager.appState.notes[noteIndex] = note;
                
                // Save the changes to persistent storage
                this.dataManager.saveData();
                
                console.log('Note after removal:', JSON.parse(JSON.stringify(note)));
                console.log('Updated appState.notes[noteIndex]:', JSON.parse(JSON.stringify(this.dataManager.appState.notes[noteIndex])));
                
                return true;
            }
            return false;
        }
        return false;
    }
}
