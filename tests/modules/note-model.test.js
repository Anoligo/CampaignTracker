import { Note } from '@/scripts/modules/notes/models/note-model.js';
import { NoteCategory } from '@/scripts/modules/notes/enums/note-enums.js';

describe('Note model', () => {
  test('initializes with defaults', () => {
    const note = new Note('Title', 'Content');
    expect(note.title).toBe('Title');
    expect(note.category).toBe('lore');
    expect(note.relatedEntities.quests).toEqual([]);
  });

  test('add and remove tags', () => {
    const note = new Note('a','b');
    note.addTag('important');
    note.addTag('important');
    expect(note.tags).toEqual(['important']);
    note.removeTag('important');
    expect(note.tags).toEqual([]);
  });

  test('related quest operations', () => {
    const note = new Note('x','y');
    expect(note.addRelatedQuest('q1')).toBe(true);
    expect(note.addRelatedQuest('q1')).toBe(false);
    expect(note.relatedEntities.quests).toEqual(['q1']);
    expect(note.removeRelatedQuest('q1')).toBe(true);
    expect(note.relatedEntities.quests).toEqual([]);
  });

  test('updateCategory validates enum', () => {
    const note = new Note('t','c');
    expect(note.updateCategory(NoteCategory.SESSION)).toBe(true);
    expect(note.category).toBe(NoteCategory.SESSION);
    expect(note.updateCategory('invalid')).toBe(false);
    expect(note.category).toBe(NoteCategory.SESSION);
  });
});
