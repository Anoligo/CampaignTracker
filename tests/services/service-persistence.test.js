import { DataService } from '@/scripts/modules/data/index.js';
import { NotesService } from '@/scripts/modules/notes/services/notes-service.js';
import { LocationService } from '@/scripts/modules/locations/services/location-service.js';

describe('Service persistence to localStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('createNote saves to localStorage', () => {
    const ds = new DataService();
    ds.clearData();
    ds._state.notes = [];
    ds.saveData();
    const notes = new NotesService(ds);
    notes.createNote('Persisted', 'note');
    const saved = JSON.parse(localStorage.getItem('ironMeridianState'));
    expect(saved.notes.length).toBe(1);
    expect(saved.notes[0].title).toBe('Persisted');
  });

  test('updateLocation saves to localStorage', () => {
    const ds = new DataService();
    ds.clearData();
    ds._state.locations = [];
    ds.saveData();
    const locations = new LocationService(ds);
    const loc = locations.createLocation({ name: 'Town', description: 'old' });
    locations.updateLocation(loc.id, { description: 'new' });
    const saved = JSON.parse(localStorage.getItem('ironMeridianState'));
    expect(saved.locations.length).toBe(1);
    expect(saved.locations[0].description).toBe('new');
  });
});
