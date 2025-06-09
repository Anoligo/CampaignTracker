import { MockDataManager, testHelpers, mockFormValues, MockDate } from './test-setup.js';
import { Quest, QuestType, QuestStatus } from '../scripts/modules/quests.js';
import { Note } from '../scripts/modules/notes.js';
import { Item, ItemType, ItemRarity } from '../scripts/modules/loot.js';
import { Location, LocationType } from '../scripts/modules/locations.js';
import { Player, PlayerClass } from '../scripts/modules/players.js';
import { GuildActivity, GuildActivityType, GuildResource, GuildResourceType } from '../scripts/modules/guild.js';

describe('Test Setup Infrastructure', () => {
    let dataManager;

    beforeEach(() => {
        dataManager = new MockDataManager();
    });

    describe('MockDataManager', () => {
        test('initializes with empty state', () => {
            expect(dataManager.appState).toEqual({
                quests: [],
                notes: [],
                loot: [],
                locations: [],
                players: [],
                items: [],
                guildLogs: {
                    activities: [],
                    resources: []
                }
            });
        });

        test('validates state on initialization', () => {
            expect(() => {
                dataManager.appState.quests.push('invalid');
                dataManager._validateState();
            }).toThrow('Invalid items in quests array');
        });

        describe('CRUD Operations', () => {
            test('adds and retrieves a note', () => {
                const note = testHelpers.createMockNote();
                dataManager.addNote(note);
                expect(dataManager.getNoteById(note.id)).toBe(note);
            });

            test('adds and retrieves a quest', () => {
                const quest = testHelpers.createMockQuest();
                dataManager.addQuest(quest);
                expect(dataManager.getQuestById(quest.id)).toBe(quest);
            });

            test('adds and retrieves a location', () => {
                const location = testHelpers.createMockLocation();
                dataManager.addLocation(location);
                expect(dataManager.getLocationById(location.id)).toBe(location);
            });

            test('adds and retrieves a player', () => {
                const player = testHelpers.createMockPlayer();
                dataManager.addPlayer(player);
                expect(dataManager.getPlayerById(player.id)).toBe(player);
            });

            test('adds and retrieves an item', () => {
                const item = testHelpers.createMockItem();
                dataManager.addItem(item);
                expect(dataManager.getItemById(item.id)).toBe(item);
            });

            test('updates entities correctly', () => {
                const note = testHelpers.createMockNote();
                dataManager.addNote(note);
                const updates = { title: 'Updated Title' };
                dataManager.updateNote(note.id, updates);
                expect(dataManager.getNoteById(note.id).title).toBe('Updated Title');
            });

            test('deletes entities correctly', () => {
                const note = testHelpers.createMockNote();
                dataManager.addNote(note);
                dataManager.deleteNote(note.id);
                expect(() => dataManager.getNoteById(note.id)).toThrow();
            });
        });

        describe('Error Handling', () => {
            test('throws on invalid note addition', () => {
                expect(() => dataManager.addNote(null)).toThrow('Invalid note object');
            });

            test('throws on invalid quest addition', () => {
                expect(() => dataManager.addQuest(null)).toThrow('Invalid quest object');
            });

            test('throws on invalid location addition', () => {
                expect(() => dataManager.addLocation(null)).toThrow('Invalid location object');
            });

            test('throws on invalid player addition', () => {
                expect(() => dataManager.addPlayer(null)).toThrow('Invalid player object');
            });

            test('throws on invalid item addition', () => {
                expect(() => dataManager.addItem(null)).toThrow('Invalid item object');
            });

            test('throws on invalid ID in getter', () => {
                expect(() => dataManager.getNoteById(null)).toThrow('Invalid note ID');
            });

            test('throws on non-existent ID in getter', () => {
                expect(() => dataManager.getNoteById('non-existent')).toThrow('Note with ID non-existent not found');
            });
        });
    });

    describe('Test Helpers', () => {
        test('creates mock note with correct structure', () => {
            const note = testHelpers.createMockNote();
            expect(note).toBeInstanceOf(Note);
            expect(note.title).toBe(mockFormValues.note.noteTitle);
            expect(note.content).toBe(mockFormValues.note.noteContent);
            expect(note.category).toBe(mockFormValues.note.noteCategory);
        });

        test('creates mock quest with correct structure', () => {
            const quest = testHelpers.createMockQuest();
            expect(quest).toBeInstanceOf(Quest);
            expect(quest.title).toBe(mockFormValues.quest.questTitle);
            expect(quest.description).toBe(mockFormValues.quest.questDescription);
            expect(quest.type).toBe(mockFormValues.quest.questType);
            expect(quest.status).toBe(mockFormValues.quest.questStatus);
        });

        test('creates mock item with correct structure', () => {
            const item = testHelpers.createMockItem();
            expect(item).toBeInstanceOf(Item);
            expect(item.name).toBe(mockFormValues.item.itemName);
            expect(item.description).toBe(mockFormValues.item.itemDescription);
            expect(item.type).toBe(mockFormValues.item.itemType);
            expect(item.rarity).toBe(mockFormValues.item.itemRarity);
        });

        test('creates mock location with correct structure', () => {
            const location = testHelpers.createMockLocation();
            expect(location).toBeInstanceOf(Location);
            expect(location.name).toBe(mockFormValues.location.locationName);
            expect(location.description).toBe(mockFormValues.location.locationDescription);
            expect(location.type).toBe('CITY');
        });

        test('creates mock player with correct structure', () => {
            const player = testHelpers.createMockPlayer();
            expect(player).toBeInstanceOf(Player);
            expect(player.name).toBe(mockFormValues.player.playerName);
            expect(player.class).toBe(mockFormValues.player.playerClass);
            expect(player.level).toBe(mockFormValues.player.playerLevel);
        });

        test('creates mock guild activity with correct structure', () => {
            const activity = testHelpers.createMockGuildActivity();
            expect(activity).toBeInstanceOf(GuildActivity);
            expect(activity.name).toBe(mockFormValues.activity.name);
            expect(activity.description).toBe(mockFormValues.activity.description);
            expect(activity.type).toBe(mockFormValues.activity.type);
            expect(activity.status).toBe(mockFormValues.activity.status);
        });

        test('creates mock guild resource with correct structure', () => {
            const resource = testHelpers.createMockGuildResource();
            expect(resource).toBeInstanceOf(GuildResource);
            expect(resource.name).toBe(mockFormValues.resource.name);
            expect(resource.description).toBe(mockFormValues.resource.description);
            expect(resource.type).toBe(mockFormValues.resource.type);
            expect(resource.quantity).toBe(mockFormValues.resource.quantity);
        });
    });

    describe('Date Mocking', () => {
        test('creates fixed dates correctly', () => {
            const fixedDate = testHelpers.createFixedDate();
            expect(fixedDate).toBeInstanceOf(MockDate);
            expect(fixedDate.toISOString()).toBe('2024-01-01T00:00:00.000Z');
        });

        test('creates date ranges correctly', () => {
            const range = testHelpers.createDateRange();
            expect(range.start).toBeInstanceOf(MockDate);
            expect(range.end).toBeInstanceOf(MockDate);
            expect(range.start.toISOString()).toBe('2024-01-01T00:00:00.000Z');
            expect(range.end.toISOString()).toBe('2024-12-31T23:59:59.999Z');
        });
    });

    describe('Test Data Generation', () => {
        test('creates multiple test notes', () => {
            const notes = testHelpers.createTestData('note', 3);
            expect(notes).toHaveLength(3);
            notes.forEach((note, index) => {
                expect(note).toBeInstanceOf(Note);
                expect(note.title).toBe(`Test Note ${index + 1}`);
            });
        });

        test('creates multiple test quests', () => {
            const quests = testHelpers.createTestData('quest', 3);
            expect(quests).toHaveLength(3);
            quests.forEach((quest, index) => {
                expect(quest).toBeInstanceOf(Quest);
                expect(quest.title).toBe(`Test Quest ${index + 1}`);
            });
        });

        test('throws on unknown test data type', () => {
            expect(() => testHelpers.createTestData('unknown')).toThrow('Unknown test data type: unknown');
        });
    });
}); 