import { DataService } from '@/scripts/modules/data/services/data-service.js';
import { NotesService } from '@/scripts/modules/notes/services/notes-service.js';
import { LocationService } from '@/scripts/modules/locations/services/location-service.js';

describe('Service persistence', () => {
  let dataService;
  
  beforeEach(() => {
    // Create a new DataService instance for each test
    dataService = new DataService();
    // Clear any existing data
    dataService.clearData();
  });

  test('createNote persists data through DataService', () => {
    // Initialize with empty notes array
    dataService.updateState({ notes: [] });
    
    // Create a note using the service
    const notesService = new NotesService(dataService);
    notesService.createNote('Persisted', 'note');
    
    // Verify the data was saved
    const savedState = dataService.exportState();
    expect(savedState.notes).toHaveLength(1);
    expect(savedState.notes[0].title).toBe('Persisted');
  });

  test('updateLocation persists changes through DataService', () => {
    // Initialize with empty locations array
    dataService.updateState({ locations: [] });
    
    // Create and update a location using the service
    const locationService = new LocationService(dataService);
    const loc = locationService.createLocation({ name: 'Town', description: 'old' });
    locationService.updateLocation(loc.id, { description: 'new' });
    
    // Verify the data was updated
    const savedState = dataService.exportState();
    expect(savedState.locations).toHaveLength(1);
    expect(savedState.locations[0].description).toBe('new');
  });
});
