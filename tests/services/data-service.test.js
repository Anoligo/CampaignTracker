import { DataService, INITIAL_STATE } from '@/scripts/modules/data/index.js';

describe('DataService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('initializes with the default state', () => {
    const ds = new DataService();
    expect(ds.appState).toEqual(INITIAL_STATE);
  });

  test('add, get, update and delete entity', () => {
    const ds = new DataService();
    ds.clearData();
    const added = ds.add('quests', { title: 'Test Quest', description: 'desc', type: 'main', status: 'ongoing' });
    const fetched = ds.get('quests', added.id);
    expect(fetched.title).toBe('Test Quest');

    const updated = ds.update('quests', added.id, { title: 'Updated Title' });
    expect(updated.title).toBe('Updated Title');

    const deleted = ds.delete('quests', added.id);
    expect(deleted).toBe(true);
    expect(ds.get('quests', added.id)).toBeNull();
  });

  test('export and import data', () => {
    const ds = new DataService();
    ds.clearData();
    const q = ds.add('quests', { title: 'Exported Quest', description: '', type: 'main', status: 'ongoing' });
    const exported = ds.exportData();

    localStorage.clear();
    const ds2 = new DataService();
    ds2.importData(exported);
    const imported = ds2.get('quests', q.id);
    expect(imported.title).toBe('Exported Quest');
  });
});
