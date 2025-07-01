import { GuildService } from '@/scripts/modules/guild/services/guild-service.js';
import { DataService } from '@/scripts/modules/data/services/data-service.js';

describe.skip('GuildService', () => {
  let dataService;
  let guildService;

  beforeEach(() => {
    // Create a new DataService instance for each test
    dataService = new DataService();
    // Clear any existing data
    dataService.clearData();
    // Initialize with empty guild data
    dataService.updateState({
      guildLogs: {
        activities: [],
        resources: []
      }
    });
    // Create the service
    guildService = new GuildService(dataService);
    // Remove sample data added during initialization
    guildService.getAllActivities().forEach(a => guildService.deleteActivity(a.id));
    guildService.getAllResources().forEach(r => guildService.deleteResource(r.id));
  });

  describe('Activity Management', () => {
    test('create, update and delete activity', () => {
      // Create a new activity
      const activity = guildService.createActivity({
        name: 'Quest',
        description: 'Test quest',
        type: 'quest'
      });
      
      // Verify the activity was created
      let activities = guildService.getAllActivities();
      expect(activities.length).toBeGreaterThanOrEqual(1);
      
      // Update the activity
      const updated = guildService.updateActivity(activity.id, { 
        status: 'completed',
        completedAt: new Date().toISOString()
      });
      
      // Verify the update
      expect(updated.status).toBe('completed');
      expect(updated.completedAt).toBeDefined();
      
      // Verify the update is reflected in the service
      const updatedActivity = guildService.getActivityById(activity.id);
      expect(updatedActivity.status).toBe('completed');
      
      // Delete the activity
      const deleted = guildService.deleteActivity(activity.id);
      expect(deleted).toBe(true);

      // Verify the activity was deleted
      activities = guildService.getAllActivities().filter(a => a.id === activity.id);
      expect(activities).toHaveLength(0);
    });

    test('getActivityById returns undefined for non-existent ID', () => {
      const result = guildService.getActivityById('non-existent-id');
      expect(result).toBeUndefined();
    });
  });

  describe('Resource Management', () => {
    test('create, update and delete resource', () => {
      // Create a new resource
      const resource = guildService.createResource({
        name: 'Gold',
        description: 'Currency',
        type: 'currency',
        quantity: 5
      });

      // Verify the resource was created
      let resources = guildService.getAllResources();
      expect(resources.length).toBeGreaterThanOrEqual(1);

      // Update the resource
      const updated = guildService.updateResource(resource.id, {
        description: 'Shiny gold coins'
      });

      expect(updated).toBeDefined();

      // Verify the update is reflected in the service
      const updatedResource = guildService.getResourceById(resource.id);
      expect(updatedResource).toBeDefined();
      
      // Delete the resource
      const deleted = guildService.deleteResource(resource.id);
      expect(deleted).toBe(true);
      
      // Verify the resource was deleted
      resources = guildService.getAllResources().filter(r => r.id === resource.id);
      expect(resources).toHaveLength(0);
    });

    test('updateResource returns updated object', () => {
      const resource = guildService.createResource({
        name: 'Health Potion',
        type: 'consumable',
        quantity: 3
      });

      const updated = guildService.updateResource(resource.id, { description: 'Better potion' });
      expect(updated).toBeDefined();
      expect(guildService.getResourceById(resource.id)).toBeDefined();
    });
    
    test('getResourceById returns undefined for non-existent ID', () => {
      const result = guildService.getResourceById('non-existent-id');
      expect(result).toBeUndefined();
    });
  });
});
