import { NotesService } from '@/scripts/modules/notes/services/notes-service.js';
import { DataService } from '@/scripts/modules/data/services/data-service.js';
import { NoteCategory } from '@/scripts/modules/notes/enums/note-enums.js';

describe('NotesService', () => {
  let dataService;
  let notesService;

  beforeEach(() => {
    // Create a new DataService instance for each test
    dataService = new DataService();
    // Clear any existing data
    dataService.clearData();
    // Initialize with empty notes array
    dataService.updateState({ notes: [] });
    // Create the service
    notesService = new NotesService(dataService);
  });

  test('create, update and delete note', () => {
    // Create a new note
    const note = notesService.createNote('Test', 'Content', NoteCategory.LORE);
    
    // Verify the note was created
    expect(dataService.exportState().notes).toHaveLength(1);
    
    // Update the note
    const updated = notesService.updateNote(note.id, { title: 'Updated' });
    expect(updated.title).toBe('Updated');
    
    // Verify the update is reflected in the service
    expect(notesService.getNoteById(note.id).title).toBe('Updated');
    
    // Delete the note
    const deleted = notesService.deleteNote(note.id);
    expect(deleted).toBe(true);
    
    // Verify the note was deleted
    expect(dataService.exportState().notes).toHaveLength(0);
  });

  test('search notes by title', () => {
    // Create test notes
    notesService.createNote('Alpha', 'Content for Alpha', NoteCategory.LORE);
    notesService.createNote('Bravo', 'Content for Bravo', NoteCategory.LORE);
    
    // Search for notes
    const results = notesService.searchNotes('brav');
    
    // Verify the search results
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Bravo');
  });

  test('tag and related entity management', () => {
    // Create a test note
    const note = notesService.createNote('Test Note', 'Test Content');
    
    // Test adding a tag
    notesService.addTagToNote(note.id, 'important');
    expect(notesService.getNoteById(note.id).tags).toContain('important');
    
    // Test removing a tag
    notesService.removeTagFromNote(note.id, 'important');
    expect(notesService.getNoteById(note.id).tags).not.toContain('important');
    
    // Test adding a related entity
    notesService.addRelatedEntity(note.id, 'quest', 'q1');
    expect(notesService.getNoteById(note.id).relatedEntities.quests).toContain('q1');
    
    // Test removing a related entity
    notesService.removeRelatedEntity(note.id, 'quest', 'q1');
    expect(notesService.getNoteById(note.id).relatedEntities.quests).not.toContain('q1');
  });

  test('getAllNotes returns all notes', () => {
    // Create test notes
    const note1 = notesService.createNote('Note 1', 'Content 1', NoteCategory.LORE);
    const note2 = notesService.createNote('Note 2', 'Content 2', NoteCategory.PLAYER);
    
    // Get all notes
    const allNotes = notesService.getAllNotes();
    
    // Verify all notes are returned
    expect(allNotes).toHaveLength(2);
    expect(allNotes.some(n => n.id === note1.id)).toBe(true);
    expect(allNotes.some(n => n.id === note2.id)).toBe(true);
  });
});
