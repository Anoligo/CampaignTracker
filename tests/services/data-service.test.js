import { DataService } from '@/scripts/modules/data/services/data-service.js';
import { INITIAL_STATE } from '@/scripts/modules/data/schemas/state-schema.js';

describe('DataService', () => {
  let dataService;

  beforeEach(() => {
    // Create a new DataService instance for each test
    dataService = new DataService();
    // Clear any existing data
    dataService.clearData();
  });

  test('initializes with the default state', () => {
    expect(dataService.exportState()).toEqual(INITIAL_STATE);
  });

  test('add, get, update and delete entity', () => {
    // Add a quest
    const added = dataService.add('quests', {
      id: 'quest-test',
      name: 'quest-test',
      title: 'Test Quest',
      description: 'desc',
      type: 'main',
      status: 'ongoing'
    });
    
    // Verify the quest was added
    const fetched = dataService.get('quests', added.id);
    expect(fetched.title).toBe('Test Quest');

    // Update the quest
    const updated = dataService.update('quests', added.id, { title: 'Updated Title' });
    expect(updated.title).toBe('Updated Title');

    // Delete the quest
    const deleted = dataService.delete('quests', added.id);
    expect(deleted).toBe(true);
    expect(dataService.get('quests', added.id)).toBeNull();
  });

  test('export and import data', () => {
    // Add a quest to the first service
    const quest = dataService.add('quests', { 
      title: 'Exported Quest', 
      description: '', 
      type: 'main', 
      status: 'ongoing' 
    });
    
    // Export the data
    const exported = dataService.exportState();
    
    // Create a second service and import the data
    const dataService2 = new DataService();
    dataService2.importData(JSON.stringify(exported));
    
    // Verify the data was imported correctly
    const imported = dataService2.get('quests', quest.id);
    expect(imported.title).toBe('Exported Quest');
  });

  test('updateState replaces array data', () => {
    dataService.updateState({
      quests: [
        { id: '1', name: 'q1', title: 'Quest 1', description: 'A', type: 'main', status: 'ongoing' }
      ]
    });

    expect(dataService.get('quests', '1')).not.toBeNull();

    dataService.updateState({
      quests: [
        { id: '2', name: 'q2', title: 'Quest 2', description: 'B', type: 'side', status: 'completed' }
      ]
    });

    expect(dataService.get('quests', '1')).toBeNull();
    const quest2 = dataService.get('quests', '2');
    expect(quest2.title).toBe('Quest 2');
  });
});
