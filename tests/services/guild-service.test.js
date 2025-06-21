import { GuildService } from '@/scripts/modules/guild/services/guild-service.js';
import { DataService } from '@/scripts/modules/data/services/data-service.js';

describe('GuildService', () => {
  let dataService;
  let guildService;

  beforeEach(() => {
    // Create a new DataService instance for each test
    dataService = new DataService();
    // Clear any existing data
    dataService.clearData();
    // Initialize with empty guild data
    dataService.updateState({
      guild: {
        activities: [],
        resources: []
      }
    });
    // Create the service
    guildService = new GuildService(dataService);
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
      expect(activities).toHaveLength(1);
      expect(activities[0].name).toBe('Quest');
      
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
      activities = guildService.getAllActivities();
      expect(activities).toHaveLength(0);
    });

    test('getActivityById returns null for non-existent ID', () => {
      const result = guildService.getActivityById('non-existent-id');
      expect(result).toBeNull();
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
      expect(resources).toHaveLength(1);
      expect(resources[0].name).toBe('Gold');
      expect(resources[0].quantity).toBe(5);
      
      // Update the resource
      const updated = guildService.updateResource(resource.id, { 
        quantity: 10,
        description: 'Shiny gold coins'
      });
      
      // Verify the update
      expect(updated.quantity).toBe(10);
      expect(updated.description).toBe('Shiny gold coins');
      
      // Verify the update is reflected in the service
      const updatedResource = guildService.getResourceById(resource.id);
      expect(updatedResource.quantity).toBe(10);
      
      // Delete the resource
      const deleted = guildService.deleteResource(resource.id);
      expect(deleted).toBe(true);
      
      // Verify the resource was deleted
      resources = guildService.getAllResources();
      expect(resources).toHaveLength(0);
    });

    test('updateResourceQuantity adjusts the quantity correctly', () => {
      const resource = guildService.createResource({ 
        name: 'Health Potion', 
        type: 'consumable', 
        quantity: 3 
      });
      
      // Add to quantity
      guildService.updateResourceQuantity(resource.id, 2);
      expect(guildService.getResourceById(resource.id).quantity).toBe(5);
      
      // Subtract from quantity
      guildService.updateResourceQuantity(resource.id, -3);
      expect(guildService.getResourceById(resource.id).quantity).toBe(2);
    });
    
    test('getResourceById returns null for non-existent ID', () => {
      const result = guildService.getResourceById('non-existent-id');
      expect(result).toBeNull();
    });
  });
});
