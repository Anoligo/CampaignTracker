import { Note, NotesManager } from '../scripts/modules/notes.js';
import { MockDataManager, testHelpers, mockFormValues } from './test-setup.js';

describe('Note', () => {
    test('should create a new note with correct properties', () => {
        const note = testHelpers.createMockNote();
        expect(note.title).toBe('Test Note');
        expect(note.content).toBe('Test Content');
        expect(note.category).toBe('lore');
        expect(note.tags).toEqual([]);
        expect(note.relatedEntities).toEqual({
            quests: [],
            locations: [],
            characters: [],
            items: []
        });
        expect(note.createdAt instanceof Date).toBe(true);
        expect(note.updatedAt instanceof Date).toBe(true);
    });

    test('should add tag', () => {
        const note = testHelpers.createMockNote();
        note.addTag('test-tag');
        expect(note.tags).toContain('test-tag');
    });

    test('should add related quest', () => {
        const note = testHelpers.createMockNote();
        note.addRelatedQuest('quest-1');
        expect(note.relatedEntities.quests).toContain('quest-1');
    });

    test('should add related location', () => {
        const note = testHelpers.createMockNote();
        note.addRelatedLocation('location-1');
        expect(note.relatedEntities.locations).toContain('location-1');
    });

    test('should add related character', () => {
        const note = testHelpers.createMockNote();
        note.addRelatedCharacter('character-1');
        expect(note.relatedEntities.characters).toContain('character-1');
    });

    test('should add related item', () => {
        const note = testHelpers.createMockNote();
        note.addRelatedItem('item-1');
        expect(note.relatedEntities.items).toContain('item-1');
    });
});

describe('NotesManager', () => {
    let notesManager;
    let dataManager;

    beforeEach(() => {
        dataManager = new MockDataManager();
        notesManager = new NotesManager(dataManager, true);
    });

    test('should initialize notes section', () => {
        const notesSection = document.getElementById('notes');
        expect(notesSection.innerHTML).toContain('Backstories &amp; Notes');
        expect(notesSection.innerHTML).toContain('New Note');
    });

    test('should create new note', () => {
        const form = testHelpers.createMockForm(mockFormValues.note);
        notesManager.createNewNote(form);
        expect(dataManager.appState.notes).toHaveLength(1);
        expect(dataManager.appState.notes[0].title).toBe('Test Note');
    });

    test('should filter notes by category', () => {
        const note1 = testHelpers.createMockNote({ category: 'lore' });
        const note2 = testHelpers.createMockNote({ category: 'quest' });
        dataManager.appState.notes.push(note1, note2);
        notesManager.handleCategoryFilter('lore');
        const noteList = document.getElementById('noteList');
        expect(noteList.innerHTML).toContain('Test Note');
        expect(noteList.innerHTML).not.toContain('Note 2');
    });

    test('should search notes', () => {
        const note1 = testHelpers.createMockNote({ title: 'Test Note 1' });
        const note2 = testHelpers.createMockNote({ title: 'Other Note' });
        dataManager.appState.notes.push(note1, note2);
        notesManager.handleSearch('Test Note 1');
        const noteList = document.getElementById('noteList');
        expect(noteList.innerHTML).toContain('Test Note 1');
        expect(noteList.innerHTML).not.toContain('Other Note');
    });

    test('should add tag to note', () => {
        const note = testHelpers.createMockNote();
        dataManager.appState.notes.push(note);
        const form = testHelpers.createMockForm({ tagName: 'test-tag' });
        notesManager.addTag(note.id, form);
        expect(note.tags).toContain('test-tag');
    });

    test('should add related quest to note', () => {
        const note = testHelpers.createMockNote();
        dataManager.appState.notes.push(note);
        const form = testHelpers.createMockForm({ questId: 'quest-1' });
        notesManager.addRelatedQuest(note.id, form);
        expect(note.relatedEntities.quests).toContain('quest-1');
    });

    test('should add related location to note', () => {
        const note = testHelpers.createMockNote();
        dataManager.appState.notes.push(note);
        const form = testHelpers.createMockForm({ locationId: 'location-1' });
        notesManager.addRelatedLocation(note.id, form);
        expect(note.relatedEntities.locations).toContain('location-1');
    });

    test('should add related character to note', () => {
        const note = testHelpers.createMockNote();
        dataManager.appState.notes.push(note);
        const form = testHelpers.createMockForm({ characterId: 'character-1' });
        notesManager.addRelatedCharacter(note.id, form);
        expect(note.relatedEntities.characters).toContain('character-1');
    });

    test('should add related item to note', () => {
        const note = testHelpers.createMockNote();
        dataManager.appState.notes.push(note);
        const form = testHelpers.createMockForm({ itemId: 'item-1' });
        notesManager.addRelatedItem(note.id, form);
        expect(note.relatedEntities.items).toContain('item-1');
    });

    test('should update note title', () => {
        const note = testHelpers.createMockNote();
        dataManager.appState.notes.push(note);
        const form = testHelpers.createMockForm({ title: 'Updated Title' });
        notesManager.updateNoteTitle(note.id, form);
        expect(note.title).toBe('Updated Title');
    });

    test('should update note content', () => {
        const note = testHelpers.createMockNote();
        dataManager.appState.notes.push(note);
        const form = testHelpers.createMockForm({ content: 'Updated Content' });
        notesManager.updateNoteContent(note.id, form);
        expect(note.content).toBe('Updated Content');
    });
}); 