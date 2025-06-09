import { NotesService } from './services/notes-service.js';
import { NotesUI } from './ui/notes-ui-new.js';
import { NoteCategory } from './enums/note-enums.js';

export class NotesManager {
    constructor(dataManager, isTest = false) {
        this.dataManager = dataManager;
        this.service = new NotesService(dataManager);
        this.ui = new NotesUI(this.service, dataManager);
        this.currentFilter = '';
        
        if (!isTest) {
            this.initialize();
        }
    }

    initialize() {
        // Create sample notes if none exist
        if (this.service.getAllNotes().length === 0) {
            this.createSampleNotes();
        }
        
        this.ui.init();
        this.ui.refresh();
    }

    // Note CRUD Operations
    createNewNote(noteData) {
        try {
            // Create and save the new note
            const note = this.service.createNote(
                noteData.title, 
                noteData.content, 
                noteData.category
            );
            
            if (note) {
                this.ui.refresh();
                return note;
            }
            return null;
        } catch (error) {
            console.error('Error creating note:', error);
            return null;
        }
    }

    updateNote(noteId, updates) {
        try {
            // Update the note
            const updated = this.service.updateNote(noteId, updates);

            if (updated) {
                this.ui.refresh(noteId);
                return updated;
            }
            return null;
        } catch (error) {
            console.error('Error updating note:', error);
            return null;
        }
    }

    deleteNote(noteId) {
        if (this.service.deleteNote(noteId)) {
            // Refresh the UI
            this.ui.refresh();
            return true;
        }
        return false;
    }

    // Note Display
    showNoteDetails(noteId) {
        this.ui.handleSelect(noteId);
    }

    showNewNoteForm() {
        this.ui.handleAdd();
    }

    showEditNoteForm(noteId) {
        const note = this.service.getNoteById(noteId);
        if (note) {
            this.ui.handleEdit(note);
        }
    }

    // Filtering and Searching
    handleCategoryFilter(category) {
        this.currentFilter = category === 'all' ? '' : category;
        const filteredNotes = this.currentFilter 
            ? this.service.getNotesByCategory(this.currentFilter)
            : this.service.getAllNotes();
        this.ui.renderList(filteredNotes);
    }

    handleSearch(query) {
        const filteredNotes = query 
            ? this.service.searchNotes(query)
            : this.service.getAllNotes();
        this.ui.renderList(filteredNotes);
    }

    // Tag Management
    showAddTagForm(noteId) {
        this.ui.handleAddTag(noteId);
    }

    // Related Entities
    showAddRelatedQuestForm(noteId) {
        this.ui.handleAddRelatedEntity(noteId);
    }

    showAddRelatedLocationForm(noteId) {
        this.ui.handleAddRelatedEntity(noteId);
    }

    showAddRelatedCharacterForm(noteId) {
        this.ui.handleAddRelatedEntity(noteId);
    }

    showAddRelatedItemForm(noteId) {
        this.ui.handleAddRelatedEntity(noteId);
    }

    // Utility methods
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getCategoryColor(category) {
        return this.ui.getCategoryColor(category);
    }
    
    /**
     * Create sample notes for demonstration
     */
    createSampleNotes() {
        const sampleNotes = [
            {
                title: 'Campaign Backstory',
                content: 'Our adventure begins in the realm of Anoligo, a land torn by ancient conflicts and magical disturbances. The party first met at the Ironforge Tavern, where a mysterious stranger offered them a quest to recover a lost artifact from the Whispering Woods.',
                category: NoteCategory.BACKSTORY
            },
            {
                title: 'Session 1 Notes',
                content: 'The party traveled to Sunhaven Village and spoke with Elder Miriam about the recent disappearances. Discovered tracks leading to the Whispering Woods. Found evidence of goblin activity near the eastern edge of the forest.',
                category: NoteCategory.SESSION
            },
            {
                title: 'The Crimson Amulet',
                content: 'A powerful magical item said to grant its wearer protection against fire and heat. Last seen in the possession of the dragon Fyretalon who dwells in the mountains to the north.',
                category: NoteCategory.ITEM
            },
            {
                title: 'Elder Miriam',
                content: 'The wise elder of Sunhaven Village. She has lived for over 90 years and knows many secrets about the region\'s history. She mentioned that her grandfather once fought alongside a famous paladin who sealed away an ancient evil in the temple ruins.',
                category: NoteCategory.CHARACTER
            },
            {
                title: 'Temple of the Forgotten Flame',
                content: 'Ancient ruins located east of Ironforge City. Said to have been a place of worship for fire elementals. The temple was abandoned after a catastrophic ritual went wrong, causing the death of many priests.',
                category: NoteCategory.LOCATION
            }
        ];
        
        sampleNotes.forEach(note => {
            this.service.createNote(note.title, note.content, note.category);
        });
        
        console.log('Created sample notes');
    }
}
