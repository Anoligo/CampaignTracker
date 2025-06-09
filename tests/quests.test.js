import { Quest, QuestManager, QuestType, QuestStatus } from '../scripts/modules/quests.js';
import { MockDataManager, testHelpers, mockFormValues } from './test-setup.js';

describe('Quest', () => {
    let quest;

    beforeEach(() => {
        quest = testHelpers.createMockQuest();
    });

    describe('Creation and Initialization', () => {
        test('should create a new quest with correct properties', () => {
            expect(quest.title).toBe('Test Quest');
            expect(quest.description).toBe('Test Description');
            expect(quest.type).toBe(QuestType.MAIN);
            expect(quest.status).toBe(QuestStatus.ONGOING);
            expect(quest.journalEntries).toEqual([]);
            expect(quest.relatedItems).toEqual([]);
            expect(quest.relatedLocations).toEqual([]);
            expect(quest.relatedCharacters).toEqual([]);
            expect(quest.createdAt instanceof Date).toBe(true);
            expect(quest.updatedAt instanceof Date).toBe(true);
        });

        test('should create quest with custom properties', () => {
            const customQuest = testHelpers.createMockQuest({
                title: 'Custom Quest',
                description: 'Custom Description',
                type: QuestType.SIDE,
                status: QuestStatus.COMPLETED
            });
            expect(customQuest.title).toBe('Custom Quest');
            expect(customQuest.description).toBe('Custom Description');
            expect(customQuest.type).toBe(QuestType.SIDE);
            expect(customQuest.status).toBe(QuestStatus.COMPLETED);
        });

        test('should throw error for invalid quest type', () => {
            expect(() => {
                testHelpers.createMockQuest({ type: 'INVALID_TYPE' });
            }).toThrow();
        });

        test('should throw error for invalid quest status', () => {
            expect(() => {
                testHelpers.createMockQuest({ status: 'INVALID_STATUS' });
            }).toThrow();
        });
    });

    describe('Journal Entries', () => {
        test('should add journal entry', () => {
            const entry = {
                content: 'Test entry',
                timestamp: new Date()
            };
            quest.addJournalEntry(entry);
            expect(quest.journalEntries).toContain(entry);
        });

        test('should not add duplicate journal entry', () => {
            const entry = {
                content: 'Test entry',
                timestamp: new Date()
            };
            quest.addJournalEntry(entry);
            quest.addJournalEntry(entry);
            expect(quest.journalEntries).toHaveLength(1);
        });

        test('should throw error for invalid journal entry', () => {
            expect(() => {
                quest.addJournalEntry(null);
            }).toThrow();
        });

        test('should remove journal entry', () => {
            const entry = {
                content: 'Test entry',
                timestamp: new Date()
            };
            quest.addJournalEntry(entry);
            quest.removeJournalEntry(entry);
            expect(quest.journalEntries).not.toContain(entry);
        });
    });

    describe('Related Entities', () => {
        test('should add related item', () => {
            quest.addRelatedItem('item-1');
            expect(quest.relatedItems).toContain('item-1');
        });

        test('should not add duplicate related item', () => {
            quest.addRelatedItem('item-1');
            quest.addRelatedItem('item-1');
            expect(quest.relatedItems).toHaveLength(1);
        });

        test('should remove related item', () => {
            quest.addRelatedItem('item-1');
            quest.removeRelatedItem('item-1');
            expect(quest.relatedItems).not.toContain('item-1');
        });

        test('should add related location', () => {
            quest.addRelatedLocation('location-1');
            expect(quest.relatedLocations).toContain('location-1');
        });

        test('should not add duplicate related location', () => {
            quest.addRelatedLocation('location-1');
            quest.addRelatedLocation('location-1');
            expect(quest.relatedLocations).toHaveLength(1);
        });

        test('should remove related location', () => {
            quest.addRelatedLocation('location-1');
            quest.removeRelatedLocation('location-1');
            expect(quest.relatedLocations).not.toContain('location-1');
        });

        test('should add related character', () => {
            quest.addRelatedCharacter('character-1');
            expect(quest.relatedCharacters).toContain('character-1');
        });

        test('should not add duplicate related character', () => {
            quest.addRelatedCharacter('character-1');
            quest.addRelatedCharacter('character-1');
            expect(quest.relatedCharacters).toHaveLength(1);
        });

        test('should remove related character', () => {
            quest.addRelatedCharacter('character-1');
            quest.removeRelatedCharacter('character-1');
            expect(quest.relatedCharacters).not.toContain('character-1');
        });
    });

    describe('Status Management', () => {
        test('should update status', () => {
            quest.updateStatus(QuestStatus.COMPLETED);
            expect(quest.status).toBe(QuestStatus.COMPLETED);
        });

        test('should throw error for invalid status', () => {
            expect(() => {
                quest.updateStatus('INVALID_STATUS');
            }).toThrow();
        });

        test('should track status history', () => {
            quest.updateStatus(QuestStatus.COMPLETED);
            quest.updateStatus(QuestStatus.FAILED);
            expect(quest.statusHistory).toHaveLength(2);
            expect(quest.statusHistory[0].status).toBe(QuestStatus.COMPLETED);
            expect(quest.statusHistory[1].status).toBe(QuestStatus.FAILED);
        });
    });

    describe('Quest Updates', () => {
        test('should update title', () => {
            quest.updateTitle('New Title');
            expect(quest.title).toBe('New Title');
        });

        test('should throw error for empty title', () => {
            expect(() => {
                quest.updateTitle('');
            }).toThrow();
        });

        test('should update description', () => {
            quest.updateDescription('New Description');
            expect(quest.description).toBe('New Description');
        });

        test('should update type', () => {
            quest.updateType(QuestType.SIDE);
            expect(quest.type).toBe(QuestType.SIDE);
        });

        test('should throw error for invalid type', () => {
            expect(() => {
                quest.updateType('INVALID_TYPE');
            }).toThrow();
        });
    });
});

describe('QuestsManager', () => {
    let questManager;
    let mockDataManager;

    beforeEach(() => {
        mockDataManager = new MockDataManager();
        questManager = new QuestManager(mockDataManager, true);
    });

    describe('Initialization', () => {
        test('should initialize quests section', () => {
            const questsSection = document.getElementById('quests');
            expect(questsSection.innerHTML).toContain('Quests');
            expect(questsSection.innerHTML).toContain('New Quest');
        });

        test('should initialize with empty state', () => {
            expect(mockDataManager.appState.quests).toHaveLength(0);
        });
    });

    describe('Quest Creation', () => {
        test('should create new quest', () => {
            const form = testHelpers.createMockForm(mockFormValues.quest);
            questManager.createNewQuest(form);
            expect(mockDataManager.appState.quests).toHaveLength(1);
            const quest = mockDataManager.appState.quests[0];
            expect(quest.title).toBe('Test Quest');
            expect(quest.type).toBe(QuestType.MAIN);
            expect(quest.description).toBe('Test Description');
        });

        test('should throw error for invalid form data', () => {
            const form = testHelpers.createMockForm({});
            expect(() => {
                questManager.createNewQuest(form);
            }).toThrow();
        });

        test('should handle form validation', () => {
            const form = testHelpers.createMockForm({
                questTitle: '',
                questDescription: 'Test Description',
                questType: QuestType.MAIN
            }, { required: ['questTitle'] });
            expect(() => {
                questManager.createNewQuest(form);
            }).toThrow();
        });
    });

    describe('Quest Filtering', () => {
        beforeEach(() => {
            const quest1 = testHelpers.createMockQuest({ type: QuestType.MAIN, title: 'Main Quest' });
            const quest2 = testHelpers.createMockQuest({ type: QuestType.SIDE, title: 'Side Quest' });
            mockDataManager.appState.quests.push(quest1, quest2);
        });

        test('should filter quests by type', () => {
            questManager.handleTypeFilter(QuestType.MAIN);
            const questList = document.getElementById('questList');
            expect(questList.innerHTML).toContain('Main Quest');
            expect(questList.innerHTML).not.toContain('Side Quest');
        });

        test('should filter quests by status', () => {
            const quest = mockDataManager.appState.quests[0];
            quest.updateStatus(QuestStatus.COMPLETED);
            questManager.handleStatusFilter(QuestStatus.COMPLETED);
            const questList = document.getElementById('questList');
            expect(questList.innerHTML).toContain('Main Quest');
        });

        test('should search quests', () => {
            questManager.handleSearch('Main');
            const questList = document.getElementById('questList');
            expect(questList.innerHTML).toContain('Main Quest');
            expect(questList.innerHTML).not.toContain('Side Quest');
        });
    });

    describe('Quest Updates', () => {
        let quest;

        beforeEach(() => {
            quest = testHelpers.createMockQuest();
            mockDataManager.appState.quests.push(quest);
        });

        test('should update quest title', () => {
            const form = testHelpers.createMockForm({ questTitle: 'Updated Title' });
            questManager.updateQuestTitle(quest.id, form);
            expect(quest.title).toBe('Updated Title');
        });

        test('should update quest description', () => {
            const form = testHelpers.createMockForm({ questDescription: 'Updated Description' });
            questManager.updateQuestDescription(quest.id, form);
            expect(quest.description).toBe('Updated Description');
        });

        test('should update quest type', () => {
            const form = testHelpers.createMockForm({ questType: QuestType.SIDE });
            questManager.updateQuestType(quest.id, form);
            expect(quest.type).toBe(QuestType.SIDE);
        });

        test('should update quest status', () => {
            const form = testHelpers.createMockForm({ questStatus: QuestStatus.COMPLETED });
            questManager.updateQuestStatus(quest.id, form);
            expect(quest.status).toBe(QuestStatus.COMPLETED);
        });
    });

    describe('Error Handling', () => {
        test('should handle non-existent quest', () => {
            const form = testHelpers.createMockForm({ questTitle: 'Updated Title' });
            expect(() => {
                questManager.updateQuestTitle('non-existent-id', form);
            }).toThrow();
        });

        test('should handle invalid form data', () => {
            const form = testHelpers.createMockForm({});
            expect(() => {
                questManager.createNewQuest(form);
            }).toThrow();
        });

        test('should handle invalid quest type', () => {
            const form = testHelpers.createMockForm({
                questTitle: 'Test Quest',
                questDescription: 'Test Description',
                questType: 'INVALID_TYPE'
            });
            expect(() => {
                questManager.createNewQuest(form);
            }).toThrow();
        });
    });
}); 