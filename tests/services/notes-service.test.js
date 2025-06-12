import { NotesService } from '@/scripts/modules/notes/services/notes-service.js';
import { DataService } from '@/scripts/modules/data/index.js';
import { NoteCategory } from '@/scripts/modules/notes/enums/note-enums.js';

let ds;
let service;

describe('NotesService', () => {
  beforeEach(() => {
    localStorage.clear();
    ds = new DataService();
    ds.clearData();
    ds._state.notes = [];
    ds.saveData();
    service = new NotesService(ds);
  });

  test('create, update and delete note', () => {
    const note = service.createNote('Test','Content', NoteCategory.LORE);
    expect(ds.appState.notes.length).toBe(1);
    const updated = service.updateNote(note.id, { title: 'Updated' });
    expect(updated.title).toBe('Updated');
    const deleted = service.deleteNote(note.id);
    expect(deleted).toBe(true);
    expect(ds.appState.notes.length).toBe(0);
  });

  test('search notes by title', () => {
    service.createNote('Alpha','', NoteCategory.LORE);
    service.createNote('Bravo','', NoteCategory.LORE);
    const results = service.searchNotes('brav');
    expect(results.map(n => n.title)).toEqual(['Bravo']);
  });

  test('tag and related entity management', () => {
    const note = service.createNote('T','C');
    service.addTagToNote(note.id, 'important');
    expect(service.getNoteById(note.id).tags).toContain('important');
    service.removeTagFromNote(note.id, 'important');
    expect(service.getNoteById(note.id).tags).not.toContain('important');
    service.addRelatedEntity(note.id, 'quest', 'q1');
    expect(service.getNoteById(note.id).relatedEntities.quests).toContain('q1');
    service.removeRelatedEntity(note.id, 'quest', 'q1');
    expect(service.getNoteById(note.id).relatedEntities.quests).not.toContain('q1');
  });
});
